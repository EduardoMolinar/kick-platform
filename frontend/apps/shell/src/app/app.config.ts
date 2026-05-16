import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  Provider,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { AUTH_SERVICE, MockAuthService } from '@platform/auth';
import { BrowserThemeService, THEME_SERVICE } from '@platform/design-system';
import { SPORTS_DATA_API_BASE_URL } from '@platform/sports-data';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

// Only provide the SPORTS_DATA_API_BASE_URL token when an env URL is set, so
// remotes' useFactory falls back cleanly to MockSportsDataService otherwise.
const sportsApiProviders: Provider[] = environment.sportsApiBaseUrl
  ? [{ provide: SPORTS_DATA_API_BASE_URL, useValue: environment.sportsApiBaseUrl }]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(),
    { provide: AUTH_SERVICE, useExisting: MockAuthService },
    { provide: THEME_SERVICE, useExisting: BrowserThemeService },
    ...sportsApiProviders,
  ],
};
