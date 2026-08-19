import React from 'react';
import { motion } from 'motion/react';
import {
  Wand2, RefreshCw, Sparkles, Share2, Check, Copy, BookOpen, Volume2, VolumeX, Heart, Plus
} from 'lucide-react';
import { CardConfig, ThemeStyle } from '../../types';
import { THEME_STYLES } from '../../constants/themes';
import { compressImage } from '../../utils/helpers';
import { playMagicalBell } from '../../utils/synth';
import { isSupabaseConfigured, uploadImageToSupabase } from '../../lib/supabase';
import { LottiePlayer } from '../LottiePlayer';

/**
 * ============================================================================
 * CARD BUILDER VIEW COMPONENT
 * ============================================================================
 * The primary workspace builder for customizing recipient details, aesthetics,
 * personal messages, Gemini AI poems, and interactive surprise features.
 * Includes a live responsive interactive studio preview panel on the right.
 */
interface CardBuilderProps {
  theme: ThemeStyle;
  builderStep: number;
  setBuilderStep: React.Dispatch<React.SetStateAction<number>>;
  recipientName: string;
  setRecipientName: (val: string) => void;
  relationship: string;
  setRelationship: (val: string) => void;
  picMethod: 'upload' | 'emoji' | 'url';
  setPicMethod: (method: 'upload' | 'emoji' | 'url') => void;
  recipientPic: string;
  setRecipientPic: (val: string) => void;
  uploadStatus: string;
  setUploadStatus: (val: string) => void;
  builderSlideshowPics: string[];
  setBuilderSlideshowPics: (pics: string[]) => void;
  handleUploadMultipleSlideshowPics: (files: FileList) => void;
  selectedTheme: CardConfig['theme'];
  setSelectedTheme: (theme: CardConfig['theme']) => void;
  selectedContainer: CardConfig['container'];
  setSelectedContainer: (container: CardConfig['container']) => void;
  personalMessage: string;
  setPersonalMessage: (val: string) => void;
  messageTone: string;
  setMessageTone: (val: string) => void;
  senderName: string;
  setSenderName: (val: string) => void;
  promptDetails: string;
  setPromptDetails: (val: string) => void;
  geminiPoem: string;
  setGeminiPoem: (val: string) => void;
  isGenerating: boolean;
  handleGeneratePoem: () => void;
  features: CardConfig['features'];
  setFeatures: React.Dispatch<React.SetStateAction<CardConfig['features']>>;
  handleCreateShareLink: () => void;
  shareLink: string;
  isCopied: boolean;
  copyToClipboard: () => void;
  toggleMusic: () => void;
  isPlayingMusic: boolean;
  setIsPlayingMusic: (val: boolean) => void;
  musicEngine: React.MutableRefObject<any>;
  builderStickers: any[];
  setActiveCard: (card: CardConfig) => void;
  setIsReceiverMode: (val: boolean) => void;
  setIsOpened: (val: boolean) => void;
  supabaseUser: any;
}

export const CardBuilder: React.FC<CardBuilderProps> = ({
  theme,
  builderStep,
  setBuilderStep,
  recipientName,
  setRecipientName,
  relationship,
  setRelationship,
  picMethod,
  setPicMethod,
  recipientPic,
  setRecipientPic,
  uploadStatus,
  setUploadStatus,
  builderSlideshowPics,
  setBuilderSlideshowPics,
  handleUploadMultipleSlideshowPics,
  selectedTheme,
  setSelectedTheme,
  selectedContainer,
  setSelectedContainer,
  personalMessage,
  senderName,
  setSenderName,
  setPersonalMessage,
  messageTone,
  setMessageTone,
  promptDetails,
  setPromptDetails,
  geminiPoem,
  setGeminiPoem,
  isGenerating,
  handleGeneratePoem,
  features,
  setFeatures,
  handleCreateShareLink,
  shareLink,
  isCopied,
  copyToClipboard,
  toggleMusic,
  isPlayingMusic,
  setIsPlayingMusic,
  musicEngine,
  builderStickers,
  setActiveCard,
  setIsReceiverMode,
  setIsOpened,
  supabaseUser,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT BUILDER CONTROLS PANEL (Column 7) */}
      <div className={`lg:col-span-7 ${theme.cardBg} rounded-[32px] md:rounded-[40px] p-6 md:p-8 border ${theme.glassBorder} shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)]`}>
        <div className="space-y-6">
          {/* Stepper Headers */}
          <div className="flex items-center justify-between border-b pb-4 border-slate-500/10 gap-1 overflow-x-auto scrollbar-none">
            {[
              { num: 1, label: 'Recipient', icon: '👤' },
              { num: 2, label: 'Aesthetic', icon: '🎨' },
              { num: 3, label: 'Wishes & AI', icon: '✍️' },
              { num: 4, label: 'Interactive', icon: '✨' },
            ].map((step) => (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  setBuilderStep(step.num);
                  playMagicalBell(500 + step.num * 100, 0.2);
                }}
                className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                  builderStep === step.num
                    ? (theme.isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-900 text-white border-slate-900 shadow-sm')
                    : (theme.isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/5 border-transparent' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent')
                }`}
              >
                <span className="text-sm">{step.icon}</span>
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.num}</span>
              </button>
            ))}
          </div>

          {/* STEP 1: RECIPIENT DETAILS & SLIDESHOW */}
          {builderStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${theme.isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-950 text-white'}`}>1</span>
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>Recipient Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme.isDark ? 'text-white/60' : 'text-slate-600'}`}>Recipient's Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className={`w-full border rounded-xl p-3 text-sm focus:outline-none transition ${
                        theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-white/50 text-slate-800 focus:border-indigo-500 shadow-inner'
                      }`}
                      placeholder="e.g. Adora"
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme.isDark ? 'text-white/60' : 'text-slate-600'}`}>Your Relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className={`w-full border rounded-xl p-3 text-sm focus:outline-none transition ${
                        theme.isDark ? 'bg-slate-900 border-white/10 text-white focus:border-cyan-500' : 'bg-white/80 border-white/50 text-slate-800 focus:border-indigo-500 shadow-sm'
                      }`}
                    >
                      <option value="friend" className="bg-white text-slate-950">Friend</option>
                      <option value="bestie" className="bg-white text-slate-950">Best Friend / Bestie</option>
                      <option value="partner" className="bg-white text-slate-950">Partner / Lover</option>
                      <option value="family" className="bg-white text-slate-950">Family Member</option>
                      <option value="colleague" className="bg-white text-slate-950">Colleague / Work Mate</option>
                    </select>
                  </div>
                </div>

                {/* Celebrant's Picture Option */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  <label className={`block text-[10px] font-bold uppercase mb-2 ${theme.isDark ? 'text-white/60' : 'text-slate-600'}`}>Celebrant's Picture / Avatar</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="shrink-0 relative w-16 h-16 rounded-full border border-white/10 flex items-center justify-center overflow-hidden bg-black/30 shadow-inner">
                      {recipientPic ? (
                        recipientPic.startsWith('data:') || recipientPic.startsWith('http') ? (
                          <img src={recipientPic} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-3xl select-none">{recipientPic}</span>
                        )
                      ) : (
                        <span className="text-2xl select-none">🎂</span>
                      )}
                      {recipientPic && (
                        <button
                          onClick={() => setRecipientPic('')}
                          className="absolute inset-0 bg-black/70 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-rose-300 font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2.5">
                      <div className="flex gap-2">
                        <label className={`cursor-pointer text-[10px] p-2 rounded-xl border text-center flex-1 font-bold transition flex items-center justify-center gap-1 ${
                          picMethod === 'upload'
                            ? (theme.isDark ? 'bg-white/10 text-white border-white/20' : 'bg-slate-900 text-white border-slate-900')
                            : (theme.isDark ? 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10' : 'bg-white/50 border-white/40 text-slate-700 hover:bg-white')
                        }`}>
                          <span>📤 Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadStatus('Uploading...');
                                try {
                                  if (isSupabaseConfigured() && supabaseUser) {
                                    try {
                                      const cloudUrl = await uploadImageToSupabase(file, 'birthday-memories');
                                      setRecipientPic(cloudUrl);
                                      setPicMethod('upload');
                                      playMagicalBell(880, 0.5);
                                      setUploadStatus('Cloud Upload Success!');
                                      setTimeout(() => setUploadStatus(''), 2500);
                                      return;
                                    } catch (err: any) {
                                      console.warn('Supabase cloud upload failed, falling back:', err);
                                    }
                                  }
                                  const compressed = await compressImage(file);
                                  setRecipientPic(compressed);
                                  setPicMethod('upload');
                                  playMagicalBell(880, 0.5);
                                  setUploadStatus('Compressed Locally!');
                                  setTimeout(() => setUploadStatus(''), 2000);
                                } catch (err) {
                                  alert('Error processing image. Please try another one.');
                                  setUploadStatus('');
                                }
                              }
                            }}
                          />
                        </label>

                        <button
                          onClick={() => setPicMethod('emoji')}
                          className={`text-[10px] p-2 rounded-xl border text-center flex-1 font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            picMethod === 'emoji'
                              ? (theme.isDark ? 'bg-white/10 text-white border-white/20' : 'bg-slate-900 text-white border-slate-900')
                              : (theme.isDark ? 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10' : 'bg-white/50 border-white/40 text-slate-700 hover:bg-white')
                          }`}
                        >
                          🥰 Choose Avatar
                        </button>

                        <button
                          onClick={() => setPicMethod('url')}
                          className={`text-[10px] p-2 rounded-xl border text-center flex-1 font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            picMethod === 'url'
                              ? (theme.isDark ? 'bg-white/10 text-white border-white/20' : 'bg-slate-900 text-white border-slate-900')
                              : (theme.isDark ? 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10' : 'bg-white/50 border-white/40 text-slate-700 hover:bg-white')
                          }`}
                        >
                          🔗 Photo Link
                        </button>
                      </div>

                      {picMethod === 'url' && (
                        <input
                          type="text"
                          placeholder="Paste photo URL (https://...)"
                          value={recipientPic && recipientPic.startsWith('http') ? recipientPic : ''}
                          onChange={(e) => setRecipientPic(e.target.value)}
                          className={`w-full border rounded-xl p-2.5 text-xs focus:outline-none transition ${
                            theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-white/50 text-slate-800 focus:border-indigo-500 shadow-inner'
                          }`}
                        />
                      )}

                      {picMethod === 'emoji' && (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-black/10 rounded-xl justify-between border border-white/5">
                          {['🧁', '🦁', '🦄', '🕶️', '🐱', '👑', '🥳', '🚀', '🎸', '⚽'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setRecipientPic(emoji);
                                playMagicalBell(783.99, 0.4);
                              }}
                              className={`w-7 h-7 flex items-center justify-center text-base rounded-lg hover:bg-white/15 transition cursor-pointer ${
                                recipientPic === emoji ? 'bg-white/25 border border-white/20' : ''
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {picMethod === 'upload' && (
                        <p className={`text-[9px] ${theme.isDark ? 'text-white/40' : 'text-slate-500'} italic leading-relaxed`}>
                          {uploadStatus || 'Upload a portrait photo. Photos are automatically compressed so they embed flawlessly in shareable links!'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Slideshow Pics Option */}
                <div className="mt-5 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-[10px] font-bold uppercase ${theme.isDark ? 'text-white/60' : 'text-slate-600'}`}>
                      Slideshow Memories (Up to 5 Photos)
                    </label>
                    <label className={`cursor-pointer text-[10px] py-1 px-2.5 rounded-lg border font-bold transition flex items-center gap-1 ${
                      theme.isDark
                        ? 'bg-white/5 hover:bg-white/10 text-cyan-300 border-white/10'
                        : 'bg-white border-slate-300 hover:bg-slate-50 text-indigo-600 shadow-sm'
                    }`}>
                      <span>📸 Add Multiple</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleUploadMultipleSlideshowPics(e.target.files);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-5 gap-3 mb-3">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const picUrl = builderSlideshowPics[idx];
                      return (
                        <div
                          key={idx}
                          className="aspect-square rounded-xl border border-dashed border-white/20 bg-black/30 relative flex flex-col items-center justify-center overflow-hidden group shadow-inner"
                        >
                          {picUrl ? (
                            <>
                              <img src={picUrl} alt={`Memory ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button
                                onClick={() => {
                                  const newPics = [...builderSlideshowPics];
                                  newPics.splice(idx, 1);
                                  setBuilderSlideshowPics(newPics.filter(Boolean));
                                  playMagicalBell(400, 0.3);
                                }}
                                className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-rose-300 font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Remove
                              </button>
                            </>
                          ) : (
                            <label className="cursor-pointer absolute inset-0 flex flex-col items-center justify-center text-white/30 hover:text-white/60 transition-colors">
                              <Plus className="w-4 h-4 mb-0.5" />
                              <span className="text-[8px] uppercase tracking-wider font-extrabold font-mono">Add</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    handleUploadMultipleSlideshowPics(e.target.files);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: AESTHETIC THEME & BOX */}
          {builderStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${theme.isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-950 text-white'}`}>2</span>
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>Aesthetic Theme & Opening box</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-2 ${theme.isDark ? 'text-white/60' : 'text-slate-600'}`}>Select Visual Theme</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(THEME_STYLES) as CardConfig['theme'][]).map((tName) => (
                        <button
                          key={tName}
                          onClick={() => setSelectedTheme(tName)}
                          className={`p-3 rounded-xl border text-left text-xs capitalize transition font-medium cursor-pointer ${
                            selectedTheme === tName
                              ? (theme.isDark ? 'bg-white/15 border-white text-white font-bold shadow-md' : 'bg-slate-900 border-slate-900 text-white font-bold shadow-md')
                              : (theme.isDark ? 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10' : 'bg-white/50 border-white/40 text-slate-700 hover:bg-white/80')
                          }`}
                        >
                          <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 bg-gradient-to-tr ${THEME_STYLES[tName].bg}`}></span>
                          {tName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-2 ${theme.isDark ? 'text-white/60' : 'text-slate-600'}`}>Secret Opening Box</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['box', 'envelope', 'bubble'] as CardConfig['container'][]).map((cName) => (
                        <button
                          key={cName}
                          onClick={() => setSelectedContainer(cName)}
                          className={`p-2.5 rounded-xl border text-xs capitalize transition text-center font-medium cursor-pointer ${
                            selectedContainer === cName
                              ? (theme.isDark ? 'bg-white/15 border-white text-white font-bold shadow-md' : 'bg-slate-900 border-slate-900 text-white font-bold shadow-md')
                              : (theme.isDark ? 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10' : 'bg-white/50 border-white/40 text-slate-700 hover:bg-white/80')
                          }`}
                        >
                          {cName === 'giftbox' && '🎁 Box'}
                          {cName === 'envelope' && '✉️ Seal'}
                          {cName === 'bubble' && '🧼 Bubble'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PERSONAL NOTE & AI VERSE */}
          {builderStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${theme.isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-950 text-white'}`}>3</span>
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>Heartfelt Message & AI Verse</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme.isDark ? 'text-white/60' : 'text-slate-600'}`}>Personal Birthday Note</label>
                    <textarea
                      value={personalMessage}
                      onChange={(e) => setPersonalMessage(e.target.value)}
                      rows={3}
                      className={`w-full border rounded-xl p-3 text-sm focus:outline-none transition ${
                        theme.isDark ? 'bg-black/20 border-white/10 text-white focus:border-cyan-500' : 'bg-white/60 border-white/50 text-slate-800 focus:border-indigo-500 shadow-inner'
                      }`}
                      placeholder="Write something custom..."
                    />
                  </div>

                  <div className={`rounded-2xl p-5 border ${theme.isDark ? 'bg-slate-900/60 border-indigo-500/20' : 'bg-white/50 border-indigo-400/30 shadow-inner'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${theme.isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                        <Wand2 className="w-4 h-4 animate-pulse" /> Gemini Verse Engine
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-bold border ${theme.isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/10' : 'bg-indigo-100 text-indigo-800 border-indigo-200'}`}>Server-Side AI</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme.isDark ? 'text-white/50' : 'text-slate-600'}`}>Poem Tone</label>
                        <div className="flex flex-wrap gap-1.5">
                          {['heartfelt', 'poetic', 'funny', 'epic', 'pirate'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setMessageTone(t)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold transition cursor-pointer ${
                                messageTone === t
                                  ? 'bg-indigo-600 text-white font-black'
                                  : (theme.isDark ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-slate-200/60 text-slate-700 hover:bg-slate-200')
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme.isDark ? 'text-white/50' : 'text-slate-600'}`}>Specific details to include (hobbies, memories)</label>
                        <input
                          type="text"
                          value={promptDetails}
                          onChange={(e) => setPromptDetails(e.target.value)}
                          className={`w-full border rounded-xl p-3 text-xs focus:outline-none transition ${
                            theme.isDark ? 'bg-black/25 border-white/10 text-white focus:border-indigo-400' : 'bg-white/80 border-white/60 text-slate-800 focus:border-indigo-600 shadow-sm'
                          }`}
                          placeholder="e.g. loves guitar, travels, funny coffee drinker..."
                        />
                      </div>

                      <button
                        onClick={handleGeneratePoem}
                        disabled={isGenerating}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-800 disabled:to-purple-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Weaving Magic...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-bounce" /> Generate Gemini Poem
                          </>
                        )}
                      </button>

                      {geminiPoem && (
                        <div className="mt-3 bg-black/40 p-3 rounded-lg border border-white/5 text-xs text-indigo-200 font-serif leading-relaxed whitespace-pre-line relative">
                          <textarea
                            value={geminiPoem}
                            onChange={(e) => setGeminiPoem(e.target.value)}
                            rows={4}
                            className="w-full bg-transparent border-none p-0 text-xs font-serif leading-relaxed text-indigo-200 focus:outline-none resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SURPRISE TOGGLES */}
          {builderStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${theme.isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-950 text-white'}`}>4</span>
                  <h2 className={`text-xs font-bold uppercase tracking-wider ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>Surprise Feature Toggles</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border space-y-3 ${theme.isDark ? 'bg-white/5 border-white/5' : 'bg-white/50 border-white/40 shadow-sm'}`}>
                    <label className={`flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>
                      <input
                        type="checkbox"
                        checked={features.candle}
                        onChange={(e) => setFeatures({ ...features, candle: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-300/40 text-indigo-600 focus:ring-0"
                      />
                      Include Magic Blowout Candle
                    </label>
                    <label className={`flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>
                      <input
                        type="checkbox"
                        checked={features.balloons}
                        onChange={(e) => setFeatures({ ...features, balloons: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-300/40 text-indigo-600 focus:ring-0"
                      />
                      Balloons Floating on Open
                    </label>
                    <label className={`flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>
                      <input
                        type="checkbox"
                        checked={features.confetti}
                        onChange={(e) => setFeatures({ ...features, confetti: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-300/40 text-indigo-600 focus:ring-0"
                      />
                      Opening Confetti Explosion
                    </label>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-3 ${theme.isDark ? 'bg-white/5 border-white/5' : 'bg-white/50 border-white/40 shadow-sm'}`}>
                    <label className={`flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>
                      <input
                        type="checkbox"
                        checked={features.music}
                        onChange={(e) => setFeatures({ ...features, music: e.target.checked })}
                        className="rounded bg-slate-900 border-slate-300/40 text-indigo-600 focus:ring-0"
                      />
                      Enable Ambient Soundscape
                    </label>

                    {features.music && (
                      <div>
                        <label className={`block text-[10px] uppercase font-bold mb-1.5 ${theme.isDark ? 'text-white/50' : 'text-slate-600'}`}>Soundscape Symphony</label>
                        <select
                          value={features.musicTheme}
                          onChange={(e) => setFeatures({ ...features, musicTheme: e.target.value as any })}
                          className={`w-full border p-2 rounded-xl text-xs focus:outline-none transition ${
                            theme.isDark ? 'bg-slate-950 border-white/10 text-white focus:border-cyan-500' : 'bg-white border-white/40 text-slate-800 focus:border-indigo-500 shadow-sm'
                          }`}
                        >
                          <option value="birthday" className="text-slate-950">Classic Orgel (Music Box)</option>
                          <option value="lofi" className="text-slate-950">Sunset Chill (Lofi Piano)</option>
                          <option value="sparkle" className="text-slate-950">Sparkle Wind Chimes</option>
                          <option value="zen" className="text-slate-950">Zen Space Drone</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-500/10 mt-6 gap-4">
            {builderStep > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setBuilderStep((prev) => prev - 1);
                  playMagicalBell(440, 0.2);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  theme.isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {builderStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  setBuilderStep((prev) => prev + 1);
                  playMagicalBell(660, 0.2);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold transition bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center gap-1 shadow-md cursor-pointer"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={handleCreateShareLink}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${theme.accentBtn}`}
              >
                Create Magical Card ✨
              </button>
            )}
          </div>

          {/* Share Link Result */}
          {shareLink && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-5 rounded-2xl border ${
                theme.isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-white/60 shadow-lg'
              }`}
            >
              <p className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5 ${
                theme.isDark ? 'text-cyan-400' : 'text-indigo-600'
              }`}>
                <Share2 className="w-3.5 h-3.5 animate-bounce" /> Your Link is Ready to Share!
              </p>

              <div className="w-full max-w-[120px] mx-auto h-20 mb-3 pointer-events-none select-none flex items-center justify-center">
                <LottiePlayer
                  src="https://lottie.host/fa0314cf-81c8-4720-be1a-da043cb7ba98/zlyOof516k.json"
                  speed={1}
                  autoplay={true}
                  loop={true}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className={`w-full border rounded-xl p-2.5 text-xs select-all focus:outline-none ${
                    theme.isDark ? 'bg-black/40 border-white/5 text-white/90' : 'bg-white/60 border-white/50 text-slate-800 shadow-inner'
                  }`}
                />
                <button
                  onClick={copyToClipboard}
                  className={`p-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
                    theme.isDark ? 'bg-white text-slate-950 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RIGHT LIVE WORKSPACE PREVIEW (Column 5) */}
      <div className="lg:col-span-5 sticky top-8">
        <div className={`${theme.cardBg} rounded-[32px] p-6 border ${theme.glassBorder} overflow-hidden relative shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)]`}>
          <div className={`flex justify-between items-center mb-4 border-b pb-3 ${theme.isDark ? 'border-white/5' : 'border-slate-800/10'}`}>
            <h3 className={`text-xs uppercase tracking-widest font-extrabold flex items-center gap-1.5 ${theme.isDark ? 'text-white/60' : 'text-slate-800'}`}>
              <BookOpen className={`w-4 h-4 ${theme.isDark ? 'text-cyan-400' : 'text-indigo-600'}`} /> Live Studio Preview
            </h3>
            <span className={`text-[9px] px-2.5 py-0.5 rounded-full uppercase font-bold ${
              theme.isDark ? 'bg-cyan-400/20 text-cyan-300' : 'bg-indigo-100 text-indigo-700'
            }`}>Interactive</span>
          </div>

          <p className={`text-[11px] mb-4 ${theme.isDark ? 'text-white/50' : 'text-slate-600'}`}>
            Preview how your custom card will look to your recipient:
          </p>

          <div className={`relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gradient-to-br border border-white/10 flex flex-col justify-center items-center p-4 transition duration-1000 ${THEME_STYLES[selectedTheme].bg}`}>
            <div className="absolute top-3 right-3 flex items-center gap-1 z-20">
              {features.music ? (
                <button
                  onClick={toggleMusic}
                  className={`p-2 rounded-full border transition-all duration-300 cursor-pointer ${
                    isPlayingMusic
                      ? 'bg-white/20 text-white border-amber-300 shadow-md scale-105 animate-pulse'
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/15 hover:text-white'
                  }`}
                  title={isPlayingMusic ? "Mute Studio Preview" : "Play Studio Preview"}
                >
                  {isPlayingMusic ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              ) : null}
            </div>

            <div className="text-center w-full z-10 px-2 select-none">
              {recipientPic && (
                <div className="relative w-16 h-16 mx-auto mb-3 group">
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-75 animate-pulse"></div>
                  <div className="relative w-full h-full rounded-full border border-white/80 overflow-hidden shadow-md bg-black/10 flex items-center justify-center">
                    {recipientPic.startsWith('data:') || recipientPic.startsWith('http') ? (
                      <img src={recipientPic} alt="Celebrant" className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-3xl">{recipientPic}</span>
                    )}
                  </div>
                </div>
              )}

              <span className="text-[9px] uppercase tracking-widest text-white/50">Surprise For</span>
              <h4 className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-rose-100 mb-6 truncate">
                {recipientName || 'Name'}
              </h4>

              {selectedContainer === 'giftbox' && (
                <div className="w-24 h-24 mx-auto animate-bounce flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                    <rect x="20" y="35" width="60" height="50" rx="6" fill="#f43f5e" />
                    <rect x="15" y="25" width="70" height="12" rx="4" fill="#fda4af" />
                    <rect x="45" y="25" width="10" height="60" fill="#fbbf24" />
                    <rect x="20" y="55" width="60" height="10" fill="#fbbf24" />
                    <path d="M50,25 C35,10 45,5 50,25 C55,5 65,10 50,25 Z" fill="#fbbf24" />
                  </svg>
                </div>
              )}

              {selectedContainer === 'envelope' && (
                <div className="w-32 h-20 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 rounded-lg relative flex items-center justify-center shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-10 border-b border-amber-300/30 rounded-b-full bg-amber-50"></div>
                  <div className="w-8 h-8 rounded-full bg-amber-600 border border-amber-500 flex items-center justify-center z-10">
                    <Heart className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
              )}

              {selectedContainer === 'bubble' && (
                <div className="w-24 h-24 mx-auto rounded-full border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3),inset_0_0_15px_rgba(255,255,255,0.2)] bg-white/5 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-white/60" />
                </div>
              )}

              <button
                onClick={() => {
                  const config: CardConfig = {
                    recipient: recipientName,
                    relation: relationship,
                    tone: messageTone,
                    sender: senderName,
                    theme: selectedTheme,
                    container: selectedContainer,
                    message: personalMessage,
                    poem: geminiPoem,
                    stickers: builderStickers,
                    features,
                    recipientPic: recipientPic,
                    slideshowPics: builderSlideshowPics,
                  };
                  setActiveCard(config);
                  setIsReceiverMode(true);
                  setIsOpened(false);
                }}
                className="mt-6 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition shadow-lg cursor-pointer"
              >
                Test Recipient View ✦
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
