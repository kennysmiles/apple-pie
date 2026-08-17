import React from 'react';
import { motion } from 'motion/react';
import { Gift } from 'lucide-react';
import { ThemeStyle } from '../../types';
import { THEME_STYLES } from '../../constants/themes';

/**
 * ============================================================================
 * WISHLIST CREATE MODAL COMPONENT
 * ============================================================================
 * Modal form for creating a new custom wishlist with title, description, and target date.
 */
interface WishlistCreateModalProps {
  theme?: ThemeStyle;
  isOpen?: boolean;
  title?: string;
  newWishlistTitle?: string;
  setTitle?: (val: string) => void;
  setNewWishlistTitle?: (val: string) => void;
  desc?: string;
  newWishlistDesc?: string;
  setDesc?: (val: string) => void;
  setNewWishlistDesc?: (val: string) => void;
  targetDate?: string;
  newWishlistDate?: string;
  setTargetDate?: (val: string) => void;
  setNewWishlistDate?: (val: string) => void;
  onSave?: () => void;
  onCreate?: () => void;
  onClose?: () => void;
}

export const WishlistCreateModal: React.FC<WishlistCreateModalProps> = ({
  theme: propTheme,
  isOpen = false,
  title: propTitle,
  newWishlistTitle: propNewTitle,
  setTitle: propSetTitle,
  setNewWishlistTitle: propSetNewTitle,
  desc: propDesc,
  newWishlistDesc: propNewDesc,
  setDesc: propSetDesc,
  setNewWishlistDesc: propSetNewDesc,
  targetDate: propDate,
  newWishlistDate: propNewDate,
  setTargetDate: propSetDate,
  setNewWishlistDate: propSetNewDate,
  onSave,
  onCreate,
  onClose = () => {},
}) => {
  const theme = propTheme || THEME_STYLES.pastel;

  const newWishlistTitle = propTitle ?? propNewTitle ?? '';
  const setNewWishlistTitle = propSetTitle || propSetNewTitle || ((_val?: string) => {});

  const newWishlistDesc = propDesc ?? propNewDesc ?? '';
  const setNewWishlistDesc = propSetDesc || propSetNewDesc || ((_val?: string) => {});

  const newWishlistDate = propDate ?? propNewDate ?? '';
  const setNewWishlistDate = propSetDate || propSetNewDate || ((_val?: string) => {});

  const handleSave = () => {
    if (onSave) onSave();
    else if (onCreate) onCreate();
  };

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
          <Gift className="w-5 h-5 text-pink-500" /> Create New Wishlist
        </h3>

        <div className="space-y-4">
          {/* Quick Preset Title Chips */}
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1.5 opacity-70">Quick Preset Ideas</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { title: '🎂 My Birthday Wishlist', desc: 'Things I would love for my upcoming birthday celebration!' },
                { title: '📱 Tech & Gadgets Dreams', desc: 'The latest gadgets and accessories on my radar.' },
                { title: '📚 Books & Hobby Registry', desc: 'Books, games, and creative hobbies I want to explore.' },
                { title: '✈️ Experiences & Travel Fund', desc: 'Memorable activities, trips, and concerts.' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setNewWishlistTitle(preset.title);
                    setNewWishlistDesc(preset.desc);
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    theme.isDark
                      ? 'bg-white/5 border-white/10 hover:bg-indigo-500/20 hover:border-indigo-400 text-indigo-300'
                      : 'bg-indigo-50/70 border-indigo-200 hover:bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {preset.title.split(' ')[0]} {preset.title.split(' ').slice(1).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Wishlist Title</label>
            <input
              type="text"
              required
              value={newWishlistTitle}
              onChange={(e) => setNewWishlistTitle(e.target.value)}
              placeholder="My 25th Birthday Wishlist!"
              className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Description (Optional)</label>
            <textarea
              value={newWishlistDesc}
              onChange={(e) => setNewWishlistDesc(e.target.value)}
              placeholder="Share details or dress codes for the birthday bash!"
              rows={3}
              className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-slate-300 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 opacity-70">Celebration / Target Date (Optional)</label>
            <input
              type="date"
              value={newWishlistDate}
              onChange={(e) => setNewWishlistDate(e.target.value)}
              className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none font-mono transition ${
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
              onClick={handleSave}
              className="p-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
            >
              Create Wishlist ✦
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
