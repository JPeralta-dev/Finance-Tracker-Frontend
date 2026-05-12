/**
 * Design Tokens — Obsidian Glass
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
 * Dark theme tokens (default)
 */
export const darkTokens: DesignTokens = {
  colors: {
    backgrounds: {
      primary: '#0A0E17',
      secondary: '#0F1623',
      tertiary: '#151D2E',
      elevated: '#1A2337',
    },
    glass: {
      bg: 'rgba(15, 22, 35, 0.72)',
      border: 'rgba(255, 255, 255, 0.06)',
      borderHover: 'rgba(255, 255, 255, 0.12)',
    },
    accent: {
      start: '#06D6A0',
      mid: '#118DFF',
      end: '#6C63FF',
      glow: 'rgba(6, 214, 160, 0.15)',
    },
    semantic: {
      success: '#06D6A0',
      successBg: 'rgba(6, 214, 160, 0.1)',
      danger: '#FF6B6B',
      dangerBg: 'rgba(255, 107, 107, 0.1)',
      warning: '#FFD93D',
      warningBg: 'rgba(255, 217, 61, 0.1)',
      info: '#118DFF',
      infoBg: 'rgba(17, 141, 255, 0.1)',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      tertiary: '#64748B',
      inverse: '#0A0E17',
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
 * Light theme tokens (future — not active yet)
 */
export const lightTokens: DesignTokens = {
  colors: {
    backgrounds: {
      primary: '#F8FAFC',
      secondary: '#FFFFFF',
      tertiary: '#F1F5F9',
      elevated: '#E2E8F0',
    },
    glass: {
      bg: 'rgba(255, 255, 255, 0.72)',
      border: 'rgba(0, 0, 0, 0.06)',
      borderHover: 'rgba(0, 0, 0, 0.12)',
    },
    accent: {
      start: '#059669',
      mid: '#2563EB',
      end: '#7C3AED',
      glow: 'rgba(5, 150, 105, 0.15)',
    },
    semantic: {
      success: '#059669',
      successBg: 'rgba(5, 150, 105, 0.1)',
      danger: '#DC2626',
      dangerBg: 'rgba(220, 38, 38, 0.1)',
      warning: '#D97706',
      warningBg: 'rgba(217, 119, 6, 0.1)',
      info: '#2563EB',
      infoBg: 'rgba(37, 99, 235, 0.1)',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF',
    },
    borders: {
      subtle: 'rgba(0, 0, 0, 0.06)',
      default: 'rgba(0, 0, 0, 0.1)',
      strong: 'rgba(0, 0, 0, 0.16)',
    },
  },
  spacing: darkTokens.spacing,
  radius: darkTokens.radius,
  animation: darkTokens.animation,
};
