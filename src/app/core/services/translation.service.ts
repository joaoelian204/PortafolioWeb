import { Injectable, inject } from '@angular/core';
import { I18nService } from './i18n.service';

interface CacheEntry {
  text: string;
  timestamp: number;
}

const CACHE_KEY = 'portfolio-translations';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private i18n = inject(I18nService);
  private memoryCache = new Map<string, string>();
  private pendingRequests = new Map<string, Promise<string>>();

  constructor() {
    this.loadCache();
  }

  /**
   * Traduce texto automáticamente al idioma activo.
   * - Si el idioma activo es 'es' (idioma fuente), devuelve el texto original.
   * - Si es 'en', traduce usando MyMemory API y cachea el resultado.
   * Retorna el texto original mientras se traduce (no bloquea).
   */
  translate(text: string): string {
    if (!text || text.trim().length === 0) return text;
    if (this.i18n.language() === 'es') return text;

    const cacheKey = this.getCacheKey(text);
    const cached = this.memoryCache.get(cacheKey);
    if (cached) return cached;

    // Lanzar traducción async en background
    this.fetchTranslation(text, cacheKey);

    // Devolver original mientras se traduce
    return text;
  }

  /**
   * Traduce texto y devuelve una Promise con el resultado.
   * Útil en código TypeScript donde puedes usar await.
   */
  async translateAsync(text: string): Promise<string> {
    if (!text || text.trim().length === 0) return text;
    if (this.i18n.language() === 'es') return text;

    const cacheKey = this.getCacheKey(text);
    const cached = this.memoryCache.get(cacheKey);
    if (cached) return cached;

    return this.fetchTranslation(text, cacheKey);
  }

  /** Limpia toda la caché de traducciones */
  clearCache(): void {
    this.memoryCache.clear();
    localStorage.removeItem(CACHE_KEY);
  }

  // ─── Private ────────────────────────────────────────────────

  private async fetchTranslation(text: string, cacheKey: string): Promise<string> {
    // Evitar peticiones duplicadas para el mismo texto
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) return pending;

    const promise = this.callTranslationAPI(text)
      .then((translated) => {
        this.memoryCache.set(cacheKey, translated);
        this.saveCache();
        this.pendingRequests.delete(cacheKey);
        return translated;
      })
      .catch(() => {
        this.pendingRequests.delete(cacheKey);
        return text; // Fallback al original
      });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  private async callTranslationAPI(text: string): Promise<string> {
    // Dividir textos largos en fragmentos (MyMemory tiene límite de 500 chars)
    if (text.length > 450) {
      return this.translateLongText(text);
    }

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation API error');

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let translated = data.responseData.translatedText as string;
      // MyMemory a veces devuelve en mayúsculas cuando no tiene buena traducción
      if (translated === translated.toUpperCase() && text !== text.toUpperCase()) {
        return text; // Fallback si la API devuelve basura
      }
      return translated;
    }

    return text;
  }

  private async translateLongText(text: string): Promise<string> {
    // Dividir por oraciones
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + sentence).length > 450) {
        if (current) chunks.push(current.trim());
        current = sentence;
      } else {
        current += sentence;
      }
    }
    if (current) chunks.push(current.trim());

    const translated = await Promise.all(chunks.map((chunk) => this.callTranslationAPI(chunk)));

    return translated.join(' ');
  }

  private getCacheKey(text: string): string {
    // Hash simple para textos largos
    if (text.length > 100) {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return `es_en_${hash}`;
    }
    return `es_en_${text}`;
  }

  private loadCache(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;

      const stored: Record<string, CacheEntry> = JSON.parse(raw);
      const now = Date.now();

      for (const [key, entry] of Object.entries(stored)) {
        if (now - entry.timestamp < CACHE_TTL) {
          this.memoryCache.set(key, entry.text);
        }
      }
    } catch {
      // Cache corrupta, limpiar
      localStorage.removeItem(CACHE_KEY);
    }
  }

  private saveCache(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const toStore: Record<string, CacheEntry> = {};
      const now = Date.now();

      for (const [key, text] of this.memoryCache.entries()) {
        toStore[key] = { text, timestamp: now };
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(toStore));
    } catch {
      // localStorage lleno, limpiar
      localStorage.removeItem(CACHE_KEY);
    }
  }
}
