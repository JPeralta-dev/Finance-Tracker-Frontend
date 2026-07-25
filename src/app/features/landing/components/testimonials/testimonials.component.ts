import {
  Component,
  input,
  signal,
  computed,
  effect,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { Testimonial } from '../../../../core/models/tier.model';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

/**
 * Testimonials — manually-controlled carousel.
 *
 * No third-party carousel library: a signal-based index plus a CSS
 * transform gives us smooth slide transitions with zero dependencies.
 * If the input array is empty, the section renders nothing.
 */
@Component({
  selector: 'ft-testimonials',
  standalone: true,
  imports: [CommonModule, NgIcon, FtSubtleRevealDirective, TranslatePipe],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent {
  /** Placeholder testimonials array. */
  readonly items = input.required<Testimonial[]>();

  /** Auto-advance interval in ms. Set to 0 to disable (manual only). */
  readonly autoAdvanceMs = input<number>(0);

  private readonly cdr = inject(ChangeDetectorRef);
  readonly currentIndex = signal(0);

  /** Convenience flags derived from the input. */
  readonly hasItems = computed(() => this.items().length > 0);
  readonly currentItem = computed(() => this.items()[this.currentIndex()]);
  readonly totalItems = computed(() => this.items().length);

  constructor() {
    // Reset to first slide whenever the input array changes shape
    effect(() => {
      const len = this.items().length;
      if (len === 0) {
        this.currentIndex.set(0);
      } else if (this.currentIndex() >= len) {
        this.currentIndex.set(0);
      }
    });
  }

  next(): void {
    if (!this.hasItems()) return;
    const len = this.totalItems();
    this.currentIndex.update(i => (i + 1) % len);
  }

  prev(): void {
    if (!this.hasItems()) return;
    const len = this.totalItems();
    this.currentIndex.update(i => (i - 1 + len) % len);
  }

  goTo(index: number): void {
    if (!this.hasItems()) return;
    if (index < 0 || index >= this.totalItems()) return;
    this.currentIndex.set(index);
  }
}
