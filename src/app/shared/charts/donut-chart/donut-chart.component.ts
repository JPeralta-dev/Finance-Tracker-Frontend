import {
  Component,
  input,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartService } from '../../charts/chart.service';
import { ChartProviderService } from '../../../core/services/chart-provider.service';

export interface DonutData {
  labels: string[];
  data: number[];
  colors: string[];
}

@Component({
  selector: 'ft-donut-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donut-chart.component.html',
  styleUrl: './donut-chart.component.scss',
})
export class DonutChartComponent implements OnInit, OnDestroy, OnChanges {
  data = input.required<DonutData>();
  title = input<string>('');
  subtitle = input<string>('');
  height = input<string>('250px');
  loading = input<boolean>(false);

  @ViewChild('chartCanvas') private canvas!: ElementRef<HTMLCanvasElement>;

  private chartService = inject(ChartService);
  private chartProvider = inject(ChartProviderService);

  private chart: any = null;

  async ngOnInit(): Promise<void> {
    if (this.loading()) return;
    const { Chart } = await this.chartProvider.ensureChart();
    this.initChart(Chart);
  }

  ngOnChanges(): void {
    if (!this.loading() && this.chart) this.updateChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(Chart: any): void {
    if (!this.canvas) return;
    const d = this.data();
    const config = this.chartService.createDonutConfig(d.labels, d.data, d.colors);
    this.chart = new Chart(this.canvas.nativeElement, config);
  }

  private updateChart(): void {
    if (!this.chart) return;
    const d = this.data();
    this.chart.data.labels = d.labels;
    this.chart.data.datasets[0].data = d.data;
    this.chart.update('default');
  }
}
