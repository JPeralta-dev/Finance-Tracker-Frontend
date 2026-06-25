import { Pipe, PipeTransform, ChangeDetectorRef, inject, effect } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: true,
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // When language changes, trigger change detection so pure pipe re-evaluates
    effect(() => {
      this.translationService.currentLang();
      this.cdr.markForCheck();
    });
  }

  transform(key: string, params?: Record<string, number | string>): string {
    if (key == null) return '';
    return this.translationService.translate(key, params);
  }
}
