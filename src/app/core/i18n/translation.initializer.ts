import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Language } from '../services/translation.service';

const SUPPORTED_LANGUAGES: Language[] = ['es', 'en', 'fr'];
const DEFAULT_LANG: Language = 'en';

/**
 * Resolves the best initial language for the APP_INITIALIZER:
 * 1. Stored user preference (localStorage)
 * 2. Browser language (navigator.language) — first visit, respects the user's OS/browser setting
 * 3. Fallback: English
 */
function resolveInitialLanguage(): Language {
  // 1. Explicit user preference from a previous session
  const stored = localStorage.getItem('flowr_language') as Language | null;
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;

  // 2. Browser language detection — first-time visitor gets their OS language
  try {
    const browserLang = (navigator.language || '').slice(0, 2) as Language;
    if (SUPPORTED_LANGUAGES.includes(browserLang)) return browserLang;
  } catch {
    // SSR or restricted environment — fall through
  }

  // 3. Default to English
  return DEFAULT_LANG;
}

/**
 * APP_INITIALIZER factory that loads translations before app bootstrap.
 * Ensures no raw keys are visible on first render and the correct
 * language is loaded before any component mounts.
 */
export function initializeTranslations(http: HttpClient) {
  return async () => {
    const lang = resolveInitialLanguage();

    try {
      const data = await firstValueFrom(
        http.get<Record<string, any>>(`/assets/i18n/${lang}.json`)
      );

      // Store in localStorage for the TranslationService to pick up
      localStorage.setItem('flowr_translations', JSON.stringify(data));
      localStorage.setItem('flowr_language', lang);
      document.documentElement.lang = lang;
    } catch (error) {
      console.error('Failed to preload translations', error);
    }
  };
}
