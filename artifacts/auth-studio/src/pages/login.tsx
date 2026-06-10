import { ChevronLeft, Key } from 'lucide-react';

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

function MicrosoftLogin({ device, theme }: { device: string; theme: string }) {
  const isDark = theme === 'dark';
  const isMobile = device === 'mobile';

  return (
    <div
      className="w-full h-full flex items-center justify-center font-[system-ui,Segoe_UI,sans-serif]"
      style={
        !isMobile
          ? { background: isDark ? 'linear-gradient(135deg,#1f1f1f,#111)' : 'linear-gradient(135deg,#e3e6e8,#c8cdd0)' }
          : { backgroundColor: isDark ? '#111' : '#ffffff' }
      }
    >
      <div className={`flex flex-col ${isMobile ? 'w-full h-full px-8 pt-10' : 'w-[440px] gap-4'}`}>
        <div className={`flex flex-col gap-0 ${!isMobile ? `px-10 pt-10 pb-8 shadow-md ${isDark ? 'bg-[#242424]' : 'bg-white'}` : ''}`}>
          <div className="flex items-center gap-2 mb-5">
            <MicrosoftLogo />
            {!isMobile && (
              <span className="text-[15px] font-semibold tracking-wide" style={{ color: isDark ? '#ccc' : '#737373' }}>
                Microsoft
              </span>
            )}
          </div>
          <h1 className={`text-[24px] font-bold mb-5 ${isDark ? 'text-white' : 'text-[#1b1b1b]'}`}>Sign in</h1>
          <div className="relative mb-4">
            <input
              type="text"
              data-testid="microsoft-email-input"
              placeholder="Email, phone, or Skype"
              className={`w-full pb-2 border-0 border-b focus:outline-none bg-transparent text-[15px] transition-colors
                ${isDark
                  ? 'border-[#555] focus:border-[#0078D4] text-white placeholder-gray-500'
                  : 'border-[#000]/40 focus:border-[#0078D4] text-black placeholder-gray-500'}`}
            />
          </div>
          <div className="text-[13px] mb-3" style={{ color: isDark ? '#ccc' : '#1b1b1b' }}>
            No account?{' '}
            <a href="#" data-testid="microsoft-create-account" className="text-[#0078D4] hover:underline">Create one!</a>
          </div>
          <div className="text-[13px] mb-8">
            <a href="#" data-testid="microsoft-cant-access" className="text-[#0078D4] hover:underline">Can't access your account?</a>
          </div>
          <div className="flex justify-end">
            <button
              data-testid="microsoft-next-button"
              className="bg-[#0078D4] hover:bg-[#005a9e] text-white text-[15px] font-semibold px-8 py-1.5 transition-colors"
              style={{ borderRadius: 0 }}
            >
              Next
            </button>
          </div>
        </div>

        <div
          data-testid="microsoft-signin-options"
          className={`flex items-center px-4 py-3 cursor-pointer border transition-colors mt-${isMobile ? '6' : '0'}
            ${isDark ? 'bg-[#242424] border-[#444] hover:bg-[#2e2e2e] text-white' : 'bg-white border-gray-300 hover:bg-gray-50 text-[#1b1b1b]'}`}
          style={isMobile ? { marginTop: 24 } : {}}
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
      </div>
    </div>
  );
}

function AppleLogin({ device, theme }: { device: string; theme: string }) {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';

  return (
    <>
      <style>{`
        @keyframes apple-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .apple-ring {
          animation: apple-ring-spin 4s linear infinite;
        }
      `}</style>
      <div
        className={`w-full h-full flex items-center justify-center font-[-apple-system,BlinkMacSystemFont,Inter,sans-serif] transition-colors
          ${isDesktop
            ? isDark ? 'bg-[#1c1c1e]' : 'bg-[#f5f5f7]'
            : isDark ? 'bg-black' : 'bg-white'}
          ${isDark ? 'text-white' : 'text-black'}`}
      >
        <div
          className={`relative flex flex-col items-center w-full
            ${isDesktop
              ? `max-w-[480px] px-12 py-14 rounded-2xl shadow-xl ${isDark ? 'bg-[#2c2c2e]' : 'bg-white'}`
              : 'h-full px-8 pt-14'}`}
        >
          {!isDesktop && (
            <button data-testid="apple-back-button" className="absolute top-14 left-5 text-[#007AFF] flex items-center">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="relative flex items-center justify-center mb-7">
            <svg
              className="apple-ring absolute"
              width="88"
              height="88"
              viewBox="0 0 88 88"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * 2 * Math.PI;
                const cx = 44 + 36 * Math.cos(angle);
                const cy = 44 + 36 * Math.sin(angle);
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={i % 3 === 0 ? 2.5 : 1.8}
                    fill="#007AFF"
                    opacity={0.3 + (i / 24) * 0.7}
                  />
                );
              })}
            </svg>
            <AppleLogo className={`w-11 h-11 ${isDark ? 'text-white' : 'text-black'}`} />
          </div>

          <h1 className="text-[26px] font-bold mb-3 tracking-tight">Apple Account</h1>
          <p className={`text-center text-[15px] leading-relaxed mb-8 ${isDark ? 'text-[#8e8e93]' : 'text-[#6e6e73]'}`}>
            Sign in with an email or phone number to use iCloud, the App Store, Messages or other Apple services.
          </p>

          <div
            className={`w-full rounded-[13px] overflow-hidden border mb-6
              ${isDark ? 'bg-[#1c1c1e] border-[#38383a]' : 'bg-[#f2f2f7] border-[#d1d1d6]'}`}
          >
            <input
              type="text"
              defaultValue="alan.jones@example.com"
              data-testid="apple-email-input"
              className={`w-full px-4 py-3.5 text-[17px] focus:outline-none bg-transparent ${isDark ? 'text-white' : 'text-black'}`}
            />
            <div className={`h-px mx-4 ${isDark ? 'bg-[#38383a]' : 'bg-[#d1d1d6]'}`} />
            <input
              type="password"
              placeholder="Password"
              data-testid="apple-password-input"
              className={`w-full px-4 py-3.5 text-[17px] focus:outline-none bg-transparent
                ${isDark ? 'text-white placeholder-[#636366]' : 'text-black placeholder-[#aeaeb2]'}`}
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <button data-testid="apple-forgot-password" className="text-[#007AFF] text-[15px]">Forgot password?</button>
            <button data-testid="apple-child-signin" className="text-[#007AFF] text-[15px]">Sign in a child in my Family</button>
          </div>

          {!isDesktop && (
            <div className="absolute bottom-3 inset-x-0 flex justify-center">
              <div className={`w-[134px] h-[5px] rounded-full ${isDark ? 'bg-white/40' : 'bg-black/20'}`} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function GoogleLogin({ device, theme }: { device: string; theme: string }) {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500&display=swap');`}</style>
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
          backgroundColor: isDark ? '#1f1f1f' : '#f0f4f9',
          color: isDark ? '#e3e3e3' : '#1f1f1f',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            width: isDesktop ? 800 : '100%',
            height: isDesktop ? 450 : '100%',
            background: isDark ? '#282a2c' : '#ffffff',
            borderRadius: isDesktop ? 28 : 0,
            padding: isDesktop ? '40px 40px' : '48px 24px 24px',
            boxSizing: 'border-box',
          }}
        >
          {/* Left / Top: branding */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: isDesktop ? '0 0 320px' : 'none', paddingRight: isDesktop ? 40 : 0, marginBottom: isDesktop ? 0 : 32 }}>
            <div style={{ marginBottom: 28 }}>
              <GoogleLogo />
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 400, margin: '0 0 12px', letterSpacing: '-0.5px', color: isDark ? '#e3e3e3' : '#1f1f1f' }}>
              Sign in
            </h1>
            <p style={{ fontSize: 16, color: isDark ? '#e3e3e3' : '#1f1f1f', margin: 0 }}>
              Use your Google Account
            </p>
          </div>

          {/* Right / Bottom: form */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            <div>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder=" "
                  data-testid="google-email-input"
                  style={{
                    width: '100%',
                    padding: '20px 16px 8px',
                    fontSize: 16,
                    border: `1px solid ${isDark ? '#8e918f' : '#747775'}`,
                    borderRadius: 4,
                    background: 'transparent',
                    color: isDark ? '#e3e3e3' : '#1f1f1f',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  className="google-input"
                />
                <label
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: 14,
                    fontSize: 16,
                    color: isDark ? '#8e918f' : '#444746',
                    pointerEvents: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  Email or phone
                </label>
              </div>
              <button
                data-testid="google-forgot-email"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#a8c7fa' : '#0b57d0',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '6px 8px 6px 0',
                  marginBottom: 20,
                }}
              >
                Forgot email?
              </button>
              <p style={{ fontSize: 14, color: isDark ? '#c4c7c5' : '#444746', margin: '0 0 4px' }}>
                Not your computer? Use Guest mode to sign in privately.
              </p>
              <button
                data-testid="google-guest-mode"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#a8c7fa' : '#0b57d0',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                Learn more about using Guest mode
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                data-testid="google-create-account"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#a8c7fa' : '#0b57d0',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '10px 16px',
                  borderRadius: 20,
                }}
              >
                Create account
              </button>
              <button
                data-testid="google-next-button"
                style={{
                  backgroundColor: isDark ? '#a8c7fa' : '#0b57d0',
                  color: isDark ? '#052e70' : '#ffffff',
                  border: 'none',
                  borderRadius: 20,
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

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