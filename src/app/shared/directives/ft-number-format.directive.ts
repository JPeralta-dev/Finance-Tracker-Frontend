import { Directive, ElementRef, HostListener, inject, OnInit, effect } from '@angular/core';
import { NgControl } from '@angular/forms';
import { CurrencyService } from '../../core/services/currency.service';

/**
 * Formats numeric input with thousands separators and proper decimal handling.
 * - Shows thousands separators as you type (1,000,000)
 * - Shows cents (2 decimals) when currency uses them (e.g. USD)
 * - Writes the raw numeric value to the form control
 *
 * Usage: <input ftNumberFormat formControlName="amount" />
 */
@Directive({
  selector: '[ftNumberFormat]',
  standalone: true,
})
export class FtNumberFormatDirective implements OnInit {
  private el = inject(ElementRef);
  private ngControl = inject(NgControl);
  private currencyService = inject(CurrencyService);

  private decimals = 2;
  private locale = 'en-US';

  constructor() {
    // React to currency config changes using effect
    effect(() => {
      const cfg = this.currencyService.currencyConfig();
      this.decimals = cfg.decimals;
      this.locale = cfg.locale;
    });
  }

  ngOnInit(): void {
    const config = this.currencyService.currencyConfig();
    this.decimals = config.decimals;
    this.locale = config.locale;

    // Format initial value if the control already has one
    const raw = this.getRawValue();
    if (raw !== null) {
      this.setDisplayValue(this.formatNumber(raw));
    }
  }

  @HostListener('blur')
  onBlur(): void {
    this.applyFormatting();
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPos = input.selectionStart ?? 0;
    const oldLength = input.value.length;

    // Strip everything except digits and decimal separator
    const raw = this.parseInput(input.value);

    if (raw !== null) {
      const formatted = this.formatNumber(raw);
      this.setDisplayValue(formatted);
      this.ngControl.control?.setValue(raw, { emitModelToViewChange: false });

      // Adjust cursor position after formatting
      const newLength = formatted.length;
      const adjustment = newLength - oldLength;
      const newPos = Math.max(0, Math.min(cursorPos + adjustment, newLength));
      input.setSelectionRange(newPos, newPos);
    } else {
      this.ngControl.control?.setValue(null, { emitModelToViewChange: false });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter, arrows, home, end
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End',
    ];
    if (allowed.includes(event.key)) return;

    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) return;

    // Block non-numeric characters (except decimal point and comma)
    if (!/^[0-9.,]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Parse the input string to a raw number.
   * Strips thousands separators, keeps the decimal part.
   */
  private parseInput(value: string): number | null {
    if (!value) return null;

    // Remove all thousands separators (commas, dots, spaces)
    let cleaned = value.replace(/[,\s]/g, '');

    // Handle multiple decimal points - treat all but last as thousands separators
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }

    // Remove any remaining non-numeric chars except decimal point
    cleaned = cleaned.replace(/[^\d.]/g, '');

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  /**
   * Format a number with thousands separators and proper decimals.
   */
  private formatNumber(value: number): string {
    return value.toLocaleString(this.locale, {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals,
    });
  }

  /**
   * Apply formatting to the current input value (used on blur).
   */
  private applyFormatting(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const raw = this.parseInput(input.value);

    if (raw !== null && raw > 0) {
      this.setDisplayValue(this.formatNumber(raw));
      this.ngControl.control?.setValue(raw, { emitModelToViewChange: false });
    } else if (raw === null || raw === 0) {
      this.setDisplayValue('');
      this.ngControl.control?.setValue(null, { emitModelToViewChange: false });
    }
  }

  /**
   * Get the raw numeric value from the form control.
   */
  private getRawValue(): number | null {
    const val = this.ngControl.control?.value;
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? null : num;
  }

  private setDisplayValue(value: string): void {
    this.el.nativeElement.value = value;
  }
}
