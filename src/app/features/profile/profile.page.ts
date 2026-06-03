import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { catchError, forkJoin, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';
import { CurrencyService } from '../../core/services/currency.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';
import { ProfileAvatarCardComponent } from './profile-avatar-card/profile-avatar-card.component';
import { ProfilePersonalInfoComponent } from './profile-personal-info/profile-personal-info.component';
import { ProfileInsightsCardComponent } from './profile-insights-card/profile-insights-card.component';
import { FtSubtleRevealDirective } from '../../shared/directives/ft-subtle-reveal.directive';
import { User } from '../../core/models/user.model';
import type { Insight } from '../../core/models/insight.model';

type ProfileState = 'loading' | 'ready' | 'error';

export function calculateAccountAge(createdAt: string, i18n?: TranslationService): string {
  const created = new Date(createdAt);
  const now = new Date();
  const months = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
  if (months < 1) return i18n ? i18n.translate('profile.account_age.less_than_month') : 'Less than a month';
  if (months < 12) return i18n ? i18n.translate('profile.account_age.months', { count: String(months) }) : `${months} months`;
  return i18n ? i18n.translate('profile.account_age.years', { count: String(Math.floor(months / 12)) }) : `${Math.floor(months / 12)} years`;
}

@Component({
  selector: 'ft-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, FtSubtleRevealDirective, NgIcon,
    ProfileAvatarCardComponent, ProfilePersonalInfoComponent, ProfileInsightsCardComponent],
  providers: [provideIcons(ICONS)],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly financeService = inject(FinanceService);
  private readonly currencyService = inject(CurrencyService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);

  readonly user = signal<User | null>(null);
  readonly state = signal<ProfileState>('loading');
  readonly insights = signal<Insight[]>([]);
  readonly userStats = signal<{ totalTransactions: number; accountAge: string } | null>(null);
  readonly profileForm = new FormGroup({
    displayName: new FormControl(''),
    email: new FormControl({ value: '', disabled: true }),
  });
  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return 'U';
    const name = u.displayName || u.email.split('@')[0];
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  });

  ngOnInit(): void { this.loadUserProfile(); }

  loadUserProfile(): void {
    this.state.set('loading');
    forkJoin({
      user: this.authService.getProfile().pipe(catchError(() => of(null))),
      insights: this.financeService.getInsights().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ user, insights }) => {
        if (!user) { this.state.set('error'); this.toast.error(this.i18n.translate('profile.toasts.load_failed')); return; }
        this.user.set(user);
        this.profileForm.patchValue({ displayName: user.displayName ?? '', email: user.email });
        this.userStats.set({ totalTransactions: 0, accountAge: calculateAccountAge(user.createdAt, this.i18n) });
        this.insights.set(insights as Insight[]);
        this.state.set('ready');
      },
      error: () => { this.state.set('error'); this.toast.error(this.i18n.translate('profile.toasts.load_failed')); },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    const displayName = this.profileForm.get('displayName')?.value;
    if (!displayName) return;
    this.authService.updateProfile(displayName).subscribe({
      next: () => this.toast.success(this.i18n.translate('profile.toasts.profile_updated')),
      error: () => this.toast.error(this.i18n.translate('profile.toasts.profile_update_failed')),
    });
  }
}
