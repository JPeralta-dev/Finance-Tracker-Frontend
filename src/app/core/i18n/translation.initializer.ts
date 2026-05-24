import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Language } from '../services/translation.service';

/**
 * APP_INITIALIZER factory that loads translations before app bootstrap.
 * Ensures no raw keys are visible on first render.
 */
export function initializeTranslations(http: HttpClient) {
  return async () => {
    const stored = localStorage.getItem('flowr_language') as Language | null;
    const lang = stored || 'es';

    try {
      const data = await firstValueFrom(
        http.get<Record<string, any>>(`/assets/i18n/${lang}.json`)
      );

      // Store in localStorage for the service to pick up
      localStorage.setItem('flowr_translations', JSON.stringify(data));
      localStorage.setItem('flowr_language', lang);
      document.documentElement.lang = lang;
    } catch (error) {
      console.error('Failed to preload translations', error);
    }
  };
}
