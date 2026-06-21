import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Subscription page — stub for PR 4.
 * Full implementation in Phase 6 (PR 5).
 */
@Component({
  selector: 'ft-subscription-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="subscription-page">
      <h1>Suscripción</h1>
      <p>Próximamente — gestioná tu plan premium.</p>
    </div>
  `,
  styles: [`
    .subscription-page {
      padding: 32px 24px;
      max-width: 800px;
    }
    h1 {
      font-family: var(--font-display);
      font-size: 24px;
      color: var(--text-primary);
      margin: 0 0 12px;
    }
    p {
      color: var(--text-secondary);
      font-size: 14px;
    }
  `],
})
export class SubscriptionPage {}
