import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, ExternalLink, Heart, Sparkles, ArrowLeft, Download } from 'lucide-react';
import { Wishlist, WishlistItem } from '../../types';
import { THEME_STYLES } from '../../constants/themes';
import { getZodiacSign, isImageUrl, resolveImageUrl } from '../../utils/helpers';
import { WishlistExportModal } from '../modals/WishlistExportModal';

/**
 * ============================================================================
 * WISHLIST RECEIVER VIEW COMPONENT
 * ============================================================================
 * Public view rendered when a friend or family member opens a shared wishlist link.
 * Allows visitors to view requested items, external purchase links, and claim items.
 */
interface WishlistReceiverViewProps {
  activeWishlist: Wishlist;
  isWishlistPreviewMode?: boolean;
  onExitPreview: () => void;
  onOpenClaimModal: (wishlistId: string, item: WishlistItem | any) => void;
}

export const WishlistReceiverView: React.FC<WishlistReceiverViewProps> = ({
  activeWishlist,
  isWishlistPreviewMode,
  onExitPreview,
  onOpenClaimModal,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const wlThemeKey = activeWishlist?.theme || 'midnight';
  const theme = THEME_STYLES[wlThemeKey] || THEME_STYLES.midnight;
  const items = activeWishlist?.items || [];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} text-white p-4 md:p-8 flex flex-col items-center justify-start relative overflow-x-hidden font-sans`}>
      {/* Top Navigation Banner */}
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-3 px-5 backdrop-blur-md">
        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> {isWishlistPreviewMode ? 'Wishlist Visitor Preview Mode' : 'Wishly Shared Wish List'}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-pink-500/20"
            title="Download this wishlist as PNG or JPG"
          >
            <Download className="w-3.5 h-3.5" /> Download / Save
          </button>
          <button
            type="button"
            onClick={onExitPreview}
            className="px-4 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl space-y-6 z-10"
      >
        {/* Wishlist Header Card */}
        <div className={`p-8 rounded-[36px] border ${theme.cardBg} ${theme.glassBorder} shadow-2xl relative overflow-hidden text-center`}>
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-pink-500/30 overflow-hidden shrink-0 border border-white/20">
            {isImageUrl(activeWishlist?.creatorAvatar) ? (
              <img
                src={resolveImageUrl(activeWishlist?.creatorAvatar)}
                alt={activeWishlist?.creatorName || 'Creator Profile'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerText = '🎁';
                  }
                }}
              />
            ) : (
              <span className="select-none">{activeWishlist?.creatorAvatar || '🎁'}</span>
            )}
          </div>

          {activeWishlist?.creatorName && (
            <p className="text-xs sm:text-sm font-black text-amber-300 tracking-tight mb-1">
              {activeWishlist.creatorName} {activeWishlist.creatorUsername ? <span className="text-white/60 font-normal text-xs">(@{activeWishlist.creatorUsername})</span> : ''}
            </p>
          )}

          <h1 className="text-xl md:text-3xl font-black font-display tracking-tight mb-2">
            {activeWishlist?.title || 'Birthday Wish List'}
          </h1>

          {activeWishlist?.description && (
            <p className="text-xs text-white/80 max-w-lg mx-auto leading-relaxed mb-3">
              "{activeWishlist.description}"
            </p>
          )}

          {/* Badges for Zodiac & Date (No Birth Month) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {activeWishlist?.targetDate && (
              <span className="text-[10px] font-mono font-bold bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full text-cyan-300">
                🎉 Date: {activeWishlist.targetDate}
              </span>
            )}

            {activeWishlist?.creatorDob && getZodiacSign(activeWishlist.creatorDob) && (() => {
              const z = getZodiacSign(activeWishlist.creatorDob)!;
              return (
                <span className="text-[10px] font-bold bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 rounded-full text-amber-200">
                  ✨ Zodiac: {z.name} {z.symbol}
                </span>
              );
            })()}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-pink-400" /> Export Wishlist Card
            </button>
          </div>
        </div>

        {/* Wishlist Items List (Ultra-Compact Mobile & Desktop) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-pink-400" /> Wish List Gifts ({items.length})
            </h2>
            <span className="text-[9px] text-white/50 italic">Claim an item so others know!</span>
          </div>

          {items.length === 0 ? (
            <div className={`p-6 text-center rounded-2xl border ${theme.cardBg} ${theme.glassBorder}`}>
              <p className="text-xs text-white/50 italic">No items currently listed in this wishlist.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-xl border flex items-center justify-between gap-2.5 ${theme.cardBg} ${theme.glassBorder} transition hover:border-white/30 min-h-[44px]`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-inner">
                      {isImageUrl(item.imageUrl) ? (
                        <img
                          src={resolveImageUrl(item.imageUrl)}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            if (e.currentTarget.parentElement) {
                              e.currentTarget.parentElement.innerText = '🎁';
                            }
                          }}
                        />
                      ) : (
                        <span>{item.imageUrl || '🎁'}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-[11px] font-black truncate max-w-[120px] sm:max-w-[160px] text-white">{item.title}</h3>
                        <span className={`text-[7px] font-bold uppercase tracking-wider px-1 py-0.2 rounded border shrink-0 ${
                          item.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border-rose-400/30' :
                          item.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                          'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        }`}>
                          {item.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[9px]">
                        {item.price && (
                          <span className="font-mono font-black text-cyan-300">${item.price}</span>
                        )}

                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-300 hover:underline flex items-center gap-0.5 font-semibold"
                          >
                            <ExternalLink className="w-2 h-2" /> Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {item.isClaimed ? (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => onOpenClaimModal(activeWishlist.id, item)}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold inline-block hover:bg-emerald-500/30 transition cursor-pointer"
                        >
                          ✓ Claimed
                        </button>
                        {item.claimedBy && (
                          <p className="text-[8px] text-white/50 truncate max-w-[65px]">{item.claimedBy}</p>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenClaimModal(activeWishlist.id, item)}
                        className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-bold transition shadow flex items-center gap-1 cursor-pointer"
                      >
                        <Heart className="w-2.5 h-2.5 fill-white" /> Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Wishlist Export Graphic Modal */}
      <WishlistExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        wishlist={activeWishlist}
        defaultTheme={wlThemeKey as any}
      />
    </div>
  );
};
