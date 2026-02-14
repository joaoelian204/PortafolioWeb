import { effect, Injectable, signal } from '@angular/core';

export type Language = 'es' | 'en';

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private _language = signal<Language>(this.getInitialLanguage());

  language = this._language.asReadonly();

  /**
   * Atajo principal: devuelve el texto en el idioma activo.
   *
   * Uso en templates:
   *   {{ i18n.s('Guardar', 'Save') }}
   *   [title]="i18n.s('Cerrar Sesión', 'Logout')"
   *
   * Uso en TypeScript:
   *   this.i18n.s('Error al guardar', 'Error saving')
   */
  s(es: string, en: string): string {
    return this._language() === 'es' ? es : en;
  }

  /** Devuelve true si el idioma activo es español */
  get isEs(): boolean {
    return this._language() === 'es';
  }

  /** Devuelve true si el idioma activo es inglés */
  get isEn(): boolean {
    return this._language() === 'en';
  }

  constructor() {
    effect(() => {
      this.saveLanguage(this._language());
    });
  }

  private getInitialLanguage(): Language {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('portfolio-language');
      if (saved === 'es' || saved === 'en') {
        return saved;
      }
    }

    if (typeof navigator !== 'undefined' && navigator.language) {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        return 'es';
      }
    }

    return 'en';
  }

  setLanguage(language: Language): void {
    this._language.set(language);
  }

  private saveLanguage(language: Language): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portfolio-language', language);
    }
  }
}
