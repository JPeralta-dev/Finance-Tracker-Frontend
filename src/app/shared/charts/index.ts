/**
 * Shared Chart Components — Barrel Export
 *
 * Chart.js wrappers themed for Obsidian Glass design system.
 */

export { ChartService } from './chart.service';
export { AreaChartComponent } from './area-chart/area-chart.component';
export { BarChartComponent } from './bar-chart/bar-chart.component';
export { DonutChartComponent } from './donut-chart/donut-chart.component';

// Types
export type { ChartDataset, ChartOptions, ChartPoint } from './chart.types';
export type { AreaDataset } from './area-chart/area-chart.component';
export type { BarDataset } from './bar-chart/bar-chart.component';
export type { DonutData } from './donut-chart/donut-chart.component';
