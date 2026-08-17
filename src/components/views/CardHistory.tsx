import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { ThemeStyle } from '../../types';
import { THEME_STYLES } from '../../constants/themes';
import { copyTextToClipboard } from '../../utils/helpers';
import { playMagicalBell } from '../../utils/synth';

/**
 * ============================================================================
 * CARD HISTORY VIEW COMPONENT
 * ============================================================================
 * Renders the user's saved card links history with quick-copy, link opening,
 * and clear options.
 */
interface CardHistoryProps {
  theme?: ThemeStyle;
  savedCards?: Array<{ name: string; url: string; recipient: string; id: string }>;
  copiedHistoryCardId?: string | null;
  setCopiedHistoryCardId?: (id: string | null) => void;
  onCopyCardLink?: (id: string, url: string) => void;
  onClearHistory?: () => void;
}

export const CardHistory: React.FC<CardHistoryProps> = ({
  theme: propTheme,
  savedCards = [],
  copiedHistoryCardId = null,
  setCopiedHistoryCardId,
  onCopyCardLink,
  onClearHistory,
}) => {
  const theme = propTheme || THEME_STYLES.pastel;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-black ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
          Saved Links History
        </h2>
        {savedCards.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-rose-500 hover:underline font-bold cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      {savedCards.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${theme.isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-white/40'}`}>
          <p className={`text-xs ${theme.isDark ? 'text-white/40' : 'text-slate-500'}`}>
            No cards saved yet. Build and share your first card to see it here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedCards.map((card) => (
            <div
              key={card.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${theme.cardBg} ${theme.glassBorder}`}
            >
              <div>
                <h3 className={`text-sm font-bold ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
                  Card for {card.recipient}
                </h3>
                <p className={`text-[10px] font-mono truncate max-w-[220px] sm:max-w-md mt-0.5 ${theme.isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  {card.url}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[11px] p-2 px-3 rounded-lg flex items-center gap-1 transition ${
                    theme.isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
                <button
                  onClick={async () => {
                    if (onCopyCardLink) {
                      onCopyCardLink(card.id, card.url);
                    } else {
                      const success = await copyTextToClipboard(card.url);
                      playMagicalBell();
                      if (success) {
                        if (setCopiedHistoryCardId) setCopiedHistoryCardId(card.id);
                        setTimeout(() => setCopiedHistoryCardId && setCopiedHistoryCardId(null), 2000);
                      } else {
                        alert(`Copy failed. Please manually copy this link:\n\n${card.url}`);
                      }
                    }
                  }}
                  className={`text-[11px] p-2 px-3 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                    theme.isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  {copiedHistoryCardId === card.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedHistoryCardId === card.id ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
