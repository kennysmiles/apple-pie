import { Sticker } from '../types';

/**
 * ============================================================================
 * PRESETS & DEFAULTS FOR APPLE PIE STUDIO
 * ============================================================================
 */

export const AVATAR_PRESETS = ['🎂', '👑', '🎉', '🌟', '🦄', '🎈', '💖', '🎁', '🍰', '🧸', '🚀', '🍓', '🌸', '✨'];

export const DEFAULT_STICKERS: Sticker[] = [
  { id: '1', type: 'cupcake', x: 15, y: 15, scale: 1, rotate: -12 },
  { id: '2', type: 'balloon', x: 82, y: 18, scale: 1.1, rotate: 15 },
  { id: '3', type: 'crown', x: 48, y: 8, scale: 1.2, rotate: 0 },
  { id: '4', type: 'star', x: 88, y: 80, scale: 0.9, rotate: -20 },
  { id: '5', type: 'heart', x: 12, y: 82, scale: 1, rotate: 10 },
];
