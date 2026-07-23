/**
 * FtPremiumActionDirective — clickable elements that should trigger the
 * upgrade modal for free users instead of executing the action.
 *
 * Usage:
 *   <button ftPremiumAction [ftPremiumActionFeature]="'create-goal'">
 *     Create goal
 *   </button>
 *
 *   <a ftPremiumAction [ftPremiumActionFeature]="'insights'"
 *      [ftPremiumActionRoute]="'/insights'">
 *     Go to insights
 *   </a>
 *
 * The directive is non-blocking: it does NOT prevent default on
 * premium users. Only on free/trial users does it intercept the click,
 * open the upgrade modal, and stop the action from running.
 */
import {
  Directive,
  HostListener,
  Input,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UpgradeModalService } from '../../core/services/upgrade-modal.service';
import { FtAnalyticsService } from '../../core/services/analytics.service';

export type PremiumFeature =
  | 'create-goal'
  | 'create-pocket'
  | 'view-insights'
  | 'view-analytics'
  | 'ai-chat'
  | 'export-pdf'
  | 'connect-telegram'
  | string;

@Directive({
  selector: '[ftPremiumAction]',
  standalone: true,
})
export class FtPremiumActionDirective {
  private readonly auth = inject(AuthService);
  private readonly upgradeModal = inject(UpgradeModalService);
  private readonly analytics = inject(FtAnalyticsService);
  private readonly router = inject(Router);

  @Input('ftPremiumActionFeature') feature: PremiumFeature = 'generic';
  /** Optional route to navigate to if the user clicks upgrade. */
  @Input() ftPremiumActionRoute: string | null = null;
  /** Optional: override the auto-detected source for analytics. */
  @Input() ftPremiumActionSource: string | null = null;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    if (this.auth.isPremium()) {
      // Premium user: do nothing, let the original click proceed.
      return;
    }

    // Free user: intercept, open modal, prevent the action.
    event.preventDefault();
    event.stopPropagation();

    this.analytics.trackEvent('premium_feature_attempted', {
      feature: this.feature,
      source: this.ftPremiumActionSource ?? undefined,
    });
    this.analytics.trackEvent('upgrade_prompt_shown', {
      feature: this.feature,
      source: this.ftPremiumActionSource ?? undefined,
    });

    this.upgradeModal.openModal({
      trigger: 'direct_link',
      route: this.ftPremiumActionRoute ?? this.router.url,
      currentTier: this.auth.subscriptionTier(),
      onCta: this.ftPremiumActionRoute
        ? () => this.router.navigateByUrl(this.ftPremiumActionRoute!)
        : undefined,
    });
  }
}
