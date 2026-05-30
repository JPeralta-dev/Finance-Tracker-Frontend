import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { PublicNavbarComponent } from './components/public-navbar/public-navbar.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeatureCardComponent } from './components/feature-card/feature-card.component';
import { TelegramSectionComponent } from './components/telegram-section/telegram-section.component';
import { FinalCtaComponent } from './components/final-cta/final-cta.component';
import { FtSubtleRevealDirective } from '../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    PublicNavbarComponent,
    HeroSectionComponent,
    FeatureCardComponent,
    TelegramSectionComponent,
    FinalCtaComponent,
    FtSubtleRevealDirective,
    TranslatePipe,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly translationService = inject(TranslationService);
  readonly scrollProgress = signal(0);
  readonly telegramBotUrl = environment.telegramBotUrl;

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.scrollProgress.set(Math.min(100, Math.max(0, progress)));
  }

  features = [
    { icon: 'dashboard', title: 'landing.features.dashboard.title', description: 'landing.features.dashboard.description' },
    { icon: 'transactions', title: 'landing.features.transactions.title', description: 'landing.features.transactions.description' },
    { icon: 'analytics', title: 'landing.features.analytics.title', description: 'landing.features.analytics.description' },
    { icon: 'info', title: 'landing.features.ai_insights.title', description: 'landing.features.ai_insights.description' },
    { icon: 'categories', title: 'landing.features.categories.title', description: 'landing.features.categories.description' },
    { icon: 'telegram', title: 'landing.features.telegram.title', description: 'landing.features.telegram.description' },
  ];
}
