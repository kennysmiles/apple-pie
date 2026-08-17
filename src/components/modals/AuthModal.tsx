import React from 'react';
import { motion } from 'motion/react';
import { Cloud, RefreshCw } from 'lucide-react';
import { ThemeStyle, UserProfile } from '../../types';
import { THEME_STYLES } from '../../constants/themes';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { playMagicalBell } from '../../utils/synth';

/**
 * ============================================================================
 * SUPABASE AUTH MODAL COMPONENT
 * ============================================================================
 * Handles Cloud sync login, registration with user profile fields,
 * password reset requests, and Google OAuth flow.
 */
interface AuthModalProps {
  theme?: ThemeStyle;
  isOpen?: boolean;
  authMode?: 'login' | 'signup' | 'forgot';
  setAuthMode?: (mode: 'login' | 'signup' | 'forgot') => void;
  authEmail?: string;
  setAuthEmail?: (email: string) => void;
  authPassword?: string;
  setAuthPassword?: (password: string) => void;
  authLoading?: boolean;
  setAuthLoading?: (loading: boolean) => void;
  authMessage?: string;
  onSubmit?: () => void;
  userProfile?: UserProfile;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  theme: propTheme,
  isOpen = false,
  authMode = 'login',
  setAuthMode = (_mode?: 'login' | 'signup' | 'forgot') => {},
  authEmail = '',
  setAuthEmail = (_email?: string) => {},
  authPassword = '',
  setAuthPassword = (_password?: string) => {},
  authLoading = false,
  setAuthLoading = (_loading?: boolean) => {},
  userProfile = { fullName: '', username: '', avatarUrl: '🎂', dateOfBirth: '' },
  setUserProfile = (_val?: any) => {},
  onClose = () => {},
}) => {
  const theme = propTheme || THEME_STYLES.pastel;

  if (!isOpen) return null;
  const handleGoogleOAuth = async () => {
    if (!supabase || !isSupabaseConfigured()) {
      alert("Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in project secrets / settings.");
      return;
    }
    try {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        }
      });
      if (error) throw error;

      if (data?.url) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          data.url,
          'supabase_google_oauth',
          `width=${width},height=${height},left=${left},top=${top},status=0,toolbar=0`
        );

        if (!popup) {
          window.location.href = data.url;
        }
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      alert(err.message || "Google Authentication failed. Please ensure Google provider is enabled in your Supabase dashboard.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      alert("Please connect Supabase using the environment variables in settings first!");
      return;
    }
    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        playMagicalBell(880, 0.8);
        onClose();
      } else if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;

        if (data?.user) {
          try {
            await supabase.from('users').upsert({
              id: data.user.id,
              email: authEmail,
              full_name: userProfile.fullName,
              username: userProfile.username || '',
              avatar_url: userProfile.avatarUrl,
              date_of_birth: userProfile.dateOfBirth,
            });
          } catch (dbErr) {
            console.warn('Could not save profile details to DB on signup:', dbErr);
          }
        }

        alert('Signup successful! Check your email for confirmation, or login if auto-confirmed.');
        setAuthMode('login');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        alert('Password reset link sent to your email! Please check your inbox.');
        setAuthMode('login');
      }
    } catch (err: any) {
      alert(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative ${
          theme.isDark ? 'bg-slate-900/95 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-bold p-1 rounded-full opacity-60 hover:opacity-100 cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Cloud className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black">
            {authMode === 'login' ? 'Cloud Sync Login' : authMode === 'signup' ? 'Create Cloud Account' : 'Reset Password'}
          </h3>
          <p className={`text-xs mt-1 ${theme.isDark ? 'text-white/60' : 'text-slate-500'}`}>
            {authMode === 'login' && 'Access cloud photo storage and save cards permanently across devices'}
            {authMode === 'signup' && 'Register now to instantly save and schedule cards for recipients'}
            {authMode === 'forgot' && 'Enter your email address to receive a secure recovery reset link'}
          </p>
        </div>

        {authMode !== 'forgot' && (
          <div className="mb-4">
            <button
              type="button"
              disabled={authLoading}
              onClick={handleGoogleOAuth}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                theme.isDark
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.76-4.51z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.45h6.45c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.49z" />
                <path fill="#FBBC05" d="M5.24 14.51c-.23-.69-.36-1.43-.36-2.21s.13-1.52.36-2.21L1.39 7.56C.5 9.35 0 11.35 0 13.5s.5 4.15 1.39 5.94l3.85-2.93z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.96 1.09-3.34 0-5.86-1.81-6.76-4.51L1.39 16.82C3.37 20.33 7.35 23 12 23z" />
              </svg>
              Continue with Google
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 h-[1px] bg-slate-500/10" />
              <span className="px-3 text-[9px] uppercase font-bold tracking-wider opacity-40">Or Email password</span>
              <div className="flex-1 h-[1px] bg-slate-500/10" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Full Name</label>
                <input
                  type="text"
                  required
                  value={userProfile.fullName}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                  className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                    theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                  placeholder="e.g. Kenneth Abazu"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Username</label>
                <input
                  type="text"
                  value={userProfile.username || ''}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                  className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                    theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                  placeholder="e.g. kenneth123"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={userProfile.dateOfBirth}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none font-mono transition ${
                    theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Email Address</label>
            <input
              type="email"
              required
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
              }`}
              placeholder="you@example.com"
            />
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-bold uppercase opacity-70">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-[10px] text-indigo-400 hover:underline font-bold cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                  theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
                }`}
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {authLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login ✦' : authMode === 'signup' ? 'Create Account ✦' : 'Send Recovery Email ✦'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="text-xs text-indigo-400 hover:underline cursor-pointer"
          >
            {authMode === 'forgot' ? '← Back to Login' : authMode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
