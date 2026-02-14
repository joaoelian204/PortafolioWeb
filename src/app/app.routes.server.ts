import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Configuración de rutas del servidor para Pre-rendering (SSG).
 *
 * RenderMode.Prerender: Genera HTML estático en build time (SSG)
 * RenderMode.Client: Solo se renderiza en el cliente (SPA)
 */
export const serverRoutes: ServerRoute[] = [
  // Páginas privadas: Solo cliente (no pre-renderizar)
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'settings',
    renderMode: RenderMode.Client,
  },

  // Todas las demás rutas: Pre-renderizadas (SSG)
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
