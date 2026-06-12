import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { CurrencyService } from '../../../../core/services/currency.service';
import { ICONS } from '../../../../shared/icons/icon-registry';
import type { RelevantTransaction } from '../../analytics.types';

@Component({
  selector: 'ft-analytics-transactions',
  standalone: true,
  imports: [CommonModule, NgIcon, RouterLink, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './analytics-transactions.component.html',
  styleUrl: './analytics-transactions.component.scss',
})
export class AnalyticsTransactionsComponent {
  transactions = input.required<RelevantTransaction[]>();
  loading = input(false);

  constructor(private currencyService: CurrencyService) {}

  formatCurrency(v: number): string {
    return this.currencyService.format(v);
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
