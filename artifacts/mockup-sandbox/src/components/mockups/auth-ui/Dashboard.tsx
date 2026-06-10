import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, Moon, Sun, Key, ChevronLeft } from 'lucide-react';

const MicrosoftLogo = () => (
  <svg width="24" height="24" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const AppleLogo = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const GoogleLogo = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const MicrosoftAuth = ({ device, theme }: { device: string, theme: string }) => {
  const isDark = theme === 'dark';
  const isMobile = device === 'mobile';
  
  const bgStyle = isDark 
    ? { background: 'linear-gradient(135deg, #1f1f1f 0%, #111 100%)' }
    : { background: 'linear-gradient(135deg, #e3e6e8 0%, #c8cdd0 100%)' };
    
  return (
    <div className={`flex items-center justify-center w-full h-full font-sans transition-colors duration-300 ${isDark ? 'text-white' : 'text-[#1b1b1b]'}`} style={!isMobile ? bgStyle : { backgroundColor: isDark ? '#111' : '#fff' }}>
      <div className={`flex flex-col ${isMobile ? 'w-full h-full p-6' : 'w-[440px]'}`}>
        <div className={`flex flex-col ${!isMobile ? `p-10 shadow-lg ${isDark ? 'bg-[#242424]' : 'bg-white'}` : ''}`}>
          <div className="flex items-center gap-2 mb-6">
            <MicrosoftLogo />
            {!isMobile && <span className="text-lg font-semibold text-[#737373] tracking-wide ml-1">Microsoft</span>}
          </div>
          <h1 className="text-2xl font-bold mb-4 font-[Segoe UI,system-ui,sans-serif]">Sign in</h1>
          
          <input 
            type="text" 
            placeholder="Email, phone, or Skype"
            className={`w-full pb-2 mb-4 border-b focus:outline-none transition-colors duration-200 bg-transparent
              ${isDark ? 'border-gray-500 focus:border-[#0078D4] text-white placeholder-gray-400' : 'border-black/50 focus:border-[#0078D4] text-black placeholder-gray-600'}`}
          />
          
          <div className="text-[13px] mb-4">
            <span className="opacity-80">No account? </span>
            <a href="#" className="text-[#0078D4] hover:underline">Create one!</a>
          </div>
          
          <div className="text-[13px] mb-8">
            <a href="#" className="text-[#0078D4] hover:underline">Can't access your account?</a>
          </div>
          
          <div className="flex justify-end mt-auto">
            <button className="bg-[#0078D4] text-white px-8 py-1.5 font-semibold hover:bg-[#005a9e] transition-colors">
              Next
            </button>
          </div>
        </div>
        
        <div className={`mt-6 flex items-center p-3 cursor-pointer group transition-colors duration-200
          ${!isMobile ? 'shadow-sm border' : 'border'} 
          ${isDark ? 'bg-[#242424] border-gray-600 hover:bg-[#333]' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
          <Key className="w-5 h-5 mr-3 opacity-70" />
          <span className="text-[15px]">Sign-in options</span>
        </div>
      </div>
    </div>
  );
};

const AppleAuth = ({ device, theme }: { device: string, theme: string }) => {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';
  
  return (
    <div className={`flex items-center justify-center w-full h-full font-[system-ui,-apple-system,BlinkMacSystemFont,sans-serif] transition-colors duration-300
      ${isDesktop 
        ? (isDark ? 'bg-[#1c1c1e]' : 'bg-[#f5f5f7]') 
        : (isDark ? 'bg-black' : 'bg-white')} 
      ${isDark ? 'text-white' : 'text-black'}`}>
      
      <div className={`relative flex flex-col items-center w-full ${isDesktop ? `max-w-[500px] p-12 rounded-2xl shadow-xl ${isDark ? 'bg-[#2c2c2e]' : 'bg-white'}` : 'h-full p-6 pt-12'}`}>
        
        {/* Back button (Mobile only) */}
        {!isDesktop && (
          <button className="absolute top-6 left-4 text-[#007aff] flex items-center">
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-[80px] h-[80px] rounded-full border-2 border-transparent border-t-[#007aff] border-r-[#007aff] animate-[spin_3s_linear_infinite]" style={{ borderStyle: 'dotted' }}></div>
          <AppleLogo className={`w-10 h-10 ${isDark ? 'text-white' : 'text-black'}`} />
        </div>
        
        <h1 className="text-2xl font-semibold mb-3 tracking-tight">Apple Account</h1>
        <p className={`text-center text-[15px] mb-8 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Sign in with an email or phone number to use iCloud, the App Store, Messages or other Apple services.
        </p>
        
        <div className={`w-full rounded-[15px] overflow-hidden border mb-6
          ${isDark ? 'bg-[#1c1c1e] border-[#38383a]' : 'bg-white border-[#d1d1d6]'}`}>
          <input 
            type="text" 
            defaultValue="alan.jones@example.com"
            className={`w-full px-4 py-3.5 text-[17px] focus:outline-none bg-transparent ${isDark ? 'text-white' : 'text-black'}`}
          />
          <div className={`h-[1px] w-full ml-4 ${isDark ? 'bg-[#38383a]' : 'bg-[#d1d1d6]'}`}></div>
          <input 
            type="password" 
            placeholder="Password"
            className={`w-full px-4 py-3.5 text-[17px] focus:outline-none bg-transparent ${isDark ? 'text-white placeholder-gray-500' : 'text-black placeholder-gray-400'}`}
          />
        </div>
        
        <div className="flex flex-col items-center gap-4 w-full">
          <button className="text-[#007aff] text-[15px]">Forgot password?</button>
          <button className="text-[#007aff] text-[15px]">Sign in a child in my Family</button>
        </div>
        
        {/* Home indicator (Mobile only) */}
        {!isDesktop && (
          <div className={`absolute bottom-2 w-[134px] h-[5px] rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}></div>
        )}
      </div>
    </div>
  );
};

const GoogleAuth = ({ device, theme }: { device: string, theme: string }) => {
  const isDark = theme === 'dark';
  const isDesktop = device === 'desktop';
  
  return (
    <div className={`flex items-center justify-center w-full h-full font-['Google_Sans',Roboto,Arial,sans-serif] transition-colors duration-300
      ${isDark ? 'bg-[#1f1f1f] text-[#e3e3e3]' : 'bg-[#f0f4f9] text-[#1f1f1f]'}`}>
      
      <div className={`flex ${isDesktop ? `flex-row w-[800px] h-[450px] rounded-3xl p-10 ${isDark ? 'bg-[#282a2c]' : 'bg-white'}` : `flex-col w-full h-full p-6 pt-12 ${isDark ? 'bg-[#1f1f1f]' : 'bg-white'}`}`}>
        
        <div className={`flex flex-col ${isDesktop ? 'w-1/2 pr-10' : 'w-full mb-10'}`}>
          <div className="mb-8">
            <GoogleLogo />
          </div>
          <h1 className={`text-4xl font-normal tracking-tight mb-4 ${isDark ? 'text-[#e3e3e3]' : 'text-[#1f1f1f]'}`}>Sign in</h1>
          <p className={`text-base ${isDark ? 'text-[#e3e3e3]' : 'text-[#1f1f1f]'}`}>Use your Google Account</p>
        </div>
        
        <div className={`flex flex-col justify-between ${isDesktop ? 'w-1/2 pt-2' : 'w-full flex-grow'}`}>
          <div>
            <div className="relative mb-2">
              <input 
                type="text" 
                className={`w-full px-4 pt-5 pb-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b57d0] transition-all bg-transparent peer
                  ${isDark ? 'border-[#8e918f] text-white focus:border-[#a8c7fa]' : 'border-[#747775] text-black focus:border-[#0b57d0]'}`}
                placeholder=" "
              />
              <label className={`absolute left-4 top-3.5 text-base transition-all duration-200 pointer-events-none
                peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-[#0b57d0]
                peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs
                ${isDark ? 'text-[#8e918f] peer-focus:text-[#a8c7fa]' : 'text-[#444746]'}`}>
                Email or phone
              </label>
            </div>
            
            <button className={`text-sm font-medium hover:bg-black/5 px-2 py-1.5 rounded -ml-2 mb-8 ${isDark ? 'text-[#a8c7fa]' : 'text-[#0b57d0]'}`}>
              Forgot email?
            </button>
            
            <p className={`text-sm mt-4 ${isDark ? 'text-[#c4c7c5]' : 'text-[#444746]'}`}>
              Not your computer? Use Guest mode to sign in privately.
            </p>
            <button className={`text-sm font-medium hover:bg-black/5 px-2 py-1.5 rounded -ml-2 mb-4 ${isDark ? 'text-[#a8c7fa]' : 'text-[#0b57d0]'}`}>
              Learn more about using Guest mode
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <button className={`text-sm font-medium px-4 py-2 rounded-full hover:bg-black/5 ${isDark ? 'text-[#a8c7fa]' : 'text-[#0b57d0]'}`}>
              Create account
            </button>
            <button className={`text-sm font-medium px-6 py-2 rounded-full transition-colors
              ${isDark ? 'bg-[#a8c7fa] text-[#052e70] hover:bg-[#b5d0fa]' : 'bg-[#0b57d0] text-white hover:bg-[#0842a0]'}`}>
              Next
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export function Dashboard() {
  const [provider, setProvider] = useState<'microsoft' | 'apple' | 'google'>('microsoft');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const providers = [
    { id: 'microsoft', name: 'Microsoft', icon: <MicrosoftLogo />, color: '#0078D4' },
    { id: 'apple', name: 'Apple', icon: <AppleLogo className="w-5 h-5" />, color: '#007AFF' },
    { id: 'google', name: 'Google', icon: <GoogleLogo />, color: '#4285F4' },
  ];

  const devices = [
    { id: 'desktop', name: 'Desktop', icon: <Monitor className="w-4 h-4" /> },
    { id: 'tablet', name: 'Tablet', icon: <Tablet className="w-4 h-4" /> },
    { id: 'mobile', name: 'Mobile', icon: <Smartphone className="w-4 h-4" /> },
  ];

  const renderAuthScreen = () => {
    switch (provider) {
      case 'microsoft': return <MicrosoftAuth device={device} theme={theme} />;
      case 'apple': return <AppleAuth device={device} theme={theme} />;
      case 'google': return <GoogleAuth device={device} theme={theme} />;
      default: return null;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
      `}} />
      <div className="flex h-screen w-full bg-[#0f1115] text-[#ececf1] overflow-hidden font-sans">
        
        {/* Left Sidebar */}
        <div className="w-[260px] flex-shrink-0 bg-[#16181d] border-r border-[#2d3139] flex flex-col z-10 shadow-xl">
          <div className="p-6 pb-4 flex items-center border-b border-[#2d3139]/50">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 mr-3 flex items-center justify-center shadow-inner">
              <Key className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-white">AuthStudio</h1>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-8">
            
            {/* Providers Section */}
            <div className="space-y-3">
              <h2 className="text-[11px] font-bold text-[#8a919e] uppercase tracking-wider px-2">Provider</h2>
              <div className="space-y-1.5">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id as any)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${provider === p.id 
                        ? 'bg-[#23262f] shadow-sm' 
                        : 'hover:bg-[#1e2128]'}`}
                  >
                    <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center mr-3 shadow-sm">
                      {p.icon}
                    </div>
                    <span className={`font-medium ${provider === p.id ? 'text-white' : 'text-[#aeb5c0] group-hover:text-white'}`}>
                      {p.name}
                    </span>
                    {provider === p.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Device Section */}
            <div className="space-y-3">
              <h2 className="text-[11px] font-bold text-[#8a919e] uppercase tracking-wider px-2">Device Viewport</h2>
              <div className="flex bg-[#0f1115] p-1 rounded-lg border border-[#2d3139]">
                {devices.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDevice(d.id as any)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all duration-200
                      ${device === d.id 
                        ? 'bg-[#2d3139] text-white shadow-sm' 
                        : 'text-[#8a919e] hover:text-[#ececf1] hover:bg-[#1e2128]'}`}
                  >
                    {d.icon}
                    <span className="text-[10px] mt-1 font-medium">{d.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Theme Section */}
            <div className="space-y-3">
              <h2 className="text-[11px] font-bold text-[#8a919e] uppercase tracking-wider px-2">Color Scheme</h2>
              <div className="flex bg-[#0f1115] p-1 rounded-lg border border-[#2d3139]">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all duration-200
                    ${theme === 'light' 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-[#8a919e] hover:text-white'}`}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  <span className="text-xs font-semibold">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all duration-200
                    ${theme === 'dark' 
                      ? 'bg-[#2d3139] text-white shadow-sm' 
                      : 'text-[#8a919e] hover:text-white'}`}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  <span className="text-xs font-semibold">Dark</span>
                </button>
              </div>
            </div>
            
          </div>
          
          <div className="p-4 border-t border-[#2d3139]/50 text-xs text-[#8a919e] text-center">
            AuthStudio UI Previewer v1.0
          </div>
        </div>

        {/* Center Preview Area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNikiLz48L3N2Zz4=')] bg-[#0b0c10]">
          
          {/* Decorative background glow based on active provider */}
          <div 
            className="absolute inset-0 opacity-20 transition-all duration-1000 ease-in-out mix-blend-screen"
            style={{
              background: `radial-gradient(circle at center, ${providers.find(p => p.id === provider)?.color} 0%, transparent 70%)`,
              transform: 'scale(1.5)'
            }}
          />

          {/* Device Frame */}
          <div className="relative z-10 transition-all duration-500 ease-in-out flex items-center justify-center">
            
            {/* Desktop Frame */}
            {device === 'desktop' && (
              <div className="w-[1024px] h-[640px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10" style={{ transform: 'scale(0.85)' }}>
                {/* Browser Chrome */}
                <div className="h-10 bg-[#2d2d2d] flex items-center px-4 flex-shrink-0 border-b border-black/20">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="mx-auto px-6 py-1 bg-[#1a1a1a] rounded-md text-[11px] text-gray-400 font-mono w-[400px] text-center truncate">
                    https://id.{provider}.com/login
                  </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                  {renderAuthScreen()}
                </div>
              </div>
            )}

            {/* Tablet Frame */}
            {device === 'tablet' && (
              <div className="w-[768px] h-[1024px] bg-black rounded-[2rem] p-4 shadow-2xl ring-4 ring-[#2a2a2a] relative" style={{ transform: 'scale(0.65)' }}>
                <div className="absolute top-1/2 -left-5 w-1.5 h-16 bg-[#2a2a2a] rounded-l-md"></div>
                <div className="absolute top-1/2 -right-5 w-1.5 h-16 bg-[#2a2a2a] rounded-r-md"></div>
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative border border-white/10">
                  {renderAuthScreen()}
                </div>
              </div>
            )}

            {/* Mobile Frame */}
            {device === 'mobile' && (
              <div className="w-[390px] h-[844px] bg-black rounded-[3rem] p-3 shadow-2xl ring-[6px] ring-[#1a1a1a] relative" style={{ transform: 'scale(0.8)' }}>
                {/* Hardware Buttons */}
                <div className="absolute top-24 -left-5 w-1.5 h-10 bg-[#1a1a1a] rounded-l-md"></div>
                <div className="absolute top-40 -left-5 w-1.5 h-16 bg-[#1a1a1a] rounded-l-md"></div>
                <div className="absolute top-60 -left-5 w-1.5 h-16 bg-[#1a1a1a] rounded-l-md"></div>
                <div className="absolute top-32 -right-5 w-1.5 h-24 bg-[#1a1a1a] rounded-r-md"></div>
                
                {/* Screen */}
                <div className="w-full h-full rounded-[2.25rem] overflow-hidden relative bg-white">
                  {/* Notch */}
                  <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
                    <div className="w-[120px] h-[25px] bg-black rounded-b-3xl"></div>
                  </div>
                  {/* Status Bar Top */}
                  <div className="absolute top-0 inset-x-0 h-12 flex justify-between items-center px-6 z-40 pointer-events-none">
                    <span className={`text-[13px] font-medium mt-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>9:41</span>
                    <div className="flex gap-1.5 mt-1">
                      <div className={`w-4 h-3 border ${theme === 'dark' ? 'border-white' : 'border-black'} rounded-[3px]`}></div>
                    </div>
                  </div>
                  
                  {renderAuthScreen()}
                  
                  {/* Home Indicator Bottom */}
                  {/* Note: AppleAuth handles its own home indicator for structural reasons, but others might need it */}
                  {provider !== 'apple' && (
                    <div className="absolute bottom-2 inset-x-0 flex justify-center z-50 pointer-events-none">
                      <div className={`w-[134px] h-[5px] rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}
