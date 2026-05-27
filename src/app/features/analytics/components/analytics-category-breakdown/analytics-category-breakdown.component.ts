import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { ICONS } from '../../../../shared/icons/icon-registry';
import type { CategoryAnalysis } from '../../analytics.types';

@Component({
  selector: 'ft-analytics-category-breakdown',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  providers: [provideIcons(ICONS)],
  templateUrl: './analytics-category-breakdown.component.html',
  styleUrl: './analytics-category-breakdown.component.scss',
})
export class AnalyticsCategoryBreakdownComponent {
  categories = input.required<CategoryAnalysis[]>();
  loading = input(false);
  max = input(7);
}
