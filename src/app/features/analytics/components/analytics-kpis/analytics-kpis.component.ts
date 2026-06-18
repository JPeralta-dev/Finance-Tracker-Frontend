import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiCardComponent } from '../kpi-card/kpi-card.component';
import type { KpiData } from '../../analytics.types';

@Component({
  selector: 'ft-analytics-kpis',
  standalone: true,
  imports: [CommonModule, KpiCardComponent],
  templateUrl: './analytics-kpis.component.html',
  styleUrl: './analytics-kpis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsKpisComponent {
  kpis = input.required<KpiData[]>();
  loading = input(false);
}
