/**
 * FtUpgradeModalComponent — global paywall modal.
 *
 * Mounted once at the app root. Subscribes to UpgradeModalService and
 * shows a tier-comparison table when opened from the premium guard,
 * dashboard prompt, or any ftPremiumAction directive.
 *
 * Analytics events (via FtAnalyticsService):
 *   - paywall_modal_shown   (on open)
 *   - modal_upgrade_clicked (on CTA)
 *   - modal_closed_without_upgrade (on close)
 */
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { FtModalComponent } from '../modal/ft-modal.component';
import {
  DEFAULT_TIER_COLUMNS,
  DEFAULT_TIER_ROWS,
  TierComparisonColumn,
  TierComparisonRow,
} from '../../../shared/models/tier-comparison.model';
import { AuthService } from '../../../core/services/auth.service';
import { FtAnalyticsService } from '../../../core/services/analytics.service';
import { UpgradeModalService } from '../../../core/services/upgrade-modal.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-upgrade-modal',
  standalone: true,
  imports: [CommonModule, FtModalComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ft-modal
      [open]="svc.open()"
      [size]="'lg'"
      [closeOnBackdrop]="true"
      [closeOnEsc]="true"
      [headerTitleKey]="'upgradeModal.headline'"
      (closed)="onClosed()"
    >
      <ng-container modalBody>
        @if (showTrialBanner()) {
          <div class="upgrade-modal__trial">
            <span class="upgrade-modal__trial-icon">⏳</span>
            <span>
              {{
                'upgradeModal.trialActive'
                  | translate: { days: trialDays() }
              }}
            </span>
          </div>
        }

        <p class="upgrade-modal__subhead">
          {{ 'upgradeModal.subhead' | translate }}
        </p>

        <div class="upgrade-modal__table" role="table" [attr.aria-label]="'upgradeModal.headline' | translate">
          <div class="upgrade-modal__row upgrade-modal__row--head" role="row">
            <div class="upgrade-modal__cell upgrade-modal__cell--feature" role="columnheader">
              {{ 'upgradeModal.featureCol' | translate }}
            </div>
            @for (col of visibleColumns(); track col.tier) {
              <div
                class="upgrade-modal__cell upgrade-modal__cell--tier"
                [class.upgrade-modal__cell--highlight]="col.highlight"
                role="columnheader"
              >
                <span class="upgrade-modal__tier-name">
                  {{ col.nameKey | translate }}
                </span>
                <span class="upgrade-modal__tier-tagline">
                  {{ col.taglineKey | translate }}
                </span>
                @if (isCurrentTier(col.tier)) {
                  <span class="upgrade-modal__tier-current">
                    {{ 'upgradeModal.currentTier' | translate }}
                  </span>
                }
              </div>
            }
          </div>

          @for (row of rows(); track row.featureKey) {
            <div
              class="upgrade-modal__row"
              [class.upgrade-modal__row--highlight]="row.highlight"
              role="row"
            >
              <div class="upgrade-modal__cell upgrade-modal__cell--feature" role="cell">
                <span class="upgrade-modal__feature-name">
                  {{ row.featureKey | translate }}
                </span>
                @if (row.subLabelKey) {
                  <span class="upgrade-modal__feature-sub">
                    {{ row.subLabelKey | translate }}
                  </span>
                }
              </div>
              @for (col of visibleColumns(); track col.tier) {
                <div
                  class="upgrade-modal__cell upgrade-modal__cell--value"
                  [class.upgrade-modal__cell--highlight]="col.highlight"
                  role="cell"
                >
                  @if (cellValue(row, col.tier) === true) {
                    <span class="upgrade-modal__check" aria-label="yes">✓</span>
                  } @else if (cellValue(row, col.tier) === false) {
                    <span class="upgrade-modal__dash" aria-label="no">—</span>
                  } @else {
                    <span class="upgrade-modal__text-value">
                      {{ cellValue(row, col.tier) }}
                    </span>
                  }
                </div>
              }
            </div>
          }
        </div>
      </ng-container>

      <ng-container modalFooter>
        <button
          type="button"
          class="upgrade-modal__btn upgrade-modal__btn--ghost"
          (click)="onLater()"
        >
          {{ 'upgradeModal.maybeLater' | translate }}
        </button>
        <button
          type="button"
          class="upgrade-modal__btn upgrade-modal__btn--primary"
          (click)="onUpgrade()"
        >
          {{ ctaLabel() | translate }}
        </button>
      </ng-container>
    </ft-modal>
  `,
  styles: [`
    :host { display: contents; }

    .upgrade-modal__trial {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
      background: var(--info-bg, rgba(139, 92, 246, 0.1));
      border: 1px solid var(--info, rgba(139, 92, 246, 0.3));
      border-radius: 10px;
      font-size: 13px;
      color: var(--text-primary, #fff);
    }
    .upgrade-modal__trial-icon { font-size: 16px; }

    .upgrade-modal__subhead {
      margin: 0 0 18px;
      font-size: 14px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      line-height: 1.5;
    }

    .upgrade-modal__table {
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
      border-radius: 12px;
      overflow: hidden;
    }

    .upgrade-modal__row {
      display: grid;
      grid-template-columns: 1.4fr repeat(var(--col-count, 3), 1fr);
      border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
    }
    .upgrade-modal__row:first-child { border-top: none; }

    .upgrade-modal__row--head {
      background: var(--bg-tertiary, rgba(255, 255, 255, 0.04));
    }

    .upgrade-modal__row--highlight {
      background: rgba(167, 139, 250, 0.05);
    }

    .upgrade-modal__cell {
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 13px;
      color: var(--text-primary, #fff);
      border-left: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
    }
    .upgrade-modal__cell:first-child {
      border-left: none;
    }

    .upgrade-modal__cell--feature { color: var(--text-secondary, rgba(255, 255, 255, 0.7)); }
    .upgrade-modal__cell--tier { text-align: center; align-items: center; }
    .upgrade-modal__cell--value { text-align: center; align-items: center; justify-content: center; }
    .upgrade-modal__cell--highlight {
      background: rgba(167, 139, 250, 0.08);
    }

    .upgrade-modal__tier-name { font-weight: 600; font-size: 14px; }
    .upgrade-modal__tier-tagline {
      font-size: 11px;
      color: var(--text-tertiary, rgba(255, 255, 255, 0.45));
    }
    .upgrade-modal__tier-current {
      display: inline-block;
      margin-top: 4px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 999px;
      background: var(--accent-glow, rgba(167, 139, 250, 0.25));
      color: var(--accent-mid, #c4b5fd);
    }

    .upgrade-modal__feature-name { font-weight: 500; }
    .upgrade-modal__feature-sub {
      font-size: 11px;
      color: var(--text-tertiary, rgba(255, 255, 255, 0.45));
    }

    .upgrade-modal__check {
      color: var(--success, #2dd4bf);
      font-weight: 700;
      font-size: 16px;
    }
    .upgrade-modal__dash {
      color: var(--text-tertiary, rgba(255, 255, 255, 0.3));
    }
    .upgrade-modal__text-value {
      font-size: 12px;
      color: var(--text-primary, #fff);
      font-weight: 500;
    }

    .upgrade-modal__btn {
      padding: 10px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: transform 0.15s ease, background 0.15s ease, opacity 0.15s ease;
      font-family: inherit;
    }
    .upgrade-modal__btn:hover { transform: translateY(-1px); }
    .upgrade-modal__btn--ghost {
      background: transparent;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      border-color: var(--border-default, rgba(255, 255, 255, 0.12));
    }
    .upgrade-modal__btn--ghost:hover {
      background: var(--bg-tertiary, rgba(255, 255, 255, 0.05));
      color: var(--text-primary, #fff);
    }
    .upgrade-modal__btn--primary {
      background: linear-gradient(135deg, var(--accent-start, #a78bfa), var(--accent-end, #8b5cf6));
      color: #fff;
      box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
    }
    .upgrade-modal__btn--primary:hover {
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
    }
    .upgrade-modal__btn:focus-visible {
      outline: 2px solid var(--accent-mid, #a855f7);
      outline-offset: 2px;
    }

    @media (max-width: 640px) {
      .upgrade-modal__row {
        grid-template-columns: 1.4fr repeat(var(--col-count, 3), 1fr);
        font-size: 12px;
      }
      .upgrade-modal__cell { padding: 10px 8px; }
      .upgrade-modal__tier-name { font-size: 12px; }
      .upgrade-modal__tier-tagline { display: none; }
    }
  `],
})
export class FtUpgradeModalComponent {
  readonly svc = inject(UpgradeModalService);
  private readonly auth = inject(AuthService);
  private readonly analytics = inject(FtAnalyticsService);
  private readonly router = inject(Router);

  readonly rows = computed<TierComparisonRow[]>(() => {
    const cfg = this.svc.config();
    return cfg?.rows ?? DEFAULT_TIER_ROWS;
  });

  /**
   * Show only the tiers above the user's current one. Free users see all 3,
   * Premium users see Free + Premium + Premium Plus but with Free styled as muted.
   * For UX clarity we keep all columns but mark the current tier.
   */
  readonly visibleColumns = computed<TierComparisonColumn[]>(() => DEFAULT_TIER_COLUMNS);

  readonly currentTier = computed(() => {
    const cfg = this.svc.config();
    return cfg?.currentTier ?? this.auth.subscriptionTier();
  });

  readonly showTrialBanner = computed(() => {
    const cfg = this.svc.config();
    return typeof cfg?.trialDaysRemaining === 'number' && cfg.trialDaysRemaining >= 0;
  });

  readonly trialDays = computed(() => this.svc.config()?.trialDaysRemaining ?? 0);

  readonly ctaLabel = computed(() => {
    const tier = this.currentTier();
    if (tier === 'premium') return 'upgradeModal.cta.upgradeToPlus';
    if (this.showTrialBanner()) return 'upgradeModal.cta.continueWithPremium';
    return 'upgradeModal.cta.upgradeToPremium';
  });

  isCurrentTier(tier: 'free' | 'premium' | 'premium_plus'): boolean {
    return this.currentTier() === tier;
  }

  cellValue(row: TierComparisonRow, tier: 'free' | 'premium' | 'premium_plus'): string | boolean {
    return row[tier];
  }

  onUpgrade(): void {
    const cfg = this.svc.config();
    this.analytics.trackEvent('modal_upgrade_clicked', {
      trigger: cfg?.trigger,
      route: cfg?.route,
      tier: this.currentTier(),
    });
    this.analytics.trackEvent('upgrade_clicked', {
      trigger: cfg?.trigger,
      route: cfg?.route,
      tier: this.currentTier(),
    });
    this.svc.close();
    if (cfg?.onCta) {
      cfg.onCta();
    } else {
      this.router.navigate(['/subscription'], { queryParams: { upgrade: 'true' } });
    }
  }

  onLater(): void {
    const cfg = this.svc.config();
    this.analytics.trackEvent('modal_closed_without_upgrade', {
      trigger: cfg?.trigger,
      route: cfg?.route,
    });
    this.svc.close();
  }

  onClosed(): void {
    // When the modal closes for any reason (backdrop, ESC, etc.) we treat
    // it as a "closed without upgrade" unless the user actually clicked
    // upgrade (which is handled in onUpgrade before close).
    const cfg = this.svc.config();
    if (cfg) {
      this.analytics.trackEvent('modal_closed_without_upgrade', {
        trigger: cfg.trigger,
        route: cfg.route,
      });
    }
    this.svc.close();
  }
}
