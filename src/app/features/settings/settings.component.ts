import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../shared/directives/ft-subtle-reveal.directive';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { finalize } from 'rxjs';

interface LinkStatusResponse {
  linked: boolean;
  telegramId: string | null;
}

interface LinkCodeResponse {
  code: string;
  expiresAt: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    TranslatePipe,
    FtSubtleRevealDirective,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = `${environment.apiUrl}/api`;

  userEmail = signal('');
  logoutLoading = signal(false);

  // Telegram linking
  isLinked = signal(false);
  telegramId = signal<string | null>(null);
  linkCode = signal<string | null>(null);
  codeExpiresAt = signal<number | null>(null);
  countdown = signal<number>(0);
  generatingCode = signal(false);
  linkError = signal<string | null>(null);
  linkLoading = signal(true);
  justLinked = signal(false); // para mostrar el mensaje de vinculación exitosa
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private linkPollTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.userEmail.set(user.displayName ?? user.email);
        },
        error: () => {
          this.authService.clearTokens();
        },
      });

      this.checkLinkStatus();
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
    this.stopLinkPoll();
  }

  private checkLinkStatus(): void {
    this.linkLoading.set(true);
    this.http.get<LinkStatusResponse>(`${this.api}/auth/link-status`).subscribe({
      next: (res) => {
        this.isLinked.set(res.linked);
        this.telegramId.set(res.telegramId);
        this.linkLoading.set(false);
      },
      error: () => {
        this.linkError.set('settings.telegram.error_link');
        this.linkLoading.set(false);
      },
    });
  }

  generateCode(): void {
    this.generatingCode.set(true);
    this.linkError.set(null);
    this.linkCode.set(null);
    this.justLinked.set(false);
    this.stopCountdown();
    this.stopLinkPoll();

    this.http.post<LinkCodeResponse>(`${this.api}/auth/link-code`, {}).subscribe({
      next: (res) => {
        this.linkCode.set(res.code);
        const expiresAt = new Date(res.expiresAt).getTime();
        this.codeExpiresAt.set(expiresAt);
        this.startCountdown(expiresAt);
        this.startLinkPoll(); // 👈 arranca el polling
        this.generatingCode.set(false);
      },
      error: () => {
        this.linkError.set('settings.telegram.error_generate');
        this.generatingCode.set(false);
      },
    });
  }

  // ── Polling: detecta cuando el bot vincula la cuenta ──

  private startLinkPoll(): void {
    this.linkPollTimer = setInterval(() => {
      this.http.get<LinkStatusResponse>(`${this.api}/auth/link-status`).subscribe({
        next: (res) => {
          if (res.linked) {
            this.isLinked.set(true);
            this.telegramId.set(res.telegramId);
            this.linkCode.set(null);
            this.justLinked.set(true);
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
        this.stopLinkPoll(); // 👈 para de pollear si expiró
        this.linkCode.set(null);
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

  get countdownMinutes(): number {
    return Math.floor(this.countdown() / 60);
  }

  get countdownSeconds(): number {
    return this.countdown() % 60;
  }

  openTelegram(): void {
    window.open('https://t.me/your_bot_username', '_blank');
  }

  openTelegramWithCode(code: string): void {
    const message = encodeURIComponent(`/link ${code}`);
    window.open(`https://t.me/your_bot_username?text=${message}`, '_blank');
  }

  onSignOut(): void {
    this.logoutLoading.set(true);
    this.authService.logout().pipe(
      finalize(() => {
        this.logoutLoading.set(false);
      }),
    ).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
