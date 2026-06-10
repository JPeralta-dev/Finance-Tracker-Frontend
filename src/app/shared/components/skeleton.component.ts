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
      background: var(--bg-elevated);
    }
    .shimmer {
      display: block;
      background: var(--bg-elevated);
      animation: shimmer 1.5s ease-in-out infinite alternate;
    }
    @keyframes shimmer {
      from { opacity: 0.3; }
      to { opacity: 0.6; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() radius = '6px';
}
