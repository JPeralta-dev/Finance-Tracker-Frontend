import { Component, signal, ElementRef, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-hero-visual',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './hero-visual.component.html',
  styleUrl: './hero-visual.component.scss',
})
export class HeroVisualComponent {
  private el = inject(ElementRef);

  readonly incomeDisplay = signal(0);
  readonly expensesDisplay = signal(0);
  readonly savingsDisplay = signal(0);
  readonly animated = signal(false);

  private readonly targets = { income: 4280, expenses: 2840, savings: 33.6 };

  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !this.animated()) {
            this.animated.set(true);
            this.animateCountUp('income', this.targets.income, 1200);
            this.animateCountUp('expenses', this.targets.expenses, 1200);
            this.animateCountUp('savings', this.targets.savings, 1400);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(this.el.nativeElement);
    });
  }

  private animateCountUp(key: 'income' | 'expenses' | 'savings', target: number, duration: number): void {
    const start = performance.now();
    const signal = key === 'income' ? this.incomeDisplay : key === 'expenses' ? this.expensesDisplay : this.savingsDisplay;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      signal.set(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }
}
