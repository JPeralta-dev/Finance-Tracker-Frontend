import {
  Component,
  input,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { FaqItem } from '../../../../core/models/tier.model';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

/**
 * FAQ — single-open accordion with smooth expand/collapse animation.
 *
 * Built with Angular Animations so the height transition is real (auto
 * to *), avoiding the max-height hack. Only one item is open at a time;
 * clicking the open item closes it.
 */
@Component({
  selector: 'ft-faq',
  standalone: true,
  imports: [CommonModule, NgIcon, FtSubtleRevealDirective, TranslatePipe],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  animations: [
    trigger('expand', [
      state('collapsed', style({ height: '0', opacity: 0, paddingTop: '0', paddingBottom: '0' })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('collapsed <=> expanded', [animate('250ms cubic-bezier(0.16, 1, 0.3, 1)')]),
    ]),
  ],
})
export class FaqComponent {
  /** FAQ items to render. */
  readonly items = input.required<FaqItem[]>();

  /** Index of the currently expanded item, or null if all collapsed. */
  readonly expandedIndex = signal<number | null>(null);

  constructor() {
    // Clamp the expanded index if the input shrinks below it
    effect(() => {
      const len = this.items().length;
      const idx = this.expandedIndex();
      if (idx !== null && idx >= len) {
        this.expandedIndex.set(null);
      }
    });
  }

  toggle(index: number): void {
    if (index < 0 || index >= this.items().length) return;
    this.expandedIndex.update(current => (current === index ? null : index));
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex() === index;
  }

  /** Returns a unique id used for ARIA wiring between the button and the panel. */
  panelId(index: number): string {
    return `faq-panel-${index}`;
  }

  buttonId(index: number): string {
    return `faq-button-${index}`;
  }
}
