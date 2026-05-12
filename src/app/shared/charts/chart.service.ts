import { Injectable } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * ChartService — Central configuration for Chart.js with Obsidian Glass theme.
 * Provides factory methods for consistent dark-themed charts.
 */
@Injectable({ providedIn: 'root' })
export class ChartService {
  // ─── Theme Colors ────────────────────────────────────────────────
  private readonly colors = {
    text: { primary: '#F1F5F9', secondary: '#94A3B8', tertiary: '#64748B' },
    grid: 'rgba(255, 255, 255, 0.04)',
    success: '#06D6A0',
    danger: '#FF6B6B',
    accent: '#118DFF',
    purple: '#6C63FF',
    bg: { primary: '#0A0E17', secondary: '#0F1623', tertiary: '#151D2E' },
  };

  // ─── Default Scale Config ────────────────────────────────────────
  private defaultScales = {
    x: {
      grid: { display: false },
      ticks: {
        color: this.colors.text.tertiary,
        font: { family: 'Inter, sans-serif', size: 11 },
      },
    },
    y: {
      grid: { color: this.colors.grid },
      ticks: {
        color: this.colors.text.tertiary,
        font: { family: 'Inter, sans-serif', size: 11 },
        callback: (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`,
      },
    },
  };

  // ─── Default Plugin Config ───────────────────────────────────────
  private defaultPlugins = {
    legend: { display: false },
    tooltip: {
      backgroundColor: this.colors.bg.tertiary,
      titleColor: this.colors.text.primary,
      bodyColor: this.colors.text.secondary,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { family: 'Space Grotesk, sans-serif', weight: '600' as const },
      bodyFont: { family: 'Inter, sans-serif' },
      displayColors: true,
      boxPadding: 4,
    },
  };

  /**
   * Create area chart config with gradient fills.
   */
  createAreaConfig(
    labels: string[],
    datasets: { label: string; data: number[]; color: string }[],
  ): unknown {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

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
            pointHoverBorderColor: this.colors.bg.secondary,
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
                return ` ${context.dataset.label}: $${val.toLocaleString()}`;
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
    return {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.map((c) => c + 'CC'),
            borderColor: this.colors.bg.secondary,
            borderWidth: 2,
            hoverBorderColor: this.colors.bg.secondary,
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
              color: this.colors.text.secondary,
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
                return ` ${context.label}: $${context.parsed.toLocaleString()} (${pct}%)`;
              },
            },
          },
        },
      },
    };
  }
}
