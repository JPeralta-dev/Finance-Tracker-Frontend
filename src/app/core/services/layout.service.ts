import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, throttleTime } from 'rxjs';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Mobile menu open/close state */
  private readonly _mobileMenuOpen = signal(false);
  readonly mobileMenuOpen = this._mobileMenuOpen.asReadonly();

  /** Scroll Y position */
  private readonly _scrollY = signal(0);
  readonly scrollY = this._scrollY.asReadonly();

  /** Whether topbar should appear elevated (scrolled) */
  readonly isScrolled = computed(() => this._scrollY() > 10);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      fromEvent(window, 'scroll')
        .pipe(throttleTime(16))
        .subscribe(() => {
          this._scrollY.set(window.scrollY);
        });
    }
  }

  toggleMobileMenu(): void {
    this._mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this._mobileMenuOpen.set(false);
  }
}
