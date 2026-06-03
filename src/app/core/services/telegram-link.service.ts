import { Injectable, signal, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface LinkStatusResponse {
  linked: boolean;
  telegramId: string | null;
}

interface LinkCodeResponse {
  code: string;
  expiresAt: string;
}

export type TelegramLinkState = 'loading' | 'idle' | 'generating' | 'polling' | 'linked' | 'error';

@Injectable({ providedIn: 'root' })
export class TelegramLinkService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/api`;

  readonly state = signal<TelegramLinkState>('loading');
  readonly linkCode = signal<string | null>(null);
  readonly telegramId = signal<string | null>(null);
  readonly countdown = signal<number>(0);
  readonly error = signal<string | null>(null);
  readonly justLinked = signal(false);

  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private linkPollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.checkLinkStatus();
  }

  ngOnDestroy(): void {
    this.stopCountdown();
    this.stopLinkPoll();
  }

  checkLinkStatus(): void {
    this.state.set('loading');
    this.http.get<LinkStatusResponse>(`${this.api}/auth/link-status`).subscribe({
      next: (res) => {
        this.telegramId.set(res.telegramId);
        this.state.set(res.linked ? 'linked' : 'idle');
      },
      error: () => {
        this.error.set('settings.telegram.error_link');
        this.state.set('idle');
      },
    });
  }

  generateCode(): void {
    if (this.state() === 'linked') return;

    this.state.set('generating');
    this.error.set(null);
    this.linkCode.set(null);
    this.justLinked.set(false);
    this.stopCountdown();
    this.stopLinkPoll();

    this.http.post<LinkCodeResponse>(`${this.api}/auth/link-code`, {}).subscribe({
      next: (res) => {
        this.linkCode.set(res.code);
        const expiresAt = new Date(res.expiresAt).getTime();
        this.startCountdown(expiresAt);
        this.startLinkPoll();
        this.state.set('polling');
      },
      error: () => {
        this.error.set('settings.telegram.error_generate');
        this.state.set('idle');
      },
    });
  }

  private startLinkPoll(): void {
    this.linkPollTimer = setInterval(() => {
      this.http.get<LinkStatusResponse>(`${this.api}/auth/link-status`).subscribe({
        next: (res) => {
          if (res.linked) {
            this.telegramId.set(res.telegramId);
            this.linkCode.set(null);
            this.justLinked.set(true);
            this.state.set('linked');
            this.stopCountdown();
            this.stopLinkPoll();
          }
        },
      });
    }, 3000);
  }

  private stopLinkPoll(): void {
    if (this.linkPollTimer) {
      clearInterval(this.linkPollTimer);
      this.linkPollTimer = null;
    }
  }

  private startCountdown(expiresAt: number): void {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      this.countdown.set(remaining);
      if (remaining <= 0) {
        this.stopCountdown();
        this.stopLinkPoll();
        this.linkCode.set(null);
        this.state.set('idle');
      }
    };
    tick();
    this.countdownTimer = setInterval(tick, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  openTelegram(): void {
    window.open(environment.telegramBotUrl, '_blank');
  }

  openTelegramWithCode(code: string): void {
    const message = encodeURIComponent(`/link ${code}`);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `tg://resolve?domain=hormigaTrackerBot&text=${message}`
      : `${environment.telegramBotUrl}?text=${message}`;
    window.open(url, '_blank');
  }
}
