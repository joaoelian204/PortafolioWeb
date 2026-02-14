import { effect, Injectable, signal } from '@angular/core';

export type Theme =
  | 'dark'
  | 'light'
  | 'monokai'
  | 'github-dark'
  | 'dracula'
  | 'nord'
  | 'solarized-dark';

export interface ThemeInfo {
  id: Theme;
  name: string;
  nameEs: string;
  type: 'dark' | 'light';
}

export const THEMES: ThemeInfo[] = [
  { id: 'dark', name: 'Dark+ (Default)', nameEs: 'Oscuro+ (Predeterminado)', type: 'dark' },
  { id: 'light', name: 'Light+ (Default)', nameEs: 'Claro+ (Predeterminado)', type: 'light' },
  { id: 'monokai', name: 'Monokai', nameEs: 'Monokai', type: 'dark' },
  { id: 'github-dark', name: 'GitHub Dark', nameEs: 'GitHub Dark', type: 'dark' },
  { id: 'dracula', name: 'Dracula', nameEs: 'Dracula', type: 'dark' },
  { id: 'nord', name: 'Nord', nameEs: 'Nord', type: 'dark' },
  { id: 'solarized-dark', name: 'Solarized Dark', nameEs: 'Solarized Dark', type: 'dark' },
];

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme = signal<Theme>(this.getInitialTheme());

  theme = this._theme.asReadonly();

  readonly themes = THEMES;

  constructor() {
    // Aplicar tema inicial inmediatamente
    this.applyTheme(this._theme());

    // Efecto para aplicar tema cuando cambie
    effect(() => {
      const currentTheme = this._theme();
      this.applyTheme(currentTheme);
      this.saveTheme(currentTheme);
    });
  }

  private getInitialTheme(): Theme {
    // Verificar si hay tema guardado en localStorage
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('portfolio-theme');
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved as Theme;
      }
    }

    // Verificar preferencia del sistema
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    // Por defecto, tema oscuro (VS Code)
    return 'dark';
  }

  toggleTheme(): void {
    const currentInfo = THEMES.find((t) => t.id === this._theme());
    if (currentInfo?.type === 'dark') {
      this._theme.set('light');
    } else {
      this._theme.set('dark');
    }
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  getThemeType(): 'dark' | 'light' {
    return THEMES.find((t) => t.id === this._theme())?.type ?? 'dark';
  }

  private readonly THEME_COLORS: Record<Theme, string> = {
    dark: '#1e1e1e',
    light: '#ffffff',
    monokai: '#272822',
    'github-dark': '#0d1117',
    dracula: '#282a36',
    nord: '#2e3440',
    'solarized-dark': '#002b36',
  };

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      const themeType = THEMES.find((t) => t.id === theme)?.type ?? 'dark';
      document.documentElement.classList.toggle('light-theme', themeType === 'light');
      document.documentElement.classList.toggle('dark-theme', themeType === 'dark');

      // Actualizar meta theme-color
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', this.THEME_COLORS[theme] || '#1e1e1e');
      }
    }
  }

  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portfolio-theme', theme);
    }
  }
}
