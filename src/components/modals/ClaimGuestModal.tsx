import React from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ThemeStyle } from '../../types';
import { THEME_STYLES } from '../../constants/themes';
import { playSparkleCascade } from '../../utils/synth';

/**
 * ============================================================================
 * CLAIM GUEST MODAL COMPONENT
 * ============================================================================
 * Allows guests viewing a public wishlist to claim an item by entering their name.
 */
interface ClaimGuestModalProps {
  theme?: ThemeStyle;
  isOpen?: boolean;
  claimData?: { wishlistId: string; item: any } | null;
  claimWishlistId?: string | null;
  claimItemId?: string | null;
  guestName?: string;
  claimerName?: string;
  setGuestName?: (name: string) => void;
  setClaimerName?: (name: string) => void;
  onConfirmClaim?: () => void;
  onClaim?: (wishlistId: string, itemId: string, name: string) => void;
  onClose?: () => void;
}

export const ClaimGuestModal: React.FC<ClaimGuestModalProps> = ({
  theme: propTheme,
  isOpen: propIsOpen,
  claimData,
  claimWishlistId: propWlId,
  claimItemId: propItemId,
  guestName: propGuestName,
  claimerName: propClaimerName,
  setGuestName: propSetGuestName,
  setClaimerName: propSetClaimerName,
  onConfirmClaim,
  onClaim,
  onClose = () => {},
}) => {
  const theme = propTheme || THEME_STYLES.pastel;

  const isOpen = propIsOpen ?? (!!claimData || (!!propWlId && !!propItemId));

  const claimerName = propGuestName ?? propClaimerName ?? '';
  const setClaimerName = propSetGuestName || propSetClaimerName || ((_val?: string) => {});

  const claimWishlistId = claimData?.wishlistId ?? propWlId ?? null;
  const claimItemId = claimData?.item?.id ?? propItemId ?? null;

  const handleSubmit = () => {
    if (!claimerName.trim()) {
      alert('Please enter your name!');
      return;
    }
    if (onConfirmClaim) {
      onConfirmClaim();
      playSparkleCascade();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      alert('Gift claimed successfully! Thank you for making their day special! 💖');
    } else if (onClaim && claimWishlistId && claimItemId) {
      onClaim(claimWishlistId, claimItemId, claimerName);
      onClose();
      setClaimerName('');
      playSparkleCascade();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      alert('Gift claimed successfully! Thank you for making their day special! 💖');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 text-white shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs font-bold p-1 rounded-full opacity-60 hover:opacity-100 cursor-pointer"
        >
          ✕
        </button>

        <h3 className="text-lg font-black flex items-center gap-2 mb-3">
          🎉 Claim This Gift!
        </h3>
        <p className="text-xs text-white/70 mb-4 leading-relaxed">
          Marking this item as claimed lets other guests know you are gifting this, so the celebrant gets exactly what they desire without duplicates!
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase mb-1 text-white/50">Your Name</label>
            <input
              type="text"
              required
              value={claimerName}
              onChange={(e) => setClaimerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-500 transition font-bold"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="p-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="p-2 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition shadow-lg cursor-pointer"
            >
              Claim Gift 💖
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
