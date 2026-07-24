import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ICONS } from '../icons/icon-registry';

export type EmptyStateVariant = 'default' | 'premium-upsell' | 'first-use';

@Component({
  selector: 'ft-empty-state',
  standalone: true,
  imports: [RouterLink, NgIcon],
  template: `
    <div class="empty-state" [class]="'empty-state empty-state--' + variant">
      <div class="empty-state__icon" [class]="'empty-state__icon--' + variant">
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
        <button class="empty-state__action" (click)="onAction('primary')">
          {{ actionLabel }}
        </button>
      }
      @if (secondaryText && (secondaryRoute || showSecondaryBtn)) {
        @if (secondaryRoute) {
          <a
            [routerLink]="secondaryRoute"
            class="empty-state__secondary"
            (click)="onAction('secondary')"
          >
            {{ secondaryText }}
          </a>
        } @else {
          <button class="empty-state__secondary" (click)="onAction('secondary')">
            {{ secondaryText }}
          </button>
        }
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

    /* Default variant — original styling */
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

    /* Premium-upsell variant — gold-ish accent and subtle premium hint */
    .empty-state--premium-upsell {
      position: relative;
    }
    .empty-state--premium-upsell::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.06), rgba(139, 92, 246, 0.02));
      border-radius: var(--radius-lg, 12px);
      pointer-events: none;
      z-index: -1;
    }
    .empty-state__icon--premium-upsell {
      background: linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(139, 92, 246, 0.1));
      border-color: rgba(167, 139, 250, 0.3);
      color: var(--accent-mid, #a855f7);
    }
    .empty-state--premium-upsell .empty-state__title {
      color: var(--text-primary);
    }
    .empty-state--premium-upsell .empty-state__action {
      background: linear-gradient(135deg, var(--accent-start), var(--accent-end));
      color: #fff;
    }

    /* First-use variant — friendly, helpful tone */
    .empty-state__icon--first-use {
      background: linear-gradient(135deg, rgba(45, 212, 191, 0.12), rgba(45, 212, 191, 0.06));
      border-color: rgba(45, 212, 191, 0.3);
      color: var(--success, #2dd4bf);
    }
    .empty-state--first-use .empty-state__action {
      background: linear-gradient(135deg, var(--success, #2dd4bf), #14b8a6);
      color: #042f2a;
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
      font-family: inherit;
    }

    .empty-state__action:hover {
      box-shadow: 0 4px 16px rgba(6, 214, 160, 0.3);
      transform: translateY(-1px);
    }

    .empty-state__secondary {
      margin-top: 4px;
      padding: 6px 12px;
      background: transparent;
      color: var(--text-secondary);
      border: none;
      text-decoration: underline;
      font-size: 13px;
      cursor: pointer;
      font-family: inherit;
    }
    .empty-state__secondary:hover {
      color: var(--text-primary);
    }

    @media (prefers-reduced-motion: reduce) {
      .empty-state__icon { animation: none; }
    }
  `]
})
export class EmptyStateComponent {
  // ── Original API (unchanged — backward compatible) ────────────
  @Input() icon = 'wallet';
  @Input() title = 'Nothing here yet';
  @Input() description = 'No items to display.';
  @Input() actionRoute: string | null = null;
  @Input() actionLabel = 'Get started';
  @Input() showActionBtn = false;
  @Output() action = new EventEmitter<void>();

  // ── New variant API (added in productization) ──────────────────
  @Input() variant: EmptyStateVariant = 'default';
  @Input() secondaryText: string | null = null;
  @Input() secondaryRoute: string | null = null;
  @Input() showSecondaryBtn = false;
  @Output() secondaryAction = new EventEmitter<void>();
  @Output() actionKind = new EventEmitter<'primary' | 'secondary'>();

  iconName(): string {
    return this.icon;
  }

  onAction(kind: 'primary' | 'secondary'): void {
    this.actionKind.emit(kind);
    if (kind === 'primary') this.action.emit();
    else this.secondaryAction.emit();
  }
}
