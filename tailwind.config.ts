/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Color System ───────────────────────────────────────────
      colors: {
        // Backgrounds — obsidian palette
        bg: {
          primary: '#0A0E17',
          secondary: '#0F1623',
          tertiary: '#151D2E',
          elevated: '#1A2337',
        },
        // Glass surfaces
        glass: {
          DEFAULT: 'rgba(15, 22, 35, 0.72)',
          border: 'rgba(255, 255, 255, 0.06)',
          'border-hover': 'rgba(255, 255, 255, 0.12)',
        },
        // Accent gradient
        accent: {
          start: '#06D6A0',
          mid: '#118DFF',
          end: '#6C63FF',
        },
        // Semantic
        success: {
          DEFAULT: '#06D6A0',
          bg: 'rgba(6, 214, 160, 0.1)',
        },
        danger: {
          DEFAULT: '#FF6B6B',
          bg: 'rgba(255, 107, 107, 0.1)',
        },
        warning: {
          DEFAULT: '#FFD93D',
          bg: 'rgba(255, 217, 61, 0.1)',
        },
        info: {
          DEFAULT: '#118DFF',
          bg: 'rgba(17, 141, 255, 0.1)',
        },
        // Text
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          inverse: '#0A0E17',
        },
        // Borders
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          strong: 'rgba(255, 255, 255, 0.16)',
        },
      },

      // ─── Typography ─────────────────────────────────────────────
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0.015em' }],
        base: ['0.875rem', { lineHeight: '1.5rem' }],
        lg: ['1rem', { lineHeight: '1.75rem' }],
        xl: ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '4xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '5xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
      },

      // ─── Spacing ────────────────────────────────────────────────
      spacing: {
        '4.5': '18px',
      },

      // ─── Border Radius ──────────────────────────────────────────
      borderRadius: {
        xs: '4px',
        sm: '8px',
        DEFAULT: '12px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },

      // ─── Shadows (dark-adapted) ─────────────────────────────────
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px rgba(0, 0, 0, 0.35)',
        lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
        xl: '0 16px 48px rgba(0, 0, 0, 0.45)',
        'glow-accent': '0 0 24px rgba(6, 214, 160, 0.15)',
        'glow-success': '0 0 20px rgba(6, 214, 160, 0.2)',
        'glow-danger': '0 0 20px rgba(255, 107, 107, 0.2)',
      },

      // ─── Backdrop Blur ──────────────────────────────────────────
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '24px',
      },

      // ─── Animation Timings ──────────────────────────────────────
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
        slower: '600ms',
      },

      // ─── Keyframes ──────────────────────────────────────────────
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'gradient': 'gradient-shift 4s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },

      // ─── Max Width ──────────────────────────────────────────────
      maxWidth: {
        'app': '1440px',
      },
    },
  },
  plugins: [],
};
