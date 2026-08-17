import React from 'react';

/**
 * ============================================================================
 * LOTTIE PLAYER COMPONENT
 * ============================================================================
 * Wrapper for custom web component <lottie-player> to render vector animations.
 */
interface LottiePlayerProps {
  src: string;
  speed?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  src,
  speed = 1,
  loop = true,
  autoplay = true,
  className = '',
  style = {}
}) => {
  return React.createElement('lottie-player', {
    src,
    background: 'transparent',
    speed,
    loop: loop ? true : undefined,
    autoplay: autoplay ? true : undefined,
    class: className,
    style
  });
};
