import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="empty-state">
      <div class="empty-icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (actionLink) {
        <a [routerLink]="actionLink" class="action-btn">{{ actionLabel }}</a>
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
      gap: 10px;
    }
    .empty-icon {
      font-size: 48px;
      margin-bottom: 8px;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    h3 {
      font-family: 'Clash Display', sans-serif;
      font-size: 20px;
      font-weight: 600;
      color: #111;
      margin: 0;
    }
    p {
      color: #888;
      font-size: 14px;
      margin: 0;
      max-width: 280px;
    }
    .action-btn {
      margin-top: 12px;
      padding: 10px 22px;
      background: #FF5C4D;
      color: white;
      border-radius: 9px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.15s ease;
    }
    .action-btn:hover { background: #e54535; transform: translateY(-1px); }
  `]
})
export class EmptyStateComponent {
  @Input() icon = '🔍';
  @Input() title = 'Nothing here yet';
  @Input() message = 'No items to display.';
  @Input() actionLink: string | null = null;
  @Input() actionLabel = 'Add one';
}
