import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CardConfig, Wishlist, WishlistItem, UserProfile, Friend } from './types';
import { THEME_STYLES } from './constants/themes';
import { playMagicalBell, playCandleBlowOut, playBalloonPop, MusicBoxEngine } from './utils/synth';
import { copyTextToClipboard } from './utils/helpers';
import {
  supabase,
  isSupabaseConfigured,
  saveCardToSupabase,
  fetchCardsFromSupabase,
  saveUserProfileToSupabase,
  fetchUserProfileFromSupabase,
  saveWishlistsToSupabase,
  deleteWishlistFromSupabase,
  deleteWishlistItemFromSupabase,
  fetchWishlistsFromSupabase,
  saveFriendsToSupabase,
  fetchFriendsFromSupabase,
  uploadImageToSupabase
} from './lib/supabase';

// Modular Component Imports
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/modals/AuthModal';
import { EditProfileModal } from './components/modals/EditProfileModal';
import { AddFriendModal } from './components/modals/AddFriendModal';
import { WishlistCreateModal } from './components/modals/WishlistCreateModal';
import { WishlistItemModal } from './components/modals/WishlistItemModal';
import { ClaimGuestModal } from './components/modals/ClaimGuestModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { CardHistory } from './components/views/CardHistory';
import { WishlistStudio } from './components/views/WishlistStudio';
import { WishlistReceiverView } from './components/views/WishlistReceiverView';
import { CardReceiverView } from './components/views/CardReceiverView';
import { CardBuilder } from './components/views/CardBuilder';
import { ProfileView } from './components/views/ProfileView';

// Default Starting Card Configuration
const DEFAULT_CONFIG: CardConfig = {
  recipient: '',
  relation: 'bestie',
  tone: 'heartfelt',
  theme: 'pastel',
  container: 'box',
  message: "Wishing you a birthday that's as spectacular, radiant, and wonderful as you are! May this year bring you endless laughter, joy, and magical memories.",
  poem: "",
  stickers: [
    { id: '1', type: 'cupcake', x: 25, y: 70, scale: 1.2, rotate: -15 },
    { id: '2', type: 'star', x: 75, y: 25, scale: 1.1, rotate: 12 },
    { id: '3', type: 'heart', x: 15, y: 30, scale: 1.3, rotate: -8 },
  ],
  features: {
    candle: true,
    confetti: true,
    balloons: true,
    music: true,
    musicTheme: 'birthday',
  },
  recipientPic: '',
  slideshowPics: [
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&fit=crop&q=80'
  ],
};

export default function App() {
  // Theme & Navigation States
  const [selectedTheme, setSelectedTheme] = useState<CardConfig['theme']>('pastel');
  const theme = THEME_STYLES[selectedTheme] || THEME_STYLES.pastel;
  const [activeTab, setActiveTab] = useState<'card' | 'wishlist' | 'history' | 'profile'>('wishlist');

  // Authentication & Supabase User State
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('wishly_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && (parsed.fullName || parsed.username || parsed.avatarUrl)) {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      fullName: 'Studio Guest',
      username: 'studioguest',
      avatarUrl: '🎂',
      dateOfBirth: ''
    };
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Friends State & Handlers
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const saved = localStorage.getItem('wishly_user_friends');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  const handleAddFriend = async (friendData: Omit<Friend, 'id'> | Friend) => {
    const friendId = ('id' in friendData && friendData.id)
      ? friendData.id
      : `friend-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newFriend: Friend = { ...friendData, id: friendId };

    setFriends((prev) => {
      const filtered = prev.filter(
        (f) => f.id !== newFriend.id && f.username?.toLowerCase() !== newFriend.username?.toLowerCase()
      );
      const updated = [newFriend, ...filtered];
      saveFriendsToSupabase(supabaseUser?.id || '', updated).catch(() => {});
      return updated;
    });
  };

  const handleRemoveFriend = async (friendId: string) => {
    setFriends((prev) => {
      const updated = prev.filter((f) => f.id !== friendId);
      saveFriendsToSupabase(supabaseUser?.id || '', updated).catch(() => {});
      return updated;
    });
  };

  const handleSendCardToFriend = (friend: Friend) => {
    setRecipientName(friend.fullName);
    setRelationship('bestie');
    setBuilderStep(1);
    setActiveTab('card');
  };

  // Wishlists State
  const [wishlists, setWishlists] = useState<Wishlist[]>(() => {
    try {
      const saved = localStorage.getItem('wishly_user_wishlists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [newWishlistTitle, setNewWishlistTitle] = useState('');
  const [newWishlistDesc, setNewWishlistDesc] = useState('');
  const [newWishlistTargetDate, setNewWishlistTargetDate] = useState('');
  const [wishlistToDeleteId, setWishlistToDeleteId] = useState<string | null>(null);

  // Wishlist Item Modal State
  const [showWishlistItemModal, setShowWishlistItemModal] = useState(false);
  const [selectedWishlistId, setSelectedWishlistId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemLink, setNewItemLink] = useState('');
  const [newItemImage, setNewItemImage] = useState('🎁');
  const [newItemPriority, setNewItemPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [wishlistItemToDelete, setWishlistItemToDelete] = useState<{ wishlistId: string; itemId: string } | null>(null);

  // Guest Claim Modal State
  const [claimModalData, setClaimModalData] = useState<{ wishlistId: string; item: WishlistItem } | null>(null);
  const [guestClaimName, setGuestClaimName] = useState('');

  // Wishlist Receiver / Shared View State
  const [activeWishlist, setActiveWishlist] = useState<Wishlist | null>(null);
  const [isWishlistReceiverMode, setIsWishlistReceiverMode] = useState(false);
  const [isWishlistPreviewMode, setIsWishlistPreviewMode] = useState(false);

  // Card Builder State
  const [builderStep, setBuilderStep] = useState(1);
  const [recipientName, setRecipientName] = useState(DEFAULT_CONFIG.recipient);
  const [relationship, setRelationship] = useState(DEFAULT_CONFIG.relation);
  const [messageTone, setMessageTone] = useState(DEFAULT_CONFIG.tone);
  const [selectedContainer, setSelectedContainer] = useState<CardConfig['container']>('box');
  const [personalMessage, setPersonalMessage] = useState(DEFAULT_CONFIG.message);
  const [promptDetails, setPromptDetails] = useState('');
  const [geminiPoem, setGeminiPoem] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [builderStickers, setBuilderStickers] = useState(DEFAULT_CONFIG.stickers);
  const [features, setFeatures] = useState<CardConfig['features']>(DEFAULT_CONFIG.features);
  const [recipientPic, setRecipientPic] = useState(DEFAULT_CONFIG.recipientPic || '');
  const [picMethod, setPicMethod] = useState<'upload' | 'emoji' | 'url'>('upload');
  const [uploadStatus, setUploadStatus] = useState('');
  const [builderSlideshowPics, setBuilderSlideshowPics] = useState<string[]>(DEFAULT_CONFIG.slideshowPics || []);

  // Share & Card Link States
  const [shareLink, setShareLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [savedCards, setSavedCards] = useState<Array<{ id: string; recipient: string; url: string; created_at: string }>>([]);
  const [copiedHistoryCardId, setCopiedHistoryCardId] = useState<string | null>(null);

  // Card Receiver Experience State
  const [activeCard, setActiveCard] = useState<CardConfig | null>(null);
  const [isReceiverMode, setIsReceiverMode] = useState(false);
  const [isCardOpened, setIsOpened] = useState(false);
  const [introStage, setIntroStage] = useState<'someone' | 'celebrating' | 'ready'>('someone');
  const [currentStoryStep, setCurrentStoryStep] = useState(0);
  const [autoplayActive, setAutoplayActive] = useState(true);
  const [candleBlown, setCandleBlown] = useState(false);
  const [smokeParticles, setSmokeParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number; size: number }>>([]);
  const [balloons, setBalloons] = useState<Array<{ id: number; x: number; color: string; size: number; speed: number; popped: boolean }>>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideshowAutoNext, setSlideshowAutoNext] = useState(true);

  // Audio Music Engine Ref
  const musicEngine = useRef<MusicBoxEngine | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const loadLocalStorageData = () => {
    try {
      const savedProf = localStorage.getItem('wishly_user_profile');
      if (savedProf) {
        const parsed = JSON.parse(savedProf);
        if (parsed && typeof parsed === 'object' && (parsed.fullName || parsed.username || parsed.avatarUrl)) {
          setUserProfile(parsed);
        }
      }
    } catch (e) {}

    try {
      const savedFriends = localStorage.getItem('wishly_user_friends');
      if (savedFriends) setFriends(JSON.parse(savedFriends));
    } catch (e) {}

    try {
      const savedWishlists = localStorage.getItem('wishly_user_wishlists');
      if (savedWishlists) {
        const parsed = JSON.parse(savedWishlists);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWishlists(parsed);
        }
      }
    } catch (e) {}
  };

  // 1. Initialize Supabase Auth Listener & Local Storage
  useEffect(() => {
    musicEngine.current = new MusicBoxEngine();

    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          setSupabaseUser(session?.user ?? null);
          if (session?.user) {
            loadUserDataFromSupabase(session.user.id);
          } else {
            loadLocalStorageData();
          }
        })
        .catch((err) => {
          console.warn('Supabase session fetch error:', err);
          loadLocalStorageData();
        });

      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setSupabaseUser(session?.user ?? null);
          if (session?.user) {
            loadUserDataFromSupabase(session.user.id);
            if (event === 'SIGNED_IN') {
              // Only redirect to wishlist on initial explicit sign-in if needed
            }
          } else {
            loadLocalStorageData();
          }
        });

        return () => subscription?.unsubscribe();
      } catch (authErr) {
        console.warn('Supabase auth listener setup error:', authErr);
        loadLocalStorageData();
      }
    } else {
      loadLocalStorageData();
    }
  }, []);

  // Load User Data directly from Supabase
  const loadUserDataFromSupabase = async (userId: string) => {
    try {
      if (!supabase) return;

      // 1. Profile Loading directly from Supabase
      const cloudProf = await fetchUserProfileFromSupabase(userId);

      let userMeta: any = null;
      let userEmail: string | undefined = undefined;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userMeta = user?.user_metadata;
        userEmail = user?.email;
      } catch (authErr) {
        // network error reading user metadata
      }
      
      const metaName = userMeta?.full_name || userMeta?.name || userMeta?.fullName || '';

      let localProf: UserProfile | null = null;
      try {
        const saved = localStorage.getItem('wishly_user_profile');
        if (saved) localProf = JSON.parse(saved);
      } catch (e) {}

      const fullName = cloudProf?.fullName || metaName || localProf?.fullName || userEmail?.split('@')[0] || 'Studio Guest';
      const username = cloudProf?.username || userMeta?.username || userMeta?.preferred_username || localProf?.username || (fullName ? fullName.toLowerCase().replace(/\s+/g, '') : '');
      const avatarUrl = cloudProf?.avatarUrl || userMeta?.avatar_url || userMeta?.picture || localProf?.avatarUrl || '🎂';
      const dateOfBirth = cloudProf?.dateOfBirth || userMeta?.date_of_birth || userMeta?.dob || localProf?.dateOfBirth || '';

      const mergedProf: UserProfile = {
        fullName,
        username,
        avatarUrl,
        dateOfBirth
      };

      setUserProfile(mergedProf);
      try {
        localStorage.setItem('wishly_user_profile', JSON.stringify(mergedProf));
      } catch (e) {}

      if (userId && (fullName || username)) {
        saveUserProfileToSupabase(userId, mergedProf).catch(() => {});
      }

      // 2. Wishlists Loading directly from Supabase
      const cloudWishlists = await fetchWishlistsFromSupabase(userId);
      if (Array.isArray(cloudWishlists)) {
        setWishlists(cloudWishlists);
      } else {
        setWishlists([]);
      }

      // 3. Saved Cards Loading
      const cloudCards = await fetchCardsFromSupabase();
      if (cloudCards && cloudCards.length > 0) {
        setSavedCards(cloudCards);
      }

      // 4. Friends Loading directly from Supabase
      const cloudFriends = await fetchFriendsFromSupabase(userId);
      if (Array.isArray(cloudFriends) && cloudFriends.length > 0) {
        setFriends(cloudFriends);
      }
    } catch (e) {
      console.warn('Error syncing user data from Supabase:', e);
    }
  };

  // 2. Hash & Query URL Parser for Receiver Mode
  useEffect(() => {
    const checkUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryWishlistId = searchParams.get('wishlist') || searchParams.get('wishlistId');

      if (queryWishlistId) {
        // Load Wishlist by ID from state
        const found = wishlists.find(w => w.id === queryWishlistId);
        if (found) {
          setActiveWishlist(found);
          setIsWishlistReceiverMode(true);
        }
      }

      const hash = window.location.hash;
      if (hash && (hash.startsWith('#wishlistId=') || hash.includes('wishlistId='))) {
        const id = hash.replace(/^#/, '').split('&').find(p => p.startsWith('wishlistId='))?.replace('wishlistId=', '');
        if (id) {
          const found = wishlists.find(w => w.id === id);
          if (found) {
            setActiveWishlist(found);
            setIsWishlistReceiverMode(true);
          }
        }
      } else if (hash && (hash.startsWith('#wishlist=') || hash.includes('wishlist='))) {
        try {
          const raw = hash.replace(/^#/, '').split('&').find(p => p.startsWith('wishlist='))?.replace('wishlist=', '');
          if (raw) {
            const decoded = JSON.parse(decodeURIComponent(atob(raw)));
            if (decoded && typeof decoded === 'object') {
              setActiveWishlist(decoded);
              setIsWishlistReceiverMode(true);
            }
          }
        } catch (e) {
          console.error('Error parsing wishlist from URL hash:', e);
        }
      } else if (hash && hash.startsWith('#card=')) {
        try {
          const raw = hash.replace('#card=', '');
          const decoded = JSON.parse(decodeURIComponent(atob(raw)));
          setActiveCard(decoded);
          setIsReceiverMode(true);
        } catch (e) {
          console.error('Error parsing card from URL hash:', e);
        }
      }
    };

    checkUrl();
    window.addEventListener('hashchange', checkUrl);
    return () => window.removeEventListener('hashchange', checkUrl);
  }, [wishlists]);

  // Load Saved Cards from Supabase / memory
  useEffect(() => {
    fetchCardsFromSupabase().then((cards) => {
      if (cards && cards.length > 0) {
        setSavedCards(cards);
      }
    }).catch(() => {});
  }, []);

  // Sync Audio Music Engine with features.musicTheme
  useEffect(() => {
    if (musicEngine.current) {
      const wasPlaying = isPlayingMusic;
      if (wasPlaying) musicEngine.current.stop();
      musicEngine.current.setTheme(features.musicTheme);
      if (wasPlaying) musicEngine.current.start();
    }
  }, [features.musicTheme]);

  // Music Toggle Helper
  const toggleMusic = () => {
    if (!musicEngine.current) return;
    if (isPlayingMusic) {
      musicEngine.current.stop();
      setIsPlayingMusic(false);
    } else {
      musicEngine.current.start();
      setIsPlayingMusic(true);
    }
  };

  // 3. User Profile Actions
  const handleSaveProfile = async (updated: UserProfile) => {
    console.info('[App Debug] Processing profile save:', updated);
    setUserProfile(updated);
    try {
      localStorage.setItem('wishly_user_profile', JSON.stringify(updated));
    } catch (e: any) {
      console.warn('[App Debug] LocalStorage write error:', e?.message || e);
    }

    setProfileSaving(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      if (isSupabaseConfigured()) {
        let uId = supabaseUser?.id;
        if (!uId) {
          try {
            const { data } = await supabase!.auth.getUser();
            if (data?.user) {
              setSupabaseUser(data.user);
              uId = data.user.id;
            }
          } catch (e: any) {
            console.warn('[App Debug] Auth fetch user notice:', e?.message || e);
          }
        }
        if (uId) {
          const synced = await saveUserProfileToSupabase(uId, updated);
          if (!synced) {
            console.warn('[App Debug] Profile saved to local storage (cloud DB write bypassed/restricted).');
          }
        }
      }
      playMagicalBell(880, 0.4);
      setProfileSuccessMsg('Profile saved successfully! ✨');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err: any) {
      const errMsg = err?.message || 'Error occurred while syncing profile to cloud.';
      console.error('[App Debug Error] Save profile failed:', err);
      setProfileErrorMsg(errMsg);
      throw new Error(errMsg);
    } finally {
      setProfileSaving(false);
    }
  };

  // 4. Wishlist Actions & Sync Helper
  const syncWishlistsToCloud = async (
    updatedWishlists: Wishlist[],
    deletedWishlistId?: string,
    deletedItemId?: { wishlistId: string; itemId: string }
  ) => {
    try {
      localStorage.setItem('wishly_user_wishlists', JSON.stringify(updatedWishlists));
    } catch (e: any) {
      console.warn('[Wishlist Sync Debug] LocalStorage write notice:', e?.message || e);
    }

    if (!isSupabaseConfigured()) {
      console.info('[Wishlist Sync Debug] Supabase client not configured. Wishlists saved to local storage.');
      return;
    }

    let uId = supabaseUser?.id;
    if (!uId && supabase) {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setSupabaseUser(data.user);
          uId = data.user.id;
        }
      } catch (e: any) {
        console.warn('[Wishlist Sync Debug] Auth user lookup notice:', e?.message || e);
      }
    }

    if (uId) {
      console.info('[Wishlist Sync Debug] Syncing wishlists to cloud for user ID:', uId);
      try {
        if (deletedWishlistId) {
          await deleteWishlistFromSupabase(uId, deletedWishlistId, updatedWishlists);
        } else if (deletedItemId) {
          await deleteWishlistItemFromSupabase(uId, deletedItemId.wishlistId, deletedItemId.itemId, updatedWishlists);
        } else {
          const success = await saveWishlistsToSupabase(uId, updatedWishlists);
          if (!success) {
            console.warn('[Wishlist Sync Debug] Cloud wishlist save operation returned false. Saved locally.');
          } else {
            console.info('[Wishlist Sync Debug] Wishlists successfully synced to cloud.');
          }
        }
      } catch (err: any) {
        console.error('[Wishlist Sync Debug Error] Critical error during wishlist sync:', err);
      }
    } else {
      console.warn('[Wishlist Sync Debug] User is not authenticated in Supabase. Wishlists saved to local storage.');
    }
  };

  const handleCreateWishlist = async () => {
    if (!newWishlistTitle.trim()) {
      alert('Please enter a wishlist title.');
      return;
    }

    const newWL: Wishlist = {
      id: Date.now().toString(),
      title: newWishlistTitle.trim(),
      description: newWishlistDesc.trim(),
      targetDate: newWishlistTargetDate,
      items: [],
      creatorName: userProfile.fullName,
      creatorUsername: userProfile.username,
      creatorAvatar: userProfile.avatarUrl,
      creatorDob: userProfile.dateOfBirth,
      theme: selectedTheme,
    };

    const updated = [newWL, ...wishlists];
    setWishlists(updated);
    setShowWishlistModal(false);
    setNewWishlistTitle('');
    setNewWishlistDesc('');
    setNewWishlistTargetDate('');

    await syncWishlistsToCloud(updated);

    playMagicalBell(987, 0.5);
  };

  const handleSaveWishlistItem = async () => {
    if (!selectedWishlistId || !newItemTitle.trim()) {
      alert('Please enter an item name.');
      return;
    }

    const updated = wishlists.map(wl => {
      if (wl.id !== selectedWishlistId) return wl;

      const currentItems = Array.isArray(wl.items) ? wl.items : [];

      if (editingItemId) {
        return {
          ...wl,
          items: currentItems.map(item => item.id === editingItemId ? {
            ...item,
            title: newItemTitle.trim(),
            price: newItemPrice.trim(),
            link: newItemLink.trim(),
            imageUrl: newItemImage,
            priority: newItemPriority
          } : item)
        };
      } else {
        const newItem: WishlistItem = {
          id: Date.now().toString(),
          title: newItemTitle.trim(),
          price: newItemPrice.trim(),
          link: newItemLink.trim(),
          imageUrl: newItemImage,
          priority: newItemPriority,
          isClaimed: false,
        };
        return { ...wl, items: [...currentItems, newItem] };
      }
    });

    setWishlists(updated);
    setShowWishlistItemModal(false);
    setEditingItemId(null);
    setNewItemTitle('');
    setNewItemPrice('');
    setNewItemLink('');
    setNewItemImage('🎁');
    setNewItemPriority('medium');

    await syncWishlistsToCloud(updated);

    playMagicalBell(880, 0.4);
  };

  const handleDeleteWishlist = async () => {
    if (!wishlistToDeleteId) return;
    const deletedId = wishlistToDeleteId;
    const updated = wishlists.filter(w => w.id !== deletedId);
    setWishlists(updated);
    setWishlistToDeleteId(null);

    await syncWishlistsToCloud(updated, deletedId);
  };

  const handleDeleteWishlistItem = async () => {
    if (!wishlistItemToDelete) return;
    const { wishlistId, itemId } = wishlistItemToDelete;

    const updated = wishlists.map(wl => {
      if (wl.id !== wishlistId) return wl;
      return { ...wl, items: wl.items.filter(item => item.id !== itemId) };
    });

    setWishlists(updated);
    setWishlistItemToDelete(null);

    await syncWishlistsToCloud(updated, undefined, { wishlistId, itemId });
  };

  // Guest Claim Gift Action
  const handleClaimWishlistItem = async (wishlistId: string, itemId: string, claimerName: string) => {
    const updated = wishlists.map(wl => {
      if (wl.id !== wishlistId) return wl;
      return {
        ...wl,
        items: wl.items.map(item => {
          if (item.id !== itemId) return item;
          const willClaim = !item.isClaimed;
          return {
            ...item,
            isClaimed: willClaim,
            claimedBy: willClaim ? claimerName : undefined,
          };
        })
      };
    });

    setWishlists(updated);
    if (activeWishlist && activeWishlist.id === wishlistId) {
      const activeUpdated = updated.find(w => w.id === wishlistId);
      if (activeUpdated) setActiveWishlist(activeUpdated);
    }

    await syncWishlistsToCloud(updated);

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    playMagicalBell(880, 0.5);
  };

  // 5. Gemini AI Verse Generator
  const handleGeneratePoem = async () => {
    if (!recipientName) {
      alert('Please enter a recipient name first in Step 1!');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipientName,
          relation: relationship,
          tone: messageTone,
          dynamicPrompt: promptDetails
        }),
      });
      const data = await res.json();
      if (data.text) {
        setGeminiPoem(data.text);
        playMagicalBell(987, 1.0);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (e) {
      alert('Could not generate poem. Please check connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Upload Multiple Photos for Slideshow
  const handleUploadMultipleSlideshowPics = async (files: FileList) => {
    const newUrls: string[] = [...builderSlideshowPics];
    for (let i = 0; i < files.length && newUrls.length < 5; i++) {
      const file = files[i];
      try {
        if (isSupabaseConfigured() && supabaseUser) {
          const url = await uploadImageToSupabase(file, 'birthday-memories');
          newUrls.push(url);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setBuilderSlideshowPics(prev => [...prev, e.target!.result as string].slice(0, 5));
            }
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.warn('File upload failed:', err);
      }
    }
    if (newUrls.length > builderSlideshowPics.length) {
      setBuilderSlideshowPics(newUrls.slice(0, 5));
      playMagicalBell(880, 0.4);
    }
  };

  // Create Shareable Card Link Action
  const handleCreateShareLink = async () => {
    const config: CardConfig = {
      recipient: recipientName || 'Friend',
      relation: relationship,
      tone: messageTone,
      theme: selectedTheme,
      container: selectedContainer,
      message: personalMessage,
      poem: geminiPoem,
      stickers: builderStickers,
      features,
      recipientPic,
      slideshowPics: builderSlideshowPics,
    };

    const jsonStr = JSON.stringify(config);
    const encoded = btoa(encodeURIComponent(jsonStr));
    const url = `${window.location.origin}${window.location.pathname}#card=${encoded}`;

    setShareLink(url);

    // Save to card history
    const newSaved = [{
      id: Date.now().toString(),
      recipient: recipientName || 'Friend',
      url,
      created_at: new Date().toISOString()
    }, ...savedCards];

    setSavedCards(newSaved);
    localStorage.setItem('wishly_saved_cards', JSON.stringify(newSaved));

    if (isSupabaseConfigured() && supabaseUser) {
      await saveCardToSupabase({
        id: Date.now().toString(),
        name: recipientName || 'Birthday Card',
        url,
        recipient: recipientName || 'Friend'
      });
    }

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    playMagicalBell(1046, 1.2);
  };

  // Copy Link to Clipboard
  const copyToClipboard = async () => {
    if (!shareLink) return;
    const success = await copyTextToClipboard(shareLink);
    if (success) {
      setIsCopied(true);
      playMagicalBell(880, 0.3);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      alert(`Copy failed. Please manually copy this link:\n\n${shareLink}`);
    }
  };

  // Card Opening Handlers
  const handleOpenCard = () => {
    setIsOpened(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    playMagicalBell(880, 0.5);
    if (features.music && musicEngine.current) {
      musicEngine.current.start();
      setIsPlayingMusic(true);
    }
  };

  const handleBlowOutCandle = () => {
    setCandleBlown(true);
    playCandleBlowOut();
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 } });
  };

  const spawnBalloons = () => {
    const colors = ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const newBalloons = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: 10 + Math.random() * 80,
      color: colors[i % colors.length],
      size: 40 + Math.random() * 30,
      speed: 2 + Math.random() * 2,
      popped: false,
    }));
    setBalloons(newBalloons);
  };

  // Auth Submit Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthMessage('Please fill in all fields.');
      return;
    }
    setAuthLoading(true);
    setAuthMessage('');

    try {
      if (!isSupabaseConfigured() || !supabase) {
        // Fallback simulation mode
        const mockUser = { id: 'local-' + Date.now(), email: authEmail };
        setSupabaseUser(mockUser);
        setShowAuthModal(false);
        playMagicalBell(880, 0.5);
        return;
      }

      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setSupabaseUser(data.user);
        setShowAuthModal(false);
        playMagicalBell(880, 0.5);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setAuthMessage('Check your email for confirmation link! ✨');
      }
    } catch (err: any) {
      setAuthMessage(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    setSupabaseUser(null);
    playMagicalBell(440, 0.2);
  };

  // RENDER CONDITIONAL VIEWS:
  // 1. Wishlist Receiver Mode
  if (isWishlistReceiverMode && activeWishlist) {
    return (
      <>
        <WishlistReceiverView
          activeWishlist={activeWishlist}
          isWishlistPreviewMode={isWishlistPreviewMode}
          onExitPreview={() => {
            setIsWishlistReceiverMode(false);
            setIsWishlistPreviewMode(false);
          }}
          onOpenClaimModal={(wishlistId, item) => setClaimModalData({ wishlistId, item })}
        />

        <ClaimGuestModal
          isOpen={!!claimModalData}
          onClose={() => setClaimModalData(null)}
          claimData={claimModalData}
          guestName={guestClaimName}
          setGuestName={setGuestClaimName}
          onConfirmClaim={() => {
            if (claimModalData && guestClaimName.trim()) {
              handleClaimWishlistItem(claimModalData.wishlistId, claimModalData.item.id, guestClaimName.trim());
              setClaimModalData(null);
              setGuestClaimName('');
            }
          }}
          theme={theme}
        />
      </>
    );
  }

  // 2. Card Receiver Mode
  if (isReceiverMode) {
    return (
      <CardReceiverView
        activeCard={activeCard}
        selectedTheme={selectedTheme}
        recipientName={recipientName}
        recipientPic={recipientPic}
        isCardOpened={isCardOpened}
        setIsCardOpened={setIsOpened}
        handleOpenCard={handleOpenCard}
        currentStoryStep={currentStoryStep}
        setCurrentStoryStep={setCurrentStoryStep}
        autoplayActive={autoplayActive}
        setAutoplayActive={setAutoplayActive}
        isMusicPlaying={isPlayingMusic}
        musicLoaded={true}
        toggleMusic={toggleMusic}
        geminiPoem={geminiPoem}
        geminiPoemLoading={isGenerating}
        generateGeminiPoem={handleGeneratePoem}
        candleBlown={candleBlown}
        handleBlowOutCandle={handleBlowOutCandle}
        smokeParticles={smokeParticles}
        currentSlideshow={builderSlideshowPics}
        currentSlideIndex={currentSlideIndex}
        setCurrentSlideIndex={setCurrentSlideIndex}
        slideshowAutoNext={slideshowAutoNext}
        setSlideshowAutoNext={setSlideshowAutoNext}
        features={features}
        spawnBalloons={spawnBalloons}
        onBackToStudio={() => setIsReceiverMode(false)}
      />
    );
  }

  // 3. Primary Studio Application Workspace
  return (
    <div className={`min-h-screen pt-4 bg-gradient-to-br ${theme.bg} text-slate-900 transition-colors duration-700 relative overflow-x-clip font-sans selection:bg-rose-500/30`}>
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-40 animate-pulse ${theme.blob1}`} />
        <div className={`absolute top-1/2 -right-40 w-96 h-96 rounded-full blur-3xl opacity-40 animate-pulse ${theme.blob2}`} />
        <div className={`absolute -bottom-40 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse ${theme.blob3}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-8 space-y-8">
        {/* Navigation Bar Header */}
        <Navbar
          theme={theme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userProfile={userProfile}
          supabaseUser={supabaseUser}
          friendsCount={friends.length}
          onOpenAddFriendModal={() => setShowAddFriendModal(true)}
          onOpenAuthModal={() => { setAuthMode('login'); setShowAuthModal(true); }}
          onOpenEditProfileModal={() => setShowEditProfileModal(true)}
          onLogout={handleLogout}
        />

        {/* Tab View Container */}
        {activeTab === 'card' && (
          <CardBuilder
            theme={theme}
            builderStep={builderStep}
            setBuilderStep={setBuilderStep}
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            relationship={relationship}
            setRelationship={setRelationship}
            picMethod={picMethod}
            setPicMethod={setPicMethod}
            recipientPic={recipientPic}
            setRecipientPic={setRecipientPic}
            uploadStatus={uploadStatus}
            setUploadStatus={setUploadStatus}
            builderSlideshowPics={builderSlideshowPics}
            setBuilderSlideshowPics={setBuilderSlideshowPics}
            handleUploadMultipleSlideshowPics={handleUploadMultipleSlideshowPics}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            selectedContainer={selectedContainer}
            setSelectedContainer={setSelectedContainer}
            personalMessage={personalMessage}
            setPersonalMessage={setPersonalMessage}
            messageTone={messageTone}
            setMessageTone={setMessageTone}
            promptDetails={promptDetails}
            setPromptDetails={setPromptDetails}
            geminiPoem={geminiPoem}
            setGeminiPoem={setGeminiPoem}
            isGenerating={isGenerating}
            handleGeneratePoem={handleGeneratePoem}
            features={features}
            setFeatures={setFeatures}
            handleCreateShareLink={handleCreateShareLink}
            shareLink={shareLink}
            isCopied={isCopied}
            copyToClipboard={copyToClipboard}
            toggleMusic={toggleMusic}
            isPlayingMusic={isPlayingMusic}
            setIsPlayingMusic={setIsPlayingMusic}
            musicEngine={musicEngine}
            builderStickers={builderStickers}
            setActiveCard={setActiveCard}
            setIsReceiverMode={setIsReceiverMode}
            setIsOpened={setIsOpened}
            supabaseUser={supabaseUser}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistStudio
            theme={theme}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onSaveProfile={handleSaveProfile}
            profileSaving={profileSaving}
            profileSuccessMsg={profileSuccessMsg}
            wishlists={wishlists}
            friends={friends}
            onOpenAddFriendModal={() => setShowAddFriendModal(true)}
            onSendCardToFriend={handleSendCardToFriend}
            onOpenWishlistModal={() => setShowWishlistModal(true)}
            onOpenWishlistItemModal={(wishlistId) => {
              setSelectedWishlistId(wishlistId);
              setEditingItemId(null);
              setNewItemTitle('');
              setNewItemPrice('');
              setNewItemLink('');
              setNewItemImage('🎁');
              setNewItemPriority('medium');
              setShowWishlistItemModal(true);
            }}
            onEditWishlistItem={(wishlistId, item) => {
              setSelectedWishlistId(wishlistId);
              setEditingItemId(item.id);
              setNewItemTitle(item.title);
              setNewItemPrice(item.price || '');
              setNewItemLink(item.link || '');
              setNewItemImage(item.imageUrl || '🎁');
              setNewItemPriority(item.priority || 'medium');
              setShowWishlistItemModal(true);
            }}
            onDeleteWishlist={(wishlistId) => setWishlistToDeleteId(wishlistId)}
            onDeleteWishlistItem={(wishlistId, itemId) => setWishlistItemToDelete({ wishlistId, itemId })}
            onPreviewWishlistVisitor={(wl) => {
              const wlWithProfile = {
                ...wl,
                theme: wl.theme || selectedTheme,
                creatorName: userProfile.fullName || '',
                creatorUsername: userProfile.username || '',
                creatorAvatar: userProfile.avatarUrl || '🎂',
                creatorDob: userProfile.dateOfBirth || '',
              };
              setActiveWishlist(wlWithProfile);
              setIsWishlistReceiverMode(true);
              setIsWishlistPreviewMode(true);
            }}
            selectedTheme={selectedTheme}
            supabaseUser={supabaseUser}
            savedCardsCount={savedCards.length}
            onSwitchToCardBuilder={() => setActiveTab('card')}
            onOpenAuthModal={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            profileSaving={profileSaving}
            profileSuccessMsg={profileSuccessMsg}
            theme={theme}
            supabaseUser={supabaseUser}
            friends={friends}
            onOpenAddFriendModal={() => setShowAddFriendModal(true)}
            onOpenAuthModal={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
          />
        )}

        {activeTab === 'history' && (
          <CardHistory
            theme={theme}
            savedCards={savedCards}
            copiedHistoryCardId={copiedHistoryCardId}
            onCopyCardLink={async (id, url) => {
              const success = await copyTextToClipboard(url);
              if (success) {
                setCopiedHistoryCardId(id);
                playMagicalBell(880, 0.3);
                setTimeout(() => setCopiedHistoryCardId(null), 2000);
              }
            }}
          />
        )}
      </div>

      {/* Global Modals */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        profileSaving={profileSaving}
        profileSuccessMsg={profileSuccessMsg}
        theme={theme}
        supabaseUser={supabaseUser}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authLoading={authLoading}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        theme={theme}
      />

      <WishlistCreateModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
        title={newWishlistTitle}
        setTitle={setNewWishlistTitle}
        desc={newWishlistDesc}
        setDesc={setNewWishlistDesc}
        targetDate={newWishlistTargetDate}
        setTargetDate={setNewWishlistTargetDate}
        onSave={handleCreateWishlist}
        theme={theme}
      />

      <WishlistItemModal
        isOpen={showWishlistItemModal}
        onClose={() => setShowWishlistItemModal(false)}
        editingItemId={editingItemId}
        title={newItemTitle}
        setTitle={setNewItemTitle}
        price={newItemPrice}
        setPrice={setNewItemPrice}
        link={newItemLink}
        setLink={setNewItemLink}
        imageUrl={newItemImage}
        setImageUrl={setNewItemImage}
        priority={newItemPriority}
        setPriority={setNewItemPriority}
        onSave={handleSaveWishlistItem}
        theme={theme}
      />

      <ClaimGuestModal
        isOpen={!!claimModalData}
        onClose={() => setClaimModalData(null)}
        claimData={claimModalData}
        guestName={guestClaimName}
        setGuestName={setGuestClaimName}
        onConfirmClaim={() => {
          if (claimModalData && guestClaimName.trim()) {
            handleClaimWishlistItem(claimModalData.wishlistId, claimModalData.item.id, guestClaimName.trim());
            setClaimModalData(null);
            setGuestClaimName('');
          }
        }}
        theme={theme}
      />

      <ConfirmDeleteModal
        isOpen={!!wishlistToDeleteId || !!wishlistItemToDelete}
        onClose={() => {
          setWishlistToDeleteId(null);
          setWishlistItemToDelete(null);
        }}
        onConfirm={() => {
          if (wishlistToDeleteId) handleDeleteWishlist();
          if (wishlistItemToDelete) handleDeleteWishlistItem();
        }}
        title={wishlistToDeleteId ? 'Delete Wishlist' : 'Remove Wish'}
        description={wishlistToDeleteId ? 'Are you sure you want to delete this entire wishlist?' : 'Are you sure you want to remove this item from your wishlist?'}
        theme={theme}
      />

      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        friends={friends}
        onAddFriend={handleAddFriend}
        onRemoveFriend={handleRemoveFriend}
        theme={theme}
      />
    </div>
  );
}
