import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import { ProfileInsightsCardComponent } from './profile-insights-card.component';
import { TranslationService } from '../../../core/services/translation.service';
import type { Insight } from '../../../core/models/insight.model';

@Component({
  template: `<app-profile-insights-card [userStats]="stats" [insights]="insights" [delay]="50" />`,
  imports: [ProfileInsightsCardComponent],
})
class TestHostComponent {
  stats = input.required<{ totalTransactions: number; accountAge: string } | null>();
  insights = input.required<Insight[]>();
}

describe('ProfileInsightsCardComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  const mockTranslationService = {
    translate: (key: string) => key,
  };

  const mockStats = {
    totalTransactions: 42,
    accountAge: '2 years',
  };

  const mockInsights: Insight[] = [
    {
      id: '1',
      type: 'info',
      titleKey: 'insights.spendingTrend',
      messageKey: 'insights.spendingTrendMsg',
      severity: 'low',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
  });

  it('should create with stats', () => {
    (hostComponent as any).stats = mockStats;
    (hostComponent as any).insights = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile-card')).toBeTruthy();
  });

  it('should render stats when userStats is provided', () => {
    (hostComponent as any).stats = mockStats;
    (hostComponent as any).insights = [];
    fixture.detectChanges();

    const statValues = fixture.nativeElement.querySelectorAll('.stat-value');
    expect(statValues.length).toBe(2);
    expect(statValues[0].textContent.trim()).toBe('2 years');
    expect(statValues[1].textContent.trim()).toBe('42');
  });

  it('should not render card when no stats and no insights', () => {
    (hostComponent as any).stats = null;
    (hostComponent as any).insights = [];
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.profile-card');
    expect(card).toBeNull();
  });

  it('should render card when insights exist but no stats', () => {
    (hostComponent as any).stats = null;
    (hostComponent as any).insights = mockInsights;
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.profile-card');
    expect(card).toBeTruthy();
  });

  it('should render insights panel when insights are provided', () => {
    (hostComponent as any).stats = mockStats;
    (hostComponent as any).insights = mockInsights;
    fixture.detectChanges();

    const insightsPanel = fixture.nativeElement.querySelector('ft-insights-panel');
    expect(insightsPanel).toBeTruthy();
  });
});
