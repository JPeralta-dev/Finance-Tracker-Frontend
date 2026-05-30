/**
 * Design Tokens — Sky Lavender & Amatista (light) / Deep Plum & Amethyst (dark)
 *
 * Single source of truth for the design system.
 * These values MUST match tailwind.config.ts and styles.scss.
 */

export interface ColorTokens {
  backgrounds: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  glass: {
    bg: string;
    border: string;
    borderHover: string;
  };
  accent: {
    start: string;
    mid: string;
    end: string;
    glow: string;
  };
  semantic: {
    success: string;
    successBg: string;
    danger: string;
    dangerBg: string;
    warning: string;
    warningBg: string;
    info: string;
    infoBg: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  borders: {
    subtle: string;
    default: string;
    strong: string;
  };
}

export interface SpacingTokens {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
}

export interface RadiusTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface AnimationTokens {
  easeOut: string;
  easeSmooth: string;
  easeSpring: string;
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  durationSlower: string;
}

export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  animation: AnimationTokens;
}

/**
 * Dark theme tokens — "Deep Plum & Amethyst" (default)
 */
export const darkTokens: DesignTokens = {
  colors: {
    backgrounds: {
      primary: '#120B1A',
      secondary: '#1D1426',
      tertiary: '#2A1E35',
      elevated: '#362845',
    },
    glass: {
      bg: 'rgba(29, 20, 38, 0.72)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.16)',
    },
    accent: {
      start: '#D946EF',
      mid: '#A855F7',
      end: '#7C3AED',
      glow: 'rgba(217, 70, 239, 0.18)',
    },
    semantic: {
      success: '#06D6A0',
      successBg: 'rgba(6, 214, 160, 0.1)',
      danger: '#FF6B6B',
      dangerBg: 'rgba(255, 107, 107, 0.1)',
      warning: '#FFD93D',
      warningBg: 'rgba(255, 217, 61, 0.1)',
      info: '#A78BFA',
      infoBg: 'rgba(167, 139, 250, 0.15)',
    },
    text: {
      primary: '#F3E8FF',
      secondary: 'rgba(243, 232, 255, 0.75)',
      tertiary: 'rgba(243, 232, 255, 0.45)',
      inverse: '#120B1A',
    },
    borders: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      default: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.16)',
    },
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  animation: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeSmooth: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
    easeSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    durationFast: '150ms',
    durationNormal: '250ms',
    durationSlow: '400ms',
    durationSlower: '600ms',
  },
};

/**
 * Light theme tokens — "Sky Lavender & Amatista"
 */
export const lightTokens: DesignTokens = {
  colors: {
    backgrounds: {
      primary: '#F4F6FB',
      secondary: '#FFFFFF',
      tertiary: '#E8ECF4',
      elevated: '#DCE2EE',
    },
    glass: {
      bg: 'rgba(255, 255, 255, 0.75)',
      border: 'rgba(0, 0, 0, 0.06)',
      borderHover: 'rgba(0, 0, 0, 0.12)',
    },
    accent: {
      start: '#7DD3FC',
      mid: '#A78BFA',
      end: '#8B5CF6',
      glow: 'rgba(167, 139, 250, 0.22)',
    },
    semantic: {
      success: '#059669',
      successBg: 'rgba(5, 150, 105, 0.1)',
      danger: '#DC2626',
      dangerBg: 'rgba(220, 38, 38, 0.1)',
      warning: '#D97706',
      warningBg: 'rgba(217, 119, 6, 0.1)',
      info: '#6366F1',
      infoBg: 'rgba(99, 102, 241, 0.08)',
    },
    text: {
      primary: '#1E293B',
      secondary: 'rgba(30, 41, 59, 0.72)',
      tertiary: 'rgba(30, 41, 59, 0.45)',
      inverse: '#FFFFFF',
    },
    borders: {
      subtle: 'rgba(0, 0, 0, 0.05)',
      default: 'rgba(0, 0, 0, 0.08)',
      strong: 'rgba(0, 0, 0, 0.14)',
    },
  },
  spacing: darkTokens.spacing,
  radius: darkTokens.radius,
  animation: darkTokens.animation,
};
