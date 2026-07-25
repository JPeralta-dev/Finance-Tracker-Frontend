import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UpgradeModalService } from '../services/upgrade-modal.service';
import { FtAnalyticsService } from '../services/analytics.service';

/**
 * Premium route guard — opens the global upgrade modal for free users
 * instead of redirecting, so the user can compare tiers and choose.
 *
 * If the user dismisses the modal they stay on the previous page; the
 * route is NOT activated.
 */
export const premiumGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const upgradeModal = inject(UpgradeModalService);
  const analytics = inject(FtAnalyticsService);

  // Trigger session check (idempotent)
  authService.initAuthCheck();

  return authService.authReady$.pipe(
    filter((ready) => ready),
    take(1),
    map(() => {
      if (authService.isPremium()) {
        return true;
      }

      // Track the attempt and open the modal. We DON'T redirect — the
      // modal gives the user a clear path to upgrade and respects their
      // choice to stay where they were.
      analytics.trackEvent('premium_access_attempted', {
        route: state.url,
        trigger: 'premium_guard',
        tier: authService.subscriptionTier(),
      });
      analytics.trackEvent('paywall_modal_shown', {
        route: state.url,
        trigger: 'premium_guard',
      });

      const trialDays = computeTrialDaysRemaining(authService.currentSubscription()?.trialEnd);
      upgradeModal.openModal({
        trigger: 'premium_guard',
        route: state.url,
        currentTier: authService.subscriptionTier(),
        trialDaysRemaining: trialDays,
        onCta: () => router.navigate(['/subscription'], { queryParams: { upgrade: 'true' } }),
      });

      return false;
    }),
  );
};

function computeTrialDaysRemaining(trialEnd: string | null | undefined): number | undefined {
  if (!trialEnd) return undefined;
  const end = new Date(trialEnd).getTime();
  if (Number.isNaN(end)) return undefined;
  const diff = end - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}
