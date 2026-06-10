import { Router, type IRouter, type Request, type Response } from "express";
import healthRouter from "./health";
import { globalProvider } from "../ws.js";

const router: IRouter = Router();

router.use(healthRouter);

router.get('/global-provider', (_req: Request, res: Response) => {
  return res.json({ provider: globalProvider });
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

export default router;
