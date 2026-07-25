import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { redirectIfAuthGuard } from './core/guards/redirect-if-auth.guard';
import { premiumGuard } from './core/guards/premium.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [redirectIfAuthGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [redirectIfAuthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then(m => m.RegisterComponent),
    canActivate: [redirectIfAuthGuard],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard.page').then(m => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/pages/transactions.page').then(m => m.TransactionsPage),
    canActivate: [authGuard],
  },
  {
    path: 'transactions/new',
    loadComponent: () =>
      import('./features/transactions/transaction-form.component').then(m => m.TransactionFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'transactions/:id',
    loadComponent: () =>
      import('./features/transactions/transaction-form.component').then(m => m.TransactionFormComponent),
    canActivate: [authGuard],
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/categories.component').then(m => m.CategoriesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [redirectIfAuthGuard],
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./features/analytics/pages/analytics.page').then(m => m.AnalyticsPage),
    canActivate: [authGuard],
  },
  // Premium routes
  {
    path: 'goals',
    loadComponent: () =>
      import('./features/goals/pages/goals.page').then(m => m.GoalsPage),
    canActivate: [authGuard, premiumGuard],
  },
  {
    path: 'ai-insights',
    loadComponent: () =>
      import('./features/ai-insights/pages/ai-insights.page').then(m => m.AiInsightsPage),
    canActivate: [authGuard, premiumGuard],
  },
  {
    path: 'pockets',
    loadComponent: () =>
      import('./features/pockets/pages/pockets.page').then(m => m.PocketsPage),
    canActivate: [authGuard, premiumGuard],
  },
  {
    path: 'subscription',
    loadComponent: () =>
      import('./features/subscription/pages/subscription.page').then(m => m.SubscriptionPage),
    canActivate: [authGuard],
  },
  {
    path: 'referral',
    loadComponent: () =>
      import('./features/referral/pages/referral.page').then(m => m.ReferralPage),
    canActivate: [authGuard],
  },
  // Legal pages (public)
  {
    path: 'legal/terms',
    loadComponent: () =>
      import('./features/legal/terms/terms.component').then(m => m.TermsComponent),
  },
  {
    path: 'legal/privacy',
    loadComponent: () =>
      import('./features/legal/privacy/privacy.component').then(m => m.PrivacyComponent),
  },
  {
    path: 'legal/cookies',
    loadComponent: () =>
      import('./features/legal/cookies/cookies.component').then(m => m.CookiesComponent),
  },
  { path: '**', redirectTo: '' }
];
