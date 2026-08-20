import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../../shared/directives/ft-subtle-reveal.directive';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslationService } from '../../../core/services/translation.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { CategoryDefaultSelectorComponent } from './category-default-selector/category-default-selector.component';

interface LanguageOption {
  code: 'es' | 'en' | 'fr';
  label: string;
  flag: string;
}

interface CurrencyOption {
  code: string;
  symbol: string;
  displaySymbol: string;
  locale: string;
  decimals: number;
}

@Component({
  selector: 'app-preferences-section',
  standalone: true,
  imports: [CommonModule, NgIcon, TranslatePipe, FtSubtleRevealDirective, CategoryDefaultSelectorComponent],
  providers: [provideIcons(ICONS)],
  templateUrl: './preferences-section.component.html',
  styleUrl: './preferences-section.component.scss',
})
export class PreferencesSectionComponent {
  readonly themeService = inject(ThemeService);
  readonly translationService = inject(TranslationService);
  readonly currencyService = inject(CurrencyService);

  delay = input<number>(0);

  readonly languages: LanguageOption[] = [
    { code: 'es', label: 'Español', flag: 'ES' },
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'fr', label: 'Français', flag: 'FR' },
  ];

  readonly currencies: CurrencyOption[] = [
    { code: 'USD', symbol: '$', displaySymbol: 'US$', locale: 'en-US', decimals: 2 },
    { code: 'EUR', symbol: '€', displaySymbol: '€', locale: 'de-DE', decimals: 2 },
    { code: 'COP', symbol: '$', displaySymbol: 'COP$', locale: 'es-CO', decimals: 0 },
  ];
}
