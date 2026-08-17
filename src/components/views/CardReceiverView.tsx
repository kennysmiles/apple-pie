import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2, VolumeX, RefreshCw, Wand2, ArrowLeft, ArrowRight, Sparkles, Heart, Gift
} from 'lucide-react';
import { CardConfig, ThemeStyle } from '../../types';
import { THEME_STYLES } from '../../constants/themes';
import { LottiePlayer } from '../LottiePlayer';
import { TypewriterText } from '../TypewriterText';
import { AnimatedBirthdayTitle } from '../AnimatedBirthdayTitle';
import {
  playPartyHorn, playCheers, playAww, playSparkleCascade, playMagicalBell, playBalloonPop
} from '../../utils/synth';

/**
 * ============================================================================
 * CARD RECEIVER VIEW COMPONENT
 * ============================================================================
 * Renders the interactive birthday experience for the receiver of a card link.
 * Handles container unboxing (envelope/gift box/bubble), music, multi-step story flow,
 * candle blowing out, auditory soundboard, and photo slideshow.
 */
interface CardReceiverViewProps {
  activeCard: CardConfig | null;
  selectedTheme: string;
  recipientName: string;
  recipientPic: string;
  isCardOpened: boolean;
  setIsCardOpened: (opened: boolean) => void;
  handleOpenCard: () => void;
  currentStoryStep: number;
  setCurrentStoryStep: (step: number) => void;
  autoplayActive: boolean;
  setAutoplayActive: (active: boolean) => void;
  isMusicPlaying: boolean;
  musicLoaded: boolean;
  toggleMusic: () => void;
  geminiPoem: string;
  geminiPoemLoading: boolean;
  generateGeminiPoem: () => void;
  candleBlown: boolean;
  handleBlowOutCandle: () => void;
  smokeParticles: Array<{ id: number; x: number; y: number; opacity: number; size: number }>;
  currentSlideshow: string[];
  currentSlideIndex: number;
  setCurrentSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  slideshowAutoNext: boolean;
  setSlideshowAutoNext: React.Dispatch<React.SetStateAction<boolean>>;
  features: { candle: boolean; poem: boolean; music: boolean; confetti: boolean };
  spawnBalloons?: () => void;
  onBackToStudio?: () => void;
}

export const CardReceiverView: React.FC<CardReceiverViewProps> = ({
  activeCard,
  selectedTheme,
  recipientName,
  recipientPic,
  isCardOpened,
  handleOpenCard,
  currentStoryStep,
  setCurrentStoryStep,
  autoplayActive,
  setAutoplayActive,
  isMusicPlaying,
  musicLoaded,
  toggleMusic,
  geminiPoem,
  geminiPoemLoading,
  generateGeminiPoem,
  candleBlown,
  handleBlowOutCandle,
  smokeParticles,
  currentSlideshow,
  currentSlideIndex,
  setCurrentSlideIndex,
  slideshowAutoNext,
  setSlideshowAutoNext,
  features,
  spawnBalloons,
  onBackToStudio,
}) => {
  const cardThemeKey = activeCard?.theme || selectedTheme || 'midnight';
  const activeCardTheme: ThemeStyle = THEME_STYLES[cardThemeKey] || THEME_STYLES.midnight;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${activeCardTheme.bg} transition-colors duration-1000 flex flex-col items-center justify-start p-4 md:p-8 relative overflow-x-hidden select-none font-sans`}>
      {/* Sound Controller Toggle */}
      {features.music && (
        <button
          onClick={toggleMusic}
          className={`fixed top-4 right-4 z-50 p-3 rounded-full backdrop-blur-md border shadow-2xl transition-all active:scale-90 cursor-pointer ${
            isMusicPlaying
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30 animate-pulse'
              : `${activeCardTheme.isDark ? 'bg-black/40 text-white border-white/10' : 'bg-white/80 text-slate-800 border-slate-200'}`
          }`}
          title={isMusicPlaying ? 'Mute Background Symphony' : 'Play Background Symphony'}
        >
          {isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-60" />}
          {isMusicPlaying && (
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </button>
      )}

      {/* Optional Back to Studio Button */}
      {onBackToStudio && (
        <button
          onClick={onBackToStudio}
          className="fixed top-4 left-4 z-50 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-bold backdrop-blur-md hover:bg-black/60 transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Studio
        </button>
      )}

      {/* Main Container Unboxing or Card Reveal */}
      <div className="w-full max-w-4xl flex flex-col items-center my-auto py-6">
        {!isCardOpened ? (
          // UNBOXING CONTAINER STEP
          <motion.div
            key="unboxing-stage"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center my-auto py-12"
          >
            <h1 className={`text-2xl md:text-3xl font-black font-display tracking-tight mb-2 ${activeCardTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
              You Received a Magical Surprise! 🎁
            </h1>
            <p className={`text-xs md:text-sm font-medium mb-12 max-w-sm ${activeCardTheme.isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Dedicated to <span className="font-extrabold text-amber-500">{activeCard?.recipient || recipientName || 'Someone Special'}</span>
            </p>

            {/* 1. ENVELOPE */}
            {(!activeCard?.container || activeCard.container === 'envelope') && (
              <motion.div
                id="secret-envelope"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenCard}
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <div className={`absolute w-40 h-40 rounded-full ${activeCardTheme.isDark ? 'bg-amber-400/20' : 'bg-pink-400/20'} blur-xl opacity-60 animate-pulse`}></div>
                  <LottiePlayer
                    src="https://lottie.host/be0edda1-4aa7-4edb-8f3b-ecae7d5fa25d/i2v9pG74eA.json"
                    speed="1"
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <p className={`mt-2 text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${activeCardTheme.isDark ? 'text-amber-300' : 'text-slate-800'}`}>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-400" /> Tap Envelope to Open
                </p>
              </motion.div>
            )}

            {/* 2. GIFT BOX */}
            {activeCard?.container === 'giftbox' && (
              <motion.div
                id="secret-treasure-box"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleOpenCard}
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <div className={`absolute w-36 h-36 rounded-full ${activeCardTheme.isDark ? 'bg-cyan-400/20' : 'bg-rose-400/25'} blur-xl opacity-60 animate-pulse`}></div>
                  <LottiePlayer
                    src="https://lottie.host/eda88340-8b70-464e-95a5-f5f327dc0855/FdPc2FvLQk.json"
                    speed={1.2}
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <p className={`mt-2 text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${activeCardTheme.isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
                  <Gift className="w-4 h-4 animate-bounce text-amber-400" /> Tap to Open Your Gift
                </p>
              </motion.div>
            )}

            {/* 3. BUBBLE */}
            {activeCard?.container === 'bubble' && (
              <motion.div
                id="secret-bubble"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleOpenCard}
                className="cursor-pointer relative w-48 h-48 flex flex-col items-center justify-center"
              >
                <div className="w-44 h-44 relative flex items-center justify-center">
                  <div className={`absolute w-32 h-32 rounded-full ${activeCardTheme.isDark ? 'bg-pink-400/10' : 'bg-purple-400/15'} blur-xl opacity-40 animate-pulse`}></div>
                  <LottiePlayer
                    src="https://lottie.host/195b0586-cfdf-47ec-b097-f58c70a9fa93/E7K4g5bO3z.json"
                    speed="1"
                    loop={true}
                    autoplay={true}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <p className={`mt-2 text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${activeCardTheme.isDark ? 'text-pink-400' : 'text-purple-600'}`}>
                  <Sparkles className="w-4 h-4 animate-spin text-pink-400" /> Tap to Pop Bubble
                </p>
              </motion.div>
            )}

            <p className={`mt-8 text-xs ${activeCardTheme.isDark ? 'text-slate-400/80' : 'text-slate-500/80'} max-w-xs font-semibold tracking-wide leading-relaxed`}>
              Make sure your sound is turned up for a truly magical birthday symphony 🎧
            </p>
          </motion.div>
        ) : (
          // CARD OPENED MULTI-PAGE GATEFOLD EXPERIENCE
          <motion.div
            key="opened-card-container"
            initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="max-w-4xl w-full"
          >
            {/* Outer Glass Container */}
            <div className={`relative rounded-[32px] md:rounded-[40px] border p-5 sm:p-8 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] backdrop-blur-[40px] ${activeCardTheme.cardBg} transition-colors duration-1000 overflow-hidden`}>
              {/* Sparkle corner borders */}
              <div className="absolute top-0 left-0 w-16 sm:w-24 h-16 sm:h-24 border-t-4 border-l-4 rounded-tl-3xl opacity-30 pointer-events-none" style={{ borderColor: activeCardTheme.sparkleColor }}></div>
              <div className="absolute bottom-0 right-0 w-16 sm:w-24 h-16 sm:h-24 border-b-4 border-r-4 rounded-br-3xl opacity-30 pointer-events-none" style={{ borderColor: activeCardTheme.sparkleColor }}></div>

              {/* Progress Bar */}
              <div className="flex gap-2 mb-6 sm:mb-8 max-w-xl mx-auto px-1">
                {[0, 1, 2, 3].map((step) => {
                  let progressPercent = 0;
                  let duration = 0.3;

                  if (currentStoryStep > step) {
                    progressPercent = 100;
                  } else if (currentStoryStep === step) {
                    if (step === 2) {
                      progressPercent = candleBlown ? 100 : 0;
                      duration = candleBlown ? 4.5 : 0.3;
                    } else {
                      progressPercent = 100;
                      duration = step === 0 ? 8.0 : 16.0;
                    }
                  }

                  return (
                    <button
                      key={step}
                      onClick={() => {
                        setCurrentStoryStep(step);
                        setAutoplayActive(false);
                        playMagicalBell(500 + step * 100, 0.45);
                      }}
                      className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden relative group cursor-pointer"
                      title={`Go to Step ${step + 1}`}
                    >
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={
                          currentStoryStep === step && (autoplayActive || step === 2)
                            ? { duration: duration, ease: 'linear' }
                            : { duration: 0.3, ease: 'easeInOut' }
                        }
                        className={`h-full rounded-full bg-gradient-to-r ${
                          currentStoryStep === step
                            ? 'from-amber-400 via-amber-300 to-yellow-200'
                            : 'from-white/40 to-white/60'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* STORY STEPS */}
              <AnimatePresence mode="wait">
                {/* STEP 0: HERO GREETING & PICTURE */}
                {currentStoryStep === 0 && (
                  <motion.div
                    key="story-step-0"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    className="flex flex-col items-center text-center py-6 md:py-12 max-w-2xl mx-auto"
                  >
                    {recipientPic && (
                      <motion.div
                        initial={{ scale: 0, rotate: -15 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                        className="relative w-36 h-36 md:w-44 md:h-44 mx-auto mb-8"
                      >
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${activeCardTheme.titleGradient} blur-xl opacity-80 animate-pulse`}></div>
                        <div className="relative w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden bg-black/10 flex items-center justify-center">
                          {recipientPic.startsWith('data:') || recipientPic.startsWith('http') ? (
                            <img src={recipientPic} alt="Celebrant" className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-6xl md:text-7xl select-none">{recipientPic}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 text-xs font-black p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center w-10 h-10 select-none animate-bounce">
                          👑
                        </div>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-extrabold tracking-[0.2em] uppercase mb-5 shadow-sm ${
                        activeCardTheme.isDark ? 'bg-white/10 border-white/20 text-yellow-300' : 'bg-slate-900/10 border-slate-950/10 text-slate-800'
                      } border`}>
                        ✦ Hooorayyyy! ✦
                      </span>
                      <AnimatedBirthdayTitle
                        text={`Happy Birthday ${activeCard?.recipient || recipientName || 'Someone Special'}! 🎉`}
                        themePreset={activeCard ? activeCard.theme : selectedTheme}
                      />
                      <p className={`text-sm md:text-base font-medium max-w-lg mx-auto leading-relaxed ${activeCardTheme.isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        The magic of this day belongs entirely to you. Get ready, we have designed something unforgettable! ✨
                      </p>

                      <div className="w-full max-w-[180px] h-36 mx-auto mt-6 pointer-events-none select-none flex items-center justify-center">
                        <LottiePlayer
                          src="https://lottie.host/48e2b1b9-35d4-4013-a3ed-7ee05b59d87c/G5FdcBaKGi.json"
                          speed="1"
                          loop={true}
                          autoplay={true}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* STEP 1: PERSONAL MESSAGE & GEMINI POEM */}
                {currentStoryStep === 1 && (
                  <motion.div
                    key="story-step-1"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    className="flex flex-col gap-6 py-4 max-w-2xl mx-auto w-full"
                  >
                    <div className={`relative ${activeCardTheme.isDark ? 'bg-white/5 border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]' : 'bg-gradient-to-b from-white/95 to-white/70 border-white/70 shadow-lg'} rounded-3xl p-6 md:p-8 border min-h-[140px] flex flex-col justify-center`}>
                      <p className="text-base md:text-xl leading-relaxed font-sans font-medium">
                        <TypewriterText
                          text={activeCard?.message || 'Wishing you a day filled with boundless laughter, infinite magic, and memories that linger forever in your heart! Happy Birthday! 🎉'}
                          speed={35}
                        />
                      </p>

                      {activeCard?.sender && (
                        <p className={`text-right text-xs font-bold uppercase tracking-widest mt-6 ${activeCardTheme.isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                          With endless love, <br />
                          <span className="text-sm font-black font-serif italic capitalize">{activeCard.sender}</span>
                        </p>
                      )}
                    </div>

                    {features.poem && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`bg-gradient-to-br ${
                          activeCardTheme.isDark
                            ? 'from-amber-950/40 to-yellow-950/20 border-amber-500/20 text-amber-100'
                            : 'from-amber-100/70 to-amber-50/30 border-amber-300/60 text-amber-950 shadow-md'
                        } rounded-3xl p-6 md:p-8 border relative`}
                      >
                        <div className={`flex items-center justify-between mb-3 text-xs uppercase tracking-widest font-black ${activeCardTheme.isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                          <span className="flex items-center gap-2">
                            <Wand2 className="w-3.5 h-3.5 animate-spin-slow" /> Gemini Magical Verse
                          </span>
                          <button
                            onClick={generateGeminiPoem}
                            disabled={geminiPoemLoading}
                            className="p-1 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition flex items-center gap-1 text-[10px] cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${geminiPoemLoading ? 'animate-spin' : ''}`} /> Regenerate
                          </button>
                        </div>
                        <p className="text-sm md:text-base leading-relaxed font-serif whitespace-pre-line">
                          {geminiPoemLoading ? '✨ Weaving a personalized poetic verse...' : (activeCard?.poem || geminiPoem)}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* STEP 2: CANDLE BLOWOUT & AUDITORY SOUNDBOARD */}
                {currentStoryStep === 2 && (
                  <motion.div
                    key="story-step-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-6 relative z-10 w-full max-w-md mx-auto"
                  >
                    {features.candle && (
                      <div className={`w-full ${
                        activeCardTheme.isDark
                          ? 'bg-black/20 border-white/5 shadow-inner'
                          : 'bg-gradient-to-b from-white/60 to-white/10 border-white/50 shadow-inner'
                      } rounded-3xl p-6 border flex flex-col items-center justify-between relative overflow-hidden group min-h-[300px]`}>
                        <h3 className={`text-xs uppercase tracking-widest font-black ${activeCardTheme.isDark ? 'text-slate-400' : 'text-slate-600'} text-center mb-2`}>Blow Out The Magic Candle</h3>

                        <div className="relative h-40 flex flex-col justify-end items-center select-none my-4">
                          {smokeParticles.map((p) => (
                            <motion.div
                              key={p.id}
                              style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
                              className="absolute rounded-full bg-slate-300 blur-[2px]"
                            />
                          ))}

                          <AnimatePresence>
                            {!candleBlown && (
                              <motion.div
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
                              >
                                <div className="absolute w-12 h-12 bg-amber-400/20 rounded-full blur-md animate-pulse"></div>
                                <motion.div
                                  animate={{
                                    scale: [1, 1.05, 0.95, 1],
                                    skewY: [-2, 2, -1, 0, -2]
                                  }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                  className="w-4 h-10 bg-gradient-to-t from-red-500 via-amber-400 to-yellow-100 rounded-full origin-bottom"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="w-0.5 h-4 bg-slate-700"></div>

                          <div className="w-8 h-24 bg-gradient-to-r from-pink-400 via-rose-300 to-pink-500 rounded-t-sm shadow-md relative overflow-hidden flex flex-col justify-around py-2">
                            <div className="w-full h-1 bg-white/30 rotate-12"></div>
                            <div className="w-full h-1 bg-white/30 rotate-12"></div>
                            <div className="w-full h-1 bg-white/30 rotate-12"></div>
                          </div>
                        </div>

                        <button
                          id="blow-candle-btn"
                          onClick={handleBlowOutCandle}
                          disabled={candleBlown}
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer ${
                            candleBlown
                              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                              : `${activeCardTheme.accentBtn}`
                          }`}
                        >
                          {candleBlown ? '✨ Wish Made! ✨' : '💨 Click to Blow Out'}
                        </button>
                      </div>
                    )}

                    <div className={`w-full ${
                      activeCardTheme.isDark
                        ? 'bg-black/20 border-white/5'
                        : 'bg-gradient-to-b from-white/60 to-white/10 border-white/50 shadow-inner'
                    } rounded-3xl p-5 border text-center`}>
                      <h4 className={`text-[10px] uppercase tracking-wider font-bold ${activeCardTheme.isDark ? 'text-slate-400' : 'text-slate-600'} mb-3`}>Auditory Confetti</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={playPartyHorn} className={`py-2 px-3 ${activeCardTheme.isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white/40 hover:bg-white/60 text-slate-800 border border-white/60'} rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer`}>
                          🎉 Horn
                        </button>
                        <button onClick={playCheers} className={`py-2 px-3 ${activeCardTheme.isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white/40 hover:bg-white/60 text-slate-800 border border-white/60'} rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer`}>
                          🥂 Cheers
                        </button>
                        <button onClick={playAww} className={`py-2 px-3 ${activeCardTheme.isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white/40 hover:bg-white/60 text-slate-800 border border-white/60'} rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer`}>
                          🥺 Aww
                        </button>
                        <button onClick={() => spawnBalloons && spawnBalloons()} className={`py-2 px-3 ${activeCardTheme.isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white/40 hover:bg-white/60 text-slate-800 border border-white/60'} rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer`}>
                          🎈 Balloons
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: PHOTO SLIDESHOW CAROUSEL */}
                {currentStoryStep === 3 && (
                  <motion.div
                    key="story-step-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.9, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-6 py-4 max-w-2xl mx-auto w-full"
                  >
                    <div className="text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase mb-2 ${
                        activeCardTheme.isDark ? 'bg-white/10 border-white/20 text-cyan-300' : 'bg-slate-900/10 border-slate-950/10 text-slate-800'
                      } border`}>
                        ✦ Celebration Slideshow ✦
                      </span>
                      <h2 className={`text-xl md:text-2xl font-black ${activeCardTheme.isDark ? 'text-white' : 'text-slate-900'}`}>
                        Our Beautiful Memories 📸
                      </h2>
                    </div>

                    {currentSlideshow.length === 0 ? (
                      <div className={`p-8 rounded-2xl border text-center ${activeCardTheme.isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white/40 border-white/50 text-slate-500'} w-full`}>
                        No photos added to the slideshow yet.
                      </div>
                    ) : (
                      <div className="relative w-full aspect-[4/3] max-h-[420px] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-black/40 flex items-center justify-center group">
                        <div className="absolute inset-0 overflow-hidden opacity-30 select-none pointer-events-none">
                          <img
                            src={currentSlideshow[currentSlideIndex]}
                            alt="background"
                            className="w-full h-full object-cover blur-2xl scale-125"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.img
                            key={currentSlideIndex}
                            src={currentSlideshow[currentSlideIndex]}
                            alt={`Slide ${currentSlideIndex + 1}`}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-full max-h-full object-contain relative z-10 rounded-xl shadow-2xl"
                            referrerPolicy="no-referrer"
                          />
                        </AnimatePresence>

                        {/* Slide Nav Buttons */}
                        {currentSlideshow.length > 1 && (
                          <>
                            <button
                              onClick={() => {
                                setCurrentSlideIndex((prev) => (prev === 0 ? currentSlideshow.length - 1 : prev - 1));
                                playSparkleCascade();
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
                            >
                              <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setCurrentSlideIndex((prev) => (prev === currentSlideshow.length - 1 ? 0 : prev + 1));
                                playSparkleCascade();
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
                            >
                              <ArrowRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Nav Buttons for Story Flow */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10 relative z-20">
                <button
                  onClick={() => {
                    if (currentStoryStep > 0) {
                      setCurrentStoryStep(currentStoryStep - 1);
                      setAutoplayActive(false);
                      playMagicalBell(400, 0.3);
                    }
                  }}
                  disabled={currentStoryStep === 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    currentStoryStep === 0
                      ? 'opacity-30 cursor-not-allowed text-white/50'
                      : `${activeCardTheme.isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <button
                  onClick={() => {
                    if (currentStoryStep < 3) {
                      setCurrentStoryStep(currentStoryStep + 1);
                      setAutoplayActive(false);
                      playMagicalBell(600, 0.3);
                    }
                  }}
                  disabled={currentStoryStep === 3}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer ${
                    currentStoryStep === 3
                      ? 'opacity-30 cursor-not-allowed text-white/50'
                      : `${activeCardTheme.accentBtn}`
                  }`}
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
