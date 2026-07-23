/**
 * FtAnnouncementBannerComponent — reusable banner primitive.
 *
 * Use this for system-level messages (trial countdown, maintenance, new
 * feature announcements) that need to be visible at the top of the
 * viewport without interrupting the main flow.
 *
 * Variants map to semantic intent:
 *   - info:    neutral message (default)
 *   - success: positive confirmation
 *   - warning: attention required, low urgency
 *   - error:   urgent attention required
 *
 * Analytics: emits `banner_dismissed` and `banner_cta_clicked` events
 * with the banner's `trackingId` as a property (when provided).
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../icons/icon-registry';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { FtAnalyticsService } from '../../core/services/analytics.service';

export type BannerVariant = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'ft-announcement-banner',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="announcement-banner"
        [class]="'announcement-banner--' + variant()"
        role="status"
        aria-live="polite"
        [attr.aria-label]="ariaLabel()"
      >
        @if (iconName()) {
          <span class="announcement-banner__icon" aria-hidden="true">
            <ng-icon [name]="iconName()!" size="20px" />
          </span>
        }
        <div class="announcement-banner__body">
          @if (titleKey() || titleText()) {
            <span class="announcement-banner__title">
              {{ titleText() || (titleKey() | translate) }}
            </span>
          }
          @if (messageKey() || messageText()) {
            <span class="announcement-banner__message">
              {{ messageText() || (messageKey() | translate) }}
            </span>
          }
        </div>
        @if (ctaKey() || ctaText()) {
          <button
            type="button"
            class="announcement-banner__cta"
            (click)="onCta()"
          >
            {{ ctaText() || (ctaKey() | translate) }}
          </button>
        }
        @if (dismissible()) {
          <button
            type="button"
            class="announcement-banner__close"
            [attr.aria-label]="'banner.dismiss' | translate"
            (click)="dismiss()"
          >
            <ng-icon [name]="closeIcon" size="16px" aria-hidden="true" />
          </button>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }

    .announcement-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
      border: 1px solid var(--banner-border);
      background: var(--banner-bg);
      color: var(--banner-text);
      box-shadow: var(--shadow-sm);
      animation: banner-in 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes banner-in {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .announcement-banner--info {
      --banner-bg: rgba(139, 92, 246, 0.08);
      --banner-border: rgba(139, 92, 246, 0.3);
      --banner-text: #c4b5fd;
      --banner-icon: #a78bfa;
    }
    .announcement-banner--success {
      --banner-bg: rgba(45, 212, 191, 0.08);
      --banner-border: rgba(45, 212, 191, 0.3);
      --banner-text: #5eead4;
      --banner-icon: #2dd4bf;
    }
    .announcement-banner--warning {
      --banner-bg: rgba(217, 119, 6, 0.1);
      --banner-border: rgba(217, 119, 6, 0.35);
      --banner-text: #fbbf24;
      --banner-icon: #f59e0b;
    }
    .announcement-banner--error {
      --banner-bg: rgba(220, 38, 38, 0.1);
      --banner-border: rgba(220, 38, 38, 0.4);
      --banner-text: #fca5a5;
      --banner-icon: #ef4444;
    }

    .announcement-banner__icon {
      display: inline-flex;
      flex-shrink: 0;
      color: var(--banner-icon);
    }
    .announcement-banner__body {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .announcement-banner__title {
      font-weight: 600;
    }
    .announcement-banner__message {
      opacity: 0.9;
    }
    .announcement-banner__cta {
      flex-shrink: 0;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      background: var(--banner-icon);
      color: #fff;
      border: none;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      font-family: inherit;
    }
    .announcement-banner__cta:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .announcement-banner__close {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--banner-text);
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.15s ease, background 0.15s ease;
    }
    .announcement-banner__close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.05);
    }

    @media (max-width: 540px) {
      .announcement-banner {
        flex-wrap: wrap;
        gap: 8px;
      }
      .announcement-banner__cta { flex: 1 1 auto; }
    }
  `],
})
export class FtAnnouncementBannerComponent {
  // ── Inputs ──────────────────────────────────────────────────────
  readonly variant = input<BannerVariant>('info');
  readonly iconName = input<string | null>(null);
  readonly titleText = input<string>('');
  readonly titleKey = input<string>('');
  readonly messageText = input<string>('');
  readonly messageKey = input<string>('');
  readonly ctaText = input<string>('');
  readonly ctaKey = input<string>('');
  readonly ctaRoute = input<string | null>(null);
  readonly dismissible = input<boolean>(true);
  /** Optional analytics key — when set, dismissal/CTA events include it. */
  readonly trackingId = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────
  readonly dismissed = output<void>();
  readonly ctaClicked = output<void>();

  // ── Internals ───────────────────────────────────────────────────
  readonly visible = signal(true);
  private readonly analytics = inject(FtAnalyticsService);
  readonly closeIcon = ICONS.close;

  readonly ariaLabel = computed(() => {
    const t = this.titleText() || this.titleKey();
    const m = this.messageText() || this.messageKey();
    return [t, m].filter(Boolean).join('. ');
  });

  // Track whether the user-initiated dismissal has fired so we don't
  // double-emit if a parent toggles `visible` off.
  private userDismissed = false;

  constructor() {
    // Allow parent to force-hide via two-way binding if needed.
    effect(() => {
      // Re-show when trackingId changes (e.g. new banner content)
      this.trackingId();
      this.userDismissed = false;
    });
  }

  dismiss(): void {
    if (this.userDismissed) return;
    this.userDismissed = true;
    this.visible.set(false);
    this.dismissed.emit();
    const id = this.trackingId();
    if (id) {
      this.analytics.trackEvent('trial_banner_dismissed', {
        variant: id,
      });
    }
  }

  onCta(): void {
    this.ctaClicked.emit();
    const id = this.trackingId();
    if (id) {
      this.analytics.trackEvent('trial_banner_cta_clicked', {
        variant: id,
      });
    }
  }
}
