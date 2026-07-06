import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { IconComponent } from '../../../shared/icons/icon.component';
import { PocketsService } from '../../../core/services/pockets.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { PocketResponse } from '../../../core/models/pocket.model';

type PocketsState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'ft-pocket-progress-widget',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  templateUrl: './pocket-progress.widget.html',
  styleUrl: './pocket-progress.widget.scss',
})
export class PocketProgressWidget implements OnInit {
  private readonly pocketsService = inject(PocketsService);
  private readonly authService = inject(AuthService);
  private readonly currencyService = inject(CurrencyService);

  readonly pockets = signal<PocketResponse[]>([]);
  readonly state = signal<PocketsState>('loading');

  readonly isPremium = this.authService.isPremium;

  readonly displayPockets = computed(() => this.pockets().slice(0, 3));

  ngOnInit(): void {
    if (!this.isPremium()) {
      this.state.set('ready');
      return;
    }
    this.loadPockets();
  }

  private loadPockets(): void {
    this.state.set('loading');
    this.pocketsService
      .list()
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            this.state.set('empty');
          } else {
            this.pockets.set(data);
            this.state.set('ready');
          }
        },
        error: () => {
          this.state.set('error');
        },
      });
  }

  progress(pocket: PocketResponse): number {
    if (!pocket.monthlyLimit || pocket.monthlyLimit <= 0) return 0;
    return Math.min(100, Math.round((pocket.currentSpending / pocket.monthlyLimit) * 100));
  }

  formatCurrency(value: number): string {
    return this.currencyService.format(value);
  }
}
