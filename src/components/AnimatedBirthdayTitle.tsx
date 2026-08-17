import React from 'react';
import { motion } from 'motion/react';

/**
 * ============================================================================
 * ANIMATED BIRTHDAY TITLE COMPONENT
 * ============================================================================
 * Animates each letter with a bouncy staggered spring transition and themed gradient flow.
 */
interface AnimatedBirthdayTitleProps {
  text: string;
  themePreset: string;
}

export const AnimatedBirthdayTitle: React.FC<AnimatedBirthdayTitleProps> = ({
  text,
  themePreset,
}) => {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.2,
      },
    },
  };

  const charVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.4,
      rotate: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 140,
      },
    },
  };

  // Build gradient flow based on theme preset
  let gradientClass = '';
  if (themePreset === 'midnight') {
    gradientClass = 'bg-gradient-to-r from-cyan-400 via-pink-400 via-purple-400 to-indigo-400 animate-gradient-shift';
  } else if (themePreset === 'gold') {
    gradientClass = 'bg-gradient-to-r from-amber-500 via-yellow-400 via-orange-400 to-amber-700 animate-gradient-shift';
  } else if (themePreset === 'pastel') {
    gradientClass = 'bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-400 via-emerald-400 via-yellow-400 to-pink-500 animate-rainbow-flow';
  } else {
    gradientClass = 'bg-gradient-to-r from-rose-500 via-orange-500 via-yellow-400 to-pink-500 animate-gradient-shift';
  }

  return (
    <motion.h1
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6 bg-clip-text text-transparent ${gradientClass} filter drop-shadow-md select-none flex flex-wrap justify-center gap-x-3 gap-y-2 pb-2`}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="inline-block whitespace-nowrap">
          {Array.from(word).map((char, charIdx) => (
            <motion.span
              key={charIdx}
              variants={charVariants}
              className="inline-block cursor-default hover:text-yellow-300 transition-colors duration-150"
              style={{ display: 'inline-block' }}
              whileHover={{
                scale: 1.3,
                rotate: 12,
                y: -12,
                transition: { type: 'spring', stiffness: 450, damping: 12 },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
};
