/**
 * Chart type definitions for the Obsidian Glass design system.
 */

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  fill?: boolean | string;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointBackgroundColor?: string;
}

export interface ChartOptions {
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  currency?: boolean;
  height?: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}
