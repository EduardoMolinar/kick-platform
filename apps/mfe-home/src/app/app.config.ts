import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HOME_ROUTES } from './remote.routes';

/**
 * Standalone app config — used only when mfe-home is served directly.
 * When loaded via the shell, only the exposed './Routes' is consumed.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(HOME_ROUTES)],
};
