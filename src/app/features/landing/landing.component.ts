import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { PublicNavbarComponent } from './components/public-navbar/public-navbar.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeatureCardComponent } from './components/feature-card/feature-card.component';
import { TelegramSectionComponent } from './components/telegram-section/telegram-section.component';
import { FinalCtaComponent } from './components/final-cta/final-cta.component';
import { LandingBackgroundComponent } from './components/landing-background/landing-background.component';
import { FooterComponent } from './components/footer/footer.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { FtSubtleRevealDirective } from '../../shared/directives/ft-subtle-reveal.directive';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { TierCard } from '../../core/models/tier.model';
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
    LandingBackgroundComponent,
    FooterComponent,
    PricingComponent,
    FtSubtleRevealDirective,
    TranslatePipe,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly translationService = inject(TranslationService);
  readonly scrollProgress = signal(0);
  readonly telegramBotUrl = environment.telegramBotUrl;

  private scrollTicking = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!this.scrollTicking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        this.scrollProgress.set(Math.min(100, Math.max(0, progress)));
        this.scrollTicking = false;
      });
      this.scrollTicking = true;
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  features = [
    { icon: 'dashboard', title: 'landing.features.dashboard.title', description: 'landing.features.dashboard.description' },
    { icon: 'transactions', title: 'landing.features.transactions.title', description: 'landing.features.transactions.description' },
    { icon: 'analytics', title: 'landing.features.analytics.title', description: 'landing.features.analytics.description' },
    { icon: 'info', title: 'landing.features.ai_insights.title', description: 'landing.features.ai_insights.description' },
    { icon: 'categories', title: 'landing.features.categories.title', description: 'landing.features.categories.description' },
    { icon: 'telegram', title: 'landing.features.telegram.title', description: 'landing.features.telegram.description' },
  ];

  /**
   * Tier cards shared with the subscription page.
   * Prices are USD for the marketing landing — the subscription page
   * localizes the same fields per user currency.
   */
  readonly tiers: TierCard[] = [
    {
      id: 'free',
      nameKey: 'landing.pricing.tiers.free.name',
      taglineKey: 'landing.pricing.tiers.free.tagline',
      price: '$0',
      priceAnnual: 'forever',
      popular: false,
      featureKeys: [
        'landing.pricing.tiers.free.features.transactions',
        'landing.pricing.tiers.free.features.categories',
        'landing.pricing.tiers.free.features.basic_charts',
        'landing.pricing.tiers.free.features.history',
      ],
      ctaKey: 'landing.pricing.tiers.free.cta',
      highlighted: false,
    },
    {
      id: 'premium',
      nameKey: 'landing.pricing.tiers.premium.name',
      taglineKey: 'landing.pricing.tiers.premium.tagline',
      price: '$4.99',
      priceAnnual: '/month',
      annualSavingsKey: 'landing.pricing.save_badge',
      popular: true,
      featureKeys: [
        'landing.pricing.tiers.premium.features.ai_insights',
        'landing.pricing.tiers.premium.features.goals',
        'landing.pricing.tiers.premium.features.budgets',
        'landing.pricing.tiers.premium.features.alerts',
        'landing.pricing.tiers.premium.features.support',
      ],
      ctaKey: 'landing.pricing.tiers.premium.cta',
      highlighted: true,
    },
    {
      id: 'premium_plus',
      nameKey: 'landing.pricing.tiers.premium_plus.name',
      taglineKey: 'landing.pricing.tiers.premium_plus.tagline',
      price: '$8.99',
      priceAnnual: '/month',
      popular: false,
      featureKeys: [
        'landing.pricing.tiers.premium_plus.features.everything_premium',
        'landing.pricing.tiers.premium_plus.features.ai_chat',
        'landing.pricing.tiers.premium_plus.features.telegram',
        'landing.pricing.tiers.premium_plus.features.export',
        'landing.pricing.tiers.premium_plus.features.priority_support',
      ],
      ctaKey: 'landing.pricing.tiers.premium_plus.cta',
      highlighted: false,
    },
  ];
}
