import {
  trigger, transition, style, animate, query,
  stagger, state, keyframes
} from '@angular/animations';

export const fadeSlideIn = trigger('fadeSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(18px)' }),
    animate('380ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('220ms ease-in',
      style({ opacity: 0, transform: 'translateY(-10px)' }))
  ])
]);

export const pageTransition = trigger('pageTransition', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(24px)' }),
    animate('420ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const staggerList = trigger('staggerList', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(-12px)' }),
      stagger('60ms', [
        animate('320ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const cardEntrance = trigger('cardEntrance', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.96) translateY(10px)' }),
    animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
  ])
]);

export const rowEntrance = trigger('rowEntrance', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate('280ms ease-out',
      style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in',
      style({ opacity: 0, transform: 'translateX(20px)' }))
  ])
]);

export const drawerSlide = trigger('drawerSlide', [
  state('closed', style({ transform: 'translateX(-100%)' })),
  state('open', style({ transform: 'translateX(0)' })),
  transition('closed => open', animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
  transition('open => closed', animate('250ms ease-in'))
]);

export const counterPop = trigger('counterPop', [
  transition(':enter', [
    animate('500ms ease-out', keyframes([
      style({ opacity: 0, transform: 'scale(0.8)', offset: 0 }),
      style({ opacity: 1, transform: 'scale(1.04)', offset: 0.7 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);
