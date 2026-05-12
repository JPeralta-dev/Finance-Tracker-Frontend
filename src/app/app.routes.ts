import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { redirectIfAuthGuard } from './core/guards/redirect-if-auth.guard';

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
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard-new',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard.page').then(m => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./features/transactions/transactions-list.component').then(m => m.TransactionsListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'transactions-new',
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
  { path: '**', redirectTo: '' }
];
