import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate/scroll-animate.directive';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

interface TelegramStatus {
  linked: boolean;
  chatId: string | null;
  botUsername: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIcon,
    TranslatePipe,
    ScrollAnimateDirective,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  readonly telegramStatus = signal<TelegramStatus | null>(null);
  readonly loading = signal(true);
  readonly linking = signal(false);
  readonly unlinking = signal(false);
  readonly linkCode = signal('');

  ngOnInit(): void {
    this.loadTelegramStatus();
  }

  private loadTelegramStatus(): void {
    this.loading.set(true);
    this.http
      .get<TelegramStatus>(`${environment.apiUrl}/api/telegram/status`)
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (status) => {
          this.telegramStatus.set(status);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  linkTelegram(): void {
    const code = this.linkCode().trim();
    if (!code || code.length !== 6) {
      this.toast.error('Please enter a valid 6-digit code.');
      return;
    }

    this.linking.set(true);
    this.http
      .post(`${environment.apiUrl}/api/telegram/link`, { code })
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: (result) => {
          this.linking.set(false);
          this.linkCode.set('');
          if (result) {
            this.loadTelegramStatus();
            this.toast.success('Telegram account linked successfully!');
          }
        },
        error: (err) => {
          this.linking.set(false);
          this.toast.error(err.error?.message || 'Failed to link Telegram account.');
        },
      });
  }

  unlinkTelegram(): void {
    if (!confirm('Are you sure you want to unlink your Telegram account?')) {
      return;
    }

    this.unlinking.set(true);
    this.http
      .delete(`${environment.apiUrl}/api/telegram/unlink`)
      .pipe(catchError(() => of(null)))
      .subscribe({
        next: () => {
          this.unlinking.set(false);
          this.loadTelegramStatus();
          this.toast.success('Telegram account unlinked.');
        },
        error: (err) => {
          this.unlinking.set(false);
          this.toast.error(err.error?.message || 'Failed to unlink Telegram account.');
        },
      });
  }
}
