import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { ICONS } from '../../../../shared/icons/icon-registry';
import type { MonthStory } from '../../analytics.types';

@Component({
  selector: 'ft-analytics-month-story',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe],
  templateUrl: './analytics-month-story.component.html',
  styleUrl: './analytics-month-story.component.scss',
})
export class AnalyticsMonthStoryComponent {
  stories = input.required<MonthStory[]>();
  loading = input(false);
}
