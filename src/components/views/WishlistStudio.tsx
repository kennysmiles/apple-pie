import React from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  Camera, Check, RefreshCw, Plus, ShoppingBag, Eye, Share2, Edit3, Trash2, ExternalLink, Sparkles, Gift, PartyPopper, CheckCircle2, ShieldCheck, ArrowRight, UserPlus, Users, Calendar, Maximize2, Minimize2, X, Music, Volume2, VolumeX, Play, Pause, Download, FileDown
} from 'lucide-react';
import { Friend, ThemeStyle, UserProfile, Wishlist } from '../../types';
import { AVATAR_PRESETS } from '../../constants/presets';
import { getBirthMonth, getZodiacSign, compressImage, copyTextToClipboard, isImageUrl, resolveImageUrl } from '../../utils/helpers';
import { playMagicalBell, startBirthdaySong, stopBirthdaySong, toggleBirthdaySong, birthdayMusicBox, isBirthdaySongPlaying } from '../../utils/synth';
import { isSupabaseConfigured, uploadImageToSupabase } from '../../lib/supabase';
import { WishlistExportModal } from '../modals/WishlistExportModal';

/**
 * ============================================================================
 * WISHLIST STUDIO DASHBOARD COMPONENT
 * ============================================================================
 * Dashboard view for managing User Profile (avatars, DOB, Zodiac sign, ticking clock)
 * and creating/curating wishlists.
 */
interface WishlistStudioProps {
  theme: ThemeStyle;
  userProfile?: UserProfile;
  setUserProfile?: React.Dispatch<React.SetStateAction<UserProfile>>;
  onSaveProfile?: (updated: UserProfile) => void;
  handleSaveProfile?: () => void;
  profileSaving?: boolean;
  setProfileSaving?: (saving: boolean) => void;
  profileSuccessMsg?: string;
  currentTime?: Date;
  wishlists?: Wishlist[];
  friends?: Friend[];
  onOpenAddFriendModal?: () => void;
  onSendCardToFriend?: (friend: Friend) => void;
  savedCardsCount?: number;
  selectedTheme?: any;
  supabaseUser?: any;
  onOpenWishlistModal?: () => void;
  onOpenCreateWishlistModal?: () => void;
  onOpenWishlistItemModal?: (wishlistId: string) => void;
  onOpenAddItemModal?: (wishlistId: string) => void;
  onEditWishlistItem?: (wishlistId: string, item: any) => void;
  onEditItem?: (wishlistId: string, item: any) => void;
  onDeleteWishlist?: (wishlistId: string) => void;
  onDeleteWishlistItem?: (wishlistId: string, itemId: string) => void;
  onPreviewWishlistVisitor?: (wishlist: Wishlist) => void;
  onPreviewWishlist?: (wishlist: Wishlist) => void;
  onSwitchToCardBuilder?: () => void;
  onOpenAuthModal?: () => void;
}

export const WishlistStudio: React.FC<WishlistStudioProps> = ({
  theme,
  userProfile: propUserProfile,
  setUserProfile: propSetUserProfile,
  onSaveProfile,
  handleSaveProfile,
  profileSaving: propProfileSaving = false,
  setProfileSaving: propSetProfileSaving,
  profileSuccessMsg,
  currentTime: propCurrentTime,
  wishlists = [],
  friends = [],
  onOpenAddFriendModal,
  onSendCardToFriend,
  savedCardsCount = 0,
  selectedTheme,
  supabaseUser,
  onOpenWishlistModal,
  onOpenCreateWishlistModal,
  onOpenWishlistItemModal,
  onOpenAddItemModal,
  onEditWishlistItem,
  onEditItem,
  onDeleteWishlist = (_wlId: string) => {},
  onDeleteWishlistItem = (_wlId: string, _itemId: string) => {},
  onPreviewWishlistVisitor,
  onPreviewWishlist,
  onSwitchToCardBuilder,
  onOpenAuthModal,
}) => {
  const [internalUserProfile, setInternalUserProfile] = React.useState<UserProfile>(
    propUserProfile || {
      fullName: '',
      username: '',
      avatarUrl: '🎂',
      dateOfBirth: '',
    }
  );

  React.useEffect(() => {
    if (propUserProfile) {
      setInternalUserProfile(propUserProfile);
    }
  }, [propUserProfile]);

  const userProfile = internalUserProfile;

  const updateUserProfile = (updater: (prev: UserProfile) => UserProfile) => {
    setInternalUserProfile((prev) => {
      const next = updater(prev);
      if (propSetUserProfile) propSetUserProfile(next);
      return next;
    });
  };

  const [internalSaving, setInternalSaving] = React.useState(false);
  const profileSaving = propProfileSaving || internalSaving;
  const setProfileSaving = propSetProfileSaving || setInternalSaving;

  const [internalTime, setInternalTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setInternalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const currentTime = propCurrentTime || internalTime;
  const [isFullScreenCountdown, setIsFullScreenCountdown] = React.useState(false);

  // Check if today is the user's birthday
  const isBirthdayToday = React.useMemo(() => {
    if (!userProfile?.dateOfBirth) return false;
    try {
      const birthDate = new Date(userProfile.dateOfBirth);
      const today = currentTime;
      return today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();
    } catch {
      return false;
    }
  }, [userProfile?.dateOfBirth, currentTime.getDate(), currentTime.getMonth()]);

  const [isBirthdayMusicPlaying, setIsBirthdayMusicPlaying] = React.useState(() => isBirthdaySongPlaying());
  const [exportModalWishlist, setExportModalWishlist] = React.useState<Wishlist | null>(null);

  // Dynamically resolve export wishlist with latest items & profile attributes
  const activeExportWishlist = React.useMemo(() => {
    if (!exportModalWishlist) return null;
    const latest = wishlists.find((w) => String(w.id) === String(exportModalWishlist.id));
    const base = latest || exportModalWishlist;
    const items = (latest && Array.isArray(latest.items) && latest.items.length > 0)
      ? latest.items
      : (exportModalWishlist.items || []);

    return {
      ...base,
      ...exportModalWishlist,
      items,
      creatorName: userProfile?.fullName || exportModalWishlist.creatorName || '',
      creatorUsername: userProfile?.username || exportModalWishlist.creatorUsername || '',
      creatorAvatar: userProfile?.avatarUrl || exportModalWishlist.creatorAvatar || '🎂',
      creatorDob: userProfile?.dateOfBirth || exportModalWishlist.creatorDob || '',
      theme: base.theme || exportModalWishlist.theme || selectedTheme,
    };
  }, [exportModalWishlist, wishlists, userProfile, selectedTheme]);

  React.useEffect(() => {
    const unsubscribe = birthdayMusicBox.subscribe((playing) => {
      setIsBirthdayMusicPlaying(playing);
    });
    return unsubscribe;
  }, []);

  const handleToggleMusic = () => {
    const nextState = toggleBirthdaySong();
    setIsBirthdayMusicPlaying(nextState);
  };

  // Confetti trigger helper
  const triggerBirthdayConfetti = (burst = false) => {
    try {
      if (burst) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#fbbf24', '#34d399', '#60a5fa', '#a855f7']
        });
      } else {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.7 },
          colors: ['#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f43f5e']
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.7 },
          colors: ['#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f43f5e']
        });
      }
    } catch {
      // safe fallback
    }
  };

  // Periodic celebration confetti explosions & birthday song when it's the user's birthday
  React.useEffect(() => {
    if (!isBirthdayToday) {
      stopBirthdaySong();
      return;
    }

    // Initial festive burst
    triggerBirthdayConfetti(true);

    // Start the birthday song automatically
    try {
      startBirthdaySong();
    } catch {
      // safe fallback
    }

    // Attach interaction listener in case browser blocked autoplay without user click
    const handleUserInteraction = () => {
      if (!birthdayMusicBox.getIsPlaying()) {
        startBirthdaySong();
      }
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    const confettiTimer = setInterval(() => {
      triggerBirthdayConfetti(false);
    }, 3500);

    return () => {
      clearInterval(confettiTimer);
      stopBirthdaySong();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [isBirthdayToday]);

  const triggerSaveProfile = () => {
    if (onSaveProfile) onSaveProfile(userProfile);
    else if (handleSaveProfile) handleSaveProfile();
  };

  const triggerOpenCreateWishlist = () => {
    if (onOpenWishlistModal) onOpenWishlistModal();
    else if (onOpenCreateWishlistModal) onOpenCreateWishlistModal();
  };

  const triggerOpenAddItem = (wlId: string) => {
    if (onOpenWishlistItemModal) onOpenWishlistItemModal(wlId);
    else if (onOpenAddItemModal) onOpenAddItemModal(wlId);
  };

  const triggerEditItem = (wlId: string, item: any) => {
    if (onEditWishlistItem) onEditWishlistItem(wlId, item);
    else if (onEditItem) onEditItem(wlId, item);
  };

  const triggerPreviewWishlist = (wl: Wishlist) => {
    if (onPreviewWishlistVisitor) onPreviewWishlistVisitor(wl);
    else if (onPreviewWishlist) onPreviewWishlist(wl);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full space-y-8 pb-12"
    >
      {/* ---------------------------------------------------------------------- */}
      {/* WELCOME HERO LAUNCHPAD & ONBOARDING HUB                               */}
      {/* ---------------------------------------------------------------------- */}
      <div className={`p-6 md:p-8 rounded-[36px] border ${
        theme.isDark 
          ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border-indigo-500/30 text-white shadow-2xl shadow-indigo-950/50' 
          : 'bg-gradient-to-br from-indigo-500/10 via-white to-pink-500/10 border-indigo-200 text-slate-800 shadow-xl'
      } relative overflow-hidden`}>
        <div className="absolute top-0 right-0 -mt-2 -mr-8 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-2 -ml-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 ">
            <div className="flex items-center gap-2">
              <div>
                <h1 className="text-xl md:text-2xl font-black font-display tracking-tight flex items-center gap-2">
                  Welcome back {userProfile?.username ? `@${userProfile.username}` : (userProfile?.fullName || 'Creator')}! 🎉
                </h1>
               
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* USER BIRTHDAY COUNTDOWN CARD                                      */}
          {/* ------------------------------------------------------------------ */}
          <div 
            onClick={() => setIsFullScreenCountdown(true)}
            className={`p-4 rounded-[28px] border ${
              theme.isDark
                ? 'bg-gradient-to-br from-pink-900/60 via-slate-900 to-pink-900/60 border-pink-500/30 text-white'
                : 'bg-gradient-to-br from-pink-600 via-pink-600 to-pink-600 text-white shadow-lg'
            } relative overflow-hidden shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group`}
            title="Click to view full screen countdown"
          >
            {/* Fullscreen Hint Badge */}
            <div className="absolute top-3 right-3 z-20 opacity-80 group-hover:opacity-100 transition flex items-center gap-1.5 text-[11px] font-bold bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white shadow-sm">
              <Maximize2 className="w-3 h-3 text-pink-300" /> 
            </div>
          
            <div className="relative z-10 flex flex-row md:flex-row items-center justify-between gap-2">
              {/* Left: Countdown Typography & User info */}
              <div className="space-y-2 text-center md:text-left">
                

                <div>
                

                  {userProfile?.dateOfBirth ? (() => {
                    try {
                      const birthDate = new Date(userProfile.dateOfBirth);
                      const today = new Date();
                      const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
                      if (today.getTime() > nextBirthday.getTime() && today.toDateString() !== nextBirthday.toDateString()) {
                        nextBirthday.setFullYear(today.getFullYear() + 1);
                      }
                      const diffTime = nextBirthday.getTime() - today.getTime();
                      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                      const isToday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();

                      if (isToday) {
                        return (
                          <div 
                            
                            className="mt-1 flex flex-col items-center md:items-start gap-2 cursor-pointer select-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerBirthdayConfetti(true);
                              playMagicalBell();
                              if (!isBirthdayMusicPlaying) {
                                startBirthdaySong();
                              }
                            }}
                            title="Click for celebration & birthday song!"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap justify-center md:justify-start">
                              <motion.span
                                animate={{ rotate: [-10, 10, -10], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                                className="text-3xl md:text-5xl drop-shadow-lg inline-block"
                              >
                                🥳
                              </motion.span>
                              
                              <motion.h2 
                                animate={{ 
                                  scale: [1, 1.03, 1],
                                  filter: [
                                    'drop-shadow(0 2px 8px rgba(251,191,36,0.6))',
                                    'drop-shadow(0 4px 16px rgba(244,114,182,0.8))',
                                    'drop-shadow(0 2px 8px rgba(251,191,36,0.6))'
                                  ]
                                }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                className="text-3xl md:text-5xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-200 to-yellow-200"
                              >
                                ITS TODAY!
                              </motion.h2>

                              <motion.span
                                animate={{ rotate: [10, -10, 10], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
                                className="text-3xl md:text-5xl drop-shadow-lg inline-block"
                              >
                                🎉
                              </motion.span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                              <motion.div 
                                animate={{ y: [0, -2, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                                <p className="text-xs font-black tracking-wide text-white drop-shadow">
                                  Happy Birthday to you! ✨
                                </p>
                                <span className="text-xs">🎂</span>
                              </motion.div>

                              {/* Interactive Birthday Song Player Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleMusic();
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all shadow-md active:scale-95 ${
                                  isBirthdayMusicPlaying
                                    ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-500/30 ring-2 ring-amber-300/50'
                                    : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'
                                }`}
                                title={isBirthdayMusicPlaying ? 'Pause Birthday Song' : 'Play Birthday Song'}
                              >
                                {isBirthdayMusicPlaying ? (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5 animate-pulse text-slate-950" />
                                    <div className="flex items-end gap-0.5 h-3">
                                      <span className="w-0.5 bg-slate-950 rounded-full animate-bounce" style={{ height: '8px', animationDuration: '0.6s' }} />
                                      <span className="w-0.5 bg-slate-950 rounded-full animate-bounce" style={{ height: '12px', animationDuration: '0.4s' }} />
                                      <span className="w-0.5 bg-slate-950 rounded-full animate-bounce" style={{ height: '6px', animationDuration: '0.8s' }} />
                                    </div>
                                    <span>Playing Song</span>
                                  </>
                                ) : (
                                  <>
                                    <Music className="w-3.5 h-3.5 text-amber-200" />
                                    <span>Play Song 🎵</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="mt-1 flex flex-col items-baseline justify-center md:justify-start gap-3">
                         <div className=" flex items-center gap-2">
                          <span className="text-6xl md:text-6xl font-black font-display tracking-tighter text-green-300 drop-shadow-md">
                            {diffDays}
                          </span>
                          <span className="text-xl md:text-xl font-black lowercase tracking-wider text-white/90">
                            {diffDays === 1 ? 'Day' : 'Days'}
                          </span>
                         </div>
                          <span className="text-xs md:text-xl font-black lowercase tracking-wider text-white/90">
                             til your special day!
                          </span>
                        </div>
                      );
                    } catch {
                      return null;
                    }
                  })() : (
                    <div className="mt-2">
                      <p className="text-xs font-semibold opacity-90">
                        Set your date of birth in Profile to activate your live birthday countdown! 🎂
                      </p>
                    </div>
                  )}
                </div>
                
              </div>

              {/* Right: Live Digital Clock & Next Birthday Badge */}
              <div className="flex flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/20 pt-0 md:pt-0 md:pl-6 w-auto md:w-auto">
                <div className="text-center md:text-right">
                  
                  <h3 className="text-sm md:text-3xl font-black font-mono tracking-tight text-white drop-shadow">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </h3>
                </div>

                <div className="flex flex-wrap flex-col md:flex-row items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-mono font-bold">
                    @{userProfile?.username || 'username'}
                  </span>
                  {getZodiacSign(userProfile?.dateOfBirth) && (() => {
                    const z = getZodiacSign(userProfile.dateOfBirth)!;
                    return (
                      <span className="px-3 py-1 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-300/30 text-xs font-bold  flex items-center gap-1">
                        ✨ {z.name} {z.symbol}
                      </span>
                    );
                  })()}
                </div>

               
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-2xl border ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
              <span className={`text-[10px] font-bold uppercase block tracking-wider ${theme.isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>Active Wishlists</span>
              <p className="text-xl font-black mt-0.5 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-pink-500" /> {wishlists.length}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
              <span className={`text-[10px] font-bold uppercase block tracking-wider ${theme.isDark ? 'text-purple-300' : 'text-purple-600'}`}>Total Wish Items</span>
              <p className="text-xl font-black mt-0.5 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-purple-500" /> {wishlists.reduce((acc, curr) => acc + (curr.items?.length || 0), 0)}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
              <span className={`text-[10px] font-bold uppercase block tracking-wider ${theme.isDark ? 'text-amber-300' : 'text-amber-600'}`}>Cards Designed</span>
              <p className="text-xl font-black mt-0.5 flex items-center gap-1.5">
                <PartyPopper className="w-4 h-4 text-amber-500" /> {savedCardsCount || 0}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${theme.isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
              <span className={`text-[10px] font-bold uppercase block tracking-wider ${theme.isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>Next Birthday</span>
              <p className="text-sm font-black mt-1 truncate">
                {userProfile?.dateOfBirth ? getBirthMonth(userProfile.dateOfBirth) || 'Set DOB' : 'Not Set'}
              </p>
            </div>
          </div>

            {/* Direct Action Launchpad */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={triggerOpenCreateWishlist}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-black transition shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create First Wishlist
            </button>

        
          </div>

         
        
        </div>
      </div>

       {/* ------------------------------------------------------------------ */}
       {/* REAL UPCOMING FRIENDS BIRTHDAYS SECTION                            */}
       {/* ------------------------------------------------------------------ */}
       <div className="space-y-3">
         <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-2">
             <p className={`text-sm font-bold ${theme.isDark ? 'text-gray-300' : 'text-gray-600'}`}>
               Upcoming birthdays...
             </p>
             {friends.length > 0 && (
               <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-black border border-indigo-500/30">
                 {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
               </span>
             )}
           </div>

           {onOpenAddFriendModal && (
             <button
               onClick={onOpenAddFriendModal}
               className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5 cursor-pointer active:scale-95"
             >
               <UserPlus className="w-3.5 h-3.5" /> Add Friend
             </button>
           )}
         </div>

         {friends.length === 0 ? (
           <div className={`p-4 sm:p-5 rounded-2xl border ${
             theme.isDark
               ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20 text-white'
               : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-indigo-200 text-slate-800 shadow-sm'
           } flex flex-col sm:flex-row items-center justify-between gap-4`}>
             <div className="flex items-center gap-3 text-center sm:text-left">
               <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 text-xl">
                 ⏰
               </div>
               <div>
                 <p className="text-xs sm:text-sm font-bold">
                   No friends added yet to track upcoming birthdays!
                 </p>
                 <p className={`text-[11px] mt-0.5 ${theme.isDark ? 'text-white/60' : 'text-slate-500'}`}>
                   Add real friends by username or birthday to see countdown alerts and send instant birthday cards.
                 </p>
               </div>
             </div>

             {onOpenAddFriendModal && (
               <button
                 onClick={onOpenAddFriendModal}
                 className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
               >
                 <UserPlus className="w-3.5 h-3.5" /> Find & Add Friends
               </button>
             )}
           </div>
         ) : (() => {
           // Compute and sort upcoming birthdays
           const today = new Date();
           today.setHours(0, 0, 0, 0);

           const friendsWithUpcoming = friends.map(friend => {
             if (!friend.dateOfBirth) return { friend, daysLeft: 999, formattedDate: '' };
             const bdate = new Date(friend.dateOfBirth);
             let nextBirthday = new Date(today.getFullYear(), bdate.getMonth(), bdate.getDate());
             if (nextBirthday < today) {
               nextBirthday.setFullYear(today.getFullYear() + 1);
             }
             const diffDays = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
             const formattedDate = nextBirthday.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
             return { friend, daysLeft: diffDays, formattedDate };
           }).sort((a, b) => a.daysLeft - b.daysLeft);

           return (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {friendsWithUpcoming.slice(0, 4).map(({ friend, daysLeft, formattedDate }) => (
                 <div
                   key={friend.id}
                   className={`p-4 rounded-2xl border ${
                     daysLeft <= 7
                       ? (theme.isDark ? 'bg-gradient-to-r from-pink-500/20 via-rose-500/10 to-purple-500/20 border-pink-500/40 text-white' : 'bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 border-pink-300 text-slate-800 shadow-sm')
                       : (theme.isDark ? 'bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-amber-500/20 text-white' : 'bg-gradient-to-r from-amber-50 via-purple-50 to-indigo-50 border-amber-200 text-slate-800 shadow-sm')
                   } flex items-center justify-between gap-3`}
                 >
                   <div className="flex items-center gap-3 overflow-hidden">
                     <div className="w-11 h-11 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                        {isImageUrl(friend.avatarUrl) ? (
                          <img
                            src={resolveImageUrl(friend.avatarUrl)}
                            alt={friend.fullName}
                            className="w-full h-full object-cover rounded-2xl"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          friend.avatarUrl || '🎂'
                        )}
                      </div>
                     <div className="min-w-0">
                       <p className="text-xs sm:text-sm font-black truncate flex items-center gap-1.5">
                         <span>{friend.fullName}</span>
                         <span className="text-[10px] font-mono opacity-60 font-normal">@{friend.username}</span>
                       </p>
                       <p className="text-xs font-extrabold text-pink-400 mt-0.5 flex items-center gap-1">
                         <span>🎉 {daysLeft === 0 ? 'Today is their Birthday!' : `${daysLeft} days until birthday`}</span>
                         {formattedDate && <span className="font-normal opacity-80">({formattedDate})</span>}
                       </p>
                     </div>
                   </div>

                   {onSendCardToFriend && (
                     <button
                       onClick={() => onSendCardToFriend(friend)}
                       className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold transition shadow flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                     >
                       <PartyPopper className="w-3.5 h-3.5" /> Send Card
                     </button>
                   )}
                 </div>
               ))}
             </div>
           );
         })()}
       </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. WISHLISTS SECTION                                                   */}
      {/* ---------------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex flex-col justify-between items-center">
          <div className="flex flex-col justify-between items-center">
            <h2 className={`text-xl font-black text-center flex items-center gap-2 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
              Birthday Wish Lists
            </h2>
            <p className={`text-xs text-center mt-1 ${theme.isDark ? 'text-white/50' : 'text-slate-500'}`}>Create, curate, and share items you'd love to receive for your special days!</p>
          </div>
          <button
            onClick={triggerOpenCreateWishlist}
            className="p-3 px-5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Wishlist
          </button>
        </div>

        {wishlists.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${theme.isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-white/40 shadow-sm'}`}>
            <ShoppingBag className={`w-12 h-12 mx-auto mb-4 animate-bounce ${theme.isDark ? 'text-white/20' : 'text-slate-400'}`} />
            <h3 className={`text-sm font-bold ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>No Wish Lists yet</h3>
            <p className={`text-xs max-w-xs mx-auto mt-2 leading-relaxed ${theme.isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Create your first list, add items you desire, and share the unique link with friends or family!
            </p>
            <button
              onClick={triggerOpenCreateWishlist}
              className={`mt-5 p-2.5 px-5 rounded-xl text-xs font-bold transition cursor-pointer ${
                theme.isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              Create Now 🪄
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {wishlists.map((wl) => {
              const wlWithProfile = {
                ...wl,
                theme: wl.theme || selectedTheme,
                creatorName: userProfile?.fullName || '',
                creatorUsername: userProfile?.username || '',
                creatorAvatar: userProfile?.avatarUrl || '🎂',
                creatorDob: userProfile?.dateOfBirth || '',
              };
              const encodedWl = btoa(encodeURIComponent(JSON.stringify(wlWithProfile)));
              const shareUrl = isSupabaseConfigured() && supabaseUser
                ? `${window.location.origin}${window.location.pathname}#wishlistId=${wl.id}`
                : `${window.location.origin}${window.location.pathname}#wishlist=${encodedWl}`;

              return (
                <div key={wl.id} className={`p-6 rounded-[28px] border ${theme.cardBg} ${theme.glassBorder} shadow-lg relative`}>
                  {/* List Header */}
                  <div className={`flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b mb-6 ${
                    theme.isDark ? 'border-white/5' : 'border-slate-200'
                  }`}>
                    <div>
                      <h3 className={`text-lg font-black flex items-center gap-2 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                        {wl.title}
                      </h3>
                      {wl.description && <p className={`text-xs mt-1 max-w-xl ${theme.isDark ? 'text-white/60' : 'text-slate-600'}`}>{wl.description}</p>}
                      {wl.targetDate && (
                        <p className="text-[10px] font-mono font-semibold text-indigo-500 dark:text-indigo-300 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full inline-block mt-1.5 bg-indigo-500/10">
                          Target Date: {wl.targetDate}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => triggerPreviewWishlist(wlWithProfile)}
                        className={`p-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          theme.isDark
                            ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview Visitor View
                      </button>

                      <button
                        onClick={() => setExportModalWishlist(wlWithProfile)}
                        className={`p-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          theme.isDark
                            ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-300 border border-pink-500/30 shadow-sm'
                            : 'bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 text-pink-700 border border-pink-200 shadow-sm'
                        }`}
                        title="Download wishlist as high quality PNG or JPG graphic"
                      >
                        <Download className="w-3.5 h-3.5 text-pink-400" /> Export Graphic
                      </button>

                      <button
                        onClick={async () => {
                          const success = await copyTextToClipboard(shareUrl);
                          playMagicalBell();
                          if (success) {
                            alert('Shareable Wishlist Link Copied to clipboard! 🎁');
                          } else {
                            alert(`Copy failed. Please copy this link manually:\n\n${shareUrl}`);
                          }
                        }}
                        className={`p-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          theme.isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300/30'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share Link
                      </button>

                      <button
                        onClick={() => triggerOpenAddItem(wl.id)}
                        className="p-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Item
                      </button>

                      <button
                        onClick={() => onDeleteWishlist(wl.id)}
                        className={`p-2 rounded-xl transition cursor-pointer ${
                          theme.isDark
                            ? 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-900/30'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* List Items */}
                  {wl.items.length === 0 ? (
                    <p className={`text-xs text-center py-6 italic ${theme.isDark ? 'text-white/30' : 'text-slate-500'}`}>
                      No items added to this list yet. Start by adding one above!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {wl.items.map((item) => (
                        <div key={item.id} className={`py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-xl flex items-center justify-between gap-2.5 relative group border transition min-h-[44px] ${
                          theme.isDark ? 'bg-white/5 border-white/5 hover:border-white/15' : 'bg-white/70 border-slate-200/80 hover:border-slate-300 shadow-sm'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Product Image / Emoji */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border overflow-hidden ${
                              theme.isDark ? 'bg-slate-800 border-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 shadow-inner'
                            }`}>
                              {item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('data:')) ? (
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <span>{item.imageUrl || '🎁'}</span>
                              )}
                            </div>

                            {/* Item details */}
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <h4 className={`text-[11px] font-black truncate max-w-[110px] sm:max-w-[150px] ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                                <span className={`text-[7px] font-bold tracking-wider uppercase px-1 py-0.2 rounded border shrink-0 ${
                                  item.priority === 'high' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' :
                                  item.priority === 'medium' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                                  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                }`}>
                                  {item.priority}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[9px]">
                                <span className="text-indigo-500 dark:text-indigo-300 font-black font-mono">
                                  {item.price ? `$${item.price}` : 'Price open'}
                                </span>

                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`font-bold transition flex items-center gap-0.5 ${
                                      theme.isDark ? 'text-white/50 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'
                                    }`}
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" /> Link
                                  </a>
                                )}

                                {item.isClaimed ? (
                                  <span className="text-[7px] font-bold text-emerald-400 bg-emerald-500/10 py-0.2 px-1 rounded-full border border-emerald-500/20 truncate max-w-[65px]">
                                    ✓ {item.claimedBy || 'Claimed'}
                                  </span>
                                ) : (
                                  <span className={`text-[7px] font-bold ${theme.isDark ? 'text-white/30' : 'text-slate-400'}`}>
                                    Available
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => triggerEditItem(wl.id, item)}
                              className={`p-1.5 rounded-lg border cursor-pointer transition ${
                                theme.isDark
                                  ? 'bg-indigo-950/40 hover:bg-indigo-900/40 text-indigo-300 border-indigo-900/30'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
                              }`}
                              title="Edit Wish"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => onDeleteWishlistItem(wl.id, item.id)}
                              className={`p-1.5 rounded-lg border cursor-pointer transition ${
                                theme.isDark
                                  ? 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border-rose-900/30'
                                  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200'
                              }`}
                              title="Delete Wish"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FULL SCREEN COUNTDOWN OVERLAY */}
      {isFullScreenCountdown && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between p-4 sm:p-12 bg-gradient-to-br from-slate-950 via-pink-950 to-purple-950 text-white overflow-y-auto animate-in fade-in duration-300">
          {/* Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-pink-500/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

          {/* Top Header Navigation */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-2xl overflow-hidden shrink-0 shadow-lg">
                {isImageUrl(userProfile?.avatarUrl) ? (
                  <img
                    src={resolveImageUrl(userProfile?.avatarUrl)}
                    alt={userProfile?.fullName || 'Avatar'}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  userProfile?.avatarUrl || '🎂'
                )}
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">{userProfile?.fullName || 'My Birthday'}</h2>
                <p className="text-xs font-mono opacity-70">@{userProfile?.username || 'username'}</p>
                  <div className="flex items-center gap-3">
              {getZodiacSign(userProfile?.dateOfBirth) && (() => {
                const z = getZodiacSign(userProfile!.dateOfBirth)!;
                return (
                  <span className="px-4 py-2 rounded-full bg-amber-400/20 backdrop-blur-xl border border-amber-300/30 text-xs sm:text-sm font-bold flex items-center gap-1.5 text-amber-200 shadow-md">
                    ✨ {z.name} ({z.symbol})
                  </span>
                );
              })()}
            </div>
              </div>
             
            </div>

            <button
              onClick={() => setIsFullScreenCountdown(false)}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white transition cursor-pointer flex items-center gap-2 font-bold text-xs sm:text-sm active:scale-95 shadow-lg"
            >
              <Minimize2 className="w-4 h-4 text-pink-300" />
            </button>
          </div>

          {/* Center Main Countdown Display */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-4">
            {userProfile?.dateOfBirth ? (() => {
              try {
                const birthDate = new Date(userProfile.dateOfBirth);
                const today = currentTime;
                const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate(), 0, 0, 0);
                if (today.getTime() > nextBirthday.getTime() + 86400000) {
                  nextBirthday.setFullYear(today.getFullYear() + 1);
                }
                const diffTime = Math.max(0, nextBirthday.getTime() - today.getTime());
                const isToday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();
                         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffTime / (1000 * 60 * 60)) % 24);
                const diffMinutes = Math.floor((diffTime / (1000 * 60)) % 60);
                const diffSeconds = Math.floor((diffTime / 1000) % 60);

                if (isToday) {
                  return (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4 max-w-2xl mx-auto flex flex-col items-center cursor-pointer select-none"
                      onClick={() => {
                        triggerBirthdayConfetti(true);
                        playMagicalBell();
                      }}
                      title="Click for celebration confetti!"
                    >
                      {/* Floating Party Emojis */}
                      <div className="flex items-center justify-center gap-4 sm:gap-6">
                        <motion.span 
                          animate={{ y: [0, -14, 0], rotate: [-12, 12, -12], scale: [1, 1.15, 1] }} 
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }} 
                          className="text-6xl sm:text-8xl block drop-shadow-2xl"
                        >
                          🥳
                        </motion.span>
                        <motion.span 
                          animate={{ scale: [1, 1.25, 1], rotate: [-5, 5, -5] }} 
                          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.15 }} 
                          className="text-7xl sm:text-9xl block drop-shadow-2xl"
                        >
                          🎂
                        </motion.span>
                        <motion.span 
                          animate={{ y: [0, -14, 0], rotate: [12, -12, 12], scale: [1, 1.15, 1] }} 
                          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.3 }} 
                          className="text-6xl sm:text-8xl block drop-shadow-2xl"
                        >
                          🎉
                        </motion.span>
                      </div>

                      {/* Giant Shimmering Animated Header */}
                      <motion.h1 
                        animate={{ 
                          scale: [1, 1.03, 1],
                          filter: [
                            'drop-shadow(0 0 25px rgba(251,191,36,0.7))',
                            'drop-shadow(0 0 45px rgba(244,114,182,0.85))',
                            'drop-shadow(0 0 25px rgba(251,191,36,0.7))'
                          ]
                        }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                        className="text-5xl sm:text-8xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-200 to-yellow-200"
                      >
                        IT'S TODAY!
                      </motion.h1>

                      {/* Glowing Greeting Pill */}
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        className="px-6 py-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-2xl flex items-center gap-2.5"
                      >
                        <PartyPopper className="w-5 h-5 text-pink-300" />
                        <p className="text-xl sm:text-3xl font-black text-pink-100 drop-shadow">
                          Happy Birthday, {userProfile?.username || 'Star'}! ✨
                        </p>
                        <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '5s' }} />
                      </motion.div>

                      {/* Live Ticking Breakdown: Hours, Minutes, Seconds */}
                      <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xl w-full mx-auto pt-4">
                        <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 text-center shadow-xl">
                          <span className="text-5xl sm:text-8xl font-black font-mono text-amber-300 drop-shadow">
                            {String(diffHours).padStart(2, '0')}
                          </span>
                          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-70 mt-1">Hours</p>
                        </div>
                        <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 text-center shadow-xl">
                          <span className="text-5xl sm:text-8xl font-black font-mono text-indigo-300 drop-shadow">
                            {String(diffMinutes).padStart(2, '0')}
                          </span>
                          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-70 mt-1">Minutes</p>
                        </div>
                        <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 text-center shadow-xl">
                          <span className="text-5xl sm:text-8xl font-black font-mono text-emerald-300 drop-shadow">
                            {String(diffSeconds).padStart(2, '0')}
                          </span>
                          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-70 mt-1">Seconds</p>
                        </div>
                      </div>

                      {/* Fullscreen Birthday Song Interactive Player Control */}
                      <div className="pt-2 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMusic();
                          }}
                          className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-base sm:text-lg font-black transition-all shadow-xl active:scale-95 ${
                            isBirthdayMusicPlaying
                              ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-amber-500/40 ring-4 ring-amber-300/50'
                              : 'bg-white/20 hover:bg-white/30 border border-white/30 text-white'
                          }`}
                        >
                          {isBirthdayMusicPlaying ? (
                            <>
                              <Volume2 className="w-6 h-6 animate-pulse text-slate-950" />
                              <div className="flex items-end gap-1 h-5">
                                <span className="w-1 bg-slate-950 rounded-full animate-bounce" style={{ height: '14px', animationDuration: '0.6s' }} />
                                <span className="w-1 bg-slate-950 rounded-full animate-bounce" style={{ height: '20px', animationDuration: '0.4s' }} />
                                <span className="w-1 bg-slate-950 rounded-full animate-bounce" style={{ height: '10px', animationDuration: '0.8s' }} />
                                <span className="w-1 bg-slate-950 rounded-full animate-bounce" style={{ height: '16px', animationDuration: '0.5s' }} />
                              </div>
                              <span>Playing Birthday Song 🎵</span>
                            </>
                          ) : (
                            <>
                              <Music className="w-6 h-6 text-amber-300" />
                              <span>Play Happy Birthday Song 🎶</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                }

       
                  {/* previous loc of diffDays etc */}
                return (
                  <div className="space-y-2 max-w-4xl w-full">
                    <div>
                     

                      {/* Main Big Days Counter */}
                      <div className=" flex flex-col md:flex-row items-center justify-center h-[300px] w-auto">
                       <div className=""> <span className="text-4xl  md:hidden ">🎂</span></div>
                        <h1 className="text-[196px] w-auto sm:text-[296px] md:text-[400px] font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-200 to-teal-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                          {diffDays}  <span className="text-xs font-black font-mono">
                          !
                        </span>
                        </h1>
                         <div className=""> <span className="text-4xl hidden absolute left-300 md:block  sm:text-9xl md:text-[100] ">🎂</span></div>
                       
                      </div>
                      <p className="text-xl sm:text-2xl font-black lowercase tracking-widest text-pink-200/90 ">
                        {diffDays === 1 ? 'Day Remaining' : 'Days Remaining'}
                      </p>
                    </div>

                    {/* Live Ticking Breakdown: Hours, Minutes, Seconds */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto pt-4">
                      <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 text-center shadow-xl">
                        <span className="text-6xl sm:text-9xl font-black font-mono text-amber-300">
                          {String(diffHours).padStart(2, '0')}
                        </span>
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-70 mt-1">Hours</p>
                      </div>
                      <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 text-center shadow-xl">
                        <span className="text-6xl sm:text-9xl font-black font-mono text-indigo-300">
                          {String(diffMinutes).padStart(2, '0')}
                        </span>
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-70 mt-1">Minutes</p>
                      </div>
                      <div className="p-4 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 text-center shadow-xl">
                        <span className="text-6xl sm:text-9xl font-black font-mono text-emerald-300">
                          {String(diffSeconds).padStart(2, '0')}
                        </span>
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-70 mt-1">Seconds</p>
                      </div>
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })() : (
              <div className="text-center space-y-4 max-w-md">
                <span className="text-7xl block">🎂</span>
                <h2 className="text-3xl font-black">Set Your Date of Birth</h2>
                <p className="text-sm opacity-80">Add your birth date in your profile settings to activate your full screen live birthday countdown!</p>
              </div>
            )}
          </div>

          {/* Bottom Footer Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/15 pt-6">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl sm:text-3xl font-black font-mono text-white drop-shadow">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </h3>
              <span className="text-xs sm:text-sm opacity-70 font-mono hidden sm:inline-block">
                • {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {getZodiacSign(userProfile?.dateOfBirth) && (() => {
                const z = getZodiacSign(userProfile!.dateOfBirth)!;
                return (
                  <span className="px-4 py-2 rounded-full bg-amber-400/20 backdrop-blur-xl border border-amber-300/30 text-xs sm:text-sm font-bold flex items-center gap-1.5 text-amber-200 shadow-md">
                    ✨ {z.name} ({z.symbol})
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Wishlist High-Resolution Export Modal */}
      <WishlistExportModal
        isOpen={!!exportModalWishlist}
        onClose={() => setExportModalWishlist(null)}
        wishlist={activeExportWishlist}
        defaultTheme={selectedTheme}
      />
    </motion.div>
  );
};
