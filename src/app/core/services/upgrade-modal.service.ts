/**
 * UpgradeModalService — singleton controller for the global upgrade modal.
 *
 * Lets any caller (premium guard, ftPremiumAction directive, dashboard
 * upgrade prompt) open the modal with optional context (current tier,
 * trial info, trigger source for analytics).
 *
 * The visual is rendered by FtUpgradeModalComponent which is mounted
 * once at the app root and listens to this service.
 */
import { Injectable, signal, computed } from '@angular/core';
import { SubscriptionTier } from '../models/user.model';
import { TierComparisonRow } from '../../shared/models/tier-comparison.model';

export interface UpgradeModalConfig {
  /** Where the modal was triggered from — used for analytics */
  trigger: 'premium_guard' | 'dashboard_prompt' | 'manual' | 'direct_link';
  /** The route the user was trying to access (optional) */
  route?: string;
  /** User's current tier (default: 'free') */
  currentTier?: SubscriptionTier;
  /** Optional trial days remaining — adds trial info banner */
  trialDaysRemaining?: number;
  /** Custom comparison rows (defaults to the standard set) */
  rows?: TierComparisonRow[];
  /** Optional callback to override default navigation to /subscription */
  onCta?: () => void;
}

@Injectable({ providedIn: 'root' })
export class UpgradeModalService {
  private readonly _open = signal(false);
  private readonly _config = signal<UpgradeModalConfig | null>(null);

  readonly open = this._open.asReadonly();
  readonly config = computed(() => this._config());

  /** Open the modal with the given config. Idempotent if already open with same config. */
  openModal(config: UpgradeModalConfig): void {
    this._config.set(config);
    this._open.set(true);
  }

  /** Close the modal. */
  close(): void {
    this._open.set(false);
    // Defer clearing config so the close animation can read it.
    setTimeout(() => this._config.set(null), 250);
  }
}
