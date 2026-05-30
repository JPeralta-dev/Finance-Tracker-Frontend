import { TestBed } from '@angular/core/testing';
import { ChartService } from './chart.service';
import { CurrencyService } from '../../core/services/currency.service';

describe('ChartService — Currency Integration', () => {
  let chartService: ChartService;
  let currencyService: CurrencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChartService, CurrencyService],
    });
    chartService = TestBed.inject(ChartService);
    currencyService = TestBed.inject(CurrencyService);
  });

  describe('createAreaConfig tooltip', () => {
    it('should use currency service formatShort in tooltip label', () => {
      const config = chartService.createAreaConfig(
        ['Jan', 'Feb'],
        [{ label: 'Income', data: [1000, 2000], color: '#06D6A0' }],
      ) as { options: { plugins: { tooltip: { callbacks: { label: Function } } } } };

      const mockContext = {
        parsed: { y: 1500 },
        dataset: { label: 'Income' },
      };

      const result = config.options.plugins.tooltip.callbacks.label(mockContext);
      expect(result).toContain('$');
      expect(result).toContain('Income');
    });

    it('should reflect currency changes when config is recreated', () => {
      currencyService.setCurrency({ symbol: '€', locale: 'de-DE' });

      const config = chartService.createAreaConfig(
        ['Jan'],
        [{ label: 'Expense', data: [500], color: '#FF6B6B' }],
      ) as { options: { plugins: { tooltip: { callbacks: { label: Function } } } } };

      const mockContext = {
        parsed: { y: 500 },
        dataset: { label: 'Expense' },
      };

      const result = config.options.plugins.tooltip.callbacks.label(mockContext);
      expect(result).toContain('€');
    });
  });

  describe('createDonutConfig tooltip', () => {
    it('should use currency service format in donut tooltip label', () => {
      const config = chartService.createDonutConfig(
        ['Food', 'Transport'],
        [300, 200],
        ['#06D6A0', '#FF6B6B'],
      ) as { options: { plugins: { tooltip: { callbacks: { label: Function } } } } };

      const mockContext = {
        parsed: 300,
        label: 'Food',
        chart: {
          data: {
            datasets: [{ data: [300, 200] }],
          },
        },
      };

      const result = config.options.plugins.tooltip.callbacks.label(mockContext);
      expect(result).toContain('$');
      expect(result).toContain('Food');
      expect(result).toContain('60.0%');
    });

    it('should reflect EUR currency in donut tooltip after change', () => {
      currencyService.setCurrency({ symbol: '€', locale: 'de-DE' });

      const config = chartService.createDonutConfig(
        ['Food'],
        [500],
        ['#06D6A0'],
      ) as { options: { plugins: { tooltip: { callbacks: { label: Function } } } } };

      const mockContext = {
        parsed: 500,
        label: 'Food',
        chart: {
          data: {
            datasets: [{ data: [500] }],
          },
        },
      };

      const result = config.options.plugins.tooltip.callbacks.label(mockContext);
      expect(result).toContain('€');
    });
  });

  describe('y-axis tick callback', () => {
    it('should use currency service formatShort in y-axis ticks', () => {
      const config = chartService.createAreaConfig(
        ['Jan'],
        [{ label: 'Income', data: [1000], color: '#06D6A0' }],
      ) as { options: { scales: { y: { ticks: { callback: Function } } } } };

      const result = config.options.scales.y.ticks.callback(5000);
      expect(result).toContain('$');
      expect(result).toContain('k');
    });
  });
});
