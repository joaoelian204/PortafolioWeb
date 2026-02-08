import { Injectable, signal, effect } from '@angular/core';

export type Language = 'es' | 'en';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private _language = signal<Language>(this.getInitialLanguage());
  
  language = this._language.asReadonly();

  private translations: Translations = {
    es: {
      // Navigation
      'nav.explorer': 'EXPLORADOR',
      'nav.search': 'BUSCAR',
      'nav.sourceControl': 'CONTROL DE CÓDIGO FUENTE',
      'nav.extensions': 'EXTENSIONES',
      'nav.settings': 'CONFIGURACIÓN',
      'nav.admin': 'Panel de Administración',
      
      // File Explorer
      'explorer.portfolio': 'portafolio',
      'explorer.src': 'src',
      'explorer.config': 'config',
      'explorer.readme': 'README.md',
      'explorer.about': 'about.md',
      'explorer.skills': 'skills.ts',
      'explorer.projects': 'projects.tsx',
      'explorer.experience': 'experience.yaml',
      'explorer.contact': 'contact.tsx',
      
      // README
      'readme.title': 'README.md',
      'readme.name': 'Joao Elian Moreira Palma',
      'readme.about': 'Acerca de Mí',
      'readme.aboutDesc': 'Desarrollador apasionado por crear experiencias digitales excepcionales.',
      'readme.whatIDo': 'Lo Que Hago',
      'readme.whatIDoDesc': 'Construyo aplicaciones web modernas con código limpio, excelentes experiencias de usuario y arquitecturas escalables.',
      'readme.getInTouch': 'Ponerse en Contacto',
      'readme.email': 'Email',
      'readme.github': 'GitHub',
      'readme.linkedin': 'LinkedIn',
      'readme.navigation': 'Navegación',
      'readme.clickFiles': 'Haz clic en los archivos del explorador para navegar.',
      
      // Skills
      'skills.title': 'skills.ts',
      'skills.export': 'export const skills',
      'skills.noSkills': 'No hay habilidades configuradas. Por favor, configura Supabase o agrega habilidades desde el panel de administración.',
      
      // Projects
      'projects.title': 'projects.tsx',
      'projects.export': 'export const projects',
      'projects.noProjects': 'No hay proyectos configurados. Por favor, configura Supabase o agrega proyectos desde el panel de administración.',
      'projects.liveDemo': 'Ver Demo',
      'projects.repository': 'Repositorio',
      
      // Experience
      'experience.title': 'experience.yaml',
      'experience.noExperience': 'No hay experiencia configurada. Por favor, configura Supabase o agrega experiencia desde el panel de administración.',
      
      // About
      'about.title': 'about.md',
      'about.me': 'Acerca de Mí',
      
      // Contact
      'contact.title': 'contact.tsx',
      'contact.getInTouch': 'Ponerse en Contacto',
      
      // Admin
      'admin.title': 'Panel de Administración',
      'admin.profile': 'Perfil',
      'admin.skills': 'Habilidades',
      'admin.projects': 'Proyectos',
      'admin.experience': 'Experiencia',
      'admin.name': 'Nombre',
      'admin.bio': 'Biografía',
      'admin.email': 'Email',
      'admin.github': 'GitHub',
      'admin.linkedin': 'LinkedIn',
      'admin.save': 'Guardar',
      'admin.cancel': 'Cancelar',
      'admin.delete': 'Eliminar',
      'admin.add': 'Agregar',
      'admin.edit': 'Editar',
      'admin.label': 'Etiqueta',
      'admin.icon': 'Icono',
      'admin.category': 'Categoría',
      'admin.titleField': 'Título',
      'admin.description': 'Descripción',
      'admin.techStack': 'Stack Tecnológico',
      'admin.imageUrl': 'URL de Imagen',
      'admin.liveLink': 'Enlace en Vivo',
      'admin.repoLink': 'Enlace del Repositorio',
      'admin.company': 'Empresa',
      'admin.position': 'Posición',
      'admin.startDate': 'Fecha de Inicio',
      'admin.endDate': 'Fecha de Fin',
      'admin.current': 'Actual',
      'admin.saveSuccess': 'Guardado exitosamente',
      'admin.saveError': 'Error al guardar',
      'admin.deleteSuccess': 'Eliminado exitosamente',
      'admin.deleteError': 'Error al eliminar',
      'admin.loading': 'Cargando...',
      
      // Status Bar
      'status.branch': 'main',
      'status.line': 'Ln',
      'status.col': 'Col',
      'status.spaces': 'Espacios',
      'status.encoding': 'UTF-8',
      'status.language': 'TypeScript',
      'status.authenticated': 'Admin',
      
      // Settings
      'settings.title': 'CONFIGURACIÓN',
      'settings.colorTheme': 'Tema de Color',
      'settings.dark': 'Oscuro+',
      'settings.light': 'Claro+',
      'settings.font': 'Fuente: Consolas, 14px',
      'settings.tabSize': 'Tamaño de Tabulación: 2',
      'settings.language': 'Idioma',
      'settings.spanish': 'Español',
      'settings.english': 'Inglés',
    },
    en: {
      // Navigation
      'nav.explorer': 'EXPLORER',
      'nav.search': 'SEARCH',
      'nav.sourceControl': 'SOURCE CONTROL',
      'nav.extensions': 'EXTENSIONS',
      'nav.settings': 'SETTINGS',
      'nav.admin': 'Admin Panel',
      
      // File Explorer
      'explorer.portfolio': 'portfolio',
      'explorer.src': 'src',
      'explorer.config': 'config',
      'explorer.readme': 'README.md',
      'explorer.about': 'about.md',
      'explorer.skills': 'skills.ts',
      'explorer.projects': 'projects.tsx',
      'explorer.experience': 'experience.yaml',
      'explorer.contact': 'contact.tsx',
      
      // README
      'readme.title': 'README.md',
      'readme.name': 'Joao Elian Moreira Palma',
      'readme.about': 'About Me',
      'readme.aboutDesc': 'Developer passionate about creating exceptional digital experiences.',
      'readme.whatIDo': 'What I Do',
      'readme.whatIDoDesc': 'I build modern web applications with clean code, great user experiences, and scalable architectures.',
      'readme.getInTouch': 'Get In Touch',
      'readme.email': 'Email',
      'readme.github': 'GitHub',
      'readme.linkedin': 'LinkedIn',
      'readme.navigation': 'Navigation',
      'readme.clickFiles': 'Click on files in the explorer to navigate.',
      
      // Skills
      'skills.title': 'skills.ts',
      'skills.export': 'export const skills',
      'skills.noSkills': 'No skills configured. Please configure Supabase or add skills from the admin panel.',
      
      // Projects
      'projects.title': 'projects.tsx',
      'projects.export': 'export const projects',
      'projects.noProjects': 'No projects configured. Please configure Supabase or add projects from the admin panel.',
      'projects.liveDemo': 'Live Demo',
      'projects.repository': 'Repository',
      
      // Experience
      'experience.title': 'experience.yaml',
      'experience.noExperience': 'No experience configured. Please configure Supabase or add experience from the admin panel.',
      
      // About
      'about.title': 'about.md',
      'about.me': 'About Me',
      
      // Contact
      'contact.title': 'contact.tsx',
      'contact.getInTouch': 'Get In Touch',
      
      // Admin
      'admin.title': 'Admin Panel',
      'admin.profile': 'Profile',
      'admin.skills': 'Skills',
      'admin.projects': 'Projects',
      'admin.experience': 'Experience',
      'admin.name': 'Name',
      'admin.bio': 'Biography',
      'admin.email': 'Email',
      'admin.github': 'GitHub',
      'admin.linkedin': 'LinkedIn',
      'admin.save': 'Save',
      'admin.cancel': 'Cancel',
      'admin.delete': 'Delete',
      'admin.add': 'Add',
      'admin.edit': 'Edit',
      'admin.label': 'Label',
      'admin.icon': 'Icon',
      'admin.category': 'Category',
      'admin.titleField': 'Title',
      'admin.description': 'Description',
      'admin.techStack': 'Tech Stack',
      'admin.imageUrl': 'Image URL',
      'admin.liveLink': 'Live Link',
      'admin.repoLink': 'Repository Link',
      'admin.company': 'Company',
      'admin.position': 'Position',
      'admin.startDate': 'Start Date',
      'admin.endDate': 'End Date',
      'admin.current': 'Current',
      'admin.saveSuccess': 'Saved successfully',
      'admin.saveError': 'Error saving',
      'admin.deleteSuccess': 'Deleted successfully',
      'admin.deleteError': 'Error deleting',
      'admin.loading': 'Loading...',
      
      // Status Bar
      'status.branch': 'main',
      'status.line': 'Ln',
      'status.col': 'Col',
      'status.spaces': 'Spaces',
      'status.encoding': 'UTF-8',
      'status.language': 'TypeScript',
      'status.authenticated': 'Admin',
      
      // Settings
      'settings.title': 'SETTINGS',
      'settings.colorTheme': 'Color Theme',
      'settings.dark': 'Dark+',
      'settings.light': 'Light+',
      'settings.font': 'Font: Consolas, 14px',
      'settings.tabSize': 'Tab Size: 2',
      'settings.language': 'Language',
      'settings.spanish': 'Spanish',
      'settings.english': 'English',
    },
  };

  constructor() {
    // Guardar idioma cuando cambie
    effect(() => {
      this.saveLanguage(this._language());
    });
  }

  private getInitialLanguage(): Language {
    const saved = localStorage.getItem('portfolio-language');
    if (saved === 'es' || saved === 'en') {
      return saved;
    }
    
    // Detectar idioma del navegador
    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        return 'es';
      }
    }
    
    // Por defecto inglés
    return 'en';
  }

  setLanguage(language: Language): void {
    this._language.set(language);
  }

  translate(key: string): string {
    const lang = this._language();
    return this.translations[lang]?.[key] || key;
  }

  t(key: string): string {
    return this.translate(key);
  }

  private saveLanguage(language: Language): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portfolio-language', language);
    }
  }
}
