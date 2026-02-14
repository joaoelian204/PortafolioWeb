import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { EditorTab, FileNode } from '../models/database.types';

@Injectable({
  providedIn: 'root',
})
export class EditorStateService {
  private router = inject(Router);

  // Signals para el estado del editor
  private _tabs = signal<EditorTab[]>([]);
  private _activeTabId = signal<string | null>(null);
  private _sidebarVisible = signal<boolean>(true);
  private _activityBarSection = signal<string>('explorer');
  private _initialized = false;

  // Mobile sidebar overlay
  private _mobileSidebarOpen = signal<boolean>(false);
  mobileSidebarOpen = computed(() => this._mobileSidebarOpen());

  toggleMobileSidebar(): void {
    this._mobileSidebarOpen.update((v) => !v);
  }

  openMobileSidebar(): void {
    this._mobileSidebarOpen.set(true);
  }

  closeMobileSidebar(): void {
    this._mobileSidebarOpen.set(false);
  }

  // Computed signals públicos
  tabs = computed(() => this._tabs());
  activeTab = computed(() => this._tabs().find((t) => t.id === this._activeTabId()));
  activeTabId = computed(() => this._activeTabId());
  sidebarVisible = computed(() => this._sidebarVisible());
  activityBarSection = computed(() => this._activityBarSection());

  // Estructura de archivos del portafolio
  readonly fileTree: FileNode[] = [
    {
      name: 'portfolio',
      type: 'folder',
      isOpen: true,
      children: [
        {
          name: 'src',
          type: 'folder',
          isOpen: true,
          children: [
            {
              name: 'about.md',
              type: 'file',
              extension: 'md',
              route: '/about',
              icon: 'markdown',
            },
            {
              name: 'skills.ts',
              type: 'file',
              extension: 'ts',
              route: '/skills',
              icon: 'typescript',
            },
            {
              name: 'projects.tsx',
              type: 'file',
              extension: 'tsx',
              route: '/projects',
              icon: 'react',
            },
            {
              name: 'experience.yaml',
              type: 'file',
              extension: 'yaml',
              route: '/experience',
              icon: 'yaml',
            },
            {
              name: 'contact.tsx',
              type: 'file',
              extension: 'tsx',
              route: '/contact',
              icon: 'react',
            },
          ],
        },
        {
          name: 'config',
          type: 'folder',
          isOpen: false,
          children: [
            {
              name: 'settings.json',
              type: 'file',
              extension: 'json',
              route: '/settings',
              icon: 'settings',
            },
          ],
        },
        {
          name: 'README.md',
          type: 'file',
          extension: 'md',
          route: '/',
          icon: 'readme',
        },
      ],
    },
  ];

  constructor() {
    // Esperar a que el router esté listo antes de abrir la pestaña inicial
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => {
        if (!this._initialized) {
          this._initialized = true;
          this.initializeTab();
        }
      });
  }

  private initializeTab(): void {
    // Abrir README.md por defecto sin navegar (ya estamos en la ruta)
    const newTab: EditorTab = {
      id: `tab-${Date.now()}`,
      name: 'README.md',
      route: '/',
      icon: 'readme',
      extension: 'md',
      isActive: true,
    };
    this._tabs.set([newTab]);
    this._activeTabId.set(newTab.id);
  }

  // Abrir un archivo (crear nueva pestaña o activar existente)
  openFile(file: FileNode): void {
    if (file.type !== 'file' || !file.route) return;

    const existingTab = this._tabs().find((t) => t.route === file.route);

    if (existingTab) {
      this.setActiveTab(existingTab.id);
    } else {
      const newTab: EditorTab = {
        id: `tab-${Date.now()}`,
        name: file.name,
        route: file.route,
        icon: file.icon,
        extension: file.extension,
        isActive: true,
      };

      // Desactivar todas las pestañas existentes
      const updatedTabs = this._tabs().map((t) => ({ ...t, isActive: false }));
      this._tabs.set([...updatedTabs, newTab]);
      this._activeTabId.set(newTab.id);
    }

    this.router.navigate([file.route]);
    this.closeMobileSidebar();
  }

  // Activar una pestaña existente
  setActiveTab(tabId: string): void {
    const tab = this._tabs().find((t) => t.id === tabId);
    if (!tab) return;

    const updatedTabs = this._tabs().map((t) => ({
      ...t,
      isActive: t.id === tabId,
    }));

    this._tabs.set(updatedTabs);
    this._activeTabId.set(tabId);
    this.router.navigate([tab.route]);
  }

  // Cerrar una pestaña
  closeTab(tabId: string): void {
    const tabs = this._tabs();
    const tabIndex = tabs.findIndex((t) => t.id === tabId);

    if (tabIndex === -1) return;

    const newTabs = tabs.filter((t) => t.id !== tabId);
    this._tabs.set(newTabs);

    // Si cerramos la pestaña activa, activar otra
    if (this._activeTabId() === tabId && newTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      this.setActiveTab(newTabs[newActiveIndex].id);
    } else if (newTabs.length === 0) {
      this._activeTabId.set(null);
      this.router.navigate(['/']);
    }
  }

  // Cerrar todas las pestañas
  closeAllTabs(): void {
    this._tabs.set([]);
    this._activeTabId.set(null);
    this.router.navigate(['/']);
  }

  // Toggle sidebar
  toggleSidebar(): void {
    this._sidebarVisible.update((v) => !v);
  }

  // Cambiar sección del activity bar
  setActivitySection(section: string): void {
    if (this._activityBarSection() === section) {
      this.toggleSidebar();
    } else {
      this._activityBarSection.set(section);
      if (!this._sidebarVisible()) {
        this._sidebarVisible.set(true);
      }
    }
  }

  // Toggle carpeta
  toggleFolder(folder: FileNode): void {
    if (folder.type === 'folder') {
      folder.isOpen = !folder.isOpen;
    }
  }

  // Obtener icono de extensión
  getFileIcon(extension?: string): string {
    const iconMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'react',
      js: 'javascript',
      jsx: 'react',
      json: 'json',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
      html: 'html',
      css: 'css',
      scss: 'sass',
      py: 'python',
      go: 'go',
      rs: 'rust',
    };
    return iconMap[extension || ''] || 'file';
  }
}
