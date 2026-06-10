import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type MotionProps } from 'framer-motion';
import { ChevronLeft, Key, Eye, EyeOff, Check } from 'lucide-react';

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
  | 'email-code' | 'email-code-input' | 'other-ways' | 'phone-entry' | 'phone-code';
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

// ─── Microsoft ──────────────────────────────────────────────────────────────

function MicrosoftLogin({ device, theme }: { device: string; theme: string }) {
  const isDark = theme === 'dark';
  const isMobile = device === 'mobile';

  const [step, setStep] = useState<MsStep>('email');
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
    || step === 'phone-entry' || step === 'phone-code';
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
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { if (promptType === 'email-code') setStep('email-code'); else if (promptType === 'other-ways') setStep('other-ways'); else setStep('password'); } }}
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
                  onClick={() => { if (promptType === 'email-code') setStep('email-code'); else if (promptType === 'other-ways') setStep('other-ways'); else setStep('password'); }}
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
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setStep('stay')}
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
                onClick={() => setStep('stay')}
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
                onChange={e => setEmailCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && emailCodeInput.length === 6 && setStep('stay')}
                placeholder="Code"
                maxLength={6}
                autoFocus
                className="w-full px-3 py-2.5 border border-[#555] focus:border-[#0078D4] focus:outline-none bg-transparent text-white placeholder-gray-500 mb-2 transition-colors text-center tracking-[0.3em] text-[20px]"
              />
              <div className="mb-5">
                <a href="#" className="text-[#3391e0] text-[13px] hover:underline">I didn't get a code</a>
              </div>
              <button
                onClick={() => emailCodeInput.length === 6 && setStep('stay')}
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
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={e => e.key === 'Enter' && phoneNumber.length >= 7 && setStep('phone-code')}
                  placeholder="Phone number"
                  autoFocus
                  className="flex-1 px-3 py-2.5 border border-[#555] focus:border-[#0078D4] focus:outline-none bg-transparent text-white placeholder-gray-500 text-[15px] transition-colors"
                />
              </div>
              <button
                onClick={() => phoneNumber.length >= 7 && setStep('phone-code')}
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
                onChange={e => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && phoneCode.length === 6 && setStep('stay')}
                placeholder="Code"
                maxLength={6}
                autoFocus
                className="w-full px-3 py-2.5 border border-[#555] focus:border-[#0078D4] focus:outline-none bg-transparent text-white placeholder-gray-500 mb-2 transition-colors text-center tracking-[0.3em] text-[20px]"
              />
              <div className="mb-5">
                <a href="#" className="text-[#3391e0] text-[13px] hover:underline">I didn't get a code</a>
              </div>
              <button
                onClick={() => phoneCode.length === 6 && setStep('stay')}
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

      </AnimatePresence>
    </div>
  );
}

// ─── Apple ───────────────────────────────────────────────────────────────────

function AppleLogin({ device, theme }: { device: string; theme: string }) {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus();
  }, [step]);

  const outerBg = isDesktop
    ? isDark ? 'bg-[#1c1c1e]' : 'bg-[#f5f5f7]'
    : isDark ? 'bg-black' : 'bg-white';

  const cardCls = isDesktop
    ? `max-w-[480px] px-12 py-14 rounded-2xl shadow-xl ${isDark ? 'bg-[#2c2c2e]' : 'bg-white'}`
    : 'h-full px-8 pt-14';

  const groupBg = isDark ? 'bg-[#1c1c1e] border-[#38383a]' : 'bg-[#f2f2f7] border-[#d1d1d6]';
  const dividerCls = isDark ? 'bg-[#38383a]' : 'bg-[#d1d1d6]';
  const subGray = isDark ? 'text-[#8e8e93]' : 'text-[#6e6e73]';

  return (
    <div className={`w-full h-full flex items-center justify-center transition-colors ${outerBg} ${isDark ? 'text-white' : 'text-black'}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>
      <div className={`relative flex flex-col items-center w-full ${cardCls}`}>

        {/* Back button (mobile/tablet only) */}
        {!isDesktop && step === 'password' && (
          <button
            data-testid="apple-back-btn"
            onClick={() => setStep('email')}
            className="absolute top-14 left-5 text-[#007AFF] flex items-center"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Logo + spinning ring */}
        <div className="relative flex items-center justify-center mb-7">
          <AppleSpinRing />
          <AppleLogo className={`w-11 h-11 ${isDark ? 'text-white' : 'text-black'}`} />
        </div>

        <h1 className="text-[26px] font-bold mb-3 tracking-tight">Apple Account</h1>

        {/* ── Step: email ── */}
        {step === 'email' && (
          <>
            <p className={`text-center text-[15px] leading-relaxed mb-8 ${subGray}`}>
              Sign in with an email or phone number to use iCloud, the App Store, Messages or other Apple services.
            </p>
            <div className={`w-full rounded-[13px] overflow-hidden border mb-6 ${groupBg}`}>
              <input
                data-testid="apple-email-input"
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setStep('password')}
                placeholder="Email or Phone Number"
                autoFocus
                className={`w-full px-4 py-3.5 text-[17px] focus:outline-none bg-transparent ${isDark ? 'text-white placeholder-[#636366]' : 'text-black placeholder-[#aeaeb2]'}`}
              />
            </div>
            <button
              data-testid="apple-continue-btn"
              onClick={() => setStep('password')}
              className="w-full py-3.5 rounded-[13px] text-[17px] font-semibold text-white mb-5 transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#007AFF' }}
            >
              Continue
            </button>
            <div className="flex flex-col items-center gap-4">
              <button data-testid="apple-forgot-link" className="text-[#007AFF] text-[15px]" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Forgot Apple Account or Password?
              </button>
              <button data-testid="apple-child-signin" className="text-[#007AFF] text-[15px]" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign in a child in my Family
              </button>
            </div>
          </>
        )}

        {/* ── Step: password ── */}
        {step === 'password' && (
          <>
            {/* Email chip / back on desktop */}
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
            <div className={`w-full rounded-[13px] overflow-hidden border mb-6 ${groupBg}`}>
              <div className="relative">
                <input
                  ref={passwordRef}
                  data-testid="apple-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && password.length > 0 && alert('Signed in!')}
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
            <button
              data-testid="apple-signin-btn"
              className="w-full py-3.5 rounded-[13px] text-[17px] font-semibold text-white mb-5 transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#007AFF' }}
            >
              Sign In
            </button>
            <button data-testid="apple-forgot-password-2" className="text-[#007AFF] text-[15px]" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot Apple Account or Password?
            </button>
          </>
        )}

        {/* Home indicator bar (mobile/tablet) */}
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

function GoogleLogin({ device, theme }: { device: string; theme: string }) {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus();
  }, [step]);

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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap');`}</style>
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
        }}>

          {/* Left / Top: branding */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: isDesktop ? '0 0 320px' : 'none', paddingRight: isDesktop ? 40 : 0, marginBottom: isDesktop ? 0 : 32 }}>
            <div style={{ marginBottom: 28 }}><GoogleLogo /></div>
            <h1 style={{ fontSize: 40, fontWeight: 400, margin: '0 0 12px', letterSpacing: '-0.5px', color: textColor }}>
              {step === 'email' ? 'Sign in' : 'Welcome'}
            </h1>
            <p style={{ fontSize: 16, color: textColor, margin: 0 }}>
              Use your Google Account
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
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      onKeyDown={e => e.key === 'Enter' && email && setStep('password')}
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
                    onClick={() => email && setStep('password')}
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
                      onChange={e => setPassword(e.target.value)}
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
                    style={{ backgroundColor: isDark ? '#a8c7fa' : '#0b57d0', color: isDark ? '#052e70' : '#ffffff', border: 'none', borderRadius: 20, padding: '10px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Next
                  </button>
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
  const provider = params.get('provider') || 'microsoft';
  const device = params.get('device') || 'desktop';
  const theme = params.get('theme') || 'light';

  return (
    <div className="w-full h-screen overflow-hidden">
      {provider === 'microsoft' && <MicrosoftLogin device={device} theme={theme} />}
      {provider === 'apple' && <AppleLogin device={device} theme={theme} />}
      {provider === 'google' && <GoogleLogin device={device} theme={theme} />}
    </div>
  );
}
