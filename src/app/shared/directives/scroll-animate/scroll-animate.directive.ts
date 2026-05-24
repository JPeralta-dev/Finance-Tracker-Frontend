import { Directive, ElementRef, Renderer2, OnInit, OnDestroy, Input } from '@angular/core';

/**
 * ScrollAnimateDirective
 * 
 * Applies scroll-driven animations using CSS `scroll-timeline` where supported,
 * with IntersectionObserver fallback for broader compatibility.
 * 
 * Usage:
 *   <div ftScrollAnimate="fade-up">Content</div>
 *   <div ftScrollAnimate="fade-up" [delay]="100">Content</div>
 * 
 * Animation types: 'fade-up', 'fade-in', 'slide-left', 'slide-right', 'scale-in'
 */
@Directive({
  selector: '[ftScrollAnimate]',
  standalone: true,
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input('ftScrollAnimate') animation: string = 'fade-up';
  @Input() delay: number = 0;
  @Input() threshold: number = 0.1;

  private observer?: IntersectionObserver;
  private animationClass: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Set initial state
    this.renderer.addClass(this.el.nativeElement, 'scroll-animate');
    this.renderer.addClass(this.el.nativeElement, `scroll-animate--${this.animation}`);
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');

    // Check for CSS scroll-timeline support
    if (CSS.supports('animation-timeline', 'view()')) {
      // Use native CSS scroll-timeline
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '');
      this.renderer.addClass(this.el.nativeElement, 'scroll-animate--css-timeline');
      if (this.delay) {
        this.renderer.setStyle(this.el.nativeElement, '--animate-delay', `${this.delay}ms`);
      }
    } else {
      // Fallback: IntersectionObserver
      this.setupIntersectionObserver();
    }
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              this.renderer.addClass(this.el.nativeElement, 'scroll-animate--visible');
              this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
            }, this.delay);
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: this.threshold }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
