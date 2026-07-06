import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateRangeService {
  readonly startDate = signal('');
  readonly endDate = signal('');

  readonly currentMonthLabel = computed(() => {
    const s = this.startDate();
    if (!s) return '';
    const d = new Date(s + 'T12:00:00');
    return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  });

  readonly availableMonths = computed(() => {
    const months: { label: string; start: string; end: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      months.push({
        label: date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0],
      });
    }
    return months;
  });

  constructor() {
    this.setCurrentMonth();
  }

  setCurrentMonth(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.startDate.set(firstDay.toISOString().split('T')[0]);
    this.endDate.set(lastDay.toISOString().split('T')[0]);
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
    if (this.startDate()) params.startDate = new Date(this.startDate() + 'T00:00:00').toISOString();
    if (this.endDate()) params.endDate = new Date(this.endDate() + 'T23:59:59').toISOString();
    return params;
  }

  getFilters(): { startDate?: string; endDate?: string } {
    return {
      startDate: this.startDate() ? new Date(this.startDate() + 'T00:00:00').toISOString() : undefined,
      endDate: this.endDate() ? new Date(this.endDate() + 'T23:59:59').toISOString() : undefined,
    };
  }
}
