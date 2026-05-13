import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicNavbarComponent } from './components/public-navbar/public-navbar.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { FeatureCardComponent } from './components/feature-card/feature-card.component';
import { TelegramSectionComponent } from './components/telegram-section/telegram-section.component';
import { FinalCtaComponent } from './components/final-cta/final-cta.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    PublicNavbarComponent,
    HeroSectionComponent,
    FeatureCardComponent,
    TelegramSectionComponent,
    FinalCtaComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  features = [
    { icon: 'dashboard', title: 'Dashboard Overview', description: 'See your balance, income, and expenses at a glance with real-time summaries.' },
    { icon: 'transactions', title: 'Transaction Tracking', description: 'Log and categorize every transaction. Filter by date, type, or category.' },
    { icon: 'analytics', title: 'Monthly Charts', description: 'Visualize your financial trends over the last 6 months with interactive charts.' },
    { icon: 'info', title: 'AI Insights', description: 'Get personalized recommendations to optimize your spending and savings.' },
    { icon: 'categories', title: 'Smart Categories', description: 'Auto-categorize transactions and create custom categories for better tracking.' },
    { icon: 'telegram', title: 'Telegram Integration', description: 'Log transactions instantly via Telegram bot. No app opening required.' },
  ];
}
