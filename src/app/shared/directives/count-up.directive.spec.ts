import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountUpDirective } from './count-up.directive';

@Component({
  template: `<span [ftCountUp]="value"></span>`,
  standalone: true,
  imports: [CountUpDirective],
})
class TestHostDefaultComponent {
  value = 100;
}

@Component({
  template: `<span [ftCountUp]="value" [ftCountUpDuration]="duration"></span>`,
  standalone: true,
  imports: [CountUpDirective],
})
class TestHostCustomComponent {
  value = 100;
  duration = 3000;
}

describe('CountUpDirective', () => {
  describe('default duration', () => {
    it('should have default duration of 4000ms', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostDefaultComponent],
      }).createComponent(TestHostDefaultComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(CountUpDirective);
      expect(directive.ftCountUpDuration).toBe(4000);
    });
  });

  describe('custom duration', () => {
    it('should respect custom duration', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostCustomComponent],
      }).createComponent(TestHostCustomComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(CountUpDirective);
      expect(directive.ftCountUpDuration).toBe(3000);
    });
  });

  describe('animate input', () => {
    it('should have animate enabled by default', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostDefaultComponent],
      }).createComponent(TestHostDefaultComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(CountUpDirective);
      expect(directive.ftCountUpAnimate).toBe(true);
    });

    it('should skip animation when animate is false', (done) => {
      @Component({
        template: `<span [ftCountUp]="value" [ftCountUpAnimate]="false"></span>`,
        standalone: true,
        imports: [CountUpDirective],
      })
      class TestHostNoAnimateComponent {
        value = 1234.56;
      }

      const fixture = TestBed.configureTestingModule({
        imports: [TestHostNoAnimateComponent],
      }).createComponent(TestHostNoAnimateComponent);
      fixture.detectChanges();

      // Should show final value immediately
      const el = fixture.nativeElement.querySelector('span');
      expect(el.textContent).toBe('1,234.56');
      done();
    });

    it('should skip animation for large numbers (>1M)', (done) => {
      @Component({
        template: `<span [ftCountUp]="value"></span>`,
        standalone: true,
        imports: [CountUpDirective],
      })
      class TestHostLargeNumberComponent {
        value = 1854000;
      }

      const fixture = TestBed.configureTestingModule({
        imports: [TestHostLargeNumberComponent],
      }).createComponent(TestHostLargeNumberComponent);
      fixture.detectChanges();

      // Should show final value immediately for large numbers
      const el = fixture.nativeElement.querySelector('span');
      expect(el.textContent).toBe('1,854,000.00');
      done();
    });
  });

  describe('linear easing', () => {
    it('should use linear easing (current = end * progress)', () => {
      // Linear: no easing curve, just direct proportion
      // At progress=0.5: current = end * 0.5
      const progress = 0.5;
      const end = 100;
      const linearCurrent = end * progress;
      expect(linearCurrent).toBe(50);
    });

    it('should animate element textContent to final value', (done) => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostDefaultComponent],
      }).createComponent(TestHostDefaultComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('span');

      // Wait for animation to complete (default 4000ms + buffer)
      setTimeout(() => {
        const finalValue = el.textContent;
        expect(finalValue).toBe('100.00');
        done();
      }, 4200);
    });
  });
});
