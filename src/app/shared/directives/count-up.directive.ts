import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[ftCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input() ftCountUp = 0;
  @Input() ftCountUpDuration = 2500;
  @Input() ftCountUpPrefix = '';
  @Input() ftCountUpSuffix = '';
  @Input() ftCountUpDecimals = 2;

  private observer: IntersectionObserver | null = null;
  private animationFrame: number | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this.startCount();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
  }

  private startCount(): void {
    const start = 0;
    const end = this.ftCountUp;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.ftCountUpDuration, 1);
      const ease = 1 - Math.pow(1 - progress, 2);
      const current = start + (end - start) * ease;

      this.el.nativeElement.textContent = `${this.ftCountUpPrefix}${current.toFixed(this.ftCountUpDecimals)}${this.ftCountUpSuffix}`;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }
}
