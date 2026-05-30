import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
    // Flush initial effect from constructor
    TestBed.flushEffects();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to dark theme', () => {
    expect(service.currentTheme()).toBe('dark');
  });

  it('should load stored theme from localStorage', () => {
    localStorage.setItem('flowr_theme', 'light');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    expect(service.currentTheme()).toBe('light');
  });

  it('should sync dark class on document.documentElement', () => {
    service.setTheme('dark');
    TestBed.flushEffects();

    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(document.documentElement.classList.contains('light')).toBeFalse();
  });

  it('should sync light class on document.documentElement', () => {
    service.setTheme('light');
    TestBed.flushEffects();

    expect(document.documentElement.classList.contains('light')).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
  });

  it('should set data-theme attribute on document.documentElement', () => {
    service.setTheme('light');
    TestBed.flushEffects();

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should toggle theme', () => {
    service.setTheme('dark');
    TestBed.flushEffects();
    service.toggleTheme();
    TestBed.flushEffects();
    expect(service.currentTheme()).toBe('light');

    service.toggleTheme();
    TestBed.flushEffects();
    expect(service.currentTheme()).toBe('dark');
  });
});
