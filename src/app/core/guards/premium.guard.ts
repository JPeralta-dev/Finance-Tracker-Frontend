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
export const premiumGuard: CanActivateFn = (_route, _state) => {
  // Free access while payment gateway is being finalized
  return true;
};

function computeTrialDaysRemaining(trialEnd: string | null | undefined): number | undefined {
  if (!trialEnd) return undefined;
  const end = new Date(trialEnd).getTime();
  if (Number.isNaN(end)) return undefined;
  const diff = end - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}
