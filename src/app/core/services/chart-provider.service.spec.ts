import { TestBed } from '@angular/core/testing';
import { ChartProviderService } from './chart-provider.service';

describe('ChartProviderService', () => {
  let service: ChartProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isReady() before ensureChart() resolves', () => {
    expect(service.isReady()).toBe(false);
  });

  it('should return the same promise on multiple ensureChart() calls', async () => {
    const promise1 = service.ensureChart();
    const promise2 = service.ensureChart();
    expect(promise1).toBe(promise2);
    await promise1;
  });

  it('should set isReady() to true after ensureChart() resolves', async () => {
    await service.ensureChart();
    expect(service.isReady()).toBe(true);
  });
});
