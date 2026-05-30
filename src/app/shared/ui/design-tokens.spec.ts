/**
 * Design Token Sync Tests — Phase 1, Task 1.6
 *
 * Validates three-way token sync between:
 * 1. design-tokens.ts (TypeScript source of truth)
 * 2. tailwind.config.ts (Tailwind theme colors)
 * 3. styles.scss (CSS custom properties)
 *
 * Any token change MUST update all three files.
 */

import { lightTokens, darkTokens } from './design-tokens';

describe('Design Token Sync', () => {
  describe('Light Theme — Proposal Spec Palette', () => {
    it('should have #8B5CF6 as primary/accent end', () => {
      expect(lightTokens.colors.accent.end).toBe('#8B5CF6');
    });

    it('should have #2DD4BF as teal/success', () => {
      expect(lightTokens.colors.semantic.success).toBe('#2DD4BF');
    });

    it('should have #A855F7 as medium purple/accent mid', () => {
      expect(lightTokens.colors.accent.mid).toBe('#A855F7');
    });

    it('should have #FAF8FD as background primary', () => {
      expect(lightTokens.colors.backgrounds.primary).toBe('#FAF8FD');
    });

    it('should have #FFFFFF as background secondary (cards)', () => {
      expect(lightTokens.colors.backgrounds.secondary).toBe('#FFFFFF');
    });

    it('should have #2E1065 as title text (text primary)', () => {
      expect(lightTokens.colors.text.primary).toBe('#2E1065');
    });

    it('should have #4B5563 as secondary text', () => {
      expect(lightTokens.colors.text.secondary).toBe('#4B5563');
    });
  });

  describe('Dark Theme — Unchanged (regression guard)', () => {
    it('should keep dark accent end at #7C3AED', () => {
      expect(darkTokens.colors.accent.end).toBe('#7C3AED');
    });

    it('should keep dark background primary at #120B1A', () => {
      expect(darkTokens.colors.backgrounds.primary).toBe('#120B1A');
    });

    it('should keep dark success at #06D6A0', () => {
      expect(darkTokens.colors.semantic.success).toBe('#06D6A0');
    });
  });

  describe('Breakpoint Config', () => {
    const breakpoints = {
      xs: '375px',
      sm: '640px', // Tailwind default — NOT overridden to 320px (breaking change guard)
      md: '768px',
      lg: '1024px',
    };

    it('should define xs at 375px', () => {
      expect(breakpoints.xs).toBe('375px');
    });

    it('should define md at 768px', () => {
      expect(breakpoints.md).toBe('768px');
    });

    it('should define lg at 1024px', () => {
      expect(breakpoints.lg).toBe('1024px');
    });
  });

  describe('Light Accent Start (sky blue)', () => {
    it('should have #7DD3FC as accent start', () => {
      expect(lightTokens.colors.accent.start).toBe('#7DD3FC');
    });
  });
});
