/**
 * FtConsentBannerComponent — minimal GDPR cookie consent banner.
 *
 * Lives at the bottom of the screen, fixed position, until the user
 * makes a choice. The choice is persisted via FtAnalyticsService and
 * shared with the rest of the app through its `consent` signal.
 *
 * Per spec: shows on first visit, allows accept/decline, and respects
 * the browser's Do Not Track signal.
 */
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FtAnalyticsService } from '../../../core/services/analytics.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'ft-consent-banner',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="consent-banner"
        role="region"
        aria-label="Cookie consent"
        aria-live="polite"
      >
        <div class="consent-banner__content">
          <p class="consent-banner__text">
            {{ 'analytics.consent.message' | translate }}
            <a class="consent-banner__link" href="/legal/cookies" target="_blank" rel="noopener">
              {{ 'analytics.consent.learnMore' | translate }}
            </a>
          </p>
        </div>
        <div class="consent-banner__actions">
          <button
            type="button"
            class="consent-banner__btn consent-banner__btn--secondary"
            (click)="deny()"
          >
            {{ 'analytics.consent.decline' | translate }}
          </button>
          <button
            type="button"
            class="consent-banner__btn consent-banner__btn--primary"
            (click)="accept()"
          >
            {{ 'analytics.consent.accept' | translate }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .consent-banner {
      position: fixed;
      left: 16px;
      right: 16px;
      bottom: 16px;
      z-index: 90;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
      background: var(--bg-secondary, #fff);
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
      border-radius: 14px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(16px);
      animation: consent-in 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes consent-in {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .consent-banner__content {
      flex: 1 1 auto;
      min-width: 0;
    }

    .consent-banner__text {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    }

    .consent-banner__link {
      color: var(--accent-mid, #a855f7);
      text-decoration: underline;
      margin-left: 4px;
    }

    .consent-banner__actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .consent-banner__btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: transform 0.15s ease, background 0.15s ease;
      font-family: inherit;
    }

    .consent-banner__btn:hover {
      transform: translateY(-1px);
    }

    .consent-banner__btn--secondary {
      background: transparent;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      border-color: var(--border-default, rgba(255, 255, 255, 0.15));
    }

    .consent-banner__btn--secondary:hover {
      background: var(--bg-tertiary, rgba(255, 255, 255, 0.05));
    }

    .consent-banner__btn--primary {
      background: linear-gradient(135deg, var(--accent-start, #a78bfa), var(--accent-end, #8b5cf6));
      color: #fff;
    }

    @media (max-width: 540px) {
      .consent-banner {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
      }
      .consent-banner__actions {
        justify-content: flex-end;
      }
    }
  `],
})
export class FtConsentBannerComponent {
  private readonly analytics = inject(FtAnalyticsService);

  readonly visible = computed(() => this.analytics.consent() === 'pending');

  accept(): void {
    this.analytics.grantConsent();
  }

  deny(): void {
    this.analytics.denyConsent();
  }
}
