import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideRouter,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  // Writable signal used to control auth state across tests.
  const authenticated = signal(false);
  let router: Router;

  beforeEach(() => {
    authenticated.set(false);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { isAuthenticated: authenticated } satisfies Partial<AuthService>,
        },
      ],
    });
    router = TestBed.inject(Router);
  });

  function runGuard(url = '/profile') {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
    );
  }

  it('allows access when authenticated', () => {
    authenticated.set(true);
    const result = runGuard();
    expect(result).toBe(true);
  });

  it('returns a redirect UrlTree when not authenticated', () => {
    const result = runGuard('/profile');
    expect(result).not.toBe(true);
    const urlTree = result as ReturnType<Router['createUrlTree']>;
    expect(router.serializeUrl(urlTree)).toContain('/login');
  });

  it('preserves the return URL in query params', () => {
    const result = runGuard('/profile');
    const urlTree = result as ReturnType<Router['createUrlTree']>;
    const serialized = router.serializeUrl(urlTree);
    expect(serialized).toContain('returnUrl');
  });
});
