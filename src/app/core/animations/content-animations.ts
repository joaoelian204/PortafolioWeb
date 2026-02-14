import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * Fade-in + slide-up para un bloque de contenido completo.
 * Usar en el contenedor principal de la página.
 */
export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate(`350ms 80ms ${EASE}`, style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

/**
 * Stagger: cada hijo directo aparece uno tras otro.
 * Ideal para listas, grids de cards, items de menú.
 * Usar en el contenedor padre; los hijos deben tener la clase .stagger-item
 */
export const staggerList = trigger('staggerList', [
  transition(':enter', [
    query(
      '.stagger-item',
      [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        stagger('50ms', [
          animate(`300ms ${EASE}`, style({ opacity: 1, transform: 'translateY(0)' })),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

/**
 * Slide-in desde la izquierda para el bloque de código/editor.
 * Simula "abrir" un archivo en VS Code.
 */
export const slideInCode = trigger('slideInCode', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-12px)' }),
    animate(`300ms 60ms ${EASE}`, style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
]);

/**
 * Scale-in suave para cards y elementos destacados.
 */
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate(`300ms 100ms ${EASE}`, style({ opacity: 1, transform: 'scale(1)' })),
  ]),
]);

/**
 * Fade simple para elementos secundarios.
 */
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate(`250ms 120ms ${EASE}`, style({ opacity: 1 })),
  ]),
]);
