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
      component.loading = false;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const emptyEl = el.querySelector('.insights-empty');
      expect(emptyEl).toBeTruthy();
      expect(emptyEl!.textContent).toContain('insights.empty');
    });
  });

  describe('Loading state', () => {
    it('should render 3 skeleton cards when loading=true', () => {
      component.loading = true;
      component.insights = [];
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const skeletons = el.querySelectorAll('.insight-card--skeleton');
      expect(skeletons.length).toBe(3);
    });

    it('should show skeleton icon, title, and message placeholders', () => {
      component.loading = true;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const icon = el.querySelector('.insight-icon--skeleton');
      const title = el.querySelector('.insight-title--skeleton');
      const message = el.querySelector('.insight-message--skeleton');
      expect(icon).toBeTruthy();
      expect(title).toBeTruthy();
      expect(message).toBeTruthy();
    });

    it('should hide real insights when loading=true even if insights exist', () => {
      component.loading = true;
      component.insights = mockInsights;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const skeletons = el.querySelectorAll('.insight-card--skeleton');
      const realCards = el.querySelectorAll('.insight-card:not(.insight-card--skeleton)');
      expect(skeletons.length).toBe(3);
      expect(realCards.length).toBe(0);
    });

    it('should show real insights when loading=false', () => {
      component.loading = false;
      component.insights = mockInsights;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const skeletons = el.querySelectorAll('.insight-card--skeleton');
      const realCards = el.querySelectorAll('.insight-card:not(.insight-card--skeleton)');
      expect(skeletons.length).toBe(0);
      expect(realCards.length).toBe(2);
    });
  });

  describe('With insights data', () => {
    it('should render insight cards when insights are provided', () => {
      component.loading = false;
      component.insights = mockInsights;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const cards = el.querySelectorAll('.insight-card');
      expect(cards.length).toBe(2);
    });

    it('should display translated title with data params', () => {
      component.loading = false;
      component.insights = mockInsights;
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      const title = el.querySelector('.insight-title');
      expect(title!.textContent).toContain('insights.highSpending');
    });

    it('should apply severity class based on insight severity', () => {
      component.loading = false;
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
      expect(component.typeIcon('warning')).toBe('!');
    });

    it('should return success icon for success type', () => {
      expect(component.typeIcon('success')).toBe('+');
    });

    it('should return info icon for info type', () => {
      expect(component.typeIcon('info')).toBe('i');
    });

    it('should return trend icon for trend type', () => {
      expect(component.typeIcon('trend')).toBe('~');
    });

    it('should return default bulb icon for unknown type', () => {
      expect(component.typeIcon('unknown')).toBe('*');
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
