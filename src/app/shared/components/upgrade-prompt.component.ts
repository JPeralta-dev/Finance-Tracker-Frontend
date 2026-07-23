/**
 * FtUpgradePromptComponent — non-blocking contextual upgrade prompt.
 *
 * Renders a small card with a lock icon, brief value proposition, and
 * a CTA that navigates to /subscription. Used inline in the dashboard
 * (Rows 3-4) for free users to demonstrate premium value without
 * hiding the underlying widget entirely.
 *
 * Designed to wrap any content via content projection: the blurred
 * preview goes in the default slot, and the prompt card overlays it
 * on hover/click.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { Router } from '@angular/router';
import { ICONS } from '../../icons/icon-registry';
import { AuthService } from '../../../core/services/auth.service';
import { UpgradeModalService } from '../../../core/services/upgrade-modal.service';
import { FtAnalyticsService } from '../../../core/services/analytics.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-upgrade-prompt',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shouldShow()) {
      <div
        class="upgrade-prompt"
        [class]="'upgrade-prompt--' + position()"
        role="complementary"
        [attr.aria-label]="titleKey() | translate"
      >
        <div class="upgrade-prompt__preview" aria-hidden="true">
          <ng-content select="[upgradePreview], [preview]"></ng-content>
        </div>
        <div class="upgrade-prompt__overlay">
          <div class="upgrade-prompt__card">
            <div class="upgrade-prompt__icon">
              <ng-icon [name]="lockIcon" size="20px" />
            </div>
            <div class="upgrade-prompt__copy">
              <h4 class="upgrade-prompt__title">{{ titleKey() | translate }}</h4>
              <p class="upgrade-prompt__description">{{ descriptionKey() | translate }}</p>
            </div>
            <div class="upgrade-prompt__actions">
              <button
                type="button"
                class="upgrade-prompt__btn upgrade-prompt__btn--secondary"
                (click)="onLearnMore()"
              >
                {{ 'upgradePrompt.learnMore' | translate }}
              </button>
              <button
                type="button"
                class="upgrade-prompt__btn upgrade-prompt__btn--primary"
                (click)="onUpgrade()"
              >
                {{ ctaKey() | translate }}
              </button>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <ng-content></ng-content>
    }
  `,
  styles: [`
    :host { display: contents; }

    .upgrade-prompt {
      position: relative;
      display: block;
    }

    .upgrade-prompt__preview {
      filter: blur(6px) grayscale(0.4);
      opacity: 0.55;
      pointer-events: none;
      user-select: none;
      transition: filter 0.3s ease, opacity 0.3s ease;
    }

    .upgrade-prompt__overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .upgrade-prompt__card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 20px;
      width: 100%;
      max-width: 360px;
      background: var(--bg-secondary, #14101f);
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.12));
      border-radius: 16px;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
      text-align: center;
      backdrop-filter: blur(12px);
      animation: upgrade-prompt-in 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes upgrade-prompt-in {
      from { opacity: 0; transform: translateY(6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .upgrade-prompt__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.1));
      color: var(--accent-mid, #a78bfa);
    }

    .upgrade-prompt__copy { width: 100%; }

    .upgrade-prompt__title {
      margin: 0 0 4px;
      font-family: var(--font-display, 'Space Grotesk', system-ui);
      font-size: 15px;
      font-weight: 600;
      color: var(--text-primary, #fff);
      line-height: 1.3;
    }

    .upgrade-prompt__description {
      margin: 0;
      font-size: 12.5px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      line-height: 1.5;
    }

    .upgrade-prompt__actions {
      display: flex;
      gap: 8px;
      width: 100%;
      justify-content: center;
    }

    .upgrade-prompt__btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: transform 0.15s ease, background 0.15s ease;
      font-family: inherit;
    }
    .upgrade-prompt__btn:hover { transform: translateY(-1px); }
    .upgrade-prompt__btn--secondary {
      background: transparent;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      border-color: var(--border-default, rgba(255, 255, 255, 0.12));
    }
    .upgrade-prompt__btn--secondary:hover {
      background: var(--bg-tertiary, rgba(255, 255, 255, 0.05));
      color: var(--text-primary, #fff);
    }
    .upgrade-prompt__btn--primary {
      background: linear-gradient(135deg, var(--accent-start, #a78bfa), var(--accent-end, #8b5cf6));
      color: #fff;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
    }
    .upgrade-prompt__btn:focus-visible {
      outline: 2px solid var(--accent-mid, #a855f7);
      outline-offset: 2px;
    }

    @media (max-width: 540px) {
      .upgrade-prompt__actions { flex-direction: column; }
      .upgrade-prompt__btn { width: 100%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .upgrade-prompt__card { animation: none; }
    }
  `],
})
export class FtUpgradePromptComponent {
  private readonly auth = inject(AuthService);
  private readonly upgradeModal = inject(UpgradeModalService);
  private readonly analytics = inject(FtAnalyticsService);
  private readonly router = inject(Router);

  readonly lockIcon = ICONS.lockClosed;

  /** Feature type — passed to analytics for funnel breakdown. */
  readonly feature = input<'insights' | 'goals' | 'analytics' | 'ai' | string>('generic');
  /** Translation key for the headline. */
  readonly titleKey = input<string>('upgradePrompt.default.title');
  /** Translation key for the body. */
  readonly descriptionKey = input<string>('upgradePrompt.default.description');
  /** Translation key for the CTA button. */
  readonly ctaKey = input<string>('upgradePrompt.default.cta');
  /** Optional route override for the upgrade action. */
  readonly upgradeRoute = input<string>('/subscription');
  /** If true, ALWAYS render the prompt (override auto-hide for premium). */
  readonly forceVisible = input<boolean>(false);

  readonly position = input<'inline' | 'absolute'>('inline');

  readonly shouldShow = computed(() => {
    if (this.forceVisible()) return true;
    return !this.auth.isPremium();
  });

  onLearnMore(): void {
    this.analytics.trackEvent('upgrade_prompt_clicked', {
      feature: this.feature(),
      action: 'learn_more',
    });
    this.upgradeModal.openModal({
      trigger: 'dashboard_prompt',
      route: this.router.url,
      currentTier: this.auth.subscriptionTier(),
      onCta: () => this.router.navigateByUrl(this.upgradeRoute()),
    });
  }

  onUpgrade(): void {
    this.analytics.trackEvent('upgrade_prompt_clicked', {
      feature: this.feature(),
      action: 'upgrade',
    });
    this.analytics.trackEvent('upgrade_clicked', {
      trigger: 'dashboard_prompt',
      feature: this.feature(),
    });
    this.router.navigateByUrl(this.upgradeRoute());
  }
}
