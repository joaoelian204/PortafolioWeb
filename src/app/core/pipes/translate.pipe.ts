import { ChangeDetectorRef, inject, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../services/i18n.service';
import { TranslationService } from '../services/translation.service';

/**
 * Pipe que traduce automáticamente texto dinámico (de Supabase, etc.)
 * al idioma activo del usuario.
 *
 * Uso:
 *   {{ profile()?.bio | translate }}
 *   {{ project.description | translate }}
 *
 * - Si el idioma es 'es' → devuelve el texto original
 * - Si el idioma es 'en' → traduce vía API y cachea
 * - Mientras traduce, muestra el texto original
 * - Una vez traducido, actualiza la vista automáticamente
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Impuro para reaccionar a cambios de idioma
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translation = inject(TranslationService);
  private i18n = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);

  private lastValue = '';
  private lastLang = '';
  private lastResult = '';
  private translating = false;

  transform(value: string | null | undefined): string {
    if (!value) return '';

    const lang = this.i18n.language();

    // Si no cambió nada, devolver lo cacheado
    if (value === this.lastValue && lang === this.lastLang) {
      return this.lastResult;
    }

    this.lastValue = value;
    this.lastLang = lang;

    // Si es español (idioma fuente), devolver original
    if (lang === 'es') {
      this.lastResult = value;
      return value;
    }

    // Intentar obtener del caché sincrónico
    const cached = this.translation.translate(value);
    if (cached !== value) {
      this.lastResult = cached;
      return cached;
    }

    // No está en caché — lanzar traducción async
    if (!this.translating) {
      this.translating = true;
      this.translation.translateAsync(value).then((translated) => {
        this.translating = false;
        if (translated !== this.lastResult) {
          this.lastResult = translated;
          this.cdr.markForCheck();
        }
      });
    }

    // Mientras tanto, devolver original
    this.lastResult = value;
    return value;
  }

  ngOnDestroy(): void {
    this.translating = false;
  }
}
