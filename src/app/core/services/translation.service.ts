import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Language = 'es' | 'en' | 'fr';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly STORAGE_KEY = 'flowr_language';
  private readonly defaultLang: Language = 'es';

  private _translations = signal<Record<string, any>>({});
  private _currentLang = signal<Language>(this.defaultLang);

  readonly currentLang = this._currentLang.asReadonly();
  readonly translations = this._translations.asReadonly();

  constructor(private http: HttpClient) {
    this.loadStoredLanguage();
  }

  async setLanguage(lang: Language): Promise<void> {
    if (lang === this._currentLang()) return;

    try {
      const data = await firstValueFrom(
        this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`)
      );
      this._translations.set(data);
      this._currentLang.set(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch (error) {
      console.error(`Failed to load language ${lang}`, error);
    }
  }

  private async loadStoredLanguage(): Promise<void> {
    const stored = localStorage.getItem(this.STORAGE_KEY) as Language | null;
    const lang = stored || this.defaultLang;
    await this.setLanguage(lang);
  }

  translate(key: string): string {
    const keys = key.split('.');
    let value: any = this._translations();

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if not found
      }
    }

    return typeof value === 'string' ? value : key;
  }
}
