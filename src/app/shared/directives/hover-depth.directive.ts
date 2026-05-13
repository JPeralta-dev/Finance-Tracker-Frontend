import { Directive, ElementRef, HostListener, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[ftHoverDepth]',
  standalone: true,
})
export class HoverDepthDirective implements OnInit {
  @Input() ftHoverDepth = 8;
  @Input() ftHoverDepthScale = 1.02;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1)');
    this.renderer.setStyle(this.el.nativeElement, 'will-change', 'transform, box-shadow');
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transform', `translateY(-${this.ftHoverDepth}px) scale(${this.ftHoverDepthScale})`);
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'var(--shadow-xl)');
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0) scale(1)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'var(--shadow-sm)');
  }
}
