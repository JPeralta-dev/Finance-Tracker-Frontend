import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ft-chart-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-placeholder.component.html',
  styleUrl: './chart-placeholder.component.scss',
})
export class ChartPlaceholderComponent {
  title = input<string>('Monthly Overview');
  subtitle = input<string>('Last 6 months');
  loading = input<boolean>(false);
}
