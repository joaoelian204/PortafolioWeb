import { animate, query, sequence, style, transition, trigger } from '@angular/animations';

/**
 * Transición "cover": la nueva página entra desde abajo
 * COMPLETAMENTE OPACA, cubriendo la anterior sin que se
 * vea nada del contenido viejo detrás.
 */
export const routeTransitionAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // Apilar ambos componentes
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ],
      { optional: true },
    ),

    sequence([
      // La vieja se queda quieta debajo
      query(':leave', [style({ zIndex: 1 })], { optional: true }),

      // La nueva entra ENCIMA, 100% opaca con fondo sólido
      query(
        ':enter',
        [
          style({
            zIndex: 2,
            transform: 'translateY(2%)',
            opacity: 1,
            'background-color': 'var(--vscode-editor-background, #1e1e1e)',
          }),
          animate(
            '180ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              transform: 'translateY(0)',
            }),
          ),
        ],
        { optional: true },
      ),
    ]),
  ]),
]);
