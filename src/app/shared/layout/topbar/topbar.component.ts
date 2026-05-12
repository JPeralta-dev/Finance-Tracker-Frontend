import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutService, NavItem } from '../../../core/services/layout.service';
import { NavItemComponent } from '../../layout/nav-item/nav-item.component';
import { MobileMenuComponent } from '../../layout/mobile-menu/mobile-menu.component';
import { MobileMenuItem } from '../../layout/mobile-menu/mobile-menu.types';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Transactions', path: '/transactions', icon: '💳' },
  { label: 'Categories', path: '/categories', icon: '🏷️' },
  { label: 'Analytics', path: '/analytics', icon: '📈' },
];

@Component({
  selector: 'ft-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NavItemComponent, MobileMenuComponent],
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
