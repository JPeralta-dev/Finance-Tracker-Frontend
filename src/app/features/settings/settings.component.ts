import { Component, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../shared/directives/ft-subtle-reveal.directive';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs';
import { ProfileSectionComponent } from './profile-section/profile-section.component';
import { PreferencesSectionComponent } from './preferences-section/preferences-section.component';
import { LinkedAccountsSectionComponent } from './linked-accounts-section/linked-accounts-section.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    TranslatePipe,
    FtSubtleRevealDirective,
    ProfileSectionComponent,
    PreferencesSectionComponent,
    LinkedAccountsSectionComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logoutLoading = signal(false);
  confirmLogout = signal(false);
  logoutError = signal('');

  /** Inline preferences drawer visibility. */
  showPreferencesDrawer = signal(false);

  togglePreferencesDrawer(): void {
    const next = !this.showPreferencesDrawer();
    this.showPreferencesDrawer.set(next);
    document.body.style.overflow = next ? 'hidden' : '';
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showPreferencesDrawer()) {
      this.showPreferencesDrawer.set(false);
      document.body.style.overflow = '';
    }
  }

  /** Toggle confirmation and move focus to the Cancel button. */
  onRequestSignOut(): void {
    this.confirmLogout.set(true);
    // Focus the Cancel button after the template re-renders
    setTimeout(() => {
      const cancelBtn = document.querySelector<HTMLElement>(
        '.logout-confirm .btn-cancel',
      );
      cancelBtn?.focus();
    });
  }

  onSignOut(): void {
    this.logoutLoading.set(true);
    this.logoutError.set('');

    this.authService.logout().pipe(
      finalize(() => {
        this.logoutLoading.set(false);
      }),
    ).subscribe({
      next: () => {
        this.confirmLogout.set(false);
        this.router.navigate(['/login']);
      },
      error: () => {
        this.logoutError.set(
          'Sign out failed. Please check your connection and try again.',
        );
      },
    });
  }
}
