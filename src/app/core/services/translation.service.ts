import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Language = 'es' | 'en' | 'fr';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly STORAGE_KEY = 'flowr_language';
  private readonly TRANSLATIONS_KEY = 'flowr_translations';
  private readonly defaultLang: Language = 'es';

  private _translations = signal<Record<string, any>>({});
  private _currentLang = signal<Language>(this.defaultLang);
  private _loaded = signal(false);

  readonly currentLang = this._currentLang.asReadonly();
  readonly translations = this._translations.asReadonly();
  readonly isLoaded = this._loaded.asReadonly();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Language | null;
    const lang = stored || this.defaultLang;
    this._currentLang.set(lang);

    // Check if translations were pre-loaded by APP_INITIALIZER
    const preloaded = localStorage.getItem(this.TRANSLATIONS_KEY);
    if (preloaded) {
      try {
        this._translations.set(JSON.parse(preloaded));
        this._loaded.set(true);
        return;
      } catch {
        // Invalid JSON, fall through to HTTP load
      }
    }

    // Fallback: load via HTTP
    this.setLanguage(lang);
  }

  async setLanguage(lang: Language): Promise<void> {
    if (lang === this._currentLang()) return;

    try {
      const data = await firstValueFrom(
        this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`)
      );
      this._translations.set(data);
      this._currentLang.set(lang);
      this._loaded.set(true);
      localStorage.setItem(this.STORAGE_KEY, lang);
      localStorage.setItem(this.TRANSLATIONS_KEY, JSON.stringify(data));
      document.documentElement.lang = lang;
    } catch (error) {
      console.error(`Failed to load language ${lang}`, error);
    }
  }

  translate(key: string, params?: Record<string, number | string>): string {
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
