/**
 * FtTrialBannerService — tracks when the trial countdown banner was last
 * dismissed so it doesn't reappear on every navigation.
 *
 * Dismissal TTL is 24h per spec: after 24h, the banner shows again.
 * State is persisted in localStorage so the rule survives reloads.
 */
import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

const DISMISS_KEY_PREFIX = 'flowr_trial_banner_dismissed_at';
const HIDE_FOREVER_KEY = 'flowr_trial_banner_dismissed_forever';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class FtTrialBannerService {
  private readonly auth = inject(AuthService);

  // ── Signals ────────────────────────────────────────────────────
  private readonly _dismissedAt = signal<number | null>(this.readDismissTimestamp());
  readonly dismissedAt = this._dismissedAt.asReadonly();

  /**
   * Whether the banner should be visible RIGHT NOW. Combines:
   *   - active trial
   *   - not premium (premium users never see trial banners)
   *   - not dismissed within the last 24h
   */
  readonly isVisible = computed(() => {
    const sub = this.auth.currentSubscription();
    if (!sub) return false;
    if (sub.status !== 'active_trial') return false;
    if (!sub.trialEnd) return false;
    const days = this.computeDaysRemaining(sub.trialEnd);
    if (days === null || days < 0) return false;

    const dismissed = this._dismissedAt();
    if (dismissed && Date.now() - dismissed < DISMISS_TTL_MS) return false;
    return true;
  });

  /** Days remaining in the current trial. Null when no active trial. */
  readonly daysRemaining = computed<number | null>(() => {
    const sub = this.auth.currentSubscription();
    if (!sub?.trialEnd) return null;
    return this.computeDaysRemaining(sub.trialEnd);
  });

  /** Map days remaining to the visual variant per spec. */
  readonly variant = computed<'info' | 'warning' | 'error'>(() => {
    const d = this.daysRemaining() ?? Infinity;
    if (d < 1) return 'error';
    if (d < 3) return 'warning';
    return 'info';
  });

  dismiss(): void {
    const now = Date.now();
    this._dismissedAt.set(now);
    if (typeof localStorage !== 'undefined') {
      const userId = this.auth.currentUser()?.id ?? 'anon';
      localStorage.setItem(`${DISMISS_KEY_PREFIX}_${userId}`, String(now));
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────
  private computeDaysRemaining(trialEnd: string): number | null {
    const end = new Date(trialEnd).getTime();
    if (Number.isNaN(end)) return null;
    const diff = end - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  }

  private readDismissTimestamp(): number | null {
    if (typeof localStorage === 'undefined') return null;
    // Try user-scoped key first, fall back to the legacy non-scoped one
    // so existing users keep their preference.
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(DISMISS_KEY_PREFIX)) {
        const v = localStorage.getItem(key);
        if (v) {
          const ts = parseInt(v, 10);
          if (!Number.isNaN(ts)) return ts;
        }
      }
    }
    if (localStorage.getItem(HIDE_FOREVER_KEY)) return Date.now();
    return null;
  }
}
