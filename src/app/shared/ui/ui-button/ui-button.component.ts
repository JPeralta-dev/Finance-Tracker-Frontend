import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonVariant, ButtonSize } from './ui-button.types';

@Component({
  selector: 'ft-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss',
})
export class UiButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<string>('button');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  loading = input<boolean>(false);

  ftClick = output<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.ftClick.emit(event);
    }
  }

  get variantClass(): string {
    return `btn--${this.variant()}`;
  }

  get sizeClass(): string {
    return `btn--${this.size()}`;
  }

  get fullClass(): string {
    return this.fullWidth() ? 'btn--full' : '';
  }

  get loadingClass(): string {
    return this.loading() ? 'btn--loading' : '';
  }
}
