import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { AUTH_SERVICE, MockAuthService } from '@platform/auth';
import { BrowserThemeService, THEME_SERVICE } from '@platform/design-system';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    { provide: AUTH_SERVICE, useExisting: MockAuthService },
    { provide: THEME_SERVICE, useExisting: BrowserThemeService },
  ],
};
