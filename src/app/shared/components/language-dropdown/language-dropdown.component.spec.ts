import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgIcon } from '@ng-icons/core';

import { LanguageDropdownComponent } from './language-dropdown.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { TranslationService } from '../../../core/services/translation.service';

describe('LanguageDropdownComponent', () => {
  let component: LanguageDropdownComponent;
  let fixture: ComponentFixture<LanguageDropdownComponent>;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    translationServiceSpy = jasmine.createSpyObj('TranslationService', ['setLanguage'], {
      currentLang: jasmine.createSpy('currentLang').and.returnValue('es'),
    });
    translationServiceSpy.setLanguage.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [LanguageDropdownComponent, NgIcon, ClickOutsideDirective],
      providers: [
        { provide: TranslationService, useValue: translationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should render a globe icon button as the trigger', () => {
      const triggerBtn = fixture.debugElement.query(By.css('.lang-dropdown__trigger'));
      expect(triggerBtn).toBeTruthy();
    });

    it('should render the globe icon with correct name', () => {
      const icon = fixture.debugElement.query(By.css('ng-icon'));
      expect(icon).toBeTruthy();
      expect(icon.attributes['name']).toBe('globe');
    });

    it('should NOT show dropdown when closed', () => {
      const menu = fixture.debugElement.query(By.css('.lang-dropdown__menu'));
      expect(menu).toBeFalsy();
    });
  });

  describe('dropdown toggle', () => {
    it('should open dropdown when clicking the globe trigger', () => {
      const triggerBtn = fixture.debugElement.query(By.css('.lang-dropdown__trigger'));
      triggerBtn.triggerEventHandler('click', null);
      fixture.detectChanges();

      const menu = fixture.debugElement.query(By.css('.lang-dropdown__menu'));
      expect(menu).toBeTruthy();
    });

    it('should close dropdown when clicking the trigger again', () => {
      const triggerBtn = fixture.debugElement.query(By.css('.lang-dropdown__trigger'));

      // Open
      triggerBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.lang-dropdown__menu'))).toBeTruthy();

      // Close
      triggerBtn.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.lang-dropdown__menu'))).toBeFalsy();
    });
  });

  describe('language options', () => {
    beforeEach(() => {
      // Open the dropdown
      component.toggleDropdown();
      fixture.detectChanges();
    });

    it('should render ES, EN, FR language options', () => {
      const items = fixture.debugElement.queryAll(By.css('.lang-dropdown__item'));
      expect(items.length).toBe(3);
    });

    it('should display correct flags for each language', () => {
      const flags = fixture.debugElement.queryAll(By.css('.lang-dropdown__flag'));
      expect(flags[0].nativeElement.textContent).toContain('ES');
      expect(flags[1].nativeElement.textContent).toContain('EN');
      expect(flags[2].nativeElement.textContent).toContain('FR');
    });

    it('should highlight the current language as active', () => {
      const items = fixture.debugElement.queryAll(By.css('.lang-dropdown__item'));
      const activeItems = items.filter(
        (item) => item.nativeElement.classList.contains('active'),
      );
      expect(activeItems.length).toBe(1);
      expect(activeItems[0].query(By.css('.lang-dropdown__label')).nativeElement.textContent.trim()).toBe('Español');
    });
  });

  describe('language selection', () => {
    it('should call setLanguage and close dropdown when clicking a language', fakeAsync(() => {
      // Open dropdown
      component.toggleDropdown();
      fixture.detectChanges();

      // Click EN option
      const items = fixture.debugElement.queryAll(By.css('.lang-dropdown__item'));
      items[1].triggerEventHandler('click', null);
      tick();
      fixture.detectChanges();

      expect(translationServiceSpy.setLanguage).toHaveBeenCalledWith('en');
      expect(component.isOpen()).toBeFalse();
    }));

    it('should call setLanguage with correct language code for FR', fakeAsync(() => {
      component.toggleDropdown();
      fixture.detectChanges();

      const items = fixture.debugElement.queryAll(By.css('.lang-dropdown__item'));
      items[2].triggerEventHandler('click', null);
      tick();
      fixture.detectChanges();

      expect(translationServiceSpy.setLanguage).toHaveBeenCalledWith('fr');
    }));
  });

  describe('click outside', () => {
    it('should close dropdown when clickOutside event fires', () => {
      component.toggleDropdown();
      fixture.detectChanges();
      expect(component.isOpen()).toBeTrue();

      component.closeDropdown();
      fixture.detectChanges();

      expect(component.isOpen()).toBeFalse();
    });
  });
});
