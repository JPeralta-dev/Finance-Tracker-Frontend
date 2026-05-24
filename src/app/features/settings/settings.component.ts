import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../shared/icons/icon-registry';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { FtSubtleRevealDirective } from '../../shared/directives/ft-subtle-reveal.directive';
import { AuthService } from '../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    TranslatePipe,
    FtSubtleRevealDirective,
  ],
  providers: [provideIcons(ICONS)],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  userEmail = signal('');
  logoutLoading = signal(false);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.userEmail.set(user.displayName ?? user.email);
        },
        error: () => {
          this.authService.clearTokens();
        },
      });
    }
  }

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
