import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Language = 'es' | 'en' | 'fr';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly STORAGE_KEY = 'flowr_language';
  private readonly TRANSLATIONS_KEY = 'flowr_translations';
  private readonly defaultLang: Language = 'es';

  // Lazy-inject HttpClient — only needed for async fetch, not for constructor
  private http = inject(HttpClient, { optional: true });

  private _translations = signal<Record<string, any>>({});
  private _currentLang = signal<Language>(this.defaultLang);
  private _loaded = signal(false);

  readonly currentLang = this._currentLang.asReadonly();
  readonly translations = this._translations.asReadonly();
  readonly isLoaded = this._loaded.asReadonly();

  constructor() {
    // Try loading from localStorage first (sync, no blocking)
    const cached = localStorage.getItem(this.TRANSLATIONS_KEY);
    if (cached) {
      try {
        this._translations.set(JSON.parse(cached));
        this._loaded.set(true);
      } catch {
        // Invalid JSON, fall through to async fetch
      }
    }

    // Restore language preference
    const stored = localStorage.getItem(this.STORAGE_KEY) as Language | null;
    if (stored) {
      this._currentLang.set(stored);
      document.documentElement.lang = stored;
    }

    // If not cached, fetch async in background
    if (!this._loaded()) {
      this.fetchTranslations();
    }
  }

  private async fetchTranslations(): Promise<void> {
    if (!this.http) return;

    const lang = this._currentLang();
    try {
      const data = await firstValueFrom(
        this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`)
      );
      this._translations.set(data);
      this._loaded.set(true);
      localStorage.setItem(this.TRANSLATIONS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to load language ${lang}`, error);
    }
  }

  async setLanguage(lang: Language): Promise<void> {
    if (lang === this._currentLang()) return;

    this._currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    await this.fetchTranslations();
  }

  translate(key: string, params?: Record<string, number | string>): string {
    // Null/undefined/empty guard — never crash on invalid keys
    if (!key || typeof key !== 'string') return '';
    if (!this._loaded()) return key;

    const keys = key.split('.');
    let value: any = this._translations();

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    let result = typeof value === 'string' ? value : key;

    // Interpolate params: {{ paramName }}
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), String(v));
      });
    }

    return result;
  }
}
