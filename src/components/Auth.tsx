import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PolicyModal = ({ isOpen, title, slug, onClose }) => {
  if (!isOpen) return null;
  const contentUrl = `/${slug}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-xl p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-full max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="p-3 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all duration-300"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe src={contentUrl} title={title} className="w-full h-full border-0" />
        </div>
      </div>
    </div>
  );
};

// Reusable Discord Button Component to keep styling consistent
const DiscordButton = ({ onClick, isLoading, label }: { onClick: () => void, isLoading: boolean, label: string }) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-5 rounded-3xl font-bold text-xl shadow-xl flex items-center justify-center gap-4 transition-all disabled:opacity-70"
  >
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z" />
    </svg>
    {isLoading ? 'Connecting...' : label}
  </motion.button>
);

// Reusable Google Button
const GoogleButton = ({ onClick, isLoading, label }: { onClick: () => void, isLoading: boolean, label: string }) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className="w-full bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-900 py-5 rounded-3xl font-bold text-xl shadow-xl flex items-center justify-center gap-4 transition-all disabled:opacity-70"
  >
    <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.92c-.25 1.36-.98 2.52-2.1 3.3v2.62h3.39c1.98-1.82 3.12-4.5 3.12-7.18z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.39-2.62c-.94.63-2.14 1-3.89 1-2.98 0-5.5-2.02-6.4-4.73H1.18v2.97C3.07 20.8 6.5 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.6c-.23-.69-.36-1.42-.36-2.2s.13-1.51.36-2.2H1.18C.7 10.4 0 11.67 0 13c0 1.33.7 2.6 1.18 3.4l3.66-2.8z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.53 14.97 0 12 0 7.5 0 3.07 2.2 1.18 5.6l3.66 2.8c.9-2.71 3.42-4.73 6.16-4.73z" fill="#EA4335"/>
    </svg>
    {isLoading ? 'Connecting...' : label}
  </motion.button>
);

export const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signIn, signInWithDiscord, signInWithGoogle } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSlug, setModalSlug] = useState('');
  

  useEffect(() => {
    setError('');
  }, [email, password, username, displayName]);

  const openModal = (title, slug) => {
    setModalTitle(title);
    setModalSlug(slug);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDiscordLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithDiscord();
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Discord');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
  setError('');
  setIsLoading(true);
  try {
    await signInWithGoogle();
  } catch (err: any) {
    setError(err.message || 'Failed to connect to Google');
    setIsLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) { setError('Username is required'); setIsLoading(false); return; }
        if (!displayName.trim()) { setError('Display name is required'); setIsLoading(false); return; }
        if (username.includes(' ')) { setError('Username cannot contain spaces'); setIsLoading(false); return; }

        await signUp(email, password, username, displayName);
        setSuccess(true);
        setTimeout(() => {
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setUsername('');
          setDisplayName('');
          setSuccess(false);
        }, 1800);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      const message = err.message?.toLowerCase() || '';
      if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
        setError('Wrong email or password. Please try again.');
      } else if (message.includes('email not confirmed')) {
        setError('Please check your email and click the confirmation link.');
      } else if (message.includes('user already registered') || message.includes('already exists')) {
        setError('An account with this email already exists. Try signing in.');
      } else if (message.includes('password should be at least')) {
        setError('Password must be at least 6 characters long.');
      } else if (message.includes('unable to validate email address')) {
        setError('Please enter a valid email address.');
      } else if (message.includes('rate limit') || message.includes('too many requests')) {
        setError('Too many attempts. Please wait a minute and try again.');
      } else if (message.includes('network') || message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
      {/* EPIC ANIMATED BACKGROUND (shared base) */}
      <div className="absolute inset-0 z-0">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-orange-950 to-amber-950" />
        
        {/* Enhanced animated waves (3 layers + glow) */}
        <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 1440 1024" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bf7bff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7850dc" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="wave2" x1="0%" y1="30%" x2="100%" y2="70%">
              <stop offset="0%" stopColor="#7850dc" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3c2d5a" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="wave3" x1="20%" y1="60%" x2="80%" y2="30%">
              <stop offset="0%" stopColor="#bf7bff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1c142d" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Wave 1 - slow & big */}
          <motion.path
            fill="url(#wave1)"
            d="M0,180 Q360,80 720,220 Q1080,340 1440,160 L1440,1024 L0,1024 Z"
            animate={{ d: ["M0,180 Q360,80 720,220 Q1080,340 1440,160 L1440,1024 L0,1024 Z", "M0,220 Q420,120 720,180 Q1060,300 1440,200 L1440,1024 L0,1024 Z"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Wave 2 - medium */}
          <motion.path
            fill="url(#wave2)"
            d="M0,340 Q280,220 720,380 Q1180,480 1440,310 L1440,1024 L0,1024 Z"
            animate={{ d: ["M0,340 Q280,220 720,380 Q1180,480 1440,310 L1440,1024 L0,1024 Z", "M0,300 Q340,420 720,310 Q1120,220 1440,360 L1440,1024 L0,1024 Z"] }}
            transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Wave 3 - fast & subtle */}
          <motion.path
            fill="url(#wave3)"
            d="M0,520 Q400,620 720,480 Q1040,380 1440,550 L1440,1024 L0,1024 Z"
            animate={{ d: ["M0,520 Q400,620 720,480 Q1040,380 1440,550 L1440,1024 L0,1024 Z", "M0,480 Q380,420 720,560 Q1100,640 1440,490 L1440,1024 L0,1024 Z"] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

        {/* Subtle floating particles (CSS only) */}
        <div className="absolute inset-0 bg-[radial-gradient(#ff880020_1px,transparent_1px)] bg-[length:40px_40px] animate-[drift_80s_linear_infinite]" />
      </div>

      {/* ====================== DESKTOP LAYOUT (lg+) ====================== */}
      <div className="hidden lg:flex w-full h-screen relative z-10">
        {/* LEFT HERO PANEL - Epic Visual */}
        <div className="w-3/5 relative flex items-center justify-center overflow-hidden bg-black/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ff440040_0%,transparent_70%)]" />

          <div className="relative text-center z-10 px-12 max-w-xl">
            <motion.div
              initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 12 }}
              className="mx-auto mb-8 relative"
            >
            </motion.div>

            <h1 className="text-7xl font-black text-white tracking-tighter mb-3 drop-shadow-2xl">
              MuxDay
            </h1>
            <p className="text-2xl text-orange-300 font-light tracking-widest">FIND YOUR PEOPLE</p>

            <div className="mt-16 text-orange-200/70 text-sm max-w-xs mx-auto">
              Connect • Create • Cherish<br />
              <span className="text-xs">A universe where every voice echoes freely</span>
            </div>
          </div>

        </div>

        {/* RIGHT FORM PANEL - Glassmorphic */}
        <div className="w-2/5 bg-white/95 backdrop-blur-3xl flex items-center justify-center p-8 relative">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-10">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black tracking-tighter text-gray-900">MuxDay</span>
              </div>
            </div>

            {/* FORM CONTENT - identical logic */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp ? (
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <p className="text-gray-600 font-medium">Create your account with Discord</p>
                    <p className="text-xs text-gray-400 px-4">
                      By joining you agree to our{' '}
                      <button type="button" onClick={() => openModal('Terms', 'terms-of-service')} className="text-red-600 hover:underline">Terms</button> and{' '}
                      <button type="button" onClick={() => openModal('Privacy', 'privacy-policy')} className="text-red-600 hover:underline">Privacy</button>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DiscordButton onClick={handleDiscordLogin} isLoading={isLoading} label="Register with Discord" />
                    <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} label="Register with Google" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-white border-2 border-orange-200 rounded-3xl focus:border-red-500 transition-all text-lg"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-6 py-4 bg-white border-2 border-orange-200 rounded-3xl focus:border-red-500 transition-all text-lg"
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    className="w-full bg-gradient-to-r from-red-600 to-amber-500 text-white py-5 rounded-3xl font-bold text-xl shadow-lg flex items-center justify-center gap-3"
                  >
                    <LogIn size={24} /> Enter MuxDay
                  </motion.button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400 font-bold">OR</span></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DiscordButton onClick={handleDiscordLogin} isLoading={isLoading} label="Sign in with Discord" />
                    <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} label="Sign in with Google" />
                  </div>
                 
                </div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-3xl">
                  <AlertCircle size={20} />
                  <span className="font-semibold text-sm">{error}</span>
                </motion.div>
              )}
            </form>

            <div className="mt-10 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
                className="text-red-600 hover:text-orange-600 font-bold text-lg transition"
              >
                {isSignUp ? 'Already a user? Sign In' : 'New to the place? Create account'}
              </button>
            </div>

            <div className="mt-16 text-center text-xs text-gray-400">© MuxDay {new Date().getFullYear()}</div>
          </div>
        </div>
      </div>

      {/* ====================== MOBILE LAYOUT (< lg) ====================== */}
      <div className="lg:hidden w-full min-h-screen relative z-10 flex flex-col items-center justify-center px-6 py-12">
        {/* Floating logo */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative mb-8"
        >
        </motion.div>

        <div className="text-center mb-10">
          <h1 className="text-6xl font-black text-white tracking-[-3px]">MuxDay</h1>
          <p className="text-orange-300 text-xl mt-1">Find Your People</p>
        </div>

        {/* Mobile Glass Card */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/60 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp ? (
              <div className="space-y-6">
                <p className="text-xs text-center text-gray-500">
                  By joining you agree to our{' '}
                  <button type="button" onClick={() => openModal('Terms', 'terms-of-service')} className="text-red-600 underline">Terms</button>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DiscordButton onClick={handleDiscordLogin} isLoading={isLoading} label="Join via Discord" />
                <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} label="Join via Google" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-6 py-4 border border-orange-200 rounded-3xl text-lg" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-6 py-4 border border-orange-200 rounded-3xl text-lg" />
                <button type="submit" className="w-full py-5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-xl rounded-3xl">Enter MuxDay</button>
                <div className="text-center text-gray-400 font-bold text-xs py-2">OR</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DiscordButton onClick={handleDiscordLogin} isLoading={isLoading} label="Discord Sign-in" />
                <GoogleButton onClick={handleGoogleLogin} isLoading={isLoading} label="Google Sign-in" />
                </div> 
              </div>
            )}
            {error && <div className="text-red-600 text-xs text-center font-bold">{error}</div>}
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-8 text-red-600 font-medium w-full text-center text-base"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create one'}
          </button>
        </div>

        <div className="mt-12 text-xs text-white/60">© MuxDay {new Date().getFullYear()}</div>
      </div>

      <PolicyModal isOpen={isModalOpen} title={modalTitle} slug={modalSlug} onClose={closeModal} />
    </div>
  );
};