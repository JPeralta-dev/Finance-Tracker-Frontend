import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Locale keys sync test — validates all 3 locale files stay synchronized.
// Loads JSON files via HttpClient (served from assets during test).

describe('i18n Locale Synchronization', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Recursively count all leaf keys in a nested object.
   * e.g. { a: { b: 1, c: 2 }, d: 3 } → 3 leaf keys
   */
  function countLeafKeys(obj: Record<string, unknown>): number {
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count += countLeafKeys(value as Record<string, unknown>);
      } else {
        count++;
      }
    }
    return count;
  }

  /**
   * Get all dot-notation keys from a nested object.
   * e.g. { a: { b: 1 } } → ['a.b']
   */
  function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...getAllKeys(value as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  }

  it('should have analytics section in all locale files', (done) => {
    const locales = ['en', 'es', 'fr'];
    const results: Record<string, Record<string, unknown>> = {};
    let loaded = 0;

    locales.forEach((locale) => {
      TestBed.inject(HttpClientTestingModule);
      // We need to make actual HTTP requests — use fetch instead
      fetch(`/assets/i18n/${locale}.json`)
        .then((r) => r.json())
        .then((data) => {
          results[locale] = data;
          loaded++;
          if (loaded === locales.length) {
            locales.forEach((locale) => {
              const analytics = results[locale]['analytics'] as Record<string, unknown> | undefined;
              expect(analytics).toBeDefined(
                `${locale}.json is missing the analytics section`
              );
              expect(analytics?.['title']).toBeDefined(
                `${locale}.json is missing analytics.title`
              );
            });
            done();
          }
        })
        .catch(done.fail);
    });
  });

  it('should have profile keys (signingOut, signOut, insights, accountAge, totalTransactions) in all locales', (done) => {
    const locales = ['en', 'es', 'fr'];
    const requiredProfileKeys = [
      'signingOut',
      'signOut',
      'insights',
      'accountAge',
      'totalTransactions',
    ];
    const results: Record<string, Record<string, unknown>> = {};
    let loaded = 0;

    locales.forEach((locale) => {
      fetch(`/assets/i18n/${locale}.json`)
        .then((r) => r.json())
        .then((data) => {
          results[locale] = data;
          loaded++;
          if (loaded === locales.length) {
            locales.forEach((locale) => {
              const profile = results[locale]['profile'] as Record<string, unknown>;
              expect(profile).toBeDefined(`${locale}.json is missing profile section`);
              requiredProfileKeys.forEach((key) => {
                expect(profile?.[key]).toBeDefined(
                  `${locale}.json is missing profile.${key}`
                );
              });
            });
            done();
          }
        })
        .catch(done.fail);
    });
  });

  it('should have fr.json key count within 2% of en.json', (done) => {
    Promise.all([
      fetch('/assets/i18n/en.json').then((r) => r.json()),
      fetch('/assets/i18n/fr.json').then((r) => r.json()),
    ]).then(([en, fr]) => {
      const enCount = countLeafKeys(en);
      const frCount = countLeafKeys(fr);
      const variance = Math.abs(enCount - frCount) / enCount;

      expect(variance).toBeLessThanOrEqual(
        0.02,
        `fr.json key count (${frCount}) differs from en.json (${enCount}) by ${(variance * 100).toFixed(1)}% (max 2%)`
      );
      done();
    }).catch(done.fail);
  });

  it('should have es.json key count within 2% of en.json', (done) => {
    Promise.all([
      fetch('/assets/i18n/en.json').then((r) => r.json()),
      fetch('/assets/i18n/es.json').then((r) => r.json()),
    ]).then(([en, es]) => {
      const enCount = countLeafKeys(en);
      const esCount = countLeafKeys(es);
      const variance = Math.abs(enCount - esCount) / enCount;

      expect(variance).toBeLessThanOrEqual(
        0.02,
        `es.json key count (${esCount}) differs from en.json (${enCount}) by ${(variance * 100).toFixed(1)}% (max 2%)`
      );
      done();
    }).catch(done.fail);
  });

  it('should have nav.profile key in all locales', (done) => {
    const locales = ['en', 'es', 'fr'];
    const results: Record<string, Record<string, unknown>> = {};
    let loaded = 0;

    locales.forEach((locale) => {
      fetch(`/assets/i18n/${locale}.json`)
        .then((r) => r.json())
        .then((data) => {
          results[locale] = data;
          loaded++;
          if (loaded === locales.length) {
            locales.forEach((locale) => {
              const nav = results[locale]['nav'] as Record<string, unknown>;
              expect(nav?.['profile']).toBeDefined(
                `${locale}.json is missing nav.profile`
              );
            });
            done();
          }
        })
        .catch(done.fail);
    });
  });
});
