import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { TierComparisonRow } from '../../../../core/models/tier.model';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

/**
 * Comparison Table — feature-by-tier matrix (Free vs Premium vs Premium Plus).
 *
 * Built with CSS Grid so the columns line up regardless of cell content.
 * On mobile (< 768px) the grid is wrapped in a horizontally scrollable
 * container so feature labels never get truncated.
 */
@Component({
  selector: 'ft-comparison-table',
  standalone: true,
  imports: [CommonModule, NgIcon, FtSubtleRevealDirective, TranslatePipe],
  templateUrl: './comparison-table.component.html',
  styleUrl: './comparison-table.component.scss',
})
export class ComparisonTableComponent {
  /** Rows of features to render. Each row maps the feature key to per-tier availability. */
  readonly rows = input.required<TierComparisonRow[]>();
}
