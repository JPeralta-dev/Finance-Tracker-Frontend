import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrap" [style.border-radius]="radius">
      <div class="shimmer" [style.width]="width" [style.height]="height"></div>
    </div>
  `,
  styles: [`
    .skeleton-wrap {
      overflow: hidden;
      background: #e8e8e4;
    }
    .shimmer {
      display: block;
      background: linear-gradient(
        90deg,
        #e8e8e4 25%,
        #f0f0ec 50%,
        #e8e8e4 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() radius = '6px';
}
