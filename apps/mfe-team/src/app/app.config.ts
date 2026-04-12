import { type ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TEAM_ROUTES } from './remote.routes';

/**
 * Standalone app config — used only when mfe-team is served directly.
 * When loaded via the shell, only the exposed './Routes' is consumed.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(TEAM_ROUTES)],
};
