import React from 'react';
import { motion } from 'motion/react';
import { Gift } from 'lucide-react';
import { ThemeStyle } from '../../types';
import { THEME_STYLES } from '../../constants/themes';

/**
 * ============================================================================
 * WISHLIST ITEM MODAL COMPONENT
 * ============================================================================
 * Modal for adding or editing a gift item within a wishlist with price, priority,
 * product URL, and emoji icon picker.
 */
interface WishlistItemModalProps {
  theme?: ThemeStyle;
  isOpen?: boolean;
  editingItemId?: string | null;
  title?: string;
  newItemTitle?: string;
  setTitle?: (val: string) => void;
  setNewItemTitle?: (val: string) => void;
  price?: string;
  newItemPrice?: string;
  setPrice?: (val: string) => void;
  setNewItemPrice?: (val: string) => void;
  link?: string;
  newItemLink?: string;
  setLink?: (val: string) => void;
  setNewItemLink?: (val: string) => void;
  imageUrl?: string;
  newItemImage?: string;
  setImageUrl?: (val: string) => void;
  setNewItemImage?: (val: string) => void;
  priority?: 'high' | 'medium' | 'low';
  newItemPriority?: 'high' | 'medium' | 'low';
  setPriority?: (val: 'high' | 'medium' | 'low') => void;
  setNewItemPriority?: (val: 'high' | 'medium' | 'low') => void;
  onSave?: () => void;
  onClose?: () => void;
}

export const WishlistItemModal: React.FC<WishlistItemModalProps> = ({
  theme: propTheme,
  isOpen = false,
  editingItemId = null,
  title: propTitle,
  newItemTitle: propNewTitle,
  setTitle: propSetTitle,
  setNewItemTitle: propSetNewTitle,
  price: propPrice,
  newItemPrice: propNewPrice,
  setPrice: propSetPrice,
  setNewItemPrice: propSetNewPrice,
  link: propLink,
  newItemLink: propNewLink,
  setLink: propSetLink,
  setNewItemLink: propSetNewLink,
  imageUrl: propImage,
  newItemImage: propNewImage,
  setImageUrl: propSetImage,
  setNewItemImage: propSetNewImage,
  priority: propPriority,
  newItemPriority: propNewPriority,
  setPriority: propSetPriority,
  setNewItemPriority: propSetNewPriority,
  onSave = () => {},
  onClose = () => {},
}) => {
  const theme = propTheme || THEME_STYLES.pastel;

  const newItemTitle = propTitle ?? propNewTitle ?? '';
  const setNewItemTitle = propSetTitle || propSetNewTitle || ((_val?: string) => {});

  const newItemPrice = propPrice ?? propNewPrice ?? '';
  const setNewItemPrice = propSetPrice || propSetNewPrice || ((_val?: string) => {});

  const newItemLink = propLink ?? propNewLink ?? '';
  const setNewItemLink = propSetLink || propSetNewLink || ((_val?: string) => {});

  const newItemImage = propImage ?? propNewImage ?? '🎁';
  const setNewItemImage = propSetImage || propSetNewImage || ((_val?: string) => {});

  const newItemPriority = propPriority ?? propNewPriority ?? 'medium';
  const setNewItemPriority = propSetPriority || propSetNewPriority || ((_val?: any) => {});

  if (!isOpen) return null;
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

        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-indigo-400" /> {editingItemId ? 'Edit Wishlist Item' : 'Add Wishlist Item'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Item Name</label>
            <input
              type="text"
              required
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Mechanical Keyboard"
              className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Price (USD)</label>
              <input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="99"
                className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none font-mono transition ${
                  theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Priority</label>
              <select
                value={newItemPriority}
                onChange={(e: any) => setNewItemPriority(e.target.value)}
                className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                  theme.isDark ? 'bg-slate-800 border-white/10 text-white focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-800 focus:border-indigo-500'
                }`}
              >
                <option value="high">High priority 💖</option>
                <option value="medium">Medium priority ✨</option>
                <option value="low">Low priority ☕</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Buy / Product Link (Optional)</label>
            <input
              type="url"
              value={newItemLink}
              onChange={(e) => setNewItemLink(e.target.value)}
              placeholder="https://amazon.com/..."
              className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Emoji Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase mb-2 opacity-70">Choose Item Icon</label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-black/15 rounded-xl">
              {['🎁', '🎈', '🎂', '🧸', '🕶️', '📱', '👟', '📚', '✈️', '🎮', '🍕', '🎨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewItemImage(emoji)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition cursor-pointer ${
                    newItemImage === emoji ? 'bg-indigo-600 scale-110 shadow-md text-white' : 'hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={newItemImage}
              onChange={(e) => setNewItemImage(e.target.value)}
              placeholder="Or type custom emoji"
              className={`w-full border rounded-xl p-2 text-xs focus:outline-none transition ${
                theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 px-4 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              className="p-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
            >
              {editingItemId ? 'Save Changes ✦' : 'Add Item ✦'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
