/**
 * FtReferralWidgetComponent — compact referral teaser for the dashboard.
 *
 * Shown only for premium users. Displays a shortened link, quick share
 * button, and a small "X friends joined" counter. Tap-through navigates
 * to /referral for the full experience.
 */
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { FtReferralService } from '../referral.service';
import { AuthService } from '../../../core/services/auth.service';
import { FtAnalyticsService } from '../../../core/services/analytics.service';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-referral-widget',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (shouldShow()) {
      <article class="referral-widget" aria-labelledby="referral-widget-title">
        <header class="referral-widget__header">
          <ng-icon [name]="iconGift" size="18px" class="referral-widget__icon" />
          <h3 id="referral-widget-title" class="referral-widget__title">
            {{ 'referral.widget.title' | translate }}
          </h3>
        </header>

        <p class="referral-widget__subtitle">
          {{ 'referral.widget.subtitle' | translate: { count: stats().referralCount } }}
        </p>

        <div class="referral-widget__link-row">
          <code class="referral-widget__link">
            {{ shortLink() || '…' }}
          </code>
          <button
            type="button"
            class="referral-widget__copy"
            (click)="copyLink($event)"
            [attr.aria-label]="'referral.widget.copy' | translate"
          >
            <ng-icon [name]="copied() ? iconCheck : iconLink" size="14px" />
          </button>
        </div>

        <div class="referral-widget__actions">
          <button
            type="button"
            class="referral-widget__btn"
            (click)="goToPage()"
          >
            {{ 'referral.widget.openFull' | translate }}
          </button>
        </div>
      </article>
    }
  `,
  styles: [`
    :host { display: block; }

    .referral-widget {
      padding: 18px;
      background: var(--bg-secondary, #14101f);
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
      border-radius: 16px;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }

    .referral-widget__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .referral-widget__icon {
      color: var(--accent-mid, #a78bfa);
    }

    .referral-widget__title {
      margin: 0;
      font-family: var(--font-display, 'Space Grotesk', system-ui);
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary, #fff);
    }

    .referral-widget__subtitle {
      margin: 0 0 12px;
      font-size: 12.5px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      line-height: 1.4;
    }

    .referral-widget__link-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      background: var(--bg-tertiary, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--border-default, rgba(255, 255, 255, 0.08));
      border-radius: 10px;
      margin-bottom: 12px;
    }

    .referral-widget__link {
      flex: 1 1 auto;
      min-width: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11.5px;
      color: var(--text-primary, #fff);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .referral-widget__copy {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border: none;
      background: transparent;
      color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
      border-radius: 6px;
      cursor: pointer;
      flex-shrink: 0;
      transition: color 0.15s ease, background 0.15s ease;
    }

    .referral-widget__copy:hover {
      color: var(--accent-mid, #a78bfa);
      background: var(--bg-elevated, rgba(255, 255, 255, 0.05));
    }

    .referral-widget__actions {
      display: flex;
      justify-content: flex-end;
    }

    .referral-widget__btn {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12.5px;
      font-weight: 600;
      background: linear-gradient(135deg, var(--accent-start, #a78bfa), var(--accent-end, #8b5cf6));
      color: #fff;
      border: none;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      font-family: inherit;
    }
    .referral-widget__btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
    }
  `],
})
export class FtReferralWidgetComponent implements OnInit {
  private readonly referral = inject(FtReferralService);
  private readonly auth = inject(AuthService);
  private readonly analytics = inject(FtAnalyticsService);
  private readonly router = inject(Router);

  readonly iconGift = ICONS.star;
  readonly iconLink = ICONS.link;
  readonly iconCheck = ICONS.check;

  readonly copied = signal(false);

  readonly stats = computed(() => this.referral.stats());

  /** Trim the URL to a short form for the widget — last 10 chars after /ref/. */
  readonly shortLink = computed(() => {
    const link = this.referral.link();
    if (!link) return '';
    const idx = link.indexOf('/ref/');
    if (idx === -1) return link;
    const code = link.slice(idx + 5);
    return `…/${code}`;
  });

  readonly shouldShow = computed(() => this.auth.isPremium());

  ngOnInit(): void {
    if (this.shouldShow()) {
      this.referral.ensureCode();
    }
  }

  async copyLink(event: Event): Promise<void> {
    event.stopPropagation();
    const ok = await this.referral.copyLink();
    if (ok) {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    }
  }

  goToPage(): void {
    this.analytics.trackEvent('referral_link_shared', { method: 'native_share' });
    this.router.navigate(['/referral']);
  }
}
