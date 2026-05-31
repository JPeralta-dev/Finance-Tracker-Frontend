import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import type { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile-dropdown-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, TranslatePipe],
  providers: [provideIcons(ICONS)],
  templateUrl: './profile-dropdown-menu.component.html',
  styleUrl: './profile-dropdown-menu.component.scss',
})
export class ProfileDropdownMenuComponent {
  user = input.required<User | null>();
  initials = input.required<string>();
  displayName = input.required<string>();
  isLoggingOut = input.required<boolean>();

  closed = output<void>();
  logoutRequested = output<void>();

  onMenuClick(event: Event): void {
    event.stopPropagation();
  }

  onClose(): void {
    this.closed.emit();
  }

  onLogout(): void {
    this.logoutRequested.emit();
  }
}
