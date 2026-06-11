import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'ft-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="confirm-overlay" @dialogAnimation (click)="cancel.emit()">
        <div class="confirm-dialog" (click)="$event.stopPropagation()">
          <div class="confirm-dialog__icon">⚠️</div>
          <h3 class="confirm-dialog__title">{{ title() }}</h3>
          <p class="confirm-dialog__message">{{ message() }}</p>
          <div class="confirm-dialog__actions">
            <button class="confirm-dialog__btn confirm-dialog__btn--cancel" (click)="cancel.emit()">
              {{ cancelLabel() }}
            </button>
            <button class="confirm-dialog__btn confirm-dialog__btn--danger" (click)="confirm.emit()">
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      padding: 24px;
    }

    .confirm-dialog {
      background: var(--bg-secondary);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      padding: 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-xl);
    }

    .confirm-dialog__icon {
      font-size: 2rem;
      margin-bottom: 16px;
    }

    .confirm-dialog__title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px;
    }

    .confirm-dialog__message {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin: 0 0 24px;
    }

    .confirm-dialog__actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .confirm-dialog__btn {
      padding: 10px 20px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all var(--duration-fast) var(--ease-out);
    }

    .confirm-dialog__btn--cancel {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      border: 1px solid var(--glass-border);

      &:hover {
        background: var(--bg-elevated);
        color: var(--text-primary);
      }
    }

    .confirm-dialog__btn--danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;

      &:hover {
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.35);
        transform: translateY(-1px);
      }
    }
  `],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class ConfirmDialogComponent {
  visible = input<boolean>(false);
  title = input<string>('Are you sure?');
  message = input<string>('');
  confirmLabel = input<string>('Delete');
  cancelLabel = input<string>('Cancel');

  confirm = output<void>();
  cancel = output<void>();
}
