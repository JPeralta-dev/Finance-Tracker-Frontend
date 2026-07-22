import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { TelegramLinkService } from '../../../core/services/telegram-link.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-linked-accounts-section',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  templateUrl: './linked-accounts-section.component.html',
  styleUrl: './linked-accounts-section.component.scss',
})
export class LinkedAccountsSectionComponent {
  readonly svc = inject(TelegramLinkService);
  private readonly auth = inject(AuthService);
  delay = input<number>(0);

  /** Gmail connection state — 'idle' shows the connect button, 'connecting' shows a spinner. */
  readonly gmailState = signal<'idle' | 'connecting'>('idle');

  /**
   * OAuth scopes required for the Gmail sync feature.
   * Matches the scopes configured on the Better Auth Google provider (backend).
   */
  private readonly GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
  ];

  get countdownMinutes(): number {
    return Math.floor(this.svc.countdown() / 60);
  }

  get countdownSeconds(): number {
    return this.svc.countdown() % 60;
  }

  /**
   * Start the Google OAuth flow with extended Gmail scopes.
   * Better Auth's `sign-in/social` endpoint accepts the `scopes` field
   * and forwards them to Google's consent screen.
   */
  connectGmail(): void {
    if (this.gmailState() === 'connecting') return;
    this.gmailState.set('connecting');
    this.auth.signInWithGoogle(this.GMAIL_SCOPES);
  }
}
