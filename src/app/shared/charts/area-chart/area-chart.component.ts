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

export interface AreaDataset {
  label: string;
  data: number[];
  color: string;
}

@Component({
  selector: 'ft-area-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-chart.component.html',
  styleUrl: './area-chart.component.scss',
})
export class AreaChartComponent implements OnInit, OnDestroy, OnChanges {
  labels = input.required<string[]>();
  datasets = input.required<AreaDataset[]>();
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

    const config = this.chartService.createAreaConfig(
      this.labels(),
      this.datasets(),
    );

    this.chart = new Chart(this.canvas.nativeElement, config);
  }

  private updateChart(): void {
    if (!this.chart) return;

    this.chart.data.labels = this.labels();
    this.chart.data.datasets = this.datasets().map((ds) => ({
      label: ds.label,
      data: ds.data,
    }));
    this.chart.update('default');
  }
}
