import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate/scroll-animate.directive';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    TranslatePipe,
    ScrollAnimateDirective,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  // Placeholder for future integrations (Telegram, AI, etc.)
  // Telegram integration will be handled by a separate microservice
}
