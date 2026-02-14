import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { I18nService } from './core/services/i18n.service';
import { SeoService } from './core/services/seo.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App implements OnInit {
  // Inicializar el servicio de tema para aplicar el tema al cargar
  private themeService = inject(ThemeService);
  private router = inject(Router);
  private seo = inject(SeoService);
  private i18n = inject(I18nService);

  ngOnInit(): void {
    // Actualizar SEO dinámicamente en cada navegación
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.seo.updateSeo(navEnd.urlAfterRedirects, this.i18n.language());
      });
  }
}
