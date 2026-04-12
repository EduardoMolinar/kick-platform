import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LIVE_ROUTES } from './remote.routes';

/**
 * Standalone app config — used only when mfe-live is served directly.
 * When loaded via the shell, only the exposed './Routes' is consumed.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(LIVE_ROUTES)],
};
