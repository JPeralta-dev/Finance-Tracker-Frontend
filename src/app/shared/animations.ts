import { trigger, transition, style, animate } from '@angular/animations';

export const pageTransition = trigger('pageTransition', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(24px)' }),
    animate('420ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);
