import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { PublicNavbarComponent } from './components/public-navbar/public-navbar.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeatureCardComponent } from './components/feature-card/feature-card.component';
import { TelegramSectionComponent } from './components/telegram-section/telegram-section.component';
import { FinalCtaComponent } from './components/final-cta/final-cta.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate/scroll-animate.directive';

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
    ScrollAnimateDirective,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  readonly scrollProgress = signal(0);

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.scrollProgress.set(Math.min(100, Math.max(0, progress)));
  }

  features = [
    { icon: 'dashboard', title: 'Dashboard Overview', description: 'See your balance, income, and expenses at a glance with real-time summaries.' },
    { icon: 'transactions', title: 'Transaction Tracking', description: 'Log and categorize every transaction. Filter by date, type, or category.' },
    { icon: 'analytics', title: 'Monthly Charts', description: 'Visualize your financial trends over the last 6 months with interactive charts.' },
    { icon: 'info', title: 'AI Insights', description: 'Get personalized recommendations to optimize your spending and savings.' },
    { icon: 'categories', title: 'Smart Categories', description: 'Auto-categorize transactions and create custom categories for better tracking.' },
    { icon: 'telegram', title: 'Telegram Integration', description: 'Log transactions instantly via Telegram bot. No app opening required.' },
  ];
}
