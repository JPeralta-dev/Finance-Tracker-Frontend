import { trigger, transition, style, animate, group, query } from '@angular/animations';

export const pageTransition = trigger('pageTransition', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(24px)' }),
    animate('420ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const modalAnimation = trigger('modalAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    group([
      animate('200ms ease-out', style({ opacity: 1 })),
      query('.modal-content', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' }),
        animate('250ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ], { optional: true })
    ])
  ]),
  transition(':leave', [
    group([
      query('.modal-content', [
        animate('150ms cubic-bezier(0.55, 0, 1, 0.45)',
          style({ opacity: 0, transform: 'scale(0.95) translateY(5px)' }))
      ], { optional: true }),
      animate('200ms ease-in', style({ opacity: 0 }))
    ])
  ])
]);
