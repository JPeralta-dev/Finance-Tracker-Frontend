import { Component, input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'ft-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ui-input.component.html',
  styleUrl: './ui-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
})
export class UiInputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  error = input<string | null>(null);
  hint = input<string | null>(null);
  disabled = input<boolean>(false);
  icon = input<string | null>(null);

  /** Internal focus state for float label */
  focused = signal(false);

  /** Internal value for float label */
  value = signal('');

  // ── ControlValueAccessor ──
  private onChange = (_: string) => {};
  private onTouched = () => {};

  writeValue(val: string): void {
    this.value.set(val ?? '');
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = input(isDisabled);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  onFocus(): void {
    this.focused.set(true);
  }

  /** Label floats when focused or has value */
  get shouldFloat(): boolean {
    return this.focused() || this.value().length > 0;
  }
}
