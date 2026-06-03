import { Injectable, signal, afterNextRender, inject, DestroyRef } from '@angular/core';
import { createBlendy, type Blendy } from 'blendy';

@Injectable({ providedIn: 'root' })
export class BlendyService {
  private blendy: Blendy | null = null;
  readonly prefersReducedMotion = signal(false);

  constructor() {
    afterNextRender(() => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion.set(prefersReduced.matches);
      prefersReduced.addEventListener('change', (e) =>
        this.prefersReducedMotion.set(e.matches),
      );

      if (!prefersReduced.matches) {
        this.blendy = createBlendy({ animation: 'dynamic' });
      }
    });
  }

  toggle(id: string): void {
    if (this.prefersReducedMotion()) return;
    this.blendy?.toggle(id);
  }

  untoggle(id: string, callback: () => void): void {
    if (this.prefersReducedMotion()) {
      callback();
      return;
    }
    this.blendy?.untoggle(id, callback);
  }

  update(): void {
    this.blendy?.update();
  }
}
