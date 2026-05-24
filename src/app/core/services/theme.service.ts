import { Injectable, signal, effect, inject } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'flowr_theme';
  private readonly defaultTheme: Theme = 'dark';

  private _currentTheme = signal<Theme>(this.defaultTheme);
  readonly currentTheme = this._currentTheme.asReadonly();

  constructor() {
    this.loadStoredTheme();

    // Apply theme to document whenever it changes
    effect(() => {
      const theme = this._currentTheme();
      document.documentElement.setAttribute('data-theme', theme);

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
    const current = this._currentTheme();
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  private loadStoredTheme(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    const theme = stored || this.defaultTheme;
    this._currentTheme.set(theme);
  }
}
