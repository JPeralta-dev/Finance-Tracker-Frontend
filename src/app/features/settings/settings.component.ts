import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../shared/directives/ft-subtle-reveal.directive';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs';
import { SecuritySectionComponent } from './security-section/security-section.component';
import { NotificationsSectionComponent } from './notifications-section/notifications-section.component';
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
    SecuritySectionComponent,
    NotificationsSectionComponent,
    PreferencesSectionComponent,
    LinkedAccountsSectionComponent,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logoutLoading = signal(false);

  onSignOut(): void {
    this.logoutLoading.set(true);
    this.authService.logout().pipe(
      finalize(() => {
        this.logoutLoading.set(false);
      }),
    ).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}
