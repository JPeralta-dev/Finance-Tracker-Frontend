import {
  Component,
  input,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartService } from '../../charts/chart.service';

let Chart: any;
const chartReady = import('chart.js').then(m => { Chart = m.Chart; });

export interface BarDataset {
  label: string;
  data: number[];
  color: string;
}

@Component({
  selector: 'ft-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit, OnDestroy, OnChanges {
  labels = input.required<string[]>();
  datasets = input.required<BarDataset[]>();
  title = input<string>('');
  subtitle = input<string>('');
  height = input<string>('250px');
  loading = input<boolean>(false);

  @ViewChild('chartCanvas') private canvas!: ElementRef<HTMLCanvasElement>;

  private chart: any = null;

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    if (this.loading()) return;
    if (Chart) {
      this.initChart();
    } else {
      chartReady.then(() => this.initChart());
    }
  }

  ngOnChanges(): void {
    if (!this.loading() && this.chart) this.updateChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(): void {
    if (!this.canvas || !Chart) return;
    const config = this.chartService.createBarConfig(this.labels(), this.datasets());
    this.chart = new Chart(this.canvas.nativeElement, config);
  }

  private updateChart(): void {
    if (!this.chart) return;
    this.chart.data.labels = this.labels();
    this.chart.data.datasets = this.datasets().map((ds) => ({ label: ds.label, data: ds.data }));
    this.chart.update('default');
  }
}
