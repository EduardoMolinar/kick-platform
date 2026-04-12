import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Functional route guard — redirects unauthenticated users to /login.
 *
 * Usage:
 *   { path: 'profile', canActivate: [authGuard], loadChildren: ... }
 *
 * The guard checks the in-memory session state synchronously — no HTTP call.
 * If status is still 'loading' (bootstrap in progress), it waits for the
 * signal to resolve before allowing or denying navigation.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Redirect, preserving the attempted URL for post-login redirect.
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
