import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScrollAnimateDirective } from '../../../../shared/directives/scroll-animate/scroll-animate.directive';

@Component({
  selector: 'ft-final-cta',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollAnimateDirective],
  templateUrl: './final-cta.component.html',
  styleUrl: './final-cta.component.scss',
})
export class FinalCtaComponent {}
