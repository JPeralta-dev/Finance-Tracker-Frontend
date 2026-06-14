/**
 * Shared Chart Components — Barrel Export
 *
 * ECharts-based chart components themed for Obsidian Glass design system.
 * Replaced Chart.js wrappers (v1.0) with modular ECharts (v2.0).
 */

// ECharts components
export { FtEChartComponent, EChartState } from './echarts/ft-echart.component';
export { EchartsThemeMapper } from './echarts/echarts-theme.mapper';
export { registerECharts } from './echarts/echarts-module';

// Types (preserved for backward compatibility where applicable)
export type { ChartDataset, ChartOptions, ChartPoint } from './chart.types';
