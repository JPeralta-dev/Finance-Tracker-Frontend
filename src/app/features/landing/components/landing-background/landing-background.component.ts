import { Component, HostListener } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-landing-background',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons(ICONS)],
  templateUrl: './landing-background.component.html',
  styleUrl: './landing-background.component.scss',
})
export class LandingBackgroundComponent {
  mouseX = 0;
  mouseY = 0;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX / window.innerWidth;
    this.mouseY = event.clientY / window.innerHeight;
  }

  getParallaxTransform(depth: number, index: number): string {
    const shift = depth * 20;
    const x = (this.mouseX - 0.5) * shift;
    const y = (this.mouseY - 0.5) * shift;
    const rotation = (index % 2 === 0 ? -1 : 1) * 8 + (this.mouseX - 0.5) * 15;
    return `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
  }

  getCircleTransform(depth: number, index: number): string {
    const shift = depth * 10;
    const x = (this.mouseX - 0.5) * shift;
    const y = (this.mouseY - 0.5) * shift;
    return `translate(${x}px, ${y}px)`;
  }
}
