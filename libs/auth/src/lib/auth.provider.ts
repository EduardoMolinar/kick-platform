import {
  type EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

/**
 * provideAuth() — registers the auth layer for the shell's bootstrapApplication.
 *
 * Usage in shell main.ts:
 *   bootstrapApplication(AppComponent, {
 *     providers: [
 *       provideAuth(),
 *       provideRouter(routes),
 *     ],
 *   });
 *
 * Registers:
 *   - HttpClient (with fetch backend for modern Angular)
 *   - authInterceptor (attaches Bearer token to /api/* requests)
 *
 * AuthService is provided in root via @Injectable({ providedIn: 'root' })
 * and does not need to be listed here.
 */
export function provideAuth(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]),
    ),
  ]);
}
