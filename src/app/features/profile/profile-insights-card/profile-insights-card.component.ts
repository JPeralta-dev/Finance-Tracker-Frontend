import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { InsightsPanelComponent } from '../../../shared/components/insights-panel/insights-panel.component';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import type { Insight } from '../../../core/models/insight.model';

@Component({
  selector: 'app-profile-insights-card',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, InsightsPanelComponent, FtSubtleRevealDirective],
  providers: [provideIcons(ICONS)],
  templateUrl: './profile-insights-card.component.html',
  styleUrl: './profile-insights-card.component.scss',
})
export class ProfileInsightsCardComponent {
  userStats = input.required<{ totalTransactions: number; accountAge: string } | null>();
  insights = input.required<Insight[]>();
  delay = input<number>(0);
}
