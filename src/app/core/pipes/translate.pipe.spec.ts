import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from '../services/translation.service';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  template: `<span>{{ key | translate }}</span>`,
})
class TestHostComponent {
  key = 'greeting';
}

describe('TranslatePipe', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('flowr_translations', JSON.stringify({
      'greeting': 'Hola',
      'farewell': 'Adiós',
      'welcome': 'Bienvenido, {{name}}',
    }));
    localStorage.setItem('flowr_language', 'es');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('pure: true — basic translation', () => {
    it('should translate a key using TranslationService', () => {
      TestBed.configureTestingModule({
        providers: [TranslationService, TranslatePipe],
      });
      service = TestBed.inject(TranslationService);
      const pipe = TestBed.inject(TranslatePipe);

      expect(pipe.transform('greeting')).toBe('Hola');
    });

    it('should return empty string for null/undefined key', () => {
      TestBed.configureTestingModule({
        providers: [TranslationService, TranslatePipe],
      });
      const pipe = TestBed.inject(TranslatePipe);

      expect(pipe.transform(null as any)).toBe('');
      expect(pipe.transform(undefined as any)).toBe('');
    });

    it('should interpolate parameters with {{ paramName }}', () => {
      TestBed.configureTestingModule({
        providers: [TranslationService, TranslatePipe],
      });
      service = TestBed.inject(TranslationService);
      const pipe = TestBed.inject(TranslatePipe);

      expect(pipe.transform('welcome', { name: 'Juan' })).toBe('Bienvenido, Juan');
    });

    it('should return the raw key when translation is not found', () => {
      TestBed.configureTestingModule({
        providers: [TranslationService, TranslatePipe],
      });
      service = TestBed.inject(TranslationService);
      const pipe = TestBed.inject(TranslatePipe);

      expect(pipe.transform('nonexistent.key')).toBe('nonexistent.key');
    });
  });

  describe('pure: true — re-evaluation on language change', () => {
    it('should re-render when language changes via effect + markForCheck', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [TestHostComponent],
        providers: [TranslationService],
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();

      // Initial translation in Spanish
      expect(fixture.nativeElement.querySelector('span').textContent).toBe('Hola');

      // Change language — the effect should trigger markForCheck
      const svc = TestBed.inject(TranslationService);
      (svc as any)._translations.set({ 'greeting': 'Hello' });
      (svc as any)._currentLang.set('en');

      tick();
      fixture.detectChanges();

      // After language change, pipe should re-evaluate with new language
      expect(fixture.nativeElement.querySelector('span').textContent).toBe('Hello');
    }));
  });
});
