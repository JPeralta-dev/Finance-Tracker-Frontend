import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth.service';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { ProfileDropdownTriggerComponent } from './profile-dropdown-trigger/profile-dropdown-trigger.component';
import { ProfileDropdownMenuComponent } from './profile-dropdown-menu/profile-dropdown-menu.component';

@Component({
  selector: 'ft-profile-dropdown',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective, ProfileDropdownTriggerComponent, ProfileDropdownMenuComponent],
  templateUrl: './profile-dropdown.component.html',
  styleUrl: './profile-dropdown.component.scss',
})
export class ProfileDropdownComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
  );

  readonly isOpen = signal<boolean>(false);
  readonly isLoggingOut = signal<boolean>(false);

  readonly user = this.authService.currentUser;

  readonly displayName = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return '';
    if (currentUser.displayName) return currentUser.displayName;
    return currentUser.email.split('@')[0];
  });

  readonly initials = computed(() => {
    const name = this.displayName();
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });

  toggleDropdown(): void {
    this.isOpen.update((open) => !open);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  async onLogout(): Promise<void> {
    if (this.isLoggingOut()) return;

    this.isLoggingOut.set(true);
    this.closeDropdown();

    const shouldNavigate = this.currentUrl()?.urlAfterRedirects !== '/login';

    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut.set(false);
        if (shouldNavigate) {
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        this.isLoggingOut.set(false);
        this.authService.clearTokens();
        if (shouldNavigate) {
          this.router.navigate(['/login']);
        }
      },
    });
  }
}
