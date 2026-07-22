import {
  Component, inject, input, signal, computed, ChangeDetectionStrategy, OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { TelegramLinkService } from '../../../core/services/telegram-link.service';
import { AuthService } from '../../../core/services/auth.service';
import { GmailLinkService, GmailTransaction } from '../../../core/services/gmail-link.service';
import { TranslationService } from '../../../core/services/translation.service';
import { environment } from '../../../../environments/environment';
import {
  LinkedChannelCardComponent,
  LinkedChannelState,
  LinkedChannelRecentItem,
} from './linked-channel-card/linked-channel-card.component';

const FIRST_GMAIL_CONNECT_FLAG = 'ft.gmail.firstConnected';

@Component({
  selector: 'app-linked-accounts-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgIcon,
    TranslatePipe,
    FtSubtleRevealDirective,
    LinkedChannelCardComponent,
  ],
  templateUrl: './linked-accounts-section.component.html',
  styleUrl: './linked-accounts-section.component.scss',
})
export class LinkedAccountsSectionComponent implements OnInit {
  readonly svc = inject(TelegramLinkService);
  private readonly auth = inject(AuthService);
  private readonly gmail = inject(GmailLinkService);

  delay = input<number>(0);

  // ── State signals ───────────────────────────────────────────────
  /** Gmail pre-OAuth state — 'connecting' shows the spinner button. */
  readonly gmailConnecting = signal(false);
  /** Flag used to play the "first connect" flash exactly once. */
  readonly gmailFirstConnect = signal(false);
  /** Read from the service, written here so the template can mark this. */

  /** Derived state for the Gmail card. */
  readonly gmailState = computed<LinkedChannelState>(() => {
    if (this.gmailConnecting()) return 'connecting';
    return this.gmail.state() === 'connected' ? 'connected' : 'disconnected';
  });

  /** Telegram card state — reuses the existing service signals. */
  readonly telegramState = computed<LinkedChannelState>(() => {
    if (this.svc.state() === 'loading') return 'connecting';
    return this.svc.state() === 'linked' ? 'connected' : 'disconnected';
  });

  /** Whether the connected state was reached for the FIRST time. */
  readonly telegramFirstConnect = computed(() => this.svc.justLinked());
  readonly gmailFirstConnectVisible = computed(
    () => this.gmail.isFirstConnect() && this.gmail.state() === 'connected',
  );

  // ── Gmail connect (Better Auth OAuth with extended scopes) ────
  private readonly GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
  ];

  // ── Telegram helpers ──────────────────────────────────────────
  get countdownMinutes(): number {
    return Math.floor(this.svc.countdown() / 60);
  }
  get countdownSeconds(): number {
    return this.svc.countdown() % 60;
  }

  ngOnInit(): void {
    // The "first connect" flash only plays for Gmail: when the user
    // is brand new and hasn't been through the OAuth round-trip yet.
    // We plant a flag in localStorage and clear it once the success
    // state is first observed.
    this.plantFirstConnectFlagIfMissing();
  }

  /** Set the flag in localStorage so GmailLinkService picks it up. */
  private plantFirstConnectFlagIfMissing(): void {
    if (typeof window === 'undefined') return;
    try {
      if (window.localStorage.getItem(FIRST_GMAIL_CONNECT_FLAG) === null) {
        window.localStorage.setItem(FIRST_GMAIL_CONNECT_FLAG, 'pending');
      }
    } catch {
      /* localStorage may be blocked */
    }
  }

  // ── Gmail actions ─────────────────────────────────────────────
  connectGmail(): void {
    if (this.gmailConnecting() || this.gmail.state() === 'connected') return;
    this.gmailConnecting.set(true);
    this.auth.signInWithGoogle(this.GMAIL_SCOPES);
    // The OAuth round-trip will redirect, so we don't reset the
    // 'connecting' flag here. On return the section is unmounted
    // and the new mount will refresh GmailLinkService status.
  }

  onGmailSync(): void {
    this.gmail.syncNow();
  }

  onGmailDisconnect(): void {
    this.gmail.markDisconnected();
  }

  // ── Telegram actions (used in the template's connected state) ─
  onTelegramDisconnect(): void {
    // Disconnect is a future feature — gracefully no-op for now
    // so the click is at least handled.
  }

  onTelegramConnect(): void {
    if (this.svc.state() === 'generating') return;
    this.svc.generateCode();
  }

  // ── Recent imports mapping (Gmail → card) ─────────────────────
  readonly gmailRecent = computed<LinkedChannelRecentItem[]>(() => {
    return this.gmail.lastTransactions().slice(0, 3).map((tx) => ({
      id: tx.id,
      iconKey: 'bank' as const,
      primary: tx.bankName,
      secondary: this.formatRelativeDate(tx.receivedAt),
      amount: this.formatAmount(tx.amount, tx.currency),
    }));
  });

  readonly gmailConnectedStatus = computed(() => {
    const email = this.gmail.email();
    if (!email) return 'settings.gmail.no_email';
    return this.translateInterpolate('settings.gmail.connected_status', { email });
  });

  readonly gmailLastSync = computed(() => {
    const when = this.gmail.lastSyncAt();
    if (!when) return '';
    const formatted = this.formatRelativeDate(when);
    return this.translateInterpolate('settings.gmail.last_sync', { when: formatted });
  });

  readonly telegramConnectedStatus = computed(() => {
    const id = this.svc.telegramId();
    if (!id) return 'settings.telegram.already_linked';
    return this.translateInterpolate('settings.telegram.connected_status', { handle: id });
  });

  // ── WhatsApp / SMS: placeholders (future) ─────────────────────
  readonly whatsappState: LinkedChannelState = 'disconnected';
  readonly smsState: LinkedChannelState = 'disconnected';

  // ── Private helpers ───────────────────────────────────────────
  private translateInterpolate(key: string, params: Record<string, string>): string {
    // The TranslatePipe does the interpolation via the TranslationService.
    // We don't have direct access here, but the service exposes a `translate`
    // method that we can call. Reuse it for derived strings.
    return this.translationService.translate(key, params);
  }

  private formatRelativeDate(iso: string): string {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';
    const diff = Date.now() - then;
    const min = Math.floor(diff / 60_000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  private formatAmount(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  // Exposed for template access
  protected readonly translationService = inject(TranslationService);
}
