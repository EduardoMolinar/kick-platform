import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AuthSession } from './auth-session';

export interface AuthService {
  readonly currentUser$: Observable<AuthSession | null>;
  readonly isAuthenticated$: Observable<boolean>;
}

export const AUTH_SERVICE = new InjectionToken<AuthService>('AUTH_SERVICE');
