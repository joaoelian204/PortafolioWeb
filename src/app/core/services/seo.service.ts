import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

/** Configuración SEO por defecto para cada ruta del portafolio */
export const SEO_CONFIG: Record<string, { es: SeoData; en: SeoData }> = {
  '': {
    es: {
      title: 'Joao Moreira - Portafolio de Desarrollador',
      description:
        'Portafolio de Joao Moreira - Desarrollador Full Stack. Angular, TypeScript, Node.js y más. Diseñado con estética de VS Code.',
      keywords: 'desarrollador, portafolio, full stack, angular, typescript, web',
    },
    en: {
      title: 'Joao Moreira - Developer Portfolio',
      description:
        'Joao Moreira - Full Stack Developer Portfolio. Angular, TypeScript, Node.js & more. Built with VS Code aesthetics.',
      keywords: 'developer, portfolio, full stack, angular, typescript, web development',
    },
  },
  about: {
    es: {
      title: 'Sobre Mí | Joao Moreira',
      description:
        'Conoce más sobre Joao Moreira, desarrollador Full Stack apasionado por crear experiencias web modernas.',
      keywords: 'sobre mí, desarrollador, bio, joao moreira',
    },
    en: {
      title: 'About Me | Joao Moreira',
      description:
        'Learn more about Joao Moreira, a Full Stack Developer passionate about building modern web experiences.',
      keywords: 'about me, developer, bio, joao moreira',
    },
  },
  skills: {
    es: {
      title: 'Habilidades | Joao Moreira',
      description:
        'Tecnologías y herramientas que domino: Angular, TypeScript, Node.js, Supabase y más.',
      keywords: 'habilidades, tecnologías, angular, typescript, nodejs, skills',
    },
    en: {
      title: 'Skills | Joao Moreira',
      description:
        'Technologies and tools I master: Angular, TypeScript, Node.js, Supabase and more.',
      keywords: 'skills, technologies, angular, typescript, nodejs',
    },
  },
  projects: {
    es: {
      title: 'Proyectos | Joao Moreira',
      description:
        'Explora mis proyectos destacados de desarrollo web con Angular, TypeScript y tecnologías modernas.',
      keywords: 'proyectos, portfolio, desarrollo web, angular, aplicaciones',
    },
    en: {
      title: 'Projects | Joao Moreira',
      description:
        'Explore my featured web development projects built with Angular, TypeScript and modern technologies.',
      keywords: 'projects, portfolio, web development, angular, applications',
    },
  },
  experience: {
    es: {
      title: 'Experiencia | Joao Moreira',
      description:
        'Mi trayectoria profesional como desarrollador Full Stack, incluyendo empresas, roles y tecnologías utilizadas.',
      keywords: 'experiencia laboral, trabajo, desarrollador, trayectoria profesional',
    },
    en: {
      title: 'Experience | Joao Moreira',
      description:
        'My professional journey as a Full Stack Developer, including companies, roles and technologies used.',
      keywords: 'work experience, career, developer, professional journey',
    },
  },
  contact: {
    es: {
      title: 'Contacto | Joao Moreira',
      description:
        '¿Tienes un proyecto en mente? Contáctame para colaborar en tu próximo proyecto web.',
      keywords: 'contacto, email, formulario, contratar desarrollador',
    },
    en: {
      title: 'Contact | Joao Moreira',
      description: 'Have a project in mind? Get in touch to collaborate on your next web project.',
      keywords: 'contact, email, form, hire developer',
    },
  },
  settings: {
    es: {
      title: 'Configuración | Joao Moreira',
      description: 'Configura el tema e idioma del portafolio.',
      keywords: 'configuración, tema, idioma, settings',
      noIndex: true,
    },
    en: {
      title: 'Settings | Joao Moreira',
      description: 'Configure the portfolio theme and language.',
      keywords: 'settings, theme, language',
      noIndex: true,
    },
  },
  login: {
    es: {
      title: 'Login | Joao Moreira',
      description: 'Acceso al panel de administración.',
      noIndex: true,
    },
    en: {
      title: 'Login | Joao Moreira',
      description: 'Access to the admin panel.',
      noIndex: true,
    },
  },
  admin: {
    es: {
      title: 'Admin | Joao Moreira',
      description: 'Panel de administración del portafolio.',
      noIndex: true,
    },
    en: {
      title: 'Admin | Joao Moreira',
      description: 'Portfolio admin panel.',
      noIndex: true,
    },
  },
};

const BASE_URL = 'https://joaomoreira.dev';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  /**
   * Actualiza las meta tags de la página actual.
   * Se llama desde el router event o manualmente desde cada componente.
   */
  updateSeo(routePath: string, language: 'es' | 'en'): void {
    // Limpiar la ruta
    const cleanPath = routePath.replace(/^\//, '').split('?')[0].split('#')[0];

    const config = SEO_CONFIG[cleanPath];
    if (!config) {
      // Ruta no encontrada, usar defaults
      this.set404Seo(language);
      return;
    }

    const seo = config[language];
    this.applyMetaTags(seo, cleanPath);
  }

  /**
   * Permite configuración SEO personalizada (útil para páginas dinámicas).
   */
  updateCustomSeo(seo: SeoData): void {
    this.applyMetaTags(seo, seo.canonicalPath || '');
  }

  private applyMetaTags(seo: SeoData, path: string): void {
    // Title
    this.titleService.setTitle(seo.title);

    // Standard meta tags
    this.meta.updateTag({ name: 'description', content: seo.description });
    if (seo.keywords) {
      this.meta.updateTag({ name: 'keywords', content: seo.keywords });
    }

    // Robots
    if (seo.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:type', content: seo.ogType || 'website' });
    this.meta.updateTag({ property: 'og:image', content: seo.ogImage || DEFAULT_OG_IMAGE });
    this.meta.updateTag({
      property: 'og:url',
      content: path ? `${BASE_URL}/${path}` : BASE_URL,
    });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });
    this.meta.updateTag({ name: 'twitter:image', content: seo.ogImage || DEFAULT_OG_IMAGE });

    // Canonical URL
    this.updateCanonicalUrl(seo.canonicalPath ?? path);
  }

  private updateCanonicalUrl(path: string): void {
    const url = path ? `${BASE_URL}/${path}` : BASE_URL;

    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (link) {
      link.setAttribute('href', url);
    } else {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }

  private set404Seo(language: 'es' | 'en'): void {
    const title =
      language === 'es' ? 'Página no encontrada | Joao Moreira' : 'Page Not Found | Joao Moreira';
    const description =
      language === 'es'
        ? 'La página que buscas no existe.'
        : "The page you're looking for doesn't exist.";

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }
}
