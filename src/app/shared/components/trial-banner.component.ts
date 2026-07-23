/**
 * FtTrialBannerComponent — trial countdown banner for the topbar/dashboard.
 *
 * Wires FtAnnouncementBannerComponent to FtTrialBannerService so:
 *   - It only renders for users with an active trial.
 *   - It picks the right variant (info → warning → error) based on days
 *     remaining per spec.
 *   - Dismissal persists for 24h (handled by the service).
 *   - CTA navigates to /subscription and fires a tracking event.
 */
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FtAnnouncementBannerComponent } from './announcement-banner.component';
import { FtTrialBannerService } from '../../core/services/trial-banner.service';
import { FtAnalyticsService } from '../../core/services/analytics.service';
import { ICONS } from '../../shared/icons/icon-registry';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-trial-banner',
  standalone: true,
  imports: [CommonModule, FtAnnouncementBannerComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (svc.isVisible()) {
      <ft-announcement-banner
        [variant]="svc.variant()"
        [iconName]="iconName()"
        [messageKey]="messageKey()"
        [messageText]="messageText()"
        [ctaKey]="'trialBanner.cta'"
        [dismissible]="true"
        [trackingId]="'trial_banner'"
        (dismissed)="onDismiss()"
        (ctaClicked)="onCta()"
      />
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
})
export class FtTrialBannerComponent {
  protected readonly svc = inject(FtTrialBannerService);
  private readonly analytics = inject(FtAnalyticsService);
  private readonly router = inject(Router);

  readonly iconName = computed<string>(() => {
    const v = this.svc.variant();
    if (v === 'error') return ICONS.warning;
    if (v === 'warning') return ICONS.info;
    return ICONS.info;
  });

  readonly messageKey = computed<string>(() => {
    const days = this.svc.daysRemaining() ?? 0;
    if (days < 1) return ''; // empty when showing the inline "today" message
    return 'trialBanner.daysRemaining';
  });

  readonly messageText = computed<string>(() => {
    const days = this.svc.daysRemaining() ?? 0;
    if (days < 1) return 'trialBanner.endsToday';
    return '';
  });

  // Computed key for "ends today" — we override via the template directly.
  // Keeping this method for the host's analytics payload.
  getDaysKey(): string {
    const days = this.svc.daysRemaining() ?? 0;
    if (days < 1) return 'today';
    if (days === 1) return 'one';
    return 'many';
  }

  onDismiss(): void {
    this.svc.dismiss();
    this.analytics.trackEvent('trial_banner_dismissed', {
      days_remaining: this.svc.daysRemaining() ?? 0,
      variant: this.svc.variant(),
    });
  }

  onCta(): void {
    this.analytics.trackEvent('trial_banner_cta_clicked', {
      days_remaining: this.svc.daysRemaining() ?? 0,
    });
    this.router.navigate(['/subscription'], { queryParams: { upgrade: 'true' } });
  }
}
