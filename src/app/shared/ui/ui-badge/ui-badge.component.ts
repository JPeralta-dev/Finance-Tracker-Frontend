import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeVariant, BadgeSize } from './ui-badge.types';

@Component({
  selector: 'ft-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-badge.component.html',
  styleUrl: './ui-badge.component.scss',
})
export class UiBadgeComponent {
  variant = input<BadgeVariant>('default');
  size = input<BadgeSize>('sm');

  get variantClass(): string {
    return `badge--${this.variant()}`;
  }

  get sizeClass(): string {
    return `badge--${this.size()}`;
  }
}
