import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FtSubtleRevealDirective } from '../../../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'ft-telegram-section',
  standalone: true,
  imports: [CommonModule, FtSubtleRevealDirective, TranslatePipe],
  templateUrl: './telegram-section.component.html',
  styleUrl: './telegram-section.component.scss',
})
export class TelegramSectionComponent {
  readonly telegramBotUrl = environment.telegramBotUrl;
}
