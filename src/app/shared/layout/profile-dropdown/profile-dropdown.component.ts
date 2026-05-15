import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../../core/services/auth.service';
import { ICONS } from '../../../shared/icons/icon-registry';
import { ClickOutsideDirective } from '../../../directives/click-outside.directive';

@Component({
  selector: 'ft-profile-dropdown',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, ClickOutsideDirective],
  providers: [provideIcons(ICONS)],
  templateUrl: './profile-dropdown.component.html',
  styleUrl: './profile-dropdown.component.scss',
})
export class ProfileDropdownComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Estado del dropdown
  readonly isOpen = signal<boolean>(false);
  readonly isLoggingOut = signal<boolean>(false);

  // Usuario actual desde el AuthService
  readonly user = this.authService.currentUser;

  // displayName: usa displayName o la primera parte del email
  readonly displayName = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return '';
    if (currentUser.displayName) return currentUser.displayName;
    // Fallback: primera parte del email (antes del @)
    return currentUser.email.split('@')[0];
  });

  // initials: primeras 2 letras del displayName (uppercase)
  readonly initials = computed(() => {
    const name = this.displayName();
    if (!name) return 'U'; // Fallback por defecto
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

    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut.set(false);
        // La navegación ya la maneja clearTokens() en el AuthService
      },
      error: () => {
        this.isLoggingOut.set(false);
        // En caso de error, igual limpiamos y redirigimos
        this.authService.clearTokens();
      },
    });
  }

  onMenuClick(event: Event): void {
    event.stopPropagation();
  }
}
