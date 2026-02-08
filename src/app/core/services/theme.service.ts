import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme = signal<Theme>(this.getInitialTheme());
  
  theme = this._theme.asReadonly();

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
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
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
    this._theme.update(current => current === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('light-theme', theme === 'light');
      document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    }
  }

  private saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portfolio-theme', theme);
    }
  }
}
