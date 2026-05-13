import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ICONS } from '../icons/icon-registry';

@Component({
  selector: 'ft-empty-state',
  standalone: true,
  imports: [RouterLink, NgIcon],
  providers: [provideIcons(ICONS)],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <ng-icon [name]="iconName()" size="32px" />
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      <p class="empty-state__description">{{ description }}</p>
      @if (actionRoute) {
        <a [routerLink]="actionRoute" class="empty-state__action">
          {{ actionLabel }}
        </a>
      }
      @if (showActionBtn && !actionRoute) {
        <button class="empty-state__action" (click)="action.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: 60px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .empty-state__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      color: var(--text-tertiary);
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .empty-state__title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .empty-state__description {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
      max-width: 320px;
      line-height: 1.6;
    }

    .empty-state__action {
      margin-top: 8px;
      padding: 10px 24px;
      background: linear-gradient(135deg, var(--accent-start), var(--accent-mid));
      color: var(--text-inverse);
      border: none;
      border-radius: var(--radius-sm);
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .empty-state__action:hover {
      box-shadow: 0 4px 16px rgba(6, 214, 160, 0.3);
      transform: translateY(-1px);
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'wallet';
  @Input() title = 'Nothing here yet';
  @Input() description = 'No items to display.';
  @Input() actionRoute: string | null = null;
  @Input() actionLabel = 'Get started';
  @Input() showActionBtn = false;
  @Output() action = new EventEmitter<void>();

  iconName(): string {
    return this.icon;
  }
}
