import { Injectable, signal, computed } from '@angular/core';

/**
 * Build a UTC date string (YYYY-MM-DD) from year/month/day components.
 * Avoids local-time `new Date(y, m, d)` which shifts by timezone offset.
 */
function toUTCDateString(year: number, month: number, day: number): string {
  return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
}

@Injectable({ providedIn: 'root' })
export class DateRangeService {
  readonly startDate = signal('');
  readonly endDate = signal('');

  /**
   * Earliest date the user has data for (e.g., first transaction date or
   * account creation date). When set, the month dropdown only shows months
   * from this date forward — no phantom months before the account existed.
   */
  readonly minDate = signal<Date | null>(null);

  readonly currentMonthLabel = computed(() => {
    const s = this.startDate();
    if (!s) return '';
    const d = new Date(s + 'T12:00:00Z');
    return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  });

  readonly availableMonths = computed(() => {
    const months: { label: string; start: string; end: string }[] = [];
    const now = new Date();
    const min = this.minDate();

    // Determine how many months back we should show.
    // If minDate is set: use it. Otherwise fall back to 12 months max.
    let maxMonthsBack = 12;
    if (min) {
      const nowYear = now.getUTCFullYear();
      const nowMonth = now.getUTCMonth();
      const minYear = min.getUTCFullYear();
      const minMonth = min.getUTCMonth();
      maxMonthsBack = (nowYear - minYear) * 12 + (nowMonth - minMonth);
    }

    for (let i = 0; i <= maxMonthsBack; i++) {
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth() - i;
      // Use noon UTC so toLocaleDateString stays in the same calendar month
      // across all timezones (midnight UTC can roll back to the previous day
      // in UTC-5 or earlier, shifting the label by one month).
      const firstDay = new Date(Date.UTC(year, month, 1, 12, 0, 0));
      const lastDay = new Date(Date.UTC(year, month + 1, 0, 12, 0, 0));
      months.push({
        label: firstDay.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
        start: toUTCDateString(firstDay.getUTCFullYear(), firstDay.getUTCMonth(), firstDay.getUTCDate()),
        end: toUTCDateString(lastDay.getUTCFullYear(), lastDay.getUTCMonth(), lastDay.getUTCDate()),
      });
    }
    return months;
  });

  constructor() {
    this.setCurrentMonth();
  }

  setCurrentMonth(): void {
    const now = new Date();
    const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    this.startDate.set(toUTCDateString(firstDay.getUTCFullYear(), firstDay.getUTCMonth(), firstDay.getUTCDate()));
    this.endDate.set(toUTCDateString(lastDay.getUTCFullYear(), lastDay.getUTCMonth(), lastDay.getUTCDate()));
  }

  /** Set the earliest date the user has data — limits the month dropdown. */
  setMinDate(date: Date): void {
    this.minDate.set(date);
  }

  setMonth(start: string, end: string): void {
    this.startDate.set(start);
    this.endDate.set(end);
  }

  clear(): void {
    this.startDate.set('');
    this.endDate.set('');
  }

  getApiParams(): { startDate?: string; endDate?: string } {
    const params: { startDate?: string; endDate?: string } = {};
    if (this.startDate()) params.startDate = new Date(this.startDate() + 'T00:00:00Z').toISOString();
    if (this.endDate()) params.endDate = new Date(this.endDate() + 'T23:59:59Z').toISOString();
    return params;
  }

  getFilters(): { startDate?: string; endDate?: string } {
    return {
      startDate: this.startDate() ? new Date(this.startDate() + 'T00:00:00Z').toISOString() : undefined,
      endDate: this.endDate() ? new Date(this.endDate() + 'T23:59:59Z').toISOString() : undefined,
    };
  }
}

