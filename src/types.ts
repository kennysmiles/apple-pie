/**
 * ============================================================================
 * TYPE DEFINITIONS FOR APPLE PIE STUDIO
 * ============================================================================
 * Defines all shared interfaces for stickers, cards, wishlists, users, and themes.
 */

// Custom Sticker placed on interactive digital birthday cards
export interface Sticker {
  id: string;
  type: 'cupcake' | 'balloon' | 'crown' | 'star' | 'heart' | 'gift' | 'wand';
  x: number; // percentage width relative to card canvas
  y: number; // percentage height relative to card canvas
  scale: number;
  rotate: number;
}

// Full configuration object for a digital birthday card
export interface CardConfig {
  recipient: string;
  relation: string;
  tone: string;
  theme: ThemeKey;
  container: 'giftbox' | 'envelope' | 'bubble';
  message: string;
  sender?: string;
  poem: string;
  stickers: Sticker[];
  features: {
    candle: boolean;
    confetti: boolean;
    balloons: boolean;
    music: boolean;
    poem: boolean;
    musicTheme: 'birthday' | 'lofi' | 'sparkle' | 'zen';
  };
  recipientPic?: string;
  slideshowPics?: string[];
}

// Item inside a birthday wishlist
export interface WishlistItem {
  id: string;
  title: string;
  price?: string;
  link?: string;
  imageUrl?: string;
  priority: 'high' | 'medium' | 'low';
  isClaimed?: boolean;
  claimedBy?: string;
}

// Birthday Wishlist container object
export interface Wishlist {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  items: WishlistItem[];
  creatorName?: string;
  creatorUsername?: string;
  creatorAvatar?: string;
  creatorDob?: string;
  theme?: 'midnight' | 'gold' | 'pastel' | 'sunset';
}

// User Profile stored in local storage and synced with Supabase
export interface UserProfile {
  fullName: string;
  username?: string;
  avatarUrl: string;
  dateOfBirth: string;
}

// Friend definition for user friends list & birthday tracking
export interface Friend {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  dateOfBirth: string; // YYYY-MM-DD
  addedAt?: string;
  userId?: string;
  bio?: string;
}

// Theme style object for UI gradients, glass borders, and accents
export interface ThemeStyle {
  bg: string;
  cardBg: string;
  accentText: string;
  accentBtn: string;
  glassBorder: string;
  titleGradient: string;
  sparkleColor: string;
  blob1: string;
  blob2: string;
  blob3: string;
  isDark: boolean;
}

export type ThemeKey = 'midnight' | 'gold' | 'pastel' | 'sunset';
