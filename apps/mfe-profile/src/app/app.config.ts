import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { PROFILE_ROUTES } from './remote.routes';

/**
 * Standalone app config — used only when mfe-profile is served directly.
 * When loaded via the shell, only the exposed './Routes' is consumed.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(PROFILE_ROUTES)],
};
