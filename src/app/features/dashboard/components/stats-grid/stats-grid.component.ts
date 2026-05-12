import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { StatCardData } from '../stat-card/stat-card.types';

@Component({
  selector: 'ft-stats-grid',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './stats-grid.component.html',
  styleUrl: './stats-grid.component.scss',
})
export class StatsGridComponent {
  stats = input.required<StatCardData[]>();
  compact = input<boolean>(false);
  loading = input<boolean>(false);
}
