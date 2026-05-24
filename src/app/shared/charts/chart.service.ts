import { Injectable, inject } from '@angular/core';
import { CurrencyService } from '../../core/services/currency.service';

/**
 * ChartService — Theme-aware Chart.js configuration.
 * Reads CSS custom properties so charts adapt to dark/light themes automatically.
 */
@Injectable({ providedIn: 'root' })
export class ChartService {
  private currencyService = inject(CurrencyService);
  // ─── Read colors from CSS custom properties (theme-aware) ────────
  private get css() {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    const get = (name: string) => style.getPropertyValue(name).trim();

    return {
      textPrimary: get('--text-primary') || '#F3E8FF',
      textSecondary: get('--text-secondary') || 'rgba(243,232,255,0.7)',
      textTertiary: get('--text-tertiary') || 'rgba(243,232,255,0.4)',
      gridColor: get('--chart-grid') || 'rgba(255,255,255,0.06)',
      bgSecondary: get('--bg-secondary') || '#1D1426',
      bgTertiary: get('--bg-tertiary') || '#2A1E35',
      borderColor: get('--glass-border') || 'rgba(255,255,255,0.08)',
      success: get('--success') || '#06D6A0',
      danger: get('--danger') || '#FF6B6B',
    };
  }

  // ─── Default Scale Config ────────────────────────────────────────
  private get defaultScales() {
    const c = this.css;
    return {
      x: {
        grid: { display: false },
        ticks: {
          color: c.textTertiary,
          font: { family: 'Inter, sans-serif', size: 11 },
        },
      },
      y: {
        grid: { color: c.gridColor },
        ticks: {
          color: c.textTertiary,
          font: { family: 'Inter, sans-serif', size: 11 },
          callback: (v: number) => this.currencyService.formatShort(v),
        },
      },
    };
  }

  // ─── Default Plugin Config ───────────────────────────────────────
  private get defaultPlugins() {
    const c = this.css;
    return {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.bgTertiary,
        titleColor: c.textPrimary,
        bodyColor: c.textSecondary,
        borderColor: c.borderColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Space Grotesk, sans-serif', weight: '600' as const },
        bodyFont: { family: 'Inter, sans-serif' },
        displayColors: true,
        boxPadding: 4,
      },
    };
  }

  /**
   * Create area chart config with gradient fills.
   */
  createAreaConfig(
    labels: string[],
    datasets: { label: string; data: number[]; color: string }[],
  ): unknown {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const c = this.css;

    return {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds) => {
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, ds.color + '30');
          gradient.addColorStop(1, ds.color + '00');

          return {
            label: ds.label,
            data: ds.data,
            borderColor: ds.color,
            backgroundColor: gradient,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: ds.color,
            pointHoverBorderColor: c.bgSecondary,
            pointHoverBorderWidth: 2,
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
          ...this.defaultPlugins,
          tooltip: {
            ...this.defaultPlugins.tooltip,
            callbacks: {
              label: (context: { parsed: { y?: number }; dataset: { label?: string } }) => {
                const val = context.parsed.y ?? 0;
                return ` ${context.dataset.label}: ${this.currencyService.formatShort(val)}`;
              },
            },
          },
        },
        scales: this.defaultScales,
      },
    };
  }

  /**
   * Create bar chart config.
   */
  createBarConfig(
    labels: string[],
    datasets: { label: string; data: number[]; color: string }[],
  ): unknown {
    return {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((ds) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: ds.color + 'CC',
          borderColor: ds.color,
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: this.defaultPlugins,
        scales: this.defaultScales,
      },
    };
  }

  /**
   * Create donut chart config.
   */
  createDonutConfig(
    labels: string[],
    data: number[],
    colors: string[],
  ): unknown {
    const c = this.css;
    return {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.map((col) => col + 'CC'),
            borderColor: c.bgSecondary,
            borderWidth: 2,
            hoverBorderColor: c.bgSecondary,
            hoverBorderWidth: 3,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
              color: c.textSecondary,
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle' as const,
              font: { family: 'Inter, sans-serif', size: 12 },
            },
          },
          tooltip: {
            ...this.defaultPlugins.tooltip,
            callbacks: {
              label: (context: { parsed: number; label: string; chart: { data: { datasets: { data: number[] }[] } } }) => {
                const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const pct = ((context.parsed / total) * 100).toFixed(1);
                return ` ${context.label}: ${this.currencyService.format(context.parsed)} (${pct}%)`;
              },
            },
          },
        },
      },
    };
  }
}
