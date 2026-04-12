import {
  APP_INITIALIZER,
  type ApplicationConfig,
} from '@angular/core';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { provideAuth, AuthService } from '@kick/auth';
import { appRoutes } from './app.routes';

/**
 * APP_INITIALIZER factory — runs auth.bootstrap() before the first navigation.
 *
 * Combined with withEnabledBlockingInitialNavigation(), this ensures the
 * authGuard always sees a resolved auth status ('authenticated' or
 * 'unauthenticated') — never 'loading' — on the initial route check.
 */
function initAuth(auth: AuthService) {
  return () => auth.bootstrap();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAuth(),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
