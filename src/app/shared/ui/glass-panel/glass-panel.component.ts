import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GlassVariant = 'default' | 'elevated' | 'subtle';

@Component({
  selector: 'ft-glass-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glass-panel.component.html',
  styleUrl: './glass-panel.component.scss',
})
export class GlassPanelComponent {
  /** Visual depth variant */
  variant = input<GlassVariant>('default');

  /** Additional padding class */
  padding = input<string>('p-6');

  /** Hover lift effect */
  hoverable = input<boolean>(false);

  /** Custom max width */
  maxWidth = input<string | null>(null);

  get variantClass(): string {
    const map: Record<GlassVariant, string> = {
      default: 'glass-panel--default',
      elevated: 'glass-panel--elevated',
      subtle: 'glass-panel--subtle',
    };
    return map[this.variant()];
  }

  get hoverClass(): string {
    return this.hoverable() ? 'glass-panel--hoverable' : '';
  }

  get maxWidthStyle(): Record<string, string> | null {
    const w = this.maxWidth();
    return w ? { 'max-width': w } : null;
  }
}
