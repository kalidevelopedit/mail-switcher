import { useState, useRef, useEffect } from 'react';
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

// ─── Microsoft ──────────────────────────────────────────────────────────────

function MicrosoftLogin({ device, theme }: { device: string; theme: string }) {
  const isDark = theme === 'dark';
  const isMobile = device === 'mobile';
  const [step, setStep] = useState<'email' | 'password' | 'stay'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'password') passwordRef.current?.focus();
  }, [step]);

  const bg = !isMobile
    ? { background: isDark ? 'linear-gradient(135deg,#1f1f1f,#111)' : 'linear-gradient(135deg,#e3e6e8,#c8cdd0)' }
    : { backgroundColor: isDark ? '#111' : '#ffffff' };

  const cardCls = !isMobile
    ? `px-10 pt-10 pb-8 shadow-md ${isDark ? 'bg-[#242424]' : 'bg-white'}`
    : '';

  const textColor = isDark ? 'text-white' : 'text-[#1b1b1b]';
  const subColor = isDark ? '#ccc' : '#1b1b1b';
  const inputBorder = isDark
    ? 'border-[#555] focus:border-[#0078D4] text-white placeholder-gray-500'
    : 'border-[#000]/40 focus:border-[#0078D4] text-black placeholder-gray-500';

  return (
    <div className="w-full h-full flex items-center justify-center font-[system-ui,Segoe_UI,sans-serif]" style={bg}>
      <div className={`flex flex-col ${isMobile ? 'w-full h-full px-8 pt-10' : 'w-[440px] gap-4'}`}>

        {/* ── Step: email ── */}
        {step === 'email' && (
          <>
            <div className={`flex flex-col gap-0 ${cardCls}`}>
              <div className="flex items-center gap-2 mb-5">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide" style={{ color: isDark ? '#ccc' : '#737373' }}>Microsoft</span>}
              </div>
              <h1 className={`text-[24px] font-bold mb-5 ${textColor}`}>Sign in</h1>
              <div className="relative mb-4">
                <input
                  data-testid="ms-email-input"
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setStep('password')}
                  placeholder="Email, phone, or Skype"
                  autoFocus
                  className={`w-full pb-2 border-0 border-b focus:outline-none bg-transparent text-[15px] transition-colors ${inputBorder}`}
                />
              </div>
              <div className="text-[13px] mb-3" style={{ color: subColor }}>
                No account? <a href="#" data-testid="ms-create-account" className="text-[#0078D4] hover:underline">Create one!</a>
              </div>
              <div className="text-[13px] mb-8">
                <a href="#" data-testid="ms-cant-access" className="text-[#0078D4] hover:underline">Can't access your account?</a>
              </div>
              <div className="flex justify-end">
                <button
                  data-testid="ms-next-btn"
                  onClick={() => setStep('password')}
                  className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Next
                </button>
              </div>
            </div>
            <div
              data-testid="ms-signin-options"
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
          </>
        )}

        {/* ── Step: password ── */}
        {step === 'password' && (
          <>
            <div className={`flex flex-col gap-0 ${cardCls}`}>
              <div className="flex items-center gap-2 mb-5">
                <MicrosoftLogo />
                {!isMobile && <span className="text-[15px] font-semibold tracking-wide" style={{ color: isDark ? '#ccc' : '#737373' }}>Microsoft</span>}
              </div>
              <button
                data-testid="ms-back-btn"
                onClick={() => setStep('email')}
                className={`flex items-center gap-1.5 text-[13px] mb-4 w-fit transition-colors ${isDark ? 'text-[#ccc] hover:text-white' : 'text-[#1b1b1b] hover:text-black'}`}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span
                  className={`text-[13px] px-2 py-0.5 rounded-sm border ${isDark ? 'border-[#555] bg-[#333]' : 'border-gray-300 bg-gray-100'}`}
                >
                  {email || 'user@example.com'}
                </span>
              </button>
              <h1 className={`text-[24px] font-bold mb-5 ${textColor}`}>Enter password</h1>
              <div className="relative mb-6">
                <input
                  ref={passwordRef}
                  data-testid="ms-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setStep('stay')}
                  placeholder="Password"
                  className={`w-full pb-2 border-0 border-b focus:outline-none bg-transparent text-[15px] transition-colors pr-8 ${inputBorder}`}
                />
                <button
                  data-testid="ms-show-password"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-0 bottom-2 opacity-50 hover:opacity-80"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: isDark ? '#fff' : '#000' }} /> : <Eye className="w-4 h-4" style={{ color: isDark ? '#fff' : '#000' }} />}
                </button>
              </div>
              <div className="text-[13px] mb-8">
                <a href="#" data-testid="ms-forgot-password" className="text-[#0078D4] hover:underline">Forgot password?</a>
              </div>
              <div className="flex justify-end">
                <button
                  data-testid="ms-signin-btn"
                  onClick={() => setStep('stay')}
                  className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
                  style={{ borderRadius: 0 }}
                >
                  Sign in
                </button>
              </div>
            </div>
            <div
              data-testid="ms-signin-options-2"
              className={`flex items-center px-4 py-3 cursor-pointer border transition-colors
                ${isDark ? 'bg-[#242424] border-[#444] hover:bg-[#2e2e2e] text-white' : 'bg-white border-gray-300 hover:bg-gray-50 text-[#1b1b1b]'}`}
            >
              <Key className="w-5 h-5 mr-3 opacity-60" />
              <span className="text-[15px]">Sign in with Windows Hello or a security key</span>
            </div>
          </>
        )}

        {/* ── Step: stay signed in ── */}
        {step === 'stay' && (
          <div className={`flex flex-col gap-0 ${cardCls}`}>
            <div className="flex items-center gap-2 mb-5">
              <MicrosoftLogo />
              {!isMobile && <span className="text-[15px] font-semibold tracking-wide" style={{ color: isDark ? '#ccc' : '#737373' }}>Microsoft</span>}
            </div>
            <h1 className={`text-[24px] font-bold mb-3 ${textColor}`}>Stay signed in?</h1>
            <p className="text-[14px] mb-6" style={{ color: subColor }}>
              Do this to reduce the number of times you are asked to sign in.
            </p>
            <label
              data-testid="ms-dont-show-checkbox"
              className="flex items-center gap-2 mb-8 cursor-pointer select-none"
              style={{ color: subColor, fontSize: 14 }}
            >
              <div
                onClick={() => setDontShow(v => !v)}
                className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer
                  ${dontShow ? 'bg-[#0078D4] border-[#0078D4]' : isDark ? 'border-[#555]' : 'border-[#666]'}`}
              >
                {dontShow && <Check className="w-3 h-3 text-white" />}
              </div>
              Don't show this again
            </label>
            <div className="flex gap-3 justify-end">
              <button
                data-testid="ms-no-btn"
                onClick={() => setStep('email')}
                className={`text-[15px] font-semibold px-6 py-1.5 border transition-colors
                  ${isDark ? 'border-[#555] text-white hover:bg-[#333]' : 'border-gray-400 text-[#1b1b1b] hover:bg-gray-100'}`}
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
        )}
      </div>
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

  // Initial avatar letter
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
              {step === 'email' ? 'Use your Google Account' : 'Use your Google Account'}
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
