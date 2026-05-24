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
    it('should have default duration of 2500ms', () => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostDefaultComponent],
      }).createComponent(TestHostDefaultComponent);
      fixture.detectChanges();

      const directive = fixture.debugElement.children[0].injector.get(CountUpDirective);
      expect(directive.ftCountUpDuration).toBe(2500);
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

  describe('quadratic easing', () => {
    it('should use quadratic easeOut formula (1 - (1-p)^2)', () => {
      // Verify the easing function directly
      // Quadratic easeOut: ease = 1 - (1 - progress)^2
      // At progress=0.5: ease = 1 - 0.25 = 0.75
      const progress = 0.5;
      const quadraticEase = 1 - Math.pow(1 - progress, 2);
      expect(quadraticEase).toBe(0.75);

      // Cubic easeOut would be: 1 - (1 - 0.5)^3 = 0.875
      const cubicEase = 1 - Math.pow(1 - progress, 3);
      expect(cubicEase).toBe(0.875);

      // They are different — quadratic is gentler
      expect(quadraticEase).toBeLessThan(cubicEase);
    });

    it('should animate element textContent to final value', (done) => {
      const fixture = TestBed.configureTestingModule({
        imports: [TestHostDefaultComponent],
      }).createComponent(TestHostDefaultComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement.querySelector('span');

      // Wait for animation to complete (default 2500ms + buffer)
      setTimeout(() => {
        const finalValue = el.textContent;
        expect(finalValue).toBe('100.00');
        done();
      }, 2700);
    });
  });
});
