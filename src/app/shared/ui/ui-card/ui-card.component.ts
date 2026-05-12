import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ft-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-card.component.html',
  styleUrl: './ui-card.component.scss',
})
export class UiCardComponent {
  /** Optional header content */
  title = input<string | null>(null);

  /** Optional subtitle */
  subtitle = input<string | null>(null);

  /** Hover lift effect */
  hoverable = input<boolean>(false);

  /** Remove padding (for custom inner layouts) */
  noPadding = input<boolean>(false);
}
