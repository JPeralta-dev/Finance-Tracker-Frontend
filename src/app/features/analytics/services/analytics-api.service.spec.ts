/**
 * AnalyticsApiService — Unit Tests
 *
 * Tests retry logic, error handling, and endpoint behavior using
 * HttpClientTestingModule and HttpTestingController.
 */

import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AnalyticsApiService, DateRange } from './analytics-api.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('AnalyticsApiService', () => {
  let service: AnalyticsApiService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:3000/api/analytics';
  const mockDateRange: DateRange = {
    startDate: '2024-01-01',
    endDate: '2024-06-30',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AnalyticsApiService],
    });

    service = TestBed.inject(AnalyticsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── Retry Logic Tests ──────────────────────────────────────────────────

  describe('Retry on 503 → eventual success', () => {
    it('should retry twice on 503 then succeed on third attempt', fakeAsync(() => {
      const mockSummary = {
        totalIncome: 5000,
        totalExpenses: 3000,
        netSavings: 2000,
        savingsRate: 40,
        incomeChange: 10,
        expenseChange: 5,
      };

      let result: typeof mockSummary | undefined;
      let error: unknown;

      service.getSummary(mockDateRange).subscribe({
        next: (data) => {
          result = data;
        },
        error: (err) => {
          error = err;
        },
      });

      // First attempt → 503
      const firstReq = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`,
      );
      firstReq.flush({ error: 'Service Unavailable' }, { status: 503, statusText: 'Service Unavailable' });

      // Advance time past first retry delay (1s)
      tick(1100);

      // Second attempt → 503
      const secondReq = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`,
      );
      secondReq.flush({ error: 'Service Unavailable' }, { status: 503, statusText: 'Service Unavailable' });

      // Advance time past second retry delay (2s)
      tick(2100);

      // Third attempt → 200 (success)
      const thirdReq = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`,
      );
      thirdReq.flush(mockSummary);

      expect(result).toEqual(mockSummary);
      expect(error).toBeUndefined();
    }));

    it('should emit error after all retries exhausted', fakeAsync(() => {
      let result: unknown;
      let error: { status: number; message: string } | undefined;

      service.getSummary(mockDateRange).subscribe({
        next: (data) => {
          result = data;
        },
        error: (err) => {
          error = err;
        },
      });

      // First attempt → 503
      const firstReq = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`,
      );
      firstReq.flush({ error: 'Service Unavailable' }, { status: 503, statusText: 'Service Unavailable' });

      tick(1100);

      // Second attempt → 503
      const secondReq = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`,
      );
      secondReq.flush({ error: 'Service Unavailable' }, { status: 503, statusText: 'Service Unavailable' });

      tick(2100);

      // Third attempt → 503 (final failure)
      const thirdReq = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`,
      );
      thirdReq.flush({ error: 'Service Unavailable' }, { status: 503, statusText: 'Service Unavailable' });

      expect(result).toBeUndefined();
      expect(error).toBeDefined();
      expect(error?.status).toBe(503);
    }));

    it('should NOT retry on 404 (client error)', () => {
      let result: unknown;
      let error: { status: number } | undefined;

      service.getSummary(mockDateRange).subscribe({
        next: (data) => {
          result = data;
        },
        error: (err) => {
          error = err;
        },
      });

      // Single request → 404 (no retry for client errors)
      const req = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`,
      );
      req.flush({ error: 'Not Found' }, { status: 404, statusText: 'Not Found' });

      expect(result).toBeUndefined();
      expect(error?.status).toBe(404);

      // Should only have one request (no retries)
      httpMock.expectNone(`${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`);
    });
  });

  // ─── Endpoint Tests ─────────────────────────────────────────────────────

  describe('getSummary', () => {
    it('should call GET /api/analytics/summary with correct params', () => {
      const mockSummary = {
        totalIncome: 5000,
        totalExpenses: 3000,
        netSavings: 2000,
        savingsRate: 40,
        incomeChange: 10,
        expenseChange: 5,
      };

      service.getSummary(mockDateRange).subscribe((data) => {
        expect(data).toEqual(mockSummary);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSummary);
    });

    it('should call without params when no range provided', () => {
      service.getSummary().subscribe();

      const req = httpMock.expectOne(`${baseUrl}/summary`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('getMonthlyTrend', () => {
    it('should include months param with default value 6', () => {
      service.getMonthlyTrend(mockDateRange).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/monthly-trend?startDate=2024-01-01&endDate=2024-06-30&months=6`,
      );
      req.flush({ labels: [], income: [], expenses: [] });
    });

    it('should accept custom months value', () => {
      service.getMonthlyTrend(mockDateRange, undefined, 12).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/monthly-trend?startDate=2024-01-01&endDate=2024-06-30&months=12`,
      );
      req.flush({ labels: [], income: [], expenses: [] });
    });
  });

  describe('getCategoryBreakdown', () => {
    it('should return category breakdown data', () => {
      const mockBreakdown = {
        categories: [
          { name: 'Food', amount: 500, percentage: 30 },
          { name: 'Transport', amount: 200, percentage: 12 },
        ],
      };

      service.getCategoryBreakdown(mockDateRange).subscribe((data) => {
        expect(data.categories.length).toBe(2);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/category-breakdown?startDate=2024-01-01&endDate=2024-06-30`,
      );
      req.flush(mockBreakdown);
    });
  });

  describe('getBanks', () => {
    it('should call GET /api/analytics/banks without params', () => {
      const mockBanks = {
        banks: [
          { id: '1', name: 'Bank A', logo: '/logos/a.png' },
          { id: '2', name: 'Bank B', logo: '/logos/b.png' },
        ],
      };

      service.getBanks().subscribe((data) => {
        expect(data.banks.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/banks`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBanks);
    });
  });

  describe('getInsights', () => {
    it('should return insights wrapped in object', () => {
      const mockInsights = {
        insights: [
          { type: 'spending', message: 'High spending', severity: 'high', actionable: true },
        ],
      };

      service.getInsights(mockDateRange).subscribe((data) => {
        expect(data.insights.length).toBe(1);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/insights?startDate=2024-01-01&endDate=2024-06-30`,
      );
      req.flush(mockInsights);
    });
  });

  describe('getRecentTransactions', () => {
    it('should include limit param with default value 10', () => {
      service.getRecentTransactions(mockDateRange).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/transactions?startDate=2024-01-01&endDate=2024-06-30&limit=10`,
      );
      req.flush({ transactions: [] });
    });
  });

  describe('bankId filter', () => {
    it('should include bankId param when provided', () => {
      service.getSummary(mockDateRange, 'bank-123').subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/summary?startDate=2024-01-01&endDate=2024-06-30&bankId=bank-123`,
      );
      req.flush({});
    });
  });

  describe('error handling', () => {
    it('should transform HTTP error into AnalyticsApiError', () => {
      let error: { status: number; message: string; details?: string; retryable: boolean } | undefined;

      service.getSummary().subscribe({
        error: (err) => {
          error = err;
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/summary`);
      req.flush(
        { error: 'Internal Server Error', details: 'DB connection failed' },
        { status: 500, statusText: 'Internal Server Error' },
      );

      expect(error?.status).toBe(500);
      expect(error?.message).toBe('Internal Server Error');
      expect(error?.details).toBe('DB connection failed');
      expect(error?.retryable).toBe(true);
    });

    it('should mark network errors (status 0) as retryable', () => {
      let error: { retryable: boolean } | undefined;

      service.getSummary().subscribe({
        error: (err) => {
          error = err;
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/summary`);
      req.error(new ProgressEvent('Network error'));

      expect(error?.retryable).toBe(true);
    });
  });
});
