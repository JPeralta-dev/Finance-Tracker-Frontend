import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

/**
 * Impure translate pipe — re-evaluates on every change detection cycle
 * so language switches reflect instantly without page reload.
 * The `translate()` lookup is a simple object traversal + string replace,
 * so the performance cost is negligible.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(key: string, params?: Record<string, number | string>): string {
    if (key == null) return '';
    return this.translationService.translate(key, params);
  }
}
