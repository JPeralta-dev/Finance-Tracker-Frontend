import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { FinanceService } from '../../../core/services/finance.service';
import { catchError, of } from 'rxjs';

interface ChannelStats {
  origin: string;
  count: number;
  percentage: number;
  totalAmount: number;
}

interface ChannelStatsResponse {
  channels: ChannelStats[];
  totalTransactions: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

interface ChannelConfig {
  icon: string;
  labelKey: string;
  color: string;
}

const CHANNEL_CONFIG: Record<string, ChannelConfig> = {
  whatsapp: {
    icon: 'whatsapp',
    labelKey: 'channels.whatsapp',
    color: '#25D366',
  },
  telegram: {
    icon: 'telegram',
    labelKey: 'channels.telegram',
    color: '#0088cc',
  },
  gmail: {
    icon: 'mail',
    labelKey: 'channels.gmail',
    color: '#EA4335',
  },
  manual: {
    icon: 'edit',
    labelKey: 'channels.manual',
    color: 'var(--text-tertiary)',
  },
};

// Mock data - replace with real API call
const MOCK_CHANNEL_STATS: ChannelStatsResponse = {
  channels: [
    { origin: 'whatsapp', count: 45, percentage: 45.0, totalAmount: 12500.50 },
    { origin: 'telegram', count: 30, percentage: 30.0, totalAmount: 8200.00 },
    { origin: 'gmail', count: 15, percentage: 15.0, totalAmount: 4500.00 },
    { origin: 'manual', count: 10, percentage: 10.0, totalAmount: 2800.00 },
  ],
  totalTransactions: 100,
  period: {
    startDate: '2026-07-01',
    endDate: '2026-07-31',
  },
};

type WidgetState = 'loading' | 'ready' | 'empty' | 'error';

@Component({
  selector: 'ft-channel-distribution-widget',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './channel-distribution-widget.component.html',
  styleUrl: './channel-distribution-widget.component.scss',
})
export class ChannelDistributionWidgetComponent implements OnInit {
  private financeService = inject(FinanceService);

  readonly state = signal<WidgetState>('loading');
  readonly stats = signal<ChannelStatsResponse | null>(null);

  readonly channels = computed(() => {
    const data = this.stats();
    if (!data) return [];
    return data.channels
      .filter(ch => ch.count > 0)
      .map(ch => ({
        ...ch,
        config: CHANNEL_CONFIG[ch.origin] || CHANNEL_CONFIG['manual'],
      }));
  });

  readonly totalTransactions = computed(() => this.stats()?.totalTransactions || 0);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.state.set('loading');

    // TODO: Replace with real API call
    // this.financeService.getChannelStats().pipe(
    //   catchError(() => of(null))
    // ).subscribe(data => { ... });

    // Mock implementation
    setTimeout(() => {
      if (MOCK_CHANNEL_STATS.totalTransactions === 0) {
        this.state.set('empty');
      } else {
        this.stats.set(MOCK_CHANNEL_STATS);
        this.state.set('ready');
      }
    }, 800);
  }

  getChannelIcon(origin: string): string {
    return CHANNEL_CONFIG[origin]?.icon || CHANNEL_CONFIG['manual'].icon;
  }

  getChannelColor(origin: string): string {
    return CHANNEL_CONFIG[origin]?.color || CHANNEL_CONFIG['manual'].color;
  }

  formatPercentage(percentage: number): string {
    return percentage < 10 ? percentage.toFixed(1) : Math.round(percentage).toString();
  }
}
