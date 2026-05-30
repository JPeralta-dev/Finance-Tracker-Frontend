import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FtSubtleRevealDirective, EFFECT_REGISTRY, EffectDefinition } from './ft-subtle-reveal.directive';

// ── Test Hosts ─────────────────────────────────────────────────────────

@Component({
  template: `<div ftSubtleReveal="fade-up">Hello World</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostFadeUpComponent {}

@Component({
  template: `<div ftSubtleReveal="micro-scale-fade">42</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostMicroScaleComponent {}

@Component({
  template: `<div ftSubtleReveal="soft-blur-in">Title</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostSoftBlurComponent {}

@Component({
  template: `<div ftSubtleReveal="per-word-crossfade">Hello World</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostPerWordComponent {}

@Component({
  template: `<div ftSubtleReveal="typewriter">Code</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostTypewriterComponent {}

@Component({
  template: `<div ftSubtleReveal="shimmer-sweep">Shimmer</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostShimmerComponent {}

@Component({
  template: `<div ftSubtleReveal="short-slide-right">Slide Right</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostShortSlideComponent {}

@Component({
  template: `<div ftSubtleReveal="scale-down-fade">Scale</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostScaleDownComponent {}

@Component({
  template: `<div ftSubtleReveal="unknown-effect">Test</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostUnknownEffectComponent {}

@Component({
  template: `<div ftSubtleReveal="fade-up" [delay]="200">Delayed</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostCustomDelayComponent {}

@Component({
  template: `<div ftSubtleReveal="fade-up" [threshold]="0.5">Threshold</div>`,
  standalone: true,
  imports: [FtSubtleRevealDirective],
})
class TestHostCustomThresholdComponent {}

// ── Specs ──────────────────────────────────────────────────────────────

describe('FtSubtleRevealDirective', () => {
  // ── RED: Registry ──────────────────────────────────────────────────

  describe('EFFECT_REGISTRY', () => {
    it('should contain 8 effects', () => {
      expect(EFFECT_REGISTRY.size).toBe(8);
    });

    it('should have soft-blur-in effect', () => {
      const effect = EFFECT_REGISTRY.get('soft-blur-in');
      expect(effect).toBeDefined();
      expect(effect!.target).toBe('per-character');
      expect(effect!.duration).toBe(648);
      expect(effect!.stagger).toBe(18);
    });

    it('should have per-word-crossfade effect', () => {
      const effect = EFFECT_REGISTRY.get('per-word-crossfade');
      expect(effect).toBeDefined();
      expect(effect!.target).toBe('per-word');
      expect(effect!.duration).toBe(504);
    });

    it('should have micro-scale-fade effect', () => {
      const effect = EFFECT_REGISTRY.get('micro-scale-fade');
      expect(effect).toBeDefined();
      expect(effect!.target).toBe('whole');
      expect(effect!.duration).toBe(432);
    });

    it('should have fade-up effect', () => {
      const effect = EFFECT_REGISTRY.get('fade-up');
      expect(effect).toBeDefined();
      expect(effect!.target).toBe('whole');
      expect(effect!.duration).toBe(432);
    });

    it('should have typewriter effect', () => {
      const effect = EFFECT_REGISTRY.get('typewriter');
      expect(effect).toBeDefined();
      expect(effect!.target).toBe('per-character');
      expect(effect!.easing).toBe('steps(1, end)');
    });

    it('should have shimmer-sweep effect', () => {
      const effect = EFFECT_REGISTRY.get('shimmer-sweep');
      expect(effect).toBeDefined();
      expect(effect!.target).toBe('whole');
    });

    it('should have short-slide-right effect', () => {
      const effect = EFFECT_REGISTRY.get('short-slide-right');
      expect(effect).toBeDefined();
      expect(effect!.target).toBe('per-word');
    });

    it('should have scale-down-fade effect', () => {
      const effect = EFFECT_REGISTRY.get('scale-down-fade');
      expect(effect).toBeDefined();
      expect(effect!.target).toBe('whole');
    });

    it('should return undefined for unknown effect', () => {
      const effect = EFFECT_REGISTRY.get('nonexistent');
      expect(effect).toBeUndefined();
    });
  });

  // ── RED: Directive instantiation ───────────────────────────────────

  describe('directive instantiation', () => {
    it('should create with fade-up effect', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostFadeUpComponent],
      }).createComponent(TestHostFadeUpComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
      expect(directive).toBeTruthy();
      expect(directive.effect).toBe('fade-up');
    });

    it('should create with micro-scale-fade effect', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostMicroScaleComponent],
      }).createComponent(TestHostMicroScaleComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
      expect(directive.effect).toBe('micro-scale-fade');
    });

    it('should have default inputs', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostFadeUpComponent],
      }).createComponent(TestHostFadeUpComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
      expect(directive.delay).toBe(0);
      expect(directive.threshold).toBe(0.1);
    });
  });

  // ── RED: Unknown effect → silent no-op ─────────────────────────────

  describe('unknown effect', () => {
    it('should not create IntersectionObserver for unknown effect', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostUnknownEffectComponent],
      }).createComponent(TestHostUnknownEffectComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
      // Should not throw, just silently skip
      expect(directive).toBeTruthy();
      // Element should remain in initial state (no opacity set by directive)
      const el = fixture.nativeElement.querySelector('div');
      expect(el.style.opacity).toBe('');
    });
  });

  // ── RED: prefers-reduced-motion ────────────────────────────────────

  describe('prefers-reduced-motion', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('should set element visible instantly when reduced-motion is active', () => {
      // Mock matchMedia to return reduced-motion active
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);

      const fixture = TestBed.configureTestingModule({
        imports: [TestHostFadeUpComponent],
      }).createComponent(TestHostFadeUpComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('div');
      expect(el.style.opacity).toBe('1');
    });

    it('should not set up observer when reduced-motion is active', () => {
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: true,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);

      const fixture = TestBed.configureTestingModule({
        imports: [TestHostFadeUpComponent],
      }).createComponent(TestHostFadeUpComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
      // Observer should be null since reduced-motion skips setup
      expect((directive as any).observer).toBeNull();
    });
  });

  // ── RED: IntersectionObserver trigger ──────────────────────────────

  describe('IntersectionObserver trigger', () => {
    let fixture: ComponentFixture<TestHostFadeUpComponent>;
    let directive: FtSubtleRevealDirective;
    let el: HTMLElement;
    let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null;

    beforeEach(() => {
      // Ensure reduced-motion is NOT active
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);

      // Use a real constructor function instead of jasmine.createSpy
      function FakeObserver(this: IntersectionObserver, cb: IntersectionObserverCallback) {
        observerCallback = (entries) => cb(entries, this);
        this.observe = jasmine.createSpy('observe');
        this.unobserve = jasmine.createSpy('unobserve');
        this.disconnect = jasmine.createSpy('disconnect');
      }
      (window as any).IntersectionObserver = FakeObserver;

      fixture = TestBed.configureTestingModule({
        imports: [TestHostFadeUpComponent],
      }).createComponent(TestHostFadeUpComponent);
      fixture.detectChanges();

      directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
      el = fixture.nativeElement.querySelector('div');
    });

    it('should create an IntersectionObserver', () => {
      expect(observerCallback).not.toBeNull();
    });

    it('should call element.animate when observer fires with isIntersecting', () => {
      const animateSpy = spyOn(el, 'animate').and.callThrough();

      // Simulate observer firing
      const entry = { isIntersecting: true, target: el, boundingClientRect: {} as DOMRectReadOnly, intersectionRatio: 1, intersectionRect: {} as DOMRectReadOnly, rootBounds: null, time: 0 } as unknown as IntersectionObserverEntry;
      observerCallback!([entry]);

      // For whole-target (fade-up), animate should be called on the host
      expect(animateSpy).toHaveBeenCalled();
    });

    it('should not replay animation on second intersection', () => {
      const animateSpy = spyOn(el, 'animate').and.callThrough();

      // First intersection
      const entry = { isIntersecting: true, target: el, boundingClientRect: {} as DOMRectReadOnly, intersectionRatio: 1, intersectionRect: {} as DOMRectReadOnly, rootBounds: null, time: 0 } as unknown as IntersectionObserverEntry;
      observerCallback!([entry]);
      const firstCallCount = animateSpy.calls.count();

      // Second intersection (should not replay)
      observerCallback!([entry]);

      expect(animateSpy.calls.count()).toBe(firstCallCount);
    });

    it('should not animate when isIntersecting is false', () => {
      const animateSpy = spyOn(el, 'animate').and.callThrough();

      const entry = { isIntersecting: false, target: el, boundingClientRect: {} as DOMRectReadOnly, intersectionRatio: 0, intersectionRect: {} as DOMRectReadOnly, rootBounds: null, time: 0 } as unknown as IntersectionObserverEntry;
      observerCallback!([entry]);

      expect(animateSpy).not.toHaveBeenCalled();
    });
  });

  // ── RED: DOM wrapping for per-character effects ────────────────────

  describe('DOM wrapping: per-character', () => {
    beforeEach(() => {
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);
    });

    it('should wrap each character in a span.ft-char for soft-blur-in', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostSoftBlurComponent],
      }).createComponent(TestHostSoftBlurComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('div');
      const chars = el.querySelectorAll('.ft-char');
      // "Title" = 5 characters
      expect(chars.length).toBe(5);
      // Each char span should start invisible
      expect((chars[0] as HTMLElement).style.opacity).toBe('0');
    });

    it('should wrap each character in a span.ft-char for typewriter', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostTypewriterComponent],
      }).createComponent(TestHostTypewriterComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('div');
      const chars = el.querySelectorAll('.ft-char');
      // "Code" = 4 characters
      expect(chars.length).toBe(4);
    });
  });

  // ── RED: DOM wrapping for per-word effects ─────────────────────────

  describe('DOM wrapping: per-word', () => {
    beforeEach(() => {
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);
    });

    it('should wrap each word in a span.ft-word for per-word-crossfade', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostPerWordComponent],
      }).createComponent(TestHostPerWordComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('div');
      const words = el.querySelectorAll('.ft-word');
      // "Hello World" = 2 words
      expect(words.length).toBe(2);
    });

    it('should wrap each word in a span.ft-word for short-slide-right', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostShortSlideComponent],
      }).createComponent(TestHostShortSlideComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('div');
      const words = el.querySelectorAll('.ft-word');
      // "Slide Right" = 2 words
      expect(words.length).toBe(2);
    });
  });

  // ── RED: Stagger calculation ───────────────────────────────────────

  describe('stagger calculation', () => {
    let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null;

    beforeEach(() => {
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);

      function FakeObserver(this: IntersectionObserver, cb: IntersectionObserverCallback) {
        observerCallback = (entries) => cb(entries, this);
        this.observe = jasmine.createSpy('observe');
        this.unobserve = jasmine.createSpy('unobserve');
        this.disconnect = jasmine.createSpy('disconnect');
      }
      (window as any).IntersectionObserver = FakeObserver;
    });

    it('should apply stagger delay per unit rank', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostSoftBlurComponent],
      }).createComponent(TestHostSoftBlurComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('div');
      spyOn(el, 'animate').and.callThrough();

      // Also spy on the child spans
      const chars = el.querySelectorAll('.ft-char');
      const charAnimSpies = Array.from(chars).map((c) =>
        spyOn(c as HTMLElement, 'animate').and.callThrough()
      );

      const entry = { isIntersecting: true, target: el, boundingClientRect: {} as DOMRectReadOnly, intersectionRatio: 1, intersectionRect: {} as DOMRectReadOnly, rootBounds: null, time: 0 } as unknown as IntersectionObserverEntry;
      observerCallback!([entry]);

      // Each char should have animate called
      charAnimSpies.forEach((spy) => {
        expect(spy).toHaveBeenCalled();
      });

      // Verify stagger: rank 0 → delay 0, rank 1 → delay 18, etc.
      const firstOpts = charAnimSpies[0].calls.first().args[1] as KeyframeAnimationOptions;
      const secondOpts = charAnimSpies[1].calls.first().args[1] as KeyframeAnimationOptions;

      expect(firstOpts.delay).toBe(0);
      expect(secondOpts.delay).toBe(18); // 0 + 1 * 18
    });

    it('should add custom delay input to stagger', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostCustomDelayComponent],
      }).createComponent(TestHostCustomDelayComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('div');
      const animateSpy = spyOn(el, 'animate').and.callThrough();

      const entry = { isIntersecting: true, target: el, boundingClientRect: {} as DOMRectReadOnly, intersectionRatio: 1, intersectionRect: {} as DOMRectReadOnly, rootBounds: null, time: 0 } as unknown as IntersectionObserverEntry;
      observerCallback!([entry]);

      const callOpts = animateSpy.calls.first().args[1] as KeyframeAnimationOptions;
      expect(callOpts.delay).toBe(200);
    });
  });

  // ── RED: Custom threshold ──────────────────────────────────────────

  describe('custom threshold', () => {
    let observerOptions: { threshold: number } | null;

    beforeEach(() => {
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);

      function FakeObserver(this: IntersectionObserver, _cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
        observerOptions = opts as { threshold: number };
        this.observe = jasmine.createSpy('observe');
        this.unobserve = jasmine.createSpy('unobserve');
        this.disconnect = jasmine.createSpy('disconnect');
      }
      (window as any).IntersectionObserver = FakeObserver;
    });

    it('should use custom threshold value', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostCustomThresholdComponent],
      }).createComponent(TestHostCustomThresholdComponent);
      fixture.detectChanges();

      expect(observerOptions).not.toBeNull();
      expect(observerOptions!.threshold).toBe(0.5);
    });
  });

  // ── RED: Cleanup on destroy ────────────────────────────────────────

  describe('ngOnDestroy cleanup', () => {
    let disconnectSpy: jasmine.Spy;
    let observerCallback: ((entries: IntersectionObserverEntry[]) => void) | null;

    beforeEach(() => {
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);

      disconnectSpy = jasmine.createSpy('disconnect');
      function FakeObserver(this: IntersectionObserver, cb: IntersectionObserverCallback) {
        observerCallback = (entries) => cb(entries, this);
        this.observe = jasmine.createSpy('observe');
        this.unobserve = jasmine.createSpy('unobserve');
        this.disconnect = disconnectSpy;
      }
      (window as any).IntersectionObserver = FakeObserver;
    });

    it('should disconnect IntersectionObserver on destroy', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostFadeUpComponent],
      }).createComponent(TestHostFadeUpComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
      directive.ngOnDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should cancel in-flight WAAPI animations on destroy', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostSoftBlurComponent],
      }).createComponent(TestHostSoftBlurComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('div');

      // Trigger animation
      const entry = { isIntersecting: true, target: el, boundingClientRect: {} as DOMRectReadOnly, intersectionRatio: 1, intersectionRect: {} as DOMRectReadOnly, rootBounds: null, time: 0 } as unknown as IntersectionObserverEntry;
      observerCallback!([entry]);

      const chars = el.querySelectorAll('.ft-char');
      const cancelSpies = Array.from(chars).map((c) => {
        const anim = { cancel: jasmine.createSpy('cancel') } as unknown as Animation;
        spyOn(c as HTMLElement, 'getAnimations').and.returnValue([anim]);
        return anim.cancel;
      });

      const directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
      directive.ngOnDestroy();

      cancelSpies.forEach((spy) => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  // ── RED: All 8 effects instantiate ─────────────────────────────────

  describe('all 8 effects instantiate', () => {
    const effectHosts: { effect: string; hostType: any }[] = [
      { effect: 'soft-blur-in', hostType: TestHostSoftBlurComponent },
      { effect: 'per-word-crossfade', hostType: TestHostPerWordComponent },
      { effect: 'micro-scale-fade', hostType: TestHostMicroScaleComponent },
      { effect: 'fade-up', hostType: TestHostFadeUpComponent },
      { effect: 'typewriter', hostType: TestHostTypewriterComponent },
      { effect: 'shimmer-sweep', hostType: TestHostShimmerComponent },
      { effect: 'short-slide-right', hostType: TestHostShortSlideComponent },
      { effect: 'scale-down-fade', hostType: TestHostScaleDownComponent },
    ];

    beforeEach(() => {
      window.matchMedia = jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as MediaQueryList);
    });

    effectHosts.forEach(({ effect, hostType }) => {
      it(`should create directive with ${effect} effect`, () => {
        const fixture = TestBed.configureTestingModule({
          imports: [hostType],
        }).createComponent(hostType);
        fixture.detectChanges();

        const directive = fixture.debugElement.children[0].injector.get(FtSubtleRevealDirective);
        expect(directive).toBeTruthy();
        expect(directive.effect).toBe(effect);
      });
    });
  });
});
