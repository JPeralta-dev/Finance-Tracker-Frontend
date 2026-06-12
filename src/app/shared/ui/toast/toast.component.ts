import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { ToastService } from '../../../core/services/toast.service';
import { ICONS } from '../../../shared/icons/icon-registry';

@Component({
  selector: 'ft-toast-container',
  standalone: true,
  imports: [CommonModule, NgIcon],
  template: `
    <div class="toast-container">
      @for (toast of toasts(); track toast.id) {
        <div class="toast toast--{{ toast.type }}">
          <div class="toast__icon">
            @switch (toast.type) {
              @case ('success') { <ng-icon name="check" size="1rem" /> }
              @case ('error') { <ng-icon name="close" size="1rem" /> }
              @case ('warning') { <ng-icon name="warning" size="1rem" /> }
              @default { <ng-icon name="info" size="1rem" /> }
            }
          </div>
          <div class="toast__content">
            <p class="toast__title">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="toast__message">{{ toast.message }}</p>
            }
          </div>
          <button class="toast__close" (click)="remove(toast.id)">
            <ng-icon name="close" size="0.8rem" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      min-width: 300px;
      max-width: 400px;
      pointer-events: auto;
      animation: slideIn 0.3s var(--ease-out);
    }

    .toast--success { border-left: 3px solid var(--success); }
    .toast--error { border-left: 3px solid var(--danger); }
    .toast--warning { border-left: 3px solid var(--warning); }
    .toast--info { border-left: 3px solid var(--info); }

    .toast__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .toast__content {
      flex: 1;
      min-width: 0;
    }

    .toast__title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .toast__message {
      font-size: 12px;
      color: var(--text-secondary);
      margin: 2px 0 0;
    }

    .toast__close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: transparent;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s ease;
    }

    .toast__close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  remove(id: string): void {
    this.toastService.remove(id);
  }
}
