import {
  Component,
  forwardRef,
  signal,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isPast: boolean;
  dateString: string;
}

@Component({
  selector: 'ft-datepicker',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="ft-datepicker" [class.ft-datepicker--open]="isOpen()">
      <!-- Trigger Field -->
      <button
        type="button"
        class="ft-datepicker__trigger"
        (click)="toggleOpen()"
        [attr.aria-expanded]="isOpen()"
      >
        <span class="ft-datepicker__icon">
          <ng-icon name="calendar" size="1.1rem" />
        </span>
        <span class="ft-datepicker__text" [class.ft-datepicker__text--placeholder]="!value()">
          {{ displayDate() || placeholder() }}
        </span>

        @if (value()) {
          <span
            class="ft-datepicker__clear"
            (click)="clearDate($event)"
            title="Quitar fecha"
          >
            <ng-icon name="close" size="0.875rem" />
          </span>
        } @else {
          <span class="ft-datepicker__chevron">
            <ng-icon [name]="isOpen() ? 'chevronUp' : 'chevronDown'" size="0.75rem" />
          </span>
        }
      </button>

      <!-- Dropdown Calendar -->
      @if (isOpen()) {
        <div class="ft-datepicker__dropdown">
          <!-- Quick Presets -->
          <div class="ft-datepicker__presets">
            <button type="button" class="preset-chip" (click)="selectPreset('end_of_month')">
              Fin de mes
            </button>
            <button type="button" class="preset-chip" (click)="selectPreset('in_3_months')">
              En 3 meses
            </button>
            <button type="button" class="preset-chip" (click)="selectPreset('in_6_months')">
              En 6 meses
            </button>
            <button type="button" class="preset-chip" (click)="selectPreset('end_of_year')">
              Fin de año
            </button>
          </div>

          <!-- Month/Year Navigation -->
          <div class="ft-datepicker__header">
            <button type="button" class="nav-btn" (click)="prevMonth($event)">
              <ng-icon name="chevronLeft" size="0.875rem" />
            </button>
            <span class="current-month">
              {{ currentMonthName() }} {{ currentYear() }}
            </span>
            <button type="button" class="nav-btn" (click)="nextMonth($event)">
              <ng-icon name="chevronRight" size="0.875rem" />
            </button>
          </div>

          <!-- Weekday Headers -->
          <div class="ft-datepicker__weekdays">
            <span>Lu</span>
            <span>Ma</span>
            <span>Mi</span>
            <span>Ju</span>
            <span>Vi</span>
            <span>Sá</span>
            <span>Do</span>
          </div>

          <!-- Days Grid -->
          <div class="ft-datepicker__days">
            @for (day of calendarDays(); track day.dateString) {
              <button
                type="button"
                class="day-btn"
                [class.day-btn--other-month]="!day.isCurrentMonth"
                [class.day-btn--today]="day.isToday"
                [class.day-btn--selected]="day.isSelected"
                [class.day-btn--disabled]="day.isPast"
                [disabled]="day.isPast"
                (click)="selectDay(day)"
              >
                {{ day.dayNumber }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .ft-datepicker {
      position: relative;
      width: 100%;
    }

    .ft-datepicker__trigger {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      min-height: 2.75rem;
      padding: 0.625rem 0.875rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      color: #f3f4f6;
      font-size: 0.875rem;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ft-datepicker__trigger:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .ft-datepicker__trigger:focus-visible {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .ft-datepicker--open .ft-datepicker__trigger {
      border-color: #6366f1;
      background: rgba(255, 255, 255, 0.07);
    }

    .ft-datepicker__icon {
      display: flex;
      align-items: center;
      color: #9ca3af;
      flex-shrink: 0;
    }

    .ft-datepicker__text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
    }

    .ft-datepicker__text--placeholder {
      color: #6b7280;
      font-weight: 400;
    }

    .ft-datepicker__clear {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 9999px;
      color: #9ca3af;
      background: rgba(255, 255, 255, 0.08);
      transition: all 0.15s ease;
    }

    .ft-datepicker__clear:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.15);
    }

    .ft-datepicker__chevron {
      color: #6b7280;
      display: flex;
      align-items: center;
    }

    /* Dropdown */
    .ft-datepicker__dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      z-index: 100;
      width: 320px;
      max-width: calc(100vw - 2rem);
      padding: 1rem;
      background: #11141d;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 1rem;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      animation: dropFade 0.15s ease-out;
    }

    @keyframes dropFade {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Presets */
    .ft-datepicker__presets {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-bottom: 0.875rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .preset-chip {
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #9ca3af;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .preset-chip:hover {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border-color: rgba(99, 102, 241, 0.3);
    }

    /* Navigation */
    .ft-datepicker__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .current-month {
      font-weight: 600;
      font-size: 0.875rem;
      color: #f3f4f6;
      text-transform: capitalize;
    }

    .nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.5rem;
      color: #9ca3af;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    /* Weekdays */
    .ft-datepicker__weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-size: 0.7rem;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    /* Days */
    .ft-datepicker__days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
    }

    .day-btn {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 0.5rem;
      color: #e5e7eb;
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .day-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .day-btn--other-month {
      color: #4b5563;
    }

    .day-btn--today {
      border: 1px solid rgba(99, 102, 241, 0.5);
      color: #a5b4fc;
      font-weight: 600;
    }

    .day-btn--selected {
      background: #6366f1 !important;
      color: #ffffff !important;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .day-btn--disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }
  `],
})
export class DatepickerComponent implements ControlValueAccessor {
  readonly placeholder = input<string>('Seleccionar fecha límite...');

  private readonly el = inject(ElementRef);

  readonly isOpen = signal(false);
  readonly value = signal<string>(''); // YYYY-MM-DD
  readonly viewDate = signal<Date>(new Date());

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly currentMonthName = computed(() => {
    return this.viewDate().toLocaleDateString('es-ES', { month: 'long' });
  });

  readonly currentYear = computed(() => {
    return this.viewDate().getFullYear();
  });

  readonly displayDate = computed(() => {
    const val = this.value();
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length !== 3) return val;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  });

  readonly calendarDays = computed(() => {
    const view = this.viewDate();
    const year = view.getFullYear();
    const month = view.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday as first day of week: (day + 6) % 7
    let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sel = this.value();

    // Days from prev month
    for (let i = startDayOfWeek; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      d.setHours(0, 0, 0, 0);
      days.push(this.createCalendarDay(d, false, today, sel));
    }

    // Days in current month
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      const cur = new Date(year, month, d);
      cur.setHours(0, 0, 0, 0);
      days.push(this.createCalendarDay(cur, true, today, sel));
    }

    // Days to complete grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextD = new Date(year, month + 1, i);
      nextD.setHours(0, 0, 0, 0);
      days.push(this.createCalendarDay(nextD, false, today, sel));
    }

    return days;
  });

  private createCalendarDay(date: Date, isCurrentMonth: boolean, today: Date, selVal: string): CalendarDay {
    const dateString = this.formatDateIso(date);
    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: date.getTime() === today.getTime(),
      isSelected: dateString === selVal,
      isPast: date.getTime() < today.getTime(),
      dateString,
    };
  }

  private formatDateIso(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  selectDay(day: CalendarDay): void {
    if (day.isPast) return;
    this.setValue(day.dateString);
    this.isOpen.set(false);
  }

  clearDate(event: MouseEvent): void {
    event.stopPropagation();
    this.setValue('');
  }

  selectPreset(preset: 'end_of_month' | 'in_3_months' | 'in_6_months' | 'end_of_year'): void {
    const now = new Date();
    let target: Date;

    switch (preset) {
      case 'end_of_month':
        target = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'in_3_months':
        target = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
        break;
      case 'in_6_months':
        target = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
        break;
      case 'end_of_year':
        target = new Date(now.getFullYear(), 11, 31);
        break;
    }

    this.setValue(this.formatDateIso(target));
    this.isOpen.set(false);
  }

  prevMonth(event: MouseEvent): void {
    event.stopPropagation();
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(event: MouseEvent): void {
    event.stopPropagation();
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  private setValue(val: string): void {
    this.value.set(val);
    this.onChange(val);
    this.onTouched();
    if (val) {
      const parts = val.split('-');
      if (parts.length === 3) {
        this.viewDate.set(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  // ControlValueAccessor
  writeValue(val: string | null): void {
    const cleanVal = val ? (val.includes('T') ? val.split('T')[0] : val) : '';
    this.value.set(cleanVal);
    if (cleanVal) {
      const parts = cleanVal.split('-');
      if (parts.length === 3) {
        this.viewDate.set(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
      }
    }
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
