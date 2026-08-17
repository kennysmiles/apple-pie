import React from 'react';
import { motion } from 'motion/react';
import { ThemeStyle } from '../../types';
import { THEME_STYLES } from '../../constants/themes';

/**
 * ============================================================================
 * CONFIRM DELETE MODAL COMPONENT
 * ============================================================================
 * Reusable confirmation dialog for deleting a wishlist or a wishlist item.
 */
interface ConfirmDeleteModalProps {
  theme?: ThemeStyle;
  isOpen?: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  theme: propTheme,
  isOpen = false,
  title,
  description,
  confirmText = 'Delete',
  onConfirm,
  onClose,
}) => {
  const theme = propTheme || THEME_STYLES.pastel;

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl relative ${
          theme.isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <h3 className="text-lg font-black flex items-center gap-2 mb-3 text-rose-500">
          ⚠️ {title}
        </h3>
        <p className={`text-xs mb-6 leading-relaxed ${theme.isDark ? 'text-white/70' : 'text-slate-600'}`}>
          {description}
        </p>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`p-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
              theme.isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="p-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
