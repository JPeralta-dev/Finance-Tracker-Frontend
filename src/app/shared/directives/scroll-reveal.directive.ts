import { Directive, ElementRef, OnInit, OnDestroy, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ftScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() ftScrollReveal = 0;
  @Input() ftScrollRevealThreshold = 0.1;
  @Input() ftScrollRevealDistance = 24;

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transform', `translateY(${this.ftScrollRevealDistance}px)`);
    this.renderer.setStyle(this.el.nativeElement, 'transition', `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${this.ftScrollReveal}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${this.ftScrollReveal}ms`);

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
            this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: this.ftScrollRevealThreshold }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
