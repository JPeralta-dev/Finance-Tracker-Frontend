import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HeroSectionComponent } from './hero-section.component';
import { TranslationService } from '../../../../core/services/translation.service';

// Mock TranslationService
function createMockTranslationService() {
  return jasmine.createSpyObj('TranslationService', ['translate'], {
    currentLang: 'en',
    isLoaded: true,
  });
}

describe('HeroSectionComponent', () => {
  let fixture: ComponentFixture<HeroSectionComponent>;
  let mockTranslationService: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    mockTranslationService = createMockTranslationService();

    await TestBed.configureTestingModule({
      imports: [HeroSectionComponent, RouterTestingModule],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSectionComponent);
    fixture.detectChanges();
  });

  describe('hero title', () => {
    it('should render specific value prop instead of generic title', () => {
      mockTranslationService.translate.and.callFake((key: string) => {
        if (key === 'landing.heroTitle') return 'Your money, <br />perfectly organized';
        return key;
      });

      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('.hero__title');
      expect(title.textContent).toContain('Your money');
      expect(title.textContent).toContain('perfectly organized');
    });
  });
});
