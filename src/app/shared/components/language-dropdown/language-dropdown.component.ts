import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { TranslationService, Language } from '../../../core/services/translation.service';

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'es', label: 'Español', flag: 'ES' },
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'fr', label: 'Français', flag: 'FR' },
];

@Component({
  selector: 'ft-language-dropdown',
  standalone: true,
  imports: [CommonModule, NgIcon, ClickOutsideDirective],
  providers: [provideIcons({ globe: ICONS.globe })],
  templateUrl: './language-dropdown.component.html',
  styleUrl: './language-dropdown.component.scss',
})
export class LanguageDropdownComponent {
  readonly translationService = inject(TranslationService);

  readonly languages = LANGUAGES;
  readonly isOpen = signal(false);

  toggleDropdown(): void {
    this.isOpen.update((v) => !v);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  async setLanguage(code: Language): Promise<void> {
    await this.translationService.setLanguage(code);
    this.closeDropdown();
  }
}
