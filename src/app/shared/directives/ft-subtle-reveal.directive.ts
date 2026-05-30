import {
  Directive, ElementRef, OnInit, OnDestroy, Input,
} from '@angular/core';

// ── Types ──────────────────────────────────────────────────────────────

export type AnimationTarget = 'whole' | 'per-word' | 'per-character';

export interface EffectDefinition {
  target: AnimationTarget;
  keyframes: Keyframe[];
  duration: number;
  easing: string;
  stagger: number;
  fill: FillMode;
}

// ── Effect Registry (8 effects from animate-text skill, speed×0.72 applied) ──

export const EFFECT_REGISTRY: Map<string, EffectDefinition> = new Map([
  [
    'soft-blur-in',
    {
      target: 'per-character',
      keyframes: [
        { opacity: 0, transform: 'translateY(16px)', filter: 'blur(12px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
      ],
      duration: 648,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      stagger: 18,
      fill: 'forwards',
    },
  ],
  [
    'per-word-crossfade',
    {
      target: 'per-word',
      keyframes: [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      duration: 504,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      stagger: 50,
      fill: 'forwards',
    },
  ],
  [
    'micro-scale-fade',
    {
      target: 'whole',
      keyframes: [
        { opacity: 0, transform: 'scale(0.96)' },
        { opacity: 1, transform: 'scale(1)' },
      ],
      duration: 432,
      easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
      stagger: 0,
      fill: 'forwards',
    },
  ],
  [
    'fade-up',
    {
      target: 'whole',
      keyframes: [
        { opacity: 0, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      duration: 432,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      stagger: 0,
      fill: 'forwards',
    },
  ],
  [
    'typewriter',
    {
      target: 'per-character',
      keyframes: [
        { opacity: 0 },
        { opacity: 1 },
      ],
      duration: 173,
      easing: 'steps(1, end)',
      stagger: 33,
      fill: 'forwards',
    },
  ],
  [
    'shimmer-sweep',
    {
      target: 'whole',
      keyframes: [
        { opacity: 0, transform: 'translateX(-22px)', filter: 'blur(8px)' },
        { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
      ],
      duration: 612,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      stagger: 0,
      fill: 'forwards',
    },
  ],
  [
    'short-slide-right',
    {
      target: 'per-word',
      keyframes: [
        { opacity: 0, transform: 'translateX(-24px)', filter: 'blur(1.2px)' },
        { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
      ],
      duration: 374,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      stagger: 66,
      fill: 'forwards',
    },
  ],
  [
    'scale-down-fade',
    {
      target: 'whole',
      keyframes: [
        { opacity: 0, transform: 'translateY(8px) scale(1.04)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ],
      duration: 374,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      stagger: 0,
      fill: 'forwards',
    },
  ],
]);

// ── Directive ──────────────────────────────────────────────────────────

@Directive({
  selector: '[ftSubtleReveal]',
  standalone: true,
})
export class FtSubtleRevealDirective implements OnInit, OnDestroy {
  @Input('ftSubtleReveal') effect = 'fade-up';
  @Input() delay = 0;
  @Input() threshold = 0.1;

  private observer: IntersectionObserver | null = null;
  private animatedUnits: HTMLElement[] = [];
  private hasAnimated = false;
  private reducedMotion = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    // Check reduced-motion preference
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const effectDef = EFFECT_REGISTRY.get(this.effect);

    // Unknown effect → silent no-op
    if (!effectDef) return;

    const host = this.el.nativeElement;

    // Reduced motion: set final state instantly, no animation
    if (this.reducedMotion) {
      this.applyFinalState(host, effectDef);
      return;
    }

    // DOM wrapping for per-word / per-character effects
    if (effectDef.target !== 'whole') {
      this.animatedUnits = this.wrapTextUnits(host, effectDef.target);
    } else {
      this.animatedUnits = [host];
      // Set initial invisible state for whole-target
      host.style.opacity = '0';
    }

    // IntersectionObserver — one-shot playback
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.hasAnimated = true;
            this.playAnimations(effectDef);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: this.threshold }
    );

    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    // Cancel any in-flight WAAPI animations
    this.animatedUnits.forEach((unit) => {
      unit.getAnimations().forEach((anim) => anim.cancel());
    });
  }

  // ── Private helpers ────────────────────────────────────────────────

  private applyFinalState(host: HTMLElement, effect: EffectDefinition): void {
    // Set element to its final visible state instantly
    host.style.opacity = '1';
    host.style.transform = '';
    host.style.filter = '';
  }

  private wrapTextUnits(host: HTMLElement, target: AnimationTarget): HTMLElement[] {
    const text = host.textContent ?? '';
    host.textContent = '';

    const units: HTMLElement[] = [];

    if (target === 'per-character') {
      // Split into grapheme-like visual units
      const chars = Array.from(text);
      chars.forEach((char) => {
        const span = document.createElement('span');
        span.className = 'ft-char';
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        host.appendChild(span);
        units.push(span);
      });
    } else if (target === 'per-word') {
      // Split on whitespace, preserve spaces as text nodes
      const words = text.split(/(\s+)/);
      words.forEach((word) => {
        if (/^\s+$/.test(word)) {
          // Space — add as plain text node
          host.appendChild(document.createTextNode(word));
        } else if (word) {
          const span = document.createElement('span');
          span.className = 'ft-word';
          span.textContent = word;
          span.style.display = 'inline-block';
          span.style.opacity = '0';
          host.appendChild(span);
          units.push(span);
        }
      });
    }

    return units;
  }

  private playAnimations(effect: EffectDefinition): void {
    this.animatedUnits.forEach((unit, rank) => {
      const unitDelay = this.delay + rank * effect.stagger;
      unit.animate(effect.keyframes, {
        delay: unitDelay,
        duration: effect.duration,
        easing: effect.easing,
        fill: effect.fill,
      });
    });
  }
}
