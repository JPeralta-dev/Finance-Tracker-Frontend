import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { LayoutService, NavItem } from '../../../core/services/layout.service';
import { NavItemComponent } from '../../layout/nav-item/nav-item.component';
import { MobileMenuComponent } from '../../layout/mobile-menu/mobile-menu.component';
import { MobileMenuItem } from '../../layout/mobile-menu/mobile-menu.types';
import { ICONS } from '../../../shared/icons/icon-registry';
import { ProfileDropdownComponent } from '../../layout/profile-dropdown/profile-dropdown.component';
import { NotificationsDropdownComponent } from '../../layout/notifications-dropdown/notifications-dropdown.component';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs';

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Transactions', path: '/transactions', icon: 'transactions' },
  { label: 'Categories', path: '/categories', icon: 'categories' },
  { label: 'Analytics', path: '/analytics', icon: 'analytics' },
];

const NAV_ITEM_LABELS = NAV_ITEMS.map((item) => item.label);

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/transactions/new': 'New Transaction',
  '/categories': 'Categories',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/profile': 'Profile',
};

const PRIVATE_PATHS = Object.keys(ROUTE_TITLES);

@Component({
  selector: 'ft-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgIcon, NavItemComponent, MobileMenuComponent, ProfileDropdownComponent, NotificationsDropdownComponent],
  providers: [provideIcons(ICONS)],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly layoutService = inject(LayoutService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = NAV_ITEMS;
  readonly mobileItems: MobileMenuItem[] = NAV_ITEMS;

  readonly mobileMenuOpen = this.layoutService.mobileMenuOpen;
  readonly isScrolled = this.layoutService.isScrolled;
  readonly currentUser = this.authService.currentUser;
  readonly isAuthenticated = this.authService.isAuthenticated;

  readonly pageTitle = signal<string>('');
  readonly showHomeButton = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects.split('?')[0].split('#')[0];
        const title = ROUTE_TITLES[url] ?? '';
        const isNavMatch = title !== '' && NAV_ITEM_LABELS.includes(title);
        this.pageTitle.set(isNavMatch ? '' : title);
        this.showHomeButton.set(PRIVATE_PATHS.some(path => url.startsWith(path)));
      });

    // Initialize on component creation
    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    const initTitle = ROUTE_TITLES[currentUrl] ?? '';
    const isInitNavMatch = initTitle !== '' && NAV_ITEM_LABELS.includes(initTitle);
    this.pageTitle.set(isInitNavMatch ? '' : initTitle);
    this.showHomeButton.set(PRIVATE_PATHS.some(path => currentUrl.startsWith(path)));
  }

  onToggleMenu(): void {
    this.layoutService.toggleMobileMenu();
  }

  onCloseMenu(): void {
    this.layoutService.closeMobileMenu();
  }

  getLogoLink(): string {
    return this.isAuthenticated() ? '/dashboard' : '/';
  }
}
