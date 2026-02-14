import {
  importProvidersFrom,
  mergeApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

// Añadir providers que solo funcionan en el navegador (no SSR)
const browserConfig = mergeApplicationConfig(appConfig, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(
      NgHcaptchaModule.forRoot({
        siteKey: environment.hcaptcha.siteKey,
        languageCode: 'es',
      }),
    ),
  ],
});

bootstrapApplication(App, browserConfig).catch((err) => console.error(err));
