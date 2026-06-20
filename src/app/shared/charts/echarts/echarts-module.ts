let registered = false;

export async function registerECharts(): Promise<void> {
  if (registered) {
    console.log('[registerECharts] already registered, skipping');
    return;
  }
  registered = true;
  console.log('[registerECharts] starting registration...');

  try {
    const { use } = await import('echarts/core');
    console.log('[registerECharts] echarts/core imported, use =', typeof use);
    const { CanvasRenderer } = await import('echarts/renderers');
    console.log('[registerECharts] echarts/renderers imported');
    const [
      { LineChart, BarChart, PieChart, GaugeChart, HeatmapChart },
      { TooltipComponent, LegendComponent, GridComponent, TitleComponent, DataZoomComponent, DatasetComponent },
    ] = await Promise.all([
      import('echarts/charts'),
      import('echarts/components'),
    ]);
    console.log('[registerECharts] charts and components imported');

    use([
      CanvasRenderer,
      LineChart, BarChart, PieChart, GaugeChart, HeatmapChart,
      TooltipComponent, LegendComponent, GridComponent, TitleComponent, DataZoomComponent, DatasetComponent,
    ]);
    console.log('[registerECharts] registration complete!');
  } catch (error) {
    registered = false; // Reset on failure so retry can work
    console.error('[registerECharts] FAILED:', error);
    throw error;
  }
}

export function isEChartsRegistered(): boolean {
  return registered;
}
