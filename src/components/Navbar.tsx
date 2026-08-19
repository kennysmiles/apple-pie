import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, LogOut, Menu, X } from 'lucide-react';
import { ThemeStyle, UserProfile } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { isImageUrl, resolveImageUrl } from '../utils/helpers';

/**
 * ============================================================================
 * NAVBAR COMPONENT
 * ============================================================================
 * Studio Navigation Bar featuring:
 * - Logo branding & environment tag
 * - Tab selectors (Card Studio, Saved Links, Profile & Wishlists)
 * - User Profile avatar chip
 * - Supabase Cloud Auth login / logout buttons
 * - Mobile drawer layout
 */
interface NavbarProps {
  theme: ThemeStyle;
  activeTab: 'card' | 'wishlist' | 'history' | 'profile' | 'create';
  setActiveTab: (tab: any) => void;
  savedCardsCount?: number;
  friendsCount?: number;
  onOpenAddFriendModal?: () => void;
  userProfile?: UserProfile;
  supabaseUser?: any;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onOpenAuthModal?: () => void;
  onOpenEditProfileModal?: () => void;
  onSignOut?: () => void;
  onLogout?: () => void;
  onOpenSetupModal?: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  activeTab,
  setActiveTab,
  savedCardsCount = 0,
  friendsCount = 0,
  onOpenAddFriendModal,
  userProfile,
  supabaseUser,
  onOpenAuth,
  onOpenAuthModal,
  onOpenEditProfileModal,
  onSignOut,
  onLogout,
  onOpenSetupModal,
  isMobileMenuOpen: propIsMobileMenuOpen,
  setIsMobileMenuOpen: propSetIsMobileMenuOpen,
}) => {
  const [internalMobileOpen, setInternalMobileOpen] = React.useState(false);
  const isMobileMenuOpen = propIsMobileMenuOpen ?? internalMobileOpen;
  const setIsMobileMenuOpen = propSetIsMobileMenuOpen ?? setInternalMobileOpen;

  const handleAuth = () => {
    if (onOpenAuthModal) onOpenAuthModal();
    else if (onOpenAuth) onOpenAuth('login');
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    else if (onSignOut) onSignOut();
  };
  return (
    <header className={`sticky top-0 z-50 flex rounded-xl justify-between items-center py-4 px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8 mb-8 border-b backdrop-blur-md transition-colors duration-300 ${theme.isDark ? 'border-white/10 bg-slate-950/80 text-white' : 'border-slate-200/80 bg-white/80 text-slate-900'}`}>
      {/* ---------------------------------------------------------------------- */}
      {/* BRANDING LOGO                                                         */}
      {/* ---------------------------------------------------------------------- */}
      <div 
        onClick={() => setActiveTab('wishlist')} 
        title="Go to Home Dashboard" 
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="h-14 w-auto shrink-0 flex items-center justify-center">
          <img
            src="https://tmmfshiaadtroqcigeff.supabase.co/storage/v1/object/public/birthday-memories/p/Apple-pie-logo2.png"
            alt="Apple Pie Studio Logo"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div>
          <h1 className={`text-2xl font-black tracking-tight flex items-center gap-1.5 font-display ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
            Apple Pie{' '}
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black border ${theme.isDark ? 'bg-indigo-500/30 text-indigo-300 border-indigo-400/20' : 'bg-slate-200 text-slate-800 border-slate-300/50'}`}>
              Studio
            </span>
          </h1>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* DESKTOP NAVIGATION                                                    */}
      {/* ---------------------------------------------------------------------- */}
      <div className="hidden md:flex items-center gap-2 md:gap-3">
        <button
          id="tab-wishlist"
          onClick={() => setActiveTab('wishlist')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeTab === 'wishlist'
              ? (theme.isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm')
              : (theme.isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          Dashboard 🏠
        </button>

        <button
          id="tab-profile"
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeTab === 'profile'
              ? (theme.isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm')
              : (theme.isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          Profile 👤
        </button>

        <button
          id="tab-card"
          onClick={() => setActiveTab('card')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            activeTab === 'card'
              ? (theme.isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm')
              : (theme.isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          Card Builder 🎉
        </button>

        <button
          id="tab-history"
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? (theme.isDark ? 'bg-white/10 text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm')
              : (theme.isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900')
          }`}
        >
          Saved Links ({savedCardsCount})
        </button>

        {onOpenAddFriendModal && (
          <button
            onClick={onOpenAddFriendModal}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              theme.isDark
                ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            Friends 👥 {friendsCount > 0 && <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[10px] font-black">{friendsCount}</span>}
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-400/20 hidden sm:block" />

        {/* User Profile Chip */}
        <button
          onClick={() => setActiveTab('profile')}
          title="Click to manage your profile"
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer text-left group ${
            activeTab === 'profile'
              ? 'border-indigo-500 ring-2 ring-indigo-500/30'
              : ''
          } ${
            theme.isDark
              ? 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 text-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)]'
              : 'bg-white/90 border-slate-200 hover:border-indigo-500/50 hover:bg-white text-slate-800 shadow-sm'
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg shadow-inner overflow-hidden border shrink-0 ${
            theme.isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            {isImageUrl(userProfile?.avatarUrl) ? (
              <img
                src={resolveImageUrl(userProfile?.avatarUrl)}
                alt="User Profile Pic"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerText = '🎂';
                  }
                }}
              />
            ) : (
              <span className="select-none">{userProfile?.avatarUrl || '🎂'}</span>
            )}
          </div>
          <div className="flex flex-col text-left">
           
            <span className="text-xs font-black max-w-[120px] truncate leading-none">
              {userProfile?.fullName || 'Studio Guest'}
            </span>
          </div>
        </button>

        <div className="h-4 w-[1px] bg-slate-400/20 hidden sm:block" />

        {/* Supabase Cloud Auth Button */}
        {!isSupabaseConfigured() ? (
          <button
            onClick={onOpenSetupModal}
            className="text-[11px] font-bold p-2 px-3 border border-dashed rounded-xl transition flex items-center gap-1.5 border-amber-500/40 text-amber-500 hover:bg-amber-500/5 bg-transparent cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" /> Enable Cloud Storage
          </button>
        ) : supabaseUser ? (
          <button
            onClick={handleLogout}
            className="text-[11px] font-bold p-2 px-3 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        ) : (
          <button
            onClick={handleAuth}
            className="text-[11px] font-bold p-2 px-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5" /> Cloud Login
          </button>
        )}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MOBILE MENU TOGGLE BUTTON                                             */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            theme.isDark
              ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
          }`}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MOBILE MENU DROPDOWN                                                  */}
      {/* ---------------------------------------------------------------------- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 z-50 mt-2 p-5 rounded-3xl border shadow-2xl flex flex-col gap-4 ${
              theme.isDark
                ? 'bg-slate-900/95 border-white/10 backdrop-blur-xl text-white'
                : 'bg-white/95 border-slate-200/80 backdrop-blur-xl text-slate-800'
            }`}
          >
            <div className={`h-[1px] ${theme.isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

            {/* Mobile User Profile */}
            <div className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
              theme.isDark
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-inner overflow-hidden border shrink-0 ${
                  theme.isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  {isImageUrl(userProfile?.avatarUrl) ? (
                    <img
                      src={resolveImageUrl(userProfile?.avatarUrl)}
                      alt="User Profile Pic"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerText = '🎂';
                        }
                      }}
                    />
                  ) : (
                    <span className="select-none">{userProfile?.avatarUrl || '🎂'}</span>
                  )}
                </div>
                <div className="flex flex-col text-left overflow-hidden">
                 
                  <span className="text-sm font-black truncate">
                    {userProfile?.fullName || 'Studio Guest'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActiveTab('profile');
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow transition shrink-0 cursor-pointer"
              >
                Profile 👤
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveTab('wishlist');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'wishlist'
                    ? (theme.isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white')
                    : (theme.isDark ? 'bg-white/5 text-white/70 hover:text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')
                }`}
              >
                Dashboard 🏠
              </button>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'profile'
                    ? (theme.isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white')
                    : (theme.isDark ? 'bg-white/5 text-white/70 hover:text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')
                }`}
              >
                Profile 👤
              </button>
              <button
                onClick={() => {
                  setActiveTab('card');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'card' || activeTab === 'create'
                    ? (theme.isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white')
                    : (theme.isDark ? 'bg-white/5 text-white/70 hover:text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')
                }`}
              >
                Card Builder ✦
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'history'
                    ? (theme.isDark ? 'bg-white/10 text-white' : 'bg-slate-900 text-white')
                    : (theme.isDark ? 'bg-white/5 text-white/70 hover:text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')
                }`}
              >
                Saved Links ({savedCardsCount})
              </button>
              {onOpenAddFriendModal && (
                <button
                  onClick={() => {
                    onOpenAddFriendModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    theme.isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  Friends & Birthdays 👥 ({friendsCount})
                </button>
              )}
            </div>

            <div className={`h-[1px] ${theme.isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

            {/* Supabase mobile actions */}
            {!isSupabaseConfigured() ? (
              <button
                onClick={() => {
                  onOpenSetupModal?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 text-xs font-bold border border-dashed rounded-xl transition flex items-center justify-center gap-2 border-amber-500/40 text-amber-500 bg-amber-500/5 cursor-pointer"
              >
                <Cloud className="w-4 h-4" /> Enable Cloud Storage
              </button>
            ) : supabaseUser ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 text-xs font-bold text-rose-500 bg-rose-500/10 rounded-xl border border-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  handleAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cloud className="w-4 h-4" /> Cloud Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
