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
import('chart.js').then(m => Chart = m.Chart);

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

  private chart: any = null;

  constructor(private chartService: ChartService) {}

  ngOnInit(): void {
    if (!this.loading()) this.initChart();
  }

  ngOnChanges(): void {
    if (!this.loading() && this.chart) this.updateChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private initChart(): void {
    if (!this.canvas || !Chart) return;
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
