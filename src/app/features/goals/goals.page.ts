import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Goals & Savings page — stub for PR 4.
 * Full implementation in Phase 6 (PR 5).
 */
@Component({
  selector: 'ft-goals-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="goals-page">
      <h1>Metas de Ahorro</h1>
      <p>Próximamente — gestioná tus metas financieras.</p>
    </div>
  `,
  styles: [`
    .goals-page {
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
export class GoalsPage {}
