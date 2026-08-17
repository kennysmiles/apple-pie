import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Music, Wand2, Gift, Wand as WandIcon } from 'lucide-react';

/**
 * ============================================================================
 * LANDING PAGE COMPONENT
 * ============================================================================
 * Clean, light-themed home page showcasing Apple Pie Studio's interactive features
 * (Melodic Chimes, AI Poetry, 3D Gifts, Wishlist Builder) with guest & auth triggers.
 */
interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onEnterGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterGuest,
}) => {
  return (
    <motion.div
      key="landing-page-view"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="container mx-auto px-4 py-8 md:py-16 max-w-6xl z-10 relative flex flex-col items-center justify-between min-h-[90vh] text-center"
    >
      {/* ------------------------------------------------------------------------ */}
      {/* BRANDING HEADER                                                           */}
      {/* ------------------------------------------------------------------------ */}
      <header className="w-full flex items-center justify-between mb-12 border-b border-slate-900/10 pb-5">
        <div className="flex items-center gap-2">
          <div className="h-10 w-auto shrink-0 flex items-center justify-center">
            <img
              src="https://tmmfshiaadtroqcigeff.supabase.co/storage/v1/object/public/birthday-memories/p/Apple-pie-logo2.png"
              alt="Apple Pie Studio Logo"
              referrerPolicy="no-referrer"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              className="h-8 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight font-display text-slate-900">
              Apple Pie
            </h1>
          </div>
        </div>

        <div>
          <button
            onClick={() => onOpenAuth('login')}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition cursor-pointer"
          >
            Sign In ✨
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------------ */}
      {/* HERO SECTION                                                             */}
      {/* ------------------------------------------------------------------------ */}
      <div className="space-y-8 max-w-3xl mx-auto my-auto py-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-white/80 text-xs font-bold text-purple-700 shadow-sm backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 text-purple-600 animate-spin duration-3000" />
          <span className="font-extrabold tracking-wide">Interactive Birthday Experience & Wishlist Creator</span>
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 font-display">
          Celebrate With <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600">
            Pure Symphony
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-semibold">
          Design bespoke, animated digital birthday cards and interactive wishlists.
          Unwrap 3D gift boxes, listen to customized melodic chime soundscapes,
          and discover AI-powered personal poetry — all created in seconds.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <button
            onClick={() => onOpenAuth('signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-black tracking-[0.15em] uppercase transition-all duration-300 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Create Account ✨
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-black tracking-[0.15em] uppercase transition-all duration-300 bg-white/80 text-slate-800 hover:bg-white border border-slate-300/80 shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            Sign In ✦
          </button>

          <button
            onClick={onEnterGuest}
            className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-black tracking-[0.15em] uppercase transition-all duration-300 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/90 border border-indigo-200/80 shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Create as Guest</span>
            <Wand2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* BENTO GRID FEATURE SHOWCASE                                               */}
      {/* ------------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-5xl mt-12">
        {/* Feature 1 */}
        <div className="p-6 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-white hover:bg-white/60 transition-all duration-300 text-left group shadow-lg">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Melodic Chimes</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Polyphonic chime melodies including classic Birthday tunes, retro lofi layers, and ambient sparkles.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="p-6 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-white hover:bg-white/60 transition-all duration-300 text-left group shadow-lg">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">AI Personal Poetry</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Powered by Gemini AI. Custom-composed birthday sonnets, heartfelt messages, and playful lyrics.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="p-6 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-white hover:bg-white/60 transition-all duration-300 text-left group shadow-lg">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-200 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Interactive 3D Gifts</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Wax-sealed envelopes, virtual popping bubbles, and 3D gift boxes packed with colorful confetti.
            </p>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="p-6 rounded-3xl bg-white/40 border border-white/60 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-white hover:bg-white/60 transition-all duration-300 text-left group shadow-lg">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Curated Wishlists</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Public wishlists with item claiming, price links, birth month badges, and zodiac astrological icons.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* FOOTER                                                                   */}
      {/* ------------------------------------------------------------------------ */}
      <footer className="mt-16 text-center text-xs text-slate-500 font-medium select-none">
        <p>&copy; 2026 Apple Pie Studio. Crafted with care for memorable celebrations.</p>
      </footer>
    </motion.div>
  );
};
