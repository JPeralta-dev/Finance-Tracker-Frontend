import { Injectable, signal, effect, inject, NgZone } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'flowr_theme';
  private readonly defaultTheme: Theme = 'dark';
  private readonly ngZone = inject(NgZone);

  private _currentTheme = signal<Theme>(this.defaultTheme);
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    this.loadStoredTheme();

    // Apply theme to document whenever it changes
    effect(() => {
      const theme = this._currentTheme();
      document.documentElement.setAttribute('data-theme', theme);
      // Sync class on <html> for inline script consistency
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);
      // body.class management stays as-is
      if (theme === 'light') {
        document.body.classList.add('theme-light');
      } else {
        document.body.classList.remove('theme-light');
      }
    });
  }

  setTheme(theme: Theme): void {
    this._currentTheme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  toggleTheme(): void {
    const next = this._currentTheme() === 'dark' ? 'light' : 'dark';
    const performSwitch = () => {
      this.setTheme(next);
    };

    if ('startViewTransition' in document) {
      this.ngZone.runOutsideAngular(() => {
        document.startViewTransition(performSwitch);
      });
    } else {
      performSwitch();
    }
  }

  private loadStoredTheme(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    const theme = stored || this.defaultTheme;
    this._currentTheme.set(theme);
  }
}
