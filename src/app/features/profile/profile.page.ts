import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { InsightsPanelComponent } from '../../shared/components/insights-panel/insights-panel.component';
import { User } from '../../core/models/user.model';
import type { Insight } from '../../core/models/insight.model';

type ProfileState = 'loading' | 'ready' | 'error';

// ── Pure function (exported for testing) ──────────────────────────────

export function calculateAccountAge(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
  
  if (months < 1) return 'Less than a month';
  if (months < 12) return `${months} months`;
  return `${Math.floor(months / 12)} years`;
}

@Component({
  selector: 'ft-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InsightsPanelComponent, TranslatePipe],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly financeService = inject(FinanceService);
  private readonly currencyService = inject(CurrencyService);
  private readonly toast = inject(ToastService);

  readonly user = signal<User | null>(null);
  readonly state = signal<ProfileState>('loading');
  readonly insights = signal<Insight[]>([]);
  readonly userStats = signal<{ totalTransactions: number; accountAge: string } | null>(null);

  readonly profileForm = new FormGroup({
    displayName: new FormControl(''),
    email: new FormControl({ value: '', disabled: true }),
  });

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.state.set('loading');

    forkJoin({
      user: this.authService.getProfile().pipe(catchError(() => of(null))),
      insights: this.financeService.getInsights().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ user, insights }) => {
        if (!user) {
          this.state.set('error');
          this.toast.error('Failed to load profile data.');
          return;
        }

        this.user.set(user);
        this.profileForm.patchValue({
          displayName: user.displayName ?? '',
          email: user.email,
        });

        // Calculate account age
        const accountAge = calculateAccountAge(user.createdAt);
        this.userStats.set({
          totalTransactions: 0, // Could be fetched from a separate endpoint
          accountAge,
        });

        this.insights.set(insights as Insight[]);
        this.state.set('ready');
      },
      error: () => {
        this.state.set('error');
        this.toast.error('Failed to load profile data.');
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const displayName = this.profileForm.get('displayName')?.value;
    if (!displayName) return;

    this.authService.updateProfile(displayName).subscribe({
      next: () => {
        this.toast.success('Profile updated successfully!');
      },
      error: () => {
        this.toast.error('Failed to save profile. Please try again.');
      },
    });
  }
}
