import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsightsPanelComponent } from './insights-panel.component';
import { TranslationService } from '../../../core/services/translation.service';
import type { Insight } from '../../../core/models/insight.model';

describe('InsightsPanelComponent (shared)', () => {
  let component: InsightsPanelComponent;
  let fixture: ComponentFixture<InsightsPanelComponent>;

  const mockTranslationService = {
    translate: (key: string, params?: Record<string, number | string>) => {
      if (params) return `${key} [${JSON.stringify(params)}]`;
      return key;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InsightsPanelComponent],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    });

    fixture = TestBed.createComponent(InsightsPanelComponent);
    component = fixture.componentInstance;
  });

  describe('Empty state', () => {
    it('should show empty message when insights array is empty', () => {
      component.insights = [];
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const emptyEl = el.querySelector('.insights-empty');
      expect(emptyEl).toBeTruthy();
      expect(emptyEl!.textContent).toContain('insights.empty');
    });
  });

  describe('With insights data', () => {
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'warning',
        titleKey: 'insights.highSpending',
        messageKey: 'insights.highSpendingMsg',
        severity: 'high',
        data: { category: 'Food' },
      },
      {
        id: '2',
        type: 'success',
        titleKey: 'insights.savingsGoal',
        messageKey: 'insights.savingsGoalMsg',
        severity: 'low',
      },
    ];

    it('should render insight cards when insights are provided', () => {
      component.insights = mockInsights;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const cards = el.querySelectorAll('.insight-card');
      expect(cards.length).toBe(2);
    });

    it('should display translated title with data params', () => {
      component.insights = mockInsights;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const title = el.querySelector('.insight-title');
      expect(title!.textContent).toContain('insights.highSpending');
    });

    it('should apply severity class based on insight severity', () => {
      component.insights = mockInsights;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const cards = el.querySelectorAll('.insight-card');
      expect(cards[0].classList.contains('severity-high')).toBe(true);
      expect(cards[1].classList.contains('severity-low')).toBe(true);
    });
  });

  describe('typeIcon()', () => {
    it('should return warning icon for warning type', () => {
      expect(component.typeIcon('warning')).toBe('⚠️');
    });

    it('should return success icon for success type', () => {
      expect(component.typeIcon('success')).toBe('✅');
    });

    it('should return info icon for info type', () => {
      expect(component.typeIcon('info')).toBe('ℹ️');
    });

    it('should return trend icon for trend type', () => {
      expect(component.typeIcon('trend')).toBe('📈');
    });

    it('should return default bulb icon for unknown type', () => {
      expect(component.typeIcon('unknown')).toBe('💡');
    });
  });

  describe('severityClass()', () => {
    it('should return severity-high for high', () => {
      expect(component.severityClass('high')).toBe('severity-high');
    });

    it('should return severity-medium for medium', () => {
      expect(component.severityClass('medium')).toBe('severity-medium');
    });

    it('should return severity-low for low', () => {
      expect(component.severityClass('low')).toBe('severity-low');
    });

    it('should return empty string for unknown severity', () => {
      expect(component.severityClass('unknown')).toBe('');
    });
  });
});
