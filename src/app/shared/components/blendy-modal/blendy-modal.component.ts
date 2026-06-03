import {
  Component,
  input,
  output,
  effect,
  HostListener,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { BlendyService } from '../../services/blendy.service';

@Component({
  selector: 'ft-blendy-modal',
  standalone: true,
  imports: [],
  template: `
    @if (open()) {
      <div class="blendy-target" [attr.data-blendy-to]="blendyId()">
        <div class="blendy-backdrop" (click)="close()"></div>
        <div class="blendy-container" role="dialog" aria-modal="true">
          <ng-content></ng-content>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .blendy-target {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .blendy-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }

    .blendy-container {
      position: relative;
      z-index: 50;
      max-width: 560px;
      width: 90%;
      max-height: 85vh;
      overflow-y: auto;
      background: var(--glass-bg, rgba(29, 20, 38, 0.72));
      backdrop-filter: blur(var(--glass-blur, 16px));
      -webkit-backdrop-filter: blur(var(--glass-blur, 16px));
      border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-lg, 16px);
      box-shadow: var(--shadow-xl, 0 16px 48px rgba(0, 0, 0, 0.7));
      color: var(--text-primary, #f3e8ff);
    }

    .reduced-motion .blendy-target {
      transition: none;
    }

    .blendy-container::-webkit-scrollbar {
      width: 4px;
    }

    .blendy-container::-webkit-scrollbar-track {
      background: transparent;
    }

    .blendy-container::-webkit-scrollbar-thumb {
      background: rgba(217, 70, 239, 0.3);
      border-radius: 99px;
    }

    .blendy-container::-webkit-scrollbar-thumb:hover {
      background: rgba(217, 70, 239, 0.5);
    }
  `],
})
export class FtBlendyModalComponent {
  private readonly blendyService = inject(BlendyService);
  private readonly cd = inject(ChangeDetectorRef);

  readonly open = input.required<boolean>();
  readonly blendyId = input.required<string>();
  readonly animation = input<'dynamic' | 'spring'>('dynamic');

  readonly closed = output<void>();

  private openEffect = effect(() => {
    if (this.open()) {
      this.cd.detectChanges();
      setTimeout(() => {
        this.blendyService.toggle(this.blendyId());
      }, 0);
    }
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }

  close(): void {
    this.blendyService.untoggle(this.blendyId(), () => {
      this.closed.emit();
    });
  }
}
