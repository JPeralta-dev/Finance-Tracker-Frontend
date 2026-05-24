import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NavItemComponent } from '../nav-item/nav-item.component';
import { MobileMenuItem } from './mobile-menu.types';
import { ICONS } from '../../../shared/icons/icon-registry';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'ft-mobile-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, NavItemComponent, NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  private readonly authService = inject(AuthService);

  items = input.required<MobileMenuItem[]>();
  isOpen = input<boolean>(false);
  user = input<User | null>(null);

  close = output<void>();

  readonly currentUser = this.authService.currentUser;

  onClose(): void {
    this.close.emit();
  }

  onLogout(): void {
    this.authService.logout().subscribe();
    this.onClose();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
