let registered = false;

export async function registerECharts(): Promise<void> {
  if (registered) return;
  registered = true;

  const { use } = await import('echarts/core');
  const { CanvasRenderer } = await import('echarts/renderers');
  const [
    { LineChart, BarChart, PieChart, GaugeChart, HeatmapChart },
    { TooltipComponent, LegendComponent, GridComponent, TitleComponent, DataZoomComponent, DatasetComponent },
  ] = await Promise.all([
    import('echarts/charts'),
    import('echarts/components'),
  ]);

  use([
    CanvasRenderer,
    LineChart, BarChart, PieChart, GaugeChart, HeatmapChart,
    TooltipComponent, LegendComponent, GridComponent, TitleComponent, DataZoomComponent, DatasetComponent,
  ]);
}

export function isEChartsRegistered(): boolean {
  return registered;
}
