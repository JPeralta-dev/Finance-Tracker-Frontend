import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { TelegramLinkService } from '../../../core/services/telegram-link.service';

@Component({
  selector: 'app-linked-accounts-section',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective],
  providers: [provideIcons(ICONS)],
  templateUrl: './linked-accounts-section.component.html',
  styleUrl: './linked-accounts-section.component.scss',
})
export class LinkedAccountsSectionComponent {
  readonly svc = inject(TelegramLinkService);
  delay = input<number>(0);

  get countdownMinutes(): number {
    return Math.floor(this.svc.countdown() / 60);
  }

  get countdownSeconds(): number {
    return this.svc.countdown() % 60;
  }
}
