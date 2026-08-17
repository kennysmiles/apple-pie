import React, { useState, useRef, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  Download, X, Sparkles, Check, Copy, Gift, Image as ImageIcon,
  Palette, Smartphone, Monitor, FileText, Layers, Loader2, DollarSign,
  Tag, ExternalLink, QrCode, Grid, List, CheckSquare, Plus, RefreshCw,
  Maximize2, Minimize2, Eye, Sliders, Calendar, Clock
} from 'lucide-react';
import { Wishlist, ThemeKey, WishlistItem } from '../../types';
import { THEME_STYLES } from '../../constants/themes';
import { getZodiacSign, isImageUrl, resolveImageUrl } from '../../utils/helpers';
import { exportElementAsImage, copyElementToClipboard } from '../../utils/wishlistExporter';
import { playMagicalBell } from '../../utils/synth';
import { fetchWishlistItemsFromSupabase } from '../../lib/supabase';

/**
 * High-definition Theme Palette Text & Color Styling Mapping
 * Adapts every label, header, card, price, tag, and footer dynamically based on theme.
 */
const THEME_CARD_PALETTES: Record<ThemeKey, {
  isDark: boolean;
  bg: string;
  blob1: string;
  blob2: string;
  border: string;
  headerName: string;
  brandName:string;
  headerUsername: string;
  headerDateBadge: string;
  titleText: string;
  descBox: string;
  descText: string;
  zodiacBadge: string;
  totalBadge: string;
  sectionHeader: string;
  itemsCountBadge: string;
  itemCardBg: string;
  itemCardBorder: string;
  itemImgBg: string;
  itemTitle: string;
  itemPrice: string;
  itemDomain: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
  claimAvailable: string;
  claimClaimed: string;
  footerTitle: string;
  footerDesc: string;
  footerDate: string;
  emptyBox: string;
  checklistNumber: string;
  countdownBox: string;
  countdownNumber: string;
  countdownText: string;
  countdownSubtext: string;
  countdownBadge: string;
}> = {
  midnight: {
    isDark: true,
    bg: 'from-[#050515] via-[#0b0f28] to-[#12082b]',
    blob1: 'bg-indigo-600/30',
    blob2: 'bg-purple-600/30',
    border: 'border-white/20',
    headerName: 'text-amber-300',
    headerUsername: 'text-white/60',
    headerDateBadge: 'bg-white/15 border-white/20 text-white/90',
    titleText: 'text-white',
    brandName:'text-white',
    descBox: 'bg-white/10 border-white/10',
    descText: 'text-white/85',
    zodiacBadge: 'bg-amber-500/25 border-amber-400/30 text-amber-200',
    totalBadge: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
    sectionHeader: 'text-white/80',
    itemsCountBadge: 'text-white/70',
    itemCardBg: 'bg-white/15 backdrop-blur-md',
    itemCardBorder: 'border-white/20',
    itemImgBg: 'bg-white/20 border-white/20 text-white',
    itemTitle: 'text-white',
    itemPrice: 'text-amber-300',
    itemDomain: 'text-white/50',
    priorityHigh: 'bg-rose-500/25 text-rose-200 border-rose-400/40',
    priorityMedium: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
    priorityLow: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
    claimAvailable: 'bg-pink-500/25 border-pink-400/40 text-pink-100',
    claimClaimed: 'bg-emerald-500/30 border-emerald-400/50 text-emerald-200',
    footerTitle: 'text-white',
    footerDesc: 'text-white/60',
    footerDate: 'text-white/40',
    emptyBox: 'bg-white/10 border-white/15 text-white/70',
    checklistNumber: 'bg-white/20 text-amber-300',
    countdownBox: 'bg-white/10 backdrop-blur-md border-white/20 shadow-md',
    countdownNumber: 'text-amber-300',
    countdownText: 'text-white',
    countdownSubtext: 'text-white/75',
    countdownBadge: 'bg-amber-400/20 border-amber-400/30 text-amber-200',
  },
  gold: {
    isDark: false,
    bg: 'from-[#fffbeb] via-[#fef3c7] to-[#fde68a]',
    blob1: 'bg-amber-400/35',
    blob2: 'bg-orange-300/30',
    border: 'border-amber-900/15',
    headerName: 'text-amber-900',
    headerUsername: 'text-amber-800/70',
    headerDateBadge: 'bg-amber-900/10 border-amber-900/20 text-amber-950',
    titleText: 'text-amber-950',
    brandName:'text-amber-950',
    descBox: 'bg-amber-900/8 border-amber-900/15',
    descText: 'text-amber-900',
    zodiacBadge: 'bg-amber-600/15 border-amber-600/30 text-amber-950',
    totalBadge: 'bg-amber-700/15 border-amber-700/30 text-amber-950',
    sectionHeader: 'text-amber-950 font-black',
    itemsCountBadge: 'text-amber-900/80',
    itemCardBg: 'bg-white/80 backdrop-blur-md',
    itemCardBorder: 'border-amber-900/15 shadow-sm',
    itemImgBg: 'bg-amber-900/10 border-amber-900/15 text-amber-950',
    itemTitle: 'text-slate-900',
    itemPrice: 'text-amber-800',
    itemDomain: 'text-amber-800/60',
    priorityHigh: 'bg-rose-100 text-rose-800 border-rose-300',
    priorityMedium: 'bg-amber-100 text-amber-800 border-amber-300',
    priorityLow: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    claimAvailable: 'bg-amber-100 border-amber-300 text-amber-900',
    claimClaimed: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    footerTitle: 'text-amber-950',
    footerDesc: 'text-amber-900/80',
    footerDate: 'text-amber-800/60',
    emptyBox: 'bg-amber-900/5 border-amber-900/15 text-amber-900',
    checklistNumber: 'bg-amber-900/15 text-amber-950',
    countdownBox: 'bg-amber-900/10 backdrop-blur-md border-amber-900/20 shadow-sm',
    countdownNumber: 'text-amber-900',
    countdownText: 'text-amber-950',
    countdownSubtext: 'text-amber-900/80',
    countdownBadge: 'bg-amber-600/15 border-amber-600/30 text-amber-950',
  },
  pastel: {
    isDark: false,
    bg: 'from-[#fdf2f8] via-[#ede9fe] to-[#e0f2fe]',
    blob1: 'bg-purple-300/40',
    blob2: 'bg-pink-300/40',
    border: 'border-purple-900/15',
    headerName: 'text-purple-950',
    headerUsername: 'text-purple-900/70',
    headerDateBadge: 'bg-purple-900/10 border-purple-900/20 text-purple-950',
    titleText: 'text-slate-900',
    brandName:'text-slate-900',
    descBox: 'bg-white/60 border-purple-900/15',
    descText: 'text-purple-950',
    zodiacBadge: 'bg-purple-600/15 border-purple-600/30 text-purple-950',
    totalBadge: 'bg-pink-600/15 border-pink-600/30 text-pink-950',
    sectionHeader: 'text-slate-900 font-black',
    itemsCountBadge: 'text-purple-900/80',
    itemCardBg: 'bg-white/85 backdrop-blur-md',
    itemCardBorder: 'border-purple-900/15 shadow-sm',
    itemImgBg: 'bg-purple-900/10 border-purple-900/15 text-purple-950',
    itemTitle: 'text-slate-900',
    itemPrice: 'text-purple-700',
    itemDomain: 'text-slate-500',
    priorityHigh: 'bg-rose-100 text-rose-800 border-rose-300',
    priorityMedium: 'bg-purple-100 text-purple-800 border-purple-300',
    priorityLow: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    claimAvailable: 'bg-pink-100 border-pink-300 text-pink-800',
    claimClaimed: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    footerTitle: 'text-purple-950',
    footerDesc: 'text-purple-900/80',
    footerDate: 'text-purple-900/60',
    emptyBox: 'bg-purple-900/5 border-purple-900/15 text-purple-900',
    checklistNumber: 'bg-purple-900/15 text-purple-950',
    countdownBox: 'bg-white/75 backdrop-blur-md border-purple-900/15 shadow-sm',
    countdownNumber: 'text-purple-900',
    countdownText: 'text-purple-950',
    countdownSubtext: 'text-purple-900/70',
    countdownBadge: 'bg-pink-600/15 border-pink-600/30 text-pink-950',
  },
  sunset: {
    isDark: false,
    bg: 'from-[#fff1f2] via-[#ffedd5] to-[#fef3c7]',
    blob1: 'bg-rose-300/40',
    blob2: 'bg-orange-300/40',
    border: 'border-rose-900/15',
    headerName: 'text-rose-950',
    headerUsername: 'text-rose-900/70',
    headerDateBadge: 'bg-rose-900/10 border-rose-900/20 text-rose-950',
    titleText: 'text-slate-900',
    brandName:'text-slate-900',
    descBox: 'bg-white/60 border-rose-900/15',
    descText: 'text-rose-950',
    zodiacBadge: 'bg-orange-600/15 border-orange-600/30 text-orange-950',
    totalBadge: 'bg-rose-600/15 border-rose-600/30 text-rose-950',
    sectionHeader: 'text-slate-900 font-black',
    itemsCountBadge: 'text-rose-900/80',
    itemCardBg: 'bg-white/85 backdrop-blur-md',
    itemCardBorder: 'border-rose-900/15 shadow-sm',
    itemImgBg: 'bg-rose-900/10 border-rose-900/15 text-rose-950',
    itemTitle: 'text-slate-900',
    itemPrice: 'text-rose-700',
    itemDomain: 'text-rose-900/60',
    priorityHigh: 'bg-rose-100 text-rose-800 border-rose-300',
    priorityMedium: 'bg-orange-100 text-orange-800 border-orange-300',
    priorityLow: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    claimAvailable: 'bg-orange-100 border-orange-300 text-orange-800',
    claimClaimed: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    footerTitle: 'text-rose-950',
    footerDesc: 'text-rose-900/80',
    footerDate: 'text-rose-900/60',
    emptyBox: 'bg-rose-900/5 border-rose-900/15 text-rose-900',
    checklistNumber: 'bg-rose-900/15 text-rose-950',
    countdownBox: 'bg-white/75 backdrop-blur-md border-rose-900/15 shadow-sm',
    countdownNumber: 'text-rose-900',
    countdownText: 'text-rose-950',
    countdownSubtext: 'text-rose-900/70',
    countdownBadge: 'bg-rose-600/15 border-rose-600/30 text-rose-950',
  }
};

interface WishlistExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Wishlist | null;
  defaultTheme?: ThemeKey;
}

export const WishlistExportModal: React.FC<WishlistExportModalProps> = ({
  isOpen,
  onClose,
  wishlist,
  defaultTheme = 'midnight'
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg'>('png');
  const [selectedResolution, setSelectedResolution] = useState<number>(3); // 2x, 3x (Ultra HD), 4x (4K)
  const [deviceFormat, setDeviceFormat] = useState<'mobile' | 'desktop'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'mobile';
    }
    return 'desktop';
  });
  const [selectedThemeKey, setSelectedThemeKey] = useState<ThemeKey>((wishlist?.theme as ThemeKey) || defaultTheme);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list' | 'checklist'>('grid');
  const [showClaimStatus, setShowClaimStatus] = useState<boolean>(true);
  const [showPriceTotal, setShowPriceTotal] = useState<boolean>(true);
  const [showQrCode, setShowQrCode] = useState<boolean>(true);
  const [showCountdown, setShowCountdown] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isCoveringScreenForExport, setIsCoveringScreenForExport] = useState(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [mobileTab, setMobileTab] = useState<'preview' | 'options'>('preview');
  const [cloudItems, setCloudItems] = useState<WishlistItem[]>([]);
  const [isFetchingCloudItems, setIsFetchingCloudItems] = useState(false);
  const [customAddedItems, setCustomAddedItems] = useState<WishlistItem[]>([]);

  const previewCardRef = useRef<HTMLDivElement>(null);

  // Sync theme when wishlist changes
  useEffect(() => {
    if (wishlist?.theme && THEME_STYLES[wishlist.theme as ThemeKey]) {
      setSelectedThemeKey(wishlist.theme as ThemeKey);
    }
  }, [wishlist?.theme]);

  // Fetch items from Supabase `wishlist_items` table if modal is opened
  useEffect(() => {
    if (!isOpen || !wishlist?.id) return;
    let isMounted = true;
    setIsFetchingCloudItems(true);

    fetchWishlistItemsFromSupabase(wishlist.id)
      .then((items) => {
        if (isMounted && Array.isArray(items) && items.length > 0) {
          setCloudItems(items);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch items from wishlist_items:', err);
      })
      .finally(() => {
        if (isMounted) setIsFetchingCloudItems(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, wishlist?.id]);

  // Safe memoization of items list from all sources (prop, cloud table, local storage, custom)
  const items: WishlistItem[] = useMemo(() => {
    if (!wishlist) return [];

    let rawItems: any[] = [];

    // 1. Direct items on wishlist prop
    if (Array.isArray(wishlist.items) && wishlist.items.length > 0) {
      rawItems = [...wishlist.items];
    } else if (typeof wishlist.items === 'string' && (wishlist.items as string).trim()) {
      try {
        const parsed = JSON.parse(wishlist.items);
        if (Array.isArray(parsed)) rawItems = parsed;
        else if (parsed && typeof parsed === 'object') rawItems = Object.values(parsed);
      } catch (e) {}
    } else if (wishlist.items && typeof wishlist.items === 'object' && !Array.isArray(wishlist.items)) {
      rawItems = Object.values(wishlist.items);
    } else if (Array.isArray((wishlist as any).wishlist_items)) {
      rawItems = (wishlist as any).wishlist_items;
    } else if (Array.isArray((wishlist as any).wishlistItems)) {
      rawItems = (wishlist as any).wishlistItems;
    } else if (Array.isArray((wishlist as any).gifts)) {
      rawItems = (wishlist as any).gifts;
    } else if ((wishlist as any).data && Array.isArray((wishlist as any).data.items)) {
      rawItems = (wishlist as any).data.items;
    } else if ((wishlist as any).payload && Array.isArray((wishlist as any).payload.items)) {
      rawItems = (wishlist as any).payload.items;
    }

    // 2. Merge Cloud Items fetched from `wishlist_items` table if any
    if (cloudItems.length > 0) {
      if (rawItems.length === 0) {
        rawItems = [...cloudItems];
      } else {
        // Merge without duplicates
        const existingIds = new Set(rawItems.map((r: any) => String(r.id || '')));
        cloudItems.forEach((ci) => {
          if (!existingIds.has(String(ci.id))) {
            rawItems.push(ci);
          }
        });
      }
    }

    // 3. Fallback: Search localStorage for matching wishlist or items
    if (rawItems.length === 0) {
      try {
        const saved = localStorage.getItem('wishly_user_wishlists');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const found = wishlist.id ? parsed.find((w: any) => String(w.id) === String(wishlist.id)) : null;
            if (found && Array.isArray(found.items) && found.items.length > 0) {
              rawItems = found.items;
            } else if (!found && parsed.length > 0 && Array.isArray(parsed[0]?.items) && parsed[0].items.length > 0) {
              const titleMatch = parsed.find((w: any) => w.title === wishlist.title);
              if (titleMatch && Array.isArray(titleMatch.items) && titleMatch.items.length > 0) {
                rawItems = titleMatch.items;
              }
            }
          }
        }
      } catch (e) {}
    }

    // 4. Append custom added preview items
    if (customAddedItems.length > 0) {
      const existingIds = new Set(rawItems.map((r: any) => String(r.id || '')));
      customAddedItems.forEach((item) => {
        if (!existingIds.has(String(item.id))) {
          rawItems.push(item);
        }
      });
    }

    return rawItems
      .filter((item: any) => item !== null && item !== undefined)
      .map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return {
            id: `item-${idx}`,
            title: item,
            price: '',
            link: '',
            priority: 'medium' as const,
            imageUrl: '🎁',
            isClaimed: false,
            claimedBy: ''
          };
        }
        const title = item.title || item.name || item.item_name || item.itemName || item.label || 'Wish Item';
        const price = item.price !== undefined && item.price !== null ? String(item.price) : (item.cost ? String(item.cost) : '');
        const link = item.link || item.url || item.item_url || item.itemUrl || item.href || '';
        const imageUrl = item.imageUrl || item.image || item.image_url || item.img || item.photo || item.thumbnail || '🎁';
        const priority = (item.priority === 'high' || item.priority === 'low' || item.priority === 'medium') ? item.priority : 'medium';
        const isClaimed = Boolean(item.isClaimed ?? item.claimed ?? item.is_claimed);
        const claimedBy = item.claimedBy || item.claimed_by || item.claimerName || item.claimer || '';

        return {
          id: String(item.id || `item-${idx}`),
          title,
          price,
          link,
          imageUrl,
          priority,
          isClaimed,
          claimedBy
        };
      });
  }, [wishlist, cloudItems, customAddedItems]);

  // Helper to quickly add sample starter items to preview
  const handleAddSampleItems = () => {
    const samples: WishlistItem[] = [
      {
        id: `sample-1-${Date.now()}`,
        title: 'Sony WH-1000XM5 Wireless Headphones',
        price: '349.99',
        link: 'https://sony.com',
        imageUrl: '🎧',
        priority: 'high',
        isClaimed: false
      },
      {
        id: `sample-2-${Date.now()}`,
        title: 'Kindle Paperwhite 16GB Waterproof',
        price: '149.99',
        link: 'https://amazon.com',
        imageUrl: '📚',
        priority: 'medium',
        isClaimed: true,
        claimedBy: 'Bestie'
      },
      {
        id: `sample-3-${Date.now()}`,
        title: 'Smeg Retro Electric Kettle in Pastel Pink',
        price: '189.95',
        link: 'https://smeg.com',
        imageUrl: '🫖',
        priority: 'low',
        isClaimed: false
      },
      {
        id: `sample-4-${Date.now()}`,
        title: 'Artisan Ceramic Pour-Over Coffee Set',
        price: '45.00',
        link: 'https://etsy.com',
        imageUrl: '☕',
        priority: 'medium',
        isClaimed: false
      }
    ];

    setCustomAddedItems((prev) => [...prev, ...samples]);
    playMagicalBell(987, 0.4);
  };

  // Calculate total price and stats unconditionally before any returns
  const totalStats = useMemo(() => {
    let sum = 0;
    let pricedCount = 0;
    let claimedCount = 0;

    items.forEach((item) => {
      if (item.isClaimed) claimedCount++;
      if (item.price) {
        const parsed = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) {
          sum += parsed;
          pricedCount++;
        }
      }
    });

    return {
      totalAmount: sum,
      pricedCount,
      claimedCount,
      availableCount: items.length - claimedCount,
    };
  }, [items]);

  // Calculate live birthday countdown from creator DOB or target date
  const countdownInfo = useMemo(() => {
    const dateStr = wishlist?.creatorDob || wishlist?.targetDate;
    if (!dateStr) return null;
    try {
      const today = new Date();
      const birthDate = new Date(dateStr);
      if (isNaN(birthDate.getTime())) return null;

      let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      if (today.getTime() > nextBirthday.getTime() && today.toDateString() !== nextBirthday.toDateString()) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
      }
      const diffTime = nextBirthday.getTime() - today.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const isToday = today.getDate() === birthDate.getDate() && today.getMonth() === birthDate.getMonth();

      return {
        diffDays,
        isToday,
      };
    } catch {
      return null;
    }
  }, [wishlist?.creatorDob, wishlist?.targetDate]);

  // Unconditional render guard AFTER all hooks are called
  if (!isOpen || !wishlist) return null;

  const currentTheme = THEME_STYLES[selectedThemeKey] || THEME_STYLES.midnight;
  const palette = THEME_CARD_PALETTES[selectedThemeKey] || THEME_CARD_PALETTES.midnight;

  // Construct share URL for QR Code
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#wishlistId=${wishlist.id}`
    : `https://wishly.app/wishlist/${wishlist.id}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=0f172a&margin=1`;

  const handleDownload = async () => {
    if (!previewCardRef.current || isExporting) return;
    setIsExporting(true);
    setExportSuccess(false);
    setIsCoveringScreenForExport(true);

    try {
      // Allow DOM and layout to recalculate full-screen dimensions with all items and images
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const fileName = `${wishlist.title || 'wishlist'}_${wishlist.creatorName || 'curation'}${deviceFormat === 'mobile' ? '_mobile_story' : ''}`;
      const result = await exportElementAsImage(previewCardRef.current, {
        format: selectedFormat,
        scale: selectedResolution,
        quality: selectedFormat === 'jpeg' ? 0.98 : undefined,
        fileName,
        backgroundColor: palette.isDark ? '#060814' : '#ffffff'
      });

      if (result.success) {
        setExportSuccess(true);
        playMagicalBell();
        try {
          confetti({
            particleCount: 80,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#ec4899', '#f59e0b', '#10b981', '#6366f1', '#a855f7']
          });
        } catch (e) {}

        setTimeout(() => setExportSuccess(false), 3000);
      } else {
        alert(`Export failed: ${result.error || 'Please try again'}`);
      }
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsCoveringScreenForExport(false);
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    if (!previewCardRef.current || isExporting) return;
    setIsExporting(true);
    setIsCoveringScreenForExport(true);

    try {
      // Allow DOM and layout to recalculate full-screen dimensions with all items and images
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const result = await copyElementToClipboard(previewCardRef.current, selectedResolution);
      if (result.success) {
        setIsCopied(true);
        playMagicalBell();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (e) {}
        setTimeout(() => setIsCopied(false), 2500);
      } else {
        alert('Could not copy directly to clipboard. You can download the image instead!');
      }
    } catch (e) {
      alert('Clipboard copy is not supported on this browser. Use the Download button instead.');
    } finally {
      setIsCoveringScreenForExport(false);
      setIsExporting(false);
    }
  };

  // Helper to extract clean domain from link
  const getDomainFromUrl = (url?: string): string | null => {
    if (!url) return null;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return 'Online Store';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        className="w-full max-w-6xl bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Download Wishlist Graphic <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-white/50">
                Ultra-high-definition image export ({selectedResolution}x Sharpness) including all {items.length} items & details
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Tab Switcher (Visible only on < lg screens) */}
        <div className="lg:hidden px-4 py-2.5 bg-slate-950/95 border-b border-white/10 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Wishlist Preview
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono">
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('options')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mobileTab === 'options'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Export Options
          </button>
        </div>

        {/* Modal Body: Split into Left Controls and Right Live Preview Graphic */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Controls Panel (4 Cols on desktop, conditioned by mobileTab on mobile, hidden when covering screen for export) */}
          <div className={`lg:col-span-4 p-5 sm:p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-900/95 text-white overflow-y-auto ${
            isCoveringScreenForExport ? 'hidden' : mobileTab === 'options' ? 'block' : 'hidden lg:block'
          }`}>
            {/* 1. Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> 1. Image Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('png')}
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col gap-0.5 cursor-pointer ${
                    selectedFormat === 'png'
                      ? 'bg-pink-500/20 border-pink-500 text-white shadow-md shadow-pink-500/10'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">PNG Format</span>
                    {selectedFormat === 'png' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                  </div>
                  <span className="text-[10px] text-white/50">Lossless & Sharp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFormat('jpeg')}
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col gap-0.5 cursor-pointer ${
                    selectedFormat === 'jpeg'
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">JPG (4K)</span>
                    {selectedFormat === 'jpeg' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-white/50">High-Fidelity (98%)</span>
                </button>
              </div>
            </div>

            {/* 2. Device Profile / Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> 2. Target Device & Shape
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeviceFormat('mobile')}
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col gap-0.5 cursor-pointer ${
                    deviceFormat === 'mobile'
                      ? 'bg-pink-500/20 border-pink-500 text-white shadow-md shadow-pink-500/10 ring-1 ring-pink-500/50'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-pink-400" /> Mobile Screen
                    </span>
                    {deviceFormat === 'mobile' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                  </div>
                  <span className="text-[10px] text-white/50">Phone / Story (Portrait)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeviceFormat('desktop')}
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col gap-0.5 cursor-pointer ${
                    deviceFormat === 'desktop'
                      ? 'bg-indigo-600/30 border-indigo-400 text-white ring-1 ring-indigo-400/50 shadow-md shadow-indigo-500/10'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-indigo-400" /> Desktop
                    </span>
                    {deviceFormat === 'desktop' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <span className="text-[10px] text-white/50">Wide Card (Landscape)</span>
                </button>
              </div>
            </div>

            {/* 3. Sharpness & Resolution */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> 3. Export Sharpness
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { scale: 2, label: '2x HD', desc: '1080p' },
                  { scale: 3, label: '3x Ultra', desc: '1440p Best' },
                  { scale: 4, label: '4x Master', desc: '4K Print' }
                ].map((res) => (
                  <button
                    key={res.scale}
                    type="button"
                    onClick={() => setSelectedResolution(res.scale)}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      selectedResolution === res.scale
                        ? 'bg-indigo-600/30 border-indigo-400 text-white ring-1 ring-indigo-400/50'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-xs font-black">{res.label}</p>
                    <p className="text-[9px] text-white/50 mt-0.5">{res.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Layout Mode */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5" /> 4. Card Layout Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'grid', label: deviceFormat === 'mobile' ? 'Stacked' : 'Bento Grid', icon: Grid, desc: deviceFormat === 'mobile' ? '1 Column' : '2 Columns' },
                  { id: 'list', label: 'Registry List', icon: List, desc: 'Full Rows' },
                  { id: 'checklist', label: 'Checklist', icon: CheckSquare, desc: 'Compact' },
                ].map((layout) => {
                  const Icon = layout.icon;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => setLayoutMode(layout.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                        layoutMode === layout.id
                          ? 'bg-purple-600/30 border-purple-400 text-white ring-1 ring-purple-400/50'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-purple-300" />
                      <p className="text-xs font-bold leading-tight">{layout.label}</p>
                      <p className="text-[9px] text-white/50">{layout.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Theme Color */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> 5. Color Palette
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['midnight', 'gold', 'pastel', 'sunset'] as ThemeKey[]).map((tKey) => {
                  const t = THEME_STYLES[tKey];
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setSelectedThemeKey(tKey)}
                      className={`p-2 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        selectedThemeKey === tKey
                          ? 'border-white bg-white/15 ring-2 ring-pink-500/50'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 opacity-70'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.bg} border border-white/30 shrink-0`} />
                      <span className="text-xs font-bold capitalize text-white">{tKey}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Custom Graphic Badges Toggles */}
            <div className="space-y-2 pt-1 border-t border-white/10">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-300">
                6. Display Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold cursor-pointer hover:bg-white/10 transition">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-300" /> Show Estimated Budget Stats
                  </span>
                  <input
                    type="checkbox"
                    checked={showPriceTotal}
                    onChange={(e) => setShowPriceTotal(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold cursor-pointer hover:bg-white/10 transition">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-300" /> Show Claimed / Available Status
                  </span>
                  <input
                    type="checkbox"
                    checked={showClaimStatus}
                    onChange={(e) => setShowClaimStatus(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold cursor-pointer hover:bg-white/10 transition">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" /> Show Birthday Countdown
                  </span>
                  <input
                    type="checkbox"
                    checked={showCountdown}
                    onChange={(e) => setShowCountdown(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold cursor-pointer hover:bg-white/10 transition">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-indigo-300" /> Include Scannable QR Code
                  </span>
                  <input
                    type="checkbox"
                    checked={showQrCode}
                    onChange={(e) => setShowQrCode(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2.5">
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:via-rose-400 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-pink-500/25 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering {selectedResolution}x Ultra-Sharp Graphic...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Downloaded Successfully! 🎉</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download as {selectedFormat.toUpperCase()} ({selectedResolution}x Sharp)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyClipboard}
                disabled={isExporting}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied to Clipboard! ✨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/70" />
                    <span>Copy Image to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live High-Res Card Render View (8 Cols on desktop, conditioned by mobileTab on mobile, always visible when exporting) */}
          <div className={`lg:col-span-8 p-4 sm:p-6 flex flex-col items-center justify-start bg-slate-950/80 overflow-y-auto ${
            isCoveringScreenForExport ? 'flex' : mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}>
            <div className="w-full flex items-center justify-between mb-3 px-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Device Profile Quick Toggle */}
                <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeviceFormat('mobile')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      deviceFormat === 'mobile'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceFormat('desktop')}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      deviceFormat === 'desktop'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-white/70 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 px-2.5 py-1 rounded-xl transition cursor-pointer"
                  title="Toggle Full Screen Card View"
                >
                  {isFullScreenPreview ? (
                    <>
                      <Minimize2 className="w-3 h-3 text-pink-400" />
                      <span>Exit Full Screen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3 h-3 text-pink-400" />
                      <span>Full Screen</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile button to switch to options tab */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileTab('options')}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 hover:text-white bg-indigo-500/20 border border-indigo-400/30 px-2.5 py-1 rounded-xl transition cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Export Options</span>
                </button>
              </div>
            </div>

            {/* Target Element for html-to-image Export */}
            <div
              className={
                isCoveringScreenForExport
                  ? "fixed inset-0 z-[99999] bg-slate-950 w-screen min-h-screen overflow-y-auto overflow-x-visible flex flex-col items-center justify-center p-4 sm:p-8"
                  : isFullScreenPreview
                  ? "fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl w-screen min-h-screen overflow-y-auto flex flex-col items-center justify-start p-4 sm:p-8"
                  : "w-full flex justify-center items-center overflow-x-auto py-2"
              }
            >
              {/* Floating bar when in Fullscreen Preview mode (marked as no-export) */}
              {isFullScreenPreview && !isCoveringScreenForExport && (
                <div className="no-export sticky top-2 z-50 mb-4 py-2 px-4 rounded-2xl bg-slate-900/90 border border-white/20 backdrop-blur-md shadow-2xl flex items-center justify-between gap-4 max-w-2xl w-full">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={isExporting}
                      className="py-1.5 px-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFullScreenPreview(false)}
                      className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Minimize2 className="w-3.5 h-3.5" /> Minimize
                    </button>
                  </div>
                </div>
              )}

              <div
                ref={previewCardRef}
                id="wishlist-export-container"
                style={{
                  width: isCoveringScreenForExport
                    ? (deviceFormat === 'mobile' ? '390px' : (layoutMode === 'grid' ? '760px' : '640px'))
                    : isFullScreenPreview
                    ? (deviceFormat === 'mobile' ? 'min(420px, 94vw)' : 'min(860px, 96vw)')
                    : (deviceFormat === 'mobile' ? 'min(390px, 100%)' : (layoutMode === 'grid' ? 'min(680px, 100%)' : 'min(600px, 100%)')),
                  minWidth: isCoveringScreenForExport
                    ? (deviceFormat === 'mobile' ? '390px' : (layoutMode === 'grid' ? '760px' : '640px'))
                    : undefined,
                  maxWidth: isCoveringScreenForExport
                    ? (deviceFormat === 'mobile' ? '390px' : (layoutMode === 'grid' ? '760px' : '640px'))
                    : (deviceFormat === 'mobile' ? '420px' : undefined),
                  height: 'auto',
                  minHeight: (isCoveringScreenForExport || isFullScreenPreview) ? '100%' : 'auto',
                  margin: '0 auto',
                }}
                className={`mx-auto ${
                  deviceFormat === 'mobile' ? 'rounded-[28px] p-5 sm:p-6' : 'rounded-[36px] p-7 sm:p-9'
                } shadow-2xl relative overflow-visible bg-gradient-to-br ${palette.bg} border ${palette.border} select-none transition-all`}
              >
                {/* Decorative Glowing Ambience Blobs */}
                <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full ${palette.blob1} blur-3xl opacity-50 pointer-events-none`} />
                <div className={`absolute -bottom-16 -left-16 w-56 h-56 rounded-full ${palette.blob2} blur-3xl opacity-50 pointer-events-none`} />

                {/* 1. Centered Header Profile Banner */}
                <div className="relative z-10 space-y-3 pb-5 border-b border-white/15 text-center flex flex-col items-center">
                  {/* Creator Avatar / Profile Pic */}
                  <div className="w-24 h-24 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-pink-500/30 overflow-hidden border-2 border-white/30 shrink-0 mx-auto">
                    {isImageUrl(wishlist.creatorAvatar) ? (
                      <img
                        src={resolveImageUrl(wishlist.creatorAvatar)}
                        alt={wishlist.creatorName || 'Creator'}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{wishlist.creatorAvatar || '🎂'}</span>
                    )}
                  </div>

                  {/* Titles & User Name,zodiac */}
                  <div className="space-y-1 w-full max-w-lg mx-auto">
                    <div className="flex items-center flex-col justify-center gap-2 flex-wrap text-center">
                      {wishlist.creatorName && (
                        <span className={`text-sm sm:text-base font-black tracking-tight ${palette.headerName}`}>
                          {wishlist.creatorName} {wishlist.creatorUsername ? <span className={`${palette.headerUsername} font-normal text-xs`}>(@{wishlist.creatorUsername})</span> : ''}
                        </span>
                      )}
                      {wishlist.creatorDob && getZodiacSign(wishlist.creatorDob) && (() => {
                      const z = getZodiacSign(wishlist.creatorDob)!;
                      return (
                        <span className={`text-[10px] sm:text-xs font-bold border px-3 py-1 rounded-full shadow-sm ${palette.zodiacBadge}`}>
                          ✨ Zodiac: {z.name} {z.symbol}
                        </span>
                      );
                    })()}
                    
                    </div>

                    <h3 className={`text-xl sm:text-2xl font-black font-display tracking-tight leading-tight text-center ${palette.titleText}`}>
                      {wishlist.title || 'Birthday Wishlist'}
                    </h3>
                  </div>

                  {/* Description */}
                  {wishlist.description && (
                    <p className={`text-xs sm:text-sm leading-relaxed max-w-lg mx-auto p-3 rounded-2xl border text-center ${palette.descBox} ${palette.descText}`}>
                      "{wishlist.description}"
                    </p>
                  )}

                  {/* Badges / TargetFate Info (Centered) */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {wishlist.targetDate && (
                        <span className={`text-[9px] font-mono font-bold border px-2.5 py-0.5 rounded-full ${palette.headerDateBadge}`}>
                          🎉 {wishlist.targetDate}
                        </span>
                      )}

                    {showPriceTotal && totalStats.pricedCount > 0 && (
                      <span className={`text-[10px] sm:text-xs font-mono font-black border px-3 py-1 rounded-full flex items-center gap-1 shadow-sm ${palette.totalBadge}`}>
                        <DollarSign className="w-3.5 h-3.5" /> Total Value: ${totalStats.totalAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Wishlist Items Section (COMPACT HEIGHT & STREAMLINED) */}
                <div className="relative z-10 py-3.5 space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <p className={`text-[11px] font-black uppercase tracking-wider ${palette.sectionHeader} flex items-center gap-1.5`}>
                      <Gift className="w-3.5 h-3.5 text-pink-500" /> Wishlist Gifts ({items.length})
                    </p>
                    {showClaimStatus && (
                      <span className={`text-[9px] font-mono font-bold ${palette.itemsCountBadge}`}>
                        {totalStats.availableCount} Available • {totalStats.claimedCount} Claimed
                      </span>
                    )}
                  </div>

                  {items.length === 0 ? (
                    <div className={`p-6 rounded-2xl border text-center space-y-1 ${palette.emptyBox}`}>
                      <Gift className="w-6 h-6 opacity-60 mx-auto" />
                      <p className="text-xs font-bold">No gifts added to this wishlist yet.</p>
                      <p className="text-[9px] opacity-70">Add items from the studio to include them in this graphic.</p>
                    </div>
                  ) : layoutMode === 'grid' ? (
                    /* Bento Grid (Compact Rows) Layout */
                    <div className={deviceFormat === 'mobile' ? "grid grid-cols-1 gap-2" : "grid grid-cols-1 sm:grid-cols-2 gap-2"}>
                      {items.map((item, idx) => {
                        const domain = getDomainFromUrl(item.link);
                        return (
                          <div
                            key={item.id || idx}
                            className={`py-1.5 px-2 sm:py-2 sm:px-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-sm min-h-[38px] ${palette.itemCardBg} ${palette.itemCardBorder}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {/* Product Thumbnail / Icon */}
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-inner ${palette.itemImgBg}`}>
                                {isImageUrl(item.imageUrl) ? (
                                  <img
                                    src={resolveImageUrl(item.imageUrl)}
                                    alt={item.title}
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{item.imageUrl || '🎁'}</span>
                                )}
                              </div>

                              {/* Title & Domain/Price */}
                              <div className="min-w-0 flex-1">
                                <h4 className={`text-[11px] font-black leading-tight truncate ${palette.itemTitle}`}>
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.2">
                                  <span className={`text-[10px] font-black font-mono ${palette.itemPrice}`}>
                                    {item.price ? `$${item.price}` : 'Open'}
                                  </span>
                                  {domain && (
                                    <span className={`text-[8px] font-bold truncate max-w-[80px] ${palette.itemDomain}`}>
                                      • {domain}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Priority & Claim Tag */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[7px] font-black uppercase tracking-wider px-1 py-0.2 rounded border ${
                                item.priority === 'high' ? palette.priorityHigh :
                                item.priority === 'medium' ? palette.priorityMedium :
                                palette.priorityLow
                              }`}>
                                {item.priority || 'med'}
                              </span>

                              {showClaimStatus && (
                                item.isClaimed ? (
                                  <span className={`px-1 py-0.2 rounded border text-[7px] font-black ${palette.claimClaimed}`}>
                                    ✓
                                  </span>
                                ) : (
                                  <span className={`px-1 py-0.2 rounded border text-[7px] font-black ${palette.claimAvailable}`}>
                                    Avail
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : layoutMode === 'list' ? (
                    /* Registry List (Ultra-Sleek Rows) Layout */
                    <div className="space-y-1.5">
                      {items.map((item, idx) => {
                        const domain = getDomainFromUrl(item.link);
                        return (
                          <div
                            key={item.id || idx}
                            className={`py-1 px-2 sm:py-1.5 sm:px-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-sm min-h-[34px] ${palette.itemCardBg} ${palette.itemCardBorder}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {/* Product Thumbnail */}
                              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-inner ${palette.itemImgBg}`}>
                                {isImageUrl(item.imageUrl) ? (
                                  <img
                                    src={resolveImageUrl(item.imageUrl)}
                                    alt={item.title}
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{item.imageUrl || '🎁'}</span>
                                )}
                              </div>

                              {/* Title, Price, and Domain Inline */}
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <h4 className={`text-[11px] font-bold truncate max-w-[140px] sm:max-w-xs ${palette.itemTitle}`}>
                                  {item.title}
                                </h4>
                                <span className={`text-[10px] font-mono font-black shrink-0 ${palette.itemPrice}`}>
                                  {item.price ? `$${item.price}` : 'Open'}
                                </span>
                                {domain && (
                                  <span className={`text-[8px] font-bold hidden sm:inline truncate max-w-[100px] ${palette.itemDomain}`}>
                                    • {domain}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[7px] font-black uppercase tracking-wider px-1 py-0.2 rounded border ${
                                item.priority === 'high' ? palette.priorityHigh :
                                item.priority === 'medium' ? palette.priorityMedium :
                                palette.priorityLow
                              }`}>
                                {item.priority || 'med'}
                              </span>

                              {showClaimStatus && (
                                item.isClaimed ? (
                                  <span className={`px-1.5 py-0.2 rounded-full border text-[8px] font-black ${palette.claimClaimed}`}>
                                    ✓ Claimed
                                  </span>
                                ) : (
                                  <span className={`px-1.5 py-0.2 rounded-full border text-[8px] font-black ${palette.claimAvailable}`}>
                                    Available
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Compact Checklist Layout */
                    <div className={`p-2.5 rounded-2xl border space-y-1 ${palette.emptyBox}`}>
                      {items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between py-1 px-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-mono font-black shrink-0 ${palette.checklistNumber}`}>
                              {idx + 1}
                            </span>
                            <span className={`font-bold truncate max-w-[160px] sm:max-w-sm ${palette.itemTitle}`}>
                              {item.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`font-mono font-black text-[10px] ${palette.itemPrice}`}>
                              {item.price ? `$${item.price}` : '—'}
                            </span>
                            {showClaimStatus && (
                              <span className={`text-[7px] font-black px-1 py-0.2 rounded ${item.isClaimed ? palette.claimClaimed : palette.claimAvailable}`}>
                                {item.isClaimed ? 'Claimed' : 'Available'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Birthday Countdown Banner (Placed at the bottom just before the footer) */}
                {showCountdown && countdownInfo && (
                  <div className={`relative z-10 mb-3 rounded-2xl border ${palette.countdownBox} flex items-center justify-between gap-2 transition-all ${
                    deviceFormat === 'mobile' ? 'py-1.5 px-3' : 'py-2.5 px-4'
                  }`}>
                    {countdownInfo.isToday ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <span className={deviceFormat === 'mobile' ? 'text-xs' : 'text-base'}>🥳</span>
                          <span className={`font-black font-display tracking-tight ${palette.countdownNumber} ${
                            deviceFormat === 'mobile' ? 'text-[10px] leading-tight' : 'text-sm sm:text-base'
                          }`}>
                            IT'S TODAY! Happy Birthday!
                          </span>
                          <span className={deviceFormat === 'mobile' ? 'text-xs' : 'text-base'}>🎂</span>
                        </div>
                        <span className={`font-bold rounded-full border ${palette.countdownBadge} ${
                          deviceFormat === 'mobile' ? 'text-[8px] px-2 py-0.2' : 'text-xs px-2.5 py-0.5'
                        }`}>
                          Celebrate 🎉
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-baseline ${
                            deviceFormat === 'mobile' ? 'gap-1' : 'gap-1.5'
                          }`}>
                            <span className={`font-black font-display tracking-tighter ${palette.countdownNumber} ${
                              deviceFormat === 'mobile' ? 'text-xl sm:text-2xl leading-none' : 'text-4xl sm:text-6xl leading-none'
                            }`}>
                              {countdownInfo.diffDays}
                            </span>
                            <span className={`font-black uppercase tracking-wider ${palette.countdownText} ${
                              deviceFormat === 'mobile' ? 'text-[8px] sm:text-[9px] leading-none' : 'text-xs leading-none'
                            }`}>
                              {countdownInfo.diffDays === 1 ? 'Day' : 'Days'}
                            </span>
                          </div>
                          <span className={`font-bold ${palette.countdownSubtext} ${
                            deviceFormat === 'mobile' ? 'text-[8px] sm:text-[9px] leading-none' : 'text-xs'
                          }`}>
                            til special day! ✨
                          </span>
                        </div>

                        <div className="shrink-0">
                          <span className={`font-bold border rounded-full flex items-center gap-1 shadow-xs ${palette.countdownBadge} ${
                            deviceFormat === 'mobile' ? 'text-[7px] sm:text-[8px] py-0.2 px-1.5' : 'text-[10px] py-0.5 px-2.5'
                          }`}>
                            <Clock className={deviceFormat === 'mobile' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                            <span>Countdown 🎂</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* 3. Footer Banner with QR Code & Branding */}
                <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className={`text-xs font-black flex items-center gap-1.5 ${palette.footerTitle}`}>
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Wishly Gift Registry ✨
                    </p>
                    <p className={`text-[10px] ${palette.footerDesc}`}>
                      Scan or visit online to view details and claim gifts
                    </p>
                    <p className={`text-[9px] font-mono pt-0.5 ${palette.footerDate}`}>
                      Exported on {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {showQrCode && (
                    <div className="p-1.5 rounded-xl bg-white shadow-md shrink-0 flex items-center justify-center border border-black/5">
                      <img
                        src={qrImageUrl}
                        alt="Scan Wishlist QR Code"
                        crossOrigin="anonymous"
                        className="w-14 h-14 object-contain rounded-lg"
                      />
                    </div>
                  )}
                 
                </div>
                  <div className="flex flex-col items-center mt-6"> 
                    <p className={`text-[11px] font-medium ${palette.footerDesc}`}>from</p>
                    <div className="h-14 w-auto shrink-0 flex gap-2 items-center justify-center">
                      <svg
                        viewBox="0 900 3470 4280"
                        className={`h-7 w-7 sm:h-8 sm:w-8 shrink-0 fill-current ${palette.brandName} transition-transform duration-500 hover:scale-105`}
                        xmlns="http://www.w3.org/2000/svg"
                        aria-label="Apple Pie Studio Logo"
                      >
                        <path d="M1539.53 912.05c-453.74,108.02 -791.21,515.95 -791.21,1002.76 0,44.67 2.85,88.68 8.36,131.85 -454.84,311.93 -753.2,835.44 -753.2,1428.64 0,829.37 583.3,1522.4 1362.01,1691.54 -13.52,-69.1 -20.68,-140.48 -20.68,-213.54 0,-610.73 495.09,-1105.83 1105.83,-1105.83 336.2,0 637.31,150.07 840.13,386.83 111.99,-229.19 174.93,-486.73 174.93,-759 0,-557.68 -263.71,-1053.78 -673.23,-1370.37 11.48,-61.61 17.5,-125.17 17.5,-190.11 0,-401.18 -229.19,-748.8 -563.76,-919.15 8.18,31.12 12.56,63.79 12.56,97.48 0,211.18 -171.19,382.37 -382.37,382.37 -211.18,0 -382.37,-171.19 -382.37,-382.37 0,-65.52 16.49,-127.18 45.53,-181.09zm174.98 1140.69c372.88,0 675.15,302.28 675.15,675.15 0,372.88 -302.28,675.15 -675.15,675.15 -372.88,0 -675.15,-302.28 -675.15,-675.15 0,-372.88 302.28,-675.15 675.15,-675.15z" />
                      </svg>
                 {/*     <img
                        src="https://tmmfshiaadtroqcigeff.supabase.co/storage/v1/object/public/birthday-memories/p/Apple-pie-logo2.png"
                        alt="Apple Pie Studio Logo"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                        className="h-8 w-auto object-contain transition-transform duration-600 group-hover:scale-105"
                      />*/}
                      
                      <h1 className={`font-bold ${palette.brandName}`}>
                        Apple Pie
                      </h1>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
