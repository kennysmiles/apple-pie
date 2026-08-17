import { ThemeStyle, ThemeKey } from '../types';

/**
 * ============================================================================
 * THEME DEFINITIONS FOR APPLE PIE STUDIO
 * ============================================================================
 * Provides color palettes, glassmorphism card backgrounds, and gradient definitions
 * for Midnight, Gold, Pastel, and Sunset themes.
 */
export const THEME_STYLES: Record<ThemeKey, ThemeStyle> = {
  midnight: {
    bg: 'from-[#050515] via-[#0b0f28] to-[#12082b]',
    cardBg: 'bg-slate-900/60 backdrop-blur-[40px] border-white/10 text-white',
    accentText: 'text-indigo-400',
    accentBtn: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25',
    glassBorder: 'border-white/10',
    titleGradient: 'from-indigo-300 via-purple-300 to-pink-300',
    sparkleColor: '#818cf8',
    blob1: 'bg-indigo-600/30',
    blob2: 'bg-purple-600/30',
    blob3: 'bg-pink-600/20',
    isDark: true,
  },
  gold: {
    bg: 'from-[#fef3c7] via-[#fde68a] to-[#f5f5f4]',
    cardBg: 'bg-white/30 backdrop-blur-[40px] border-amber-200/60 text-slate-900',
    accentText: 'text-amber-700',
    accentBtn: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10',
    glassBorder: 'border-amber-300/40',
    titleGradient: 'from-amber-600 via-yellow-600 to-amber-700',
    sparkleColor: '#d97706',
    blob1: 'bg-amber-300/40',
    blob2: 'bg-yellow-300/40',
    blob3: 'bg-orange-300/30',
    isDark: false,
  },
  pastel: {
    bg: 'from-[#FFDEE9] via-[#B5FFFC] to-[#f5f7fa]',
    cardBg: 'bg-white/20 backdrop-blur-[40px] border-white/50 text-slate-800',
    accentText: 'text-purple-600',
    accentBtn: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10',
    glassBorder: 'border-white/40',
    titleGradient: 'from-rose-500 via-purple-600 to-indigo-600',
    sparkleColor: '#8b5cf6',
    blob1: 'bg-pink-300/40',
    blob2: 'bg-blue-300/40',
    blob3: 'bg-purple-300/30',
    isDark: false,
  },
  sunset: {
    bg: 'from-[#ffedd5] via-[#fecdd3] to-[#f5f5f4]',
    cardBg: 'bg-white/25 backdrop-blur-[40px] border-white/60 text-slate-800',
    accentText: 'text-rose-600',
    accentBtn: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10',
    glassBorder: 'border-white/40',
    titleGradient: 'from-rose-600 via-orange-500 to-pink-600',
    sparkleColor: '#f43f5e',
    blob1: 'bg-rose-300/40',
    blob2: 'bg-orange-300/40',
    blob3: 'bg-pink-300/30',
    isDark: false,
  },
};
