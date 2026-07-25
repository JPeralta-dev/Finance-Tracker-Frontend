/**
 * FtTourOverlayComponent — visual layer for the onboarding tour.
 *
 * Renders a fullscreen dim overlay with a cutout (using box-shadow
 * trick) over the current step's target element, plus a positioned
 * tooltip with Next / Previous / Skip / Done controls.
 *
 * Subscribes to FtTourService signals and uses ResizeObserver +
 * scroll listener to keep the cutout and tooltip aligned with the
 * target as the page changes.
 */
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  computed,
  HostListener,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FtTourService } from '../../../core/services/tour.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

const HIGHLIGHT_PADDING_DEFAULT = 8;
const TOOLTIP_OFFSET = 12;

@Component({
  selector: 'ft-tour-overlay',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tour.isActive() && tour.currentStep(); as step) {
      <div
        class="tour-overlay"
        [class.tour-overlay--closing]="closing()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="step.titleKey | translate"
      >
        <!-- Cutout (4 dark rectangles around the target) -->
        <div class="tour-overlay__cutout" [style]="cutoutStyle()"></div>

        <!-- Highlight ring around the target -->
        <div
          class="tour-overlay__highlight"
          [style.top.px]="rect().top - highlightPadding()"
          [style.left.px]="rect().left - highlightPadding()"
          [style.width.px]="rect().width + (highlightPadding() * 2)"
          [style.height.px]="rect().height + (highlightPadding() * 2)"
        ></div>

        <!-- Tooltip card -->
        <div
          class="tour-tooltip"
          [class]="'tour-tooltip--' + placement()"
          [style.top.px]="tooltipTop()"
          [style.left.px]="tooltipLeft()"
          [style.maxWidth.px]="320"
        >
          <div class="tour-tooltip__progress" aria-live="polite">
            <span class="tour-tooltip__step">
              {{ 'tour.progress' | translate: { current: tour.currentStepNumber(), total: tour.totalSteps } }}
            </span>
          </div>
          <h3 class="tour-tooltip__title">
            {{ step.titleKey | translate }}
          </h3>
          <p class="tour-tooltip__description">
            {{ step.descriptionKey | translate }}
          </p>
          <div class="tour-tooltip__actions">
            <button
              type="button"
              class="tour-tooltip__btn tour-tooltip__btn--ghost"
              (click)="tour.skip()"
              [attr.aria-label]="'tour.skip' | translate"
            >
              {{ 'tour.skipTour' | translate }}
            </button>
            <div class="tour-tooltip__nav">
              @if (tour.currentStepNumber() > 1) {
                <button
                  type="button"
                  class="tour-tooltip__btn tour-tooltip__btn--ghost"
                  (click)="tour.previous()"
                  [attr.aria-label]="'tour.previous' | translate"
                >
                  ‹ {{ 'tour.previous' | translate }}
                </button>
              }
              <button
                type="button"
                class="tour-tooltip__btn tour-tooltip__btn--primary"
                (click)="onPrimary()"
                [attr.aria-label]="isLastStep() ? ('tour.finish' | translate) : ('tour.next' | translate)"
              >
                @if (step.actionKey && !isLastStep()) {
                  {{ step.actionKey | translate }}
                } @else if (isLastStep()) {
                  {{ 'tour.startExploring' | translate }}
                } @else {
                  {{ 'tour.next' | translate }} ›
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }

    .tour-overlay {
      position: fixed;
      inset: 0;
      z-index: 1100;
      pointer-events: auto;
      animation: tour-in 300ms ease-in-out both;
    }

    @keyframes tour-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .tour-overlay__cutout {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(2px);
      /* Cutout via box-shadow — the four insets are the "hole" edges */
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.65);
      pointer-events: none;
    }

    .tour-overlay__highlight {
      position: fixed;
      border-radius: 12px;
      box-shadow:
        0 0 0 2px var(--accent-mid, #a855f7),
        0 0 0 6px rgba(167, 139, 250, 0.3),
        0 0 30px rgba(167, 139, 250, 0.4);
      pointer-events: none;
      animation: tour-pulse 2.4s ease-in-out infinite;
    }

    @keyframes tour-pulse {
      0%, 100% { box-shadow: 0 0 0 2px var(--accent-mid, #a855f7), 0 0 0 6px rgba(167, 139, 250, 0.3); }
      50%      { box-shadow: 0 0 0 2px var(--accent-mid, #a855f7), 0 0 0 12px rgba(167, 139, 250, 0.5); }
    }

    .tour-tooltip {
      position: fixed;
      z-index: 1101;
      padding: 20px;
      background: var(--bg-secondary, #14101f);
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
      border-radius: 14px;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.5);
      color: var(--text-primary, #fff);
      font-size: 14px;
      animation: tour-tooltip-in 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes tour-tooltip-in {
      from { opacity: 0; transform: scale(0.96) translateY(4px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    .tour-tooltip__progress {
      margin-bottom: 8px;
    }
    .tour-tooltip__step {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--accent-mid, #a78bfa);
    }

    .tour-tooltip__title {
      margin: 0 0 8px;
      font-family: var(--font-display, 'Space Grotesk', system-ui);
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
    }

    .tour-tooltip__description {
      margin: 0 0 16px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      line-height: 1.5;
      font-size: 13px;
    }

    .tour-tooltip__actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .tour-tooltip__nav {
      display: flex;
      gap: 8px;
    }

    .tour-tooltip__btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: transform 0.15s ease, background 0.15s ease;
      font-family: inherit;
    }
    .tour-tooltip__btn:hover { transform: translateY(-1px); }
    .tour-tooltip__btn--ghost {
      background: transparent;
      color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
      border-color: transparent;
    }
    .tour-tooltip__btn--ghost:hover {
      color: var(--text-primary, #fff);
      background: var(--bg-tertiary, rgba(255, 255, 255, 0.05));
    }
    .tour-tooltip__btn--primary {
      background: linear-gradient(135deg, var(--accent-start, #a78bfa), var(--accent-end, #8b5cf6));
      color: #fff;
    }
    .tour-tooltip__btn:focus-visible {
      outline: 2px solid var(--accent-mid, #a855f7);
      outline-offset: 2px;
    }

    @media (max-width: 540px) {
      .tour-tooltip {
        left: 12px !important;
        right: 12px !important;
        width: auto !important;
        max-width: none !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tour-overlay,
      .tour-tooltip,
      .tour-overlay__highlight {
        animation: none !important;
      }
    }
  `],
})
export class FtTourOverlayComponent {
  protected readonly tour = inject(FtTourService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly closing = signal(false);
  readonly rect = signal<TargetRect>({ top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 });
  readonly placement = signal<TooltipPlacement>('bottom');
  readonly highlightPadding = signal(HIGHLIGHT_PADDING_DEFAULT);

  // Cutout style uses a custom property we can't easily template-bind, so
  // we compute a "raw" inset string for the background to bleed through
  // the four cutout sides.
  readonly cutoutStyle = computed(() => {
    const r = this.rect();
    const pad = this.highlightPadding();
    const t = r.top - pad;
    const l = r.left - pad;
    const w = r.width + pad * 2;
    const h = r.height + pad * 2;
    // Box-shadow trick: outer black ring is the overlay; the gap is the
    // cutout. We use a transparent rect bordered by a 9999px box-shadow.
    return {
      'box-shadow': `0 0 0 9999px rgba(0, 0, 0, 0.65)`,
      '--cutout-top': `${t}px`,
      '--cutout-left': `${l}px`,
      '--cutout-width': `${w}px`,
      '--cutout-height': `${h}px`,
    } as Record<string, string>;
  });

  readonly tooltipTop = signal(0);
  readonly tooltipLeft = signal(0);

  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;

  constructor() {
    // Re-compute target position whenever the active step changes.
    effect(() => {
      if (this.tour.isActive()) {
        this.highlightPadding.set(this.tour.currentStep()?.highlightPadding ?? HIGHLIGHT_PADDING_DEFAULT);
        // Defer to next frame so the target element is mounted / visible.
        requestAnimationFrame(() => this.measure());
      }
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    });
  }

  isLastStep(): boolean {
    return this.tour.currentStepNumber() === this.tour.totalSteps;
  }

  onPrimary(): void {
    const step = this.tour.currentStep();
    if (!step) return;
    if (step.actionRoute) {
      this.router.navigateByUrl(step.actionRoute);
    }
    if (this.isLastStep()) {
      this.tour.complete();
    } else {
      this.tour.next();
    }
  }

  // ── Positioning ───────────────────────────────────────────────

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScrollOrResize(): void {
    if (this.tour.isActive()) this.measure();
  }

  private measure(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => {
      const step = this.tour.currentStep();
      if (!step) return;
      const target = document.querySelector(step.targetSelector) as HTMLElement | null;
      if (!target) {
        // Element not yet on screen — center the tooltip instead
        this.rect.set({ top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0, bottom: 0, right: 0 });
        this.tooltipTop.set(60);
        this.tooltipLeft.set(Math.max(16, (window.innerWidth - 320) / 2));
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const r = target.getBoundingClientRect();
      this.rect.set({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
        bottom: r.bottom,
        right: r.right,
      });
      this.positionTooltip(r, step.tooltipPosition ?? 'auto');
    });
  }

  private positionTooltip(target: DOMRect, requested: 'top' | 'bottom' | 'left' | 'right' | 'auto'): void {
    const ttWidth = 320;
    const ttHeight = 200; // estimate
    const margin = 16;

    let placement = requested === 'auto' ? this.choosePlacement(target, ttWidth, ttHeight, margin) : requested;
    placement = placement === 'top' || placement === 'bottom' || placement === 'left' || placement === 'right'
      ? placement as TooltipPlacement
      : 'bottom';
    this.placement.set(placement);

    let top = 0;
    let left = 0;
    switch (placement) {
      case 'top':
        top = target.top - ttHeight - TOOLTIP_OFFSET;
        left = target.left + target.width / 2 - ttWidth / 2;
        break;
      case 'bottom':
        top = target.bottom + TOOLTIP_OFFSET;
        left = target.left + target.width / 2 - ttWidth / 2;
        break;
      case 'left':
        top = target.top + target.height / 2 - ttHeight / 2;
        left = target.left - ttWidth - TOOLTIP_OFFSET;
        break;
      case 'right':
        top = target.top + target.height / 2 - ttHeight / 2;
        left = target.right + TOOLTIP_OFFSET;
        break;
    }

    // Clamp to viewport
    left = Math.max(margin, Math.min(left, window.innerWidth - ttWidth - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - ttHeight - margin));

    this.tooltipTop.set(top);
    this.tooltipLeft.set(left);
  }

  private choosePlacement(
    target: DOMRect,
    ttWidth: number,
    ttHeight: number,
    margin: number,
  ): TooltipPlacement {
    const spaceBelow = window.innerHeight - target.bottom;
    const spaceAbove = target.top;
    const spaceRight = window.innerWidth - target.right;
    const spaceLeft = target.left;

    if (spaceBelow >= ttHeight + margin) return 'bottom';
    if (spaceAbove >= ttHeight + margin) return 'top';
    if (spaceRight >= ttWidth + margin) return 'right';
    if (spaceLeft >= ttWidth + margin) return 'left';
    return 'bottom';
  }
}
