import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LayoutService, NavItem } from '../../../core/services/layout.service';
import { NavItemComponent } from '../../layout/nav-item/nav-item.component';
import { MobileMenuComponent } from '../../layout/mobile-menu/mobile-menu.component';
import { MobileMenuItem } from '../../layout/mobile-menu/mobile-menu.types';
import { ICONS } from '../../../shared/icons/icon-registry';
import { ProfileDropdownComponent } from '../../layout/profile-dropdown/profile-dropdown.component';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Transactions', path: '/transactions', icon: 'transactions' },
  { label: 'Categories', path: '/categories', icon: 'categories' },
  { label: 'Analytics', path: '/analytics', icon: 'analytics' },
];

@Component({
  selector: 'ft-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, NavItemComponent, MobileMenuComponent, ProfileDropdownComponent],
  providers: [provideIcons(ICONS)],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly layoutService = inject(LayoutService);

  readonly navItems = NAV_ITEMS;
  readonly mobileItems: MobileMenuItem[] = NAV_ITEMS;

  readonly mobileMenuOpen = this.layoutService.mobileMenuOpen;
  readonly isScrolled = this.layoutService.isScrolled;

  onToggleMenu(): void {
    this.layoutService.toggleMobileMenu();
  }

  onCloseMenu(): void {
    this.layoutService.closeMobileMenu();
  }
}
