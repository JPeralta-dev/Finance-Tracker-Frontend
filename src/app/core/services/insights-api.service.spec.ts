import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InsightsApiService } from './insights-api.service';
import { FinancialHealthOverview } from '../models/insight.model';
import { environment } from '../../../environments/environment';

describe('InsightsApiService', () => {
  let service: InsightsApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InsightsApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(InsightsApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should fetch financial health overview', () => {
    const mockOverview: FinancialHealthOverview = {
      healthScore: 85,
      healthLevel: 'good',
      summaryHeadline: 'Tus metas van al día',
      goalsSummary: { totalGoals: 2, onTrack: 2, atRisk: 0, critical: 0, achieved: 0 },
      savingsMetrics: { monthlySavingsRate: 25, targetSavingsRate: 20, netSavedThisMonth: 500000 },
      insightsCount: { highPriority: 0, opportunities: 1 },
    };

    service.getHealthOverview().subscribe((res) => {
      expect(res.healthScore).toBe(85);
      expect(res.healthLevel).toBe('good');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/api/insights/overview`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOverview);
  });

  it('should fetch actionable insights list', () => {
    service.getActionableInsights().subscribe((res) => {
      expect(res.insights.length).toBe(1);
      expect(res.insights[0].category).toBe('pacing_alert');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/api/insights`);
    expect(req.request.method).toBe('GET');
    req.flush({
      insights: [
        {
          id: 'ins-1',
          category: 'pacing_alert',
          severity: 'high',
          title: 'Ritmo de Insumos',
          message: 'Llevas 70% gastado',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  });
});
