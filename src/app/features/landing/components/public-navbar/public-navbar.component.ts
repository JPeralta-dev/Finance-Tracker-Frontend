import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslationService, Language } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'ft-public-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, TranslatePipe],
  providers: [provideIcons(ICONS)],
  templateUrl: './public-navbar.component.html',
  styleUrl: './public-navbar.component.scss',
})
export class PublicNavbarComponent {
  readonly themeService = inject(ThemeService);
  readonly translationService = inject(TranslationService);

  readonly languages: { code: Language; label: string }[] = [
    { code: 'es', label: 'ES' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
  ];

  async setLanguage(lang: Language): Promise<void> {
    await this.translationService.setLanguage(lang);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
