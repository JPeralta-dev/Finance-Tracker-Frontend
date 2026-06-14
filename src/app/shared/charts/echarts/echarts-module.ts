/**
 * EChartsModule — Modular ECharts registration.
 *
 * Imports ONLY the chart types and components needed by the analytics page:
 * - Charts: Line, Bar, Pie, Gauge, Heatmap
 * - Components: Tooltip, Legend, Grid, Title, DataZoom
 *
 * This selective import strategy keeps the ECharts contribution under 150KB gzipped.
 * Full echarts import is ~900KB; modular is ~120KB gzipped.
 *
 * Usage: Call `registerECharts()` once during app initialization (e.g., app.config.ts
 * via APP_INITIALIZER or directly in main.ts).
 */

import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  HeatmapChart,
} from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  DataZoomComponent,
  DatasetComponent,
} from 'echarts/components';

/**
 * Register all required ECharts modules.
 * Must be called exactly once before any chart renders.
 */
export function registerECharts(): void {
  use([
    // Renderer
    CanvasRenderer,
    // Chart types
    LineChart,
    BarChart,
    PieChart,
    GaugeChart,
    HeatmapChart,
    // Components
    TooltipComponent,
    LegendComponent,
    GridComponent,
    TitleComponent,
    DataZoomComponent,
    DatasetComponent,
  ]);
}
