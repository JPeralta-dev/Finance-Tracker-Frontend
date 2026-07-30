import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect,
  ViewEncapsulation,
  NgZone,
  DestroyRef,
} from '@angular/core';
import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

import { FtTourService } from '../../../core/services/tour.service';
import { TranslationService } from '../../../core/services/translation.service';
import type { TourStep } from '../../models/tour.types';

@Component({
  selector: 'ft-tour-overlay',
  standalone: true,
  imports: [],
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .ft-driver-popover.driver-popover {
      background: var(--glass-bg);
      backdrop-filter: blur(var(--glass-blur, 16px));
      -webkit-backdrop-filter: blur(var(--glass-blur, 16px));
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md, 12px);
      color: var(--text-primary);
      box-shadow: var(--shadow-lg);
      font-family: var(--font-body);
    }

    .ft-driver-popover .driver-popover-title {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--text-primary);
      margin: 0 0 8px;
    }

    .ft-driver-popover .driver-popover-description {
      font-family: var(--font-body);
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-secondary);
      margin: 0 0 16px;
    }

    .ft-driver-popover .driver-popover-progress-text {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--accent-mid);
    }

    .ft-driver-popover .driver-popover-next-btn,
    .ft-driver-popover .driver-popover-prev-btn,
    .ft-driver-popover .driver-popover-close-btn {
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      border-radius: var(--radius-sm, 8px);
      padding: 8px 16px;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      cursor: pointer;
      min-height: 44px;
      text-shadow: none;
      border: 1px solid transparent;
    }

    .ft-driver-popover .driver-popover-next-btn {
      background: linear-gradient(135deg, var(--accent-start), var(--accent-mid));
      color: var(--text-inverse);
      border: none;
    }
    .ft-driver-popover .driver-popover-next-btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--glow-accent);
    }
    .ft-driver-popover .driver-popover-next-btn:active {
      transform: scale(0.97);
    }

    .ft-driver-popover .driver-popover-prev-btn {
      background: transparent;
      color: var(--text-tertiary);
    }
    .ft-driver-popover .driver-popover-prev-btn:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }

    .ft-driver-popover .driver-popover-close-btn {
      background: transparent;
      color: var(--text-tertiary);
    }
    .ft-driver-popover .driver-popover-close-btn:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }

    .ft-driver-popover .driver-popover-next-btn:focus-visible,
    .ft-driver-popover .driver-popover-prev-btn:focus-visible,
    .ft-driver-popover .driver-popover-close-btn:focus-visible {
      outline: 2px solid var(--accent-start);
      outline-offset: 2px;
    }

    .ft-driver-popover .driver-popover-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .ft-driver-popover .driver-popover-arrow {
      border-color: var(--glass-border);
      background: var(--glass-bg);
    }

    .driver-highlighted-element {
      border-radius: var(--radius-md, 12px) !important;
      box-shadow:
        0 0 0 2px var(--accent-start),
        0 0 0 6px rgba(217, 70, 239, 0.3),
        0 0 30px rgba(217, 70, 239, 0.15) !important;
      animation: driver-pulse 2.4s ease-in-out infinite;
    }

    @keyframes driver-pulse {
      0%, 100% {
        box-shadow:
          0 0 0 2px var(--accent-start),
          0 0 0 6px rgba(217, 70, 239, 0.3),
          0 0 30px rgba(217, 70, 239, 0.15);
      }
      50% {
        box-shadow:
          0 0 0 2px var(--accent-start),
          0 0 0 12px rgba(217, 70, 239, 0.5),
          0 0 40px rgba(217, 70, 239, 0.25);
      }
    }

    .driver-overlay {
      background: rgba(18, 11, 26, 0.85);
    }

    @media (max-width: 640px) {
      .ft-driver-popover.driver-popover {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        top: auto !important;
        border-radius: var(--radius-lg, 16px) var(--radius-lg, 16px) 0 0 !important;
        max-width: none !important;
        width: 100% !important;
        padding-bottom: max(20px, env(safe-area-inset-bottom, 16px)) !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .driver-highlighted-element {
        animation: none !important;
      }
      .ft-driver-popover .driver-popover-next-btn,
      .ft-driver-popover .driver-popover-prev-btn,
      .ft-driver-popover .driver-popover-close-btn {
        transition: none !important;
      }
    }
  `],
})
export class FtTourOverlayComponent {
  protected readonly tour = inject(FtTourService);
  private readonly translation = inject(TranslationService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private driverInstance: Driver | null = null;

  constructor() {
    effect(() => {
      if (this.tour.isActive()) {
        this.zone.runOutsideAngular(() => this.createAndStartDriver());
      } else {
        this.zone.runOutsideAngular(() => this.destroyDriver());
      }
    });

    this.destroyRef.onDestroy(() => {
      this.destroyDriver();
    });
  }

  private createAndStartDriver(): void {
    const startIndex = this.tour.currentStepIndex();
    const steps = this.mapSteps();
    const totalSteps = steps.length;

    this.driverInstance = driver({
      showProgress: true,
      progressText: '{{current}} of {{total}}',
      steps,
      stagePadding: 10,
      popoverClass: 'ft-driver-popover',
      overlayColor: 'rgba(18, 11, 26, 0.85)',
      smoothScroll: true,
      allowClose: true,
      animate: true,
      disableActiveInteraction: false,

      onHighlightStarted: (_element, _step, _opts) => {
        const idx = this.driverInstance?.getActiveIndex();
        if (idx !== undefined && idx >= 0) {
          this.tour.syncStepIndex(idx);
        }
      },

      onCloseClick: () => {
        const currentIdx = this.tour.currentStepIndex();
        this.driverInstance?.destroy();
        if (currentIdx >= totalSteps - 1) {
          this.zone.run(() => this.tour.complete());
        } else {
          this.zone.run(() => this.tour.skip());
        }
      },

      onDestroyed: () => {
        this.driverInstance = null;
      },

      onNextClick: (_element, _step, _opts) => {
        const currentIdx = this.tour.currentStepIndex();
        if (currentIdx >= totalSteps - 1) {
          this.driverInstance?.destroy();
          this.zone.run(() => this.tour.complete());
        }
      },
    });

    this.driverInstance.drive(startIndex);
  }

  private destroyDriver(): void {
    if (this.driverInstance) {
      this.driverInstance.destroy();
      this.driverInstance = null;
    }
  }

  private mapSteps(): DriveStep[] {
    const lang = this.translation.currentLang();
    const isLast = (index: number) => index === this.tour.steps.length - 1;

    return this.tour.steps.map((step: TourStep, index: number): DriveStep => {
      return {
        element: step.targetSelector,
        popover: {
          title: this.translation.translate(step.titleKey),
          description: this.translation.translate(step.descriptionKey),
          side: (step.tooltipPosition === 'auto' ? undefined : step.tooltipPosition),
          showButtons: ['next', 'previous', 'close'],
          doneBtnText: this.translation.translate('tour.finish'),
          nextBtnText: step.actionKey
            ? this.translation.translate(step.actionKey)
            : this.translation.translate('tour.next'),
          prevBtnText: this.translation.translate('tour.previous'),
        },
      } satisfies DriveStep;
    });
  }
}
