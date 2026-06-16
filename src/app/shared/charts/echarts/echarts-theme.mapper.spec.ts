/**
 * EchartsThemeMapper — Unit Tests
 *
 * Tests CSS variable resolution with mocked getComputedStyle.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EchartsThemeMapper } from './echarts-theme.mapper';

describe('EchartsThemeMapper', () => {
  let mapper: EchartsThemeMapper;
  let originalGetComputedStyle: typeof window.getComputedStyle;

  beforeEach(() => {
    // Store original
    originalGetComputedStyle = window.getComputedStyle;

    TestBed.configureTestingModule({
      providers: [EchartsThemeMapper],
    });

    mapper = TestBed.inject(EchartsThemeMapper);
  });

  afterEach(() => {
    // Restore original
    window.getComputedStyle = originalGetComputedStyle;
  });

  describe('CSS variable resolution', () => {
    it('should resolve CSS variables via getComputedStyle', () => {
      // Mock getComputedStyle
      spyOn(window, 'getComputedStyle').and.returnValue({
        getPropertyValue: (name: string) => {
          const vars: Record<string, string> = {
            '--text-primary': '#FFFFFF',
            '--text-secondary': 'rgba(255,255,255,0.7)',
            '--text-tertiary': 'rgba(255,255,255,0.4)',
            '--chart-grid': 'rgba(255,255,255,0.1)',
            '--bg-secondary': '#1a1a2e',
            '--bg-tertiary': '#16213e',
            '--glass-border': 'rgba(255,255,255,0.1)',
            '--success': '#06D6A0',
            '--danger': '#FF6B6B',
            '--accent-start': '#9D50BB',
            '--accent-mid': '#7B42F6',
            '--accent-end': '#6E48AA',
            '--info': '#A78BFA',
          };
          return vars[name] || '';
        },
      } as unknown as CSSStyleDeclaration);

      // Force refresh to re-read CSS vars
      mapper.refresh();

      const theme = mapper.theme();

      expect(theme).toBeDefined();
      expect(theme.textStyle).toBeDefined();
      expect((theme.textStyle as any).color).toBe('#FFFFFF');
    });

    it('should use fallback colors when CSS var is missing', () => {
      // Mock getComputedStyle returning empty values
      spyOn(window, 'getComputedStyle').and.returnValue({
        getPropertyValue: () => '',
      } as unknown as CSSStyleDeclaration);

      // Suppress console.warn in tests
      spyOn(console, 'warn');

      mapper.refresh();
      const theme = mapper.theme();

      expect(theme).toBeDefined();
      // Should use default fallback values
      expect(theme.textStyle).toBeDefined();
      expect((theme.textStyle as any).color).toBe('#F3E8FF');
    });

    it('should log warning when CSS var is missing', () => {
      spyOn(window, 'getComputedStyle').and.returnValue({
        getPropertyValue: () => '',
      } as unknown as CSSStyleDeclaration);

      const warnSpy = spyOn(console, 'warn');

      mapper.refresh();

      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.calls.first().args[0]).toContain('--text-primary');
    });
  });

  describe('theme building', () => {
    beforeEach(() => {
      spyOn(window, 'getComputedStyle').and.returnValue({
        getPropertyValue: (name: string) => {
          const vars: Record<string, string> = {
            '--text-primary': '#FFFFFF',
            '--text-secondary': 'rgba(255,255,255,0.7)',
            '--text-tertiary': 'rgba(255,255,255,0.4)',
            '--chart-grid': 'rgba(255,255,255,0.1)',
            '--bg-secondary': '#1a1a2e',
            '--bg-tertiary': '#16213e',
            '--glass-border': 'rgba(255,255,255,0.1)',
            '--success': '#06D6A0',
            '--danger': '#FF6B6B',
            '--accent-start': '#9D50BB',
            '--accent-mid': '#7B42F6',
            '--accent-end': '#6E48AA',
            '--info': '#A78BFA',
          };
          return vars[name] || '';
        },
      } as unknown as CSSStyleDeclaration);

      mapper.refresh();
    });

    it('should build area chart option with correct structure', () => {
      const option = mapper.buildAreaOption(
        ['Jan', 'Feb', 'Mar'],
        [{ label: 'Income', data: [100, 200, 150], color: '#06D6A0' }],
        'Monthly Income',
      );

      expect(option).toBeDefined();
      expect(option.title).toBeDefined();
      expect(option.series).toBeDefined();
      expect((option.series as any[]).length).toBe(1);
      expect((option.series as any[])[0].type).toBe('line');
    });

    it('should build bar chart option with correct structure', () => {
      const option = mapper.buildBarOption(
        ['Jan', 'Feb', 'Mar'],
        [
          { label: 'Income', data: [100, 200, 150], color: '#06D6A0' },
          { label: 'Expenses', data: [80, 120, 100], color: '#FF6B6B' },
        ],
      );

      expect(option).toBeDefined();
      expect((option.series as any[]).length).toBe(2);
      expect((option.series as any[])[0].type).toBe('bar');
      expect((option.series as any[])[1].type).toBe('bar');
    });

    it('should build donut chart option with correct structure', () => {
      const option = mapper.buildDonutOption(
        ['Food', 'Transport', 'Entertainment'],
        [300, 150, 200],
        'Spending by Category',
      );

      expect(option).toBeDefined();
      expect(option.series).toBeDefined();
      expect((option.series as any[]).length).toBe(1);
      expect((option.series as any[])[0].type).toBe('pie');
      expect((option.series as any[])[0].radius).toEqual(['55%', '75%']);
    });

    it('should provide category colors array', () => {
      const colors = mapper.categoryColors();
      expect(colors.length).toBe(10);
      expect(colors[0]).toBe('#9D50BB');
    });
  });

  describe('theme reactivity', () => {
    it('should refresh theme when refresh() is called', () => {
      let callCount = 0;
      spyOn(window, 'getComputedStyle').and.callFake(() => {
        callCount++;
        return {
          getPropertyValue: (name: string) => {
            if (name === '--text-primary') {
              return callCount === 1 ? '#000000' : '#FFFFFF';
            }
            return '';
          },
        } as unknown as CSSStyleDeclaration;
      });

      const theme1 = mapper.theme();
      expect((theme1.textStyle as any).color).toBe('#000000');

      mapper.refresh();

      const theme2 = mapper.theme();
      expect((theme2.textStyle as any).color).toBe('#FFFFFF');
    });
  });
});
