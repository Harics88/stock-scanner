import React, { useState } from 'react';
import { useAuth } from '../AuthContext';

const Icon = ({ name, size = 24, className = "" }) => {
  const icons = {
    Mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    Lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    Eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    ArrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name]}
    </svg>
  );
};

export default function LoginScreen() {
  const { signInWithGoogle, loginWithEmail, registerWithEmail } = useAuth();
  const [authMode, setAuthMode] = useState('google'); // 'google' or 'email'
  const [emailMode, setEmailMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (emailMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message.includes('auth/') ? err.message.split('/')[1].replace(/-/g, ' ') : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {['top-10 left-10','top-1/4 right-20','bottom-20 left-1/4','bottom-1/3 right-10'].map((pos,i) => (
          <div key={i} className={`absolute ${pos} w-32 h-32 bg-white/10 rounded-full blur-2xl`} />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        <div className="text-8xl mb-4 animate-bounce inline-block">🦕</div>
        <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg">Dino Star Quest!</h1>
        <p className="text-indigo-200 text-xl mb-6 font-medium">Complete missions, earn stars, get rewards!</p>

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-white/50 animate-in slide-in-from-bottom duration-500">
          <p className="text-slate-500 font-bold mb-6">Parents — sign in to manage your explorers!</p>

          {authMode === 'google' ? (
            <div className="space-y-4">
              <button
                onClick={signInWithGoogle}
                className="w-full bg-white border-2 border-slate-200 hover:border-indigo-400 text-slate-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-md flex items-center justify-center gap-4 transition-all hover:shadow-lg active:scale-95"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
              <button
                onClick={() => setAuthMode('email')}
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Or use email and password
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="relative">
                <Icon name="Mail" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium text-slate-800"
                />
              </div>
              <div className="relative">
                <Icon name="Lock" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-400 transition-all font-medium text-slate-800"
                />
              </div>

              {error && <p className="text-red-500 font-bold text-sm capitalize">{error}</p>}

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? 'Processing...' : (emailMode === 'login' ? 'Sign In' : 'Create Account')}
                <Icon name="ArrowRight" size={20} />
              </button>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailMode(emailMode === 'login' ? 'signup' : 'login')}
                  className="text-slate-500 font-bold text-sm hover:text-indigo-600"
                >
                  {emailMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('google')}
                  className="text-indigo-600 font-bold text-sm hover:underline"
                >
                  Back to Google Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
