import { Injectable } from '@angular/core';
import { BehaviorSubject, map, type Observable } from 'rxjs';
import type { AuthSession } from './auth-session';
import type { AuthService } from './auth.service';

const SEEDED_USER: AuthSession = {
  userId: 'u-demo-001',
  displayName: 'Demo User',
  email: 'demo@platform.local',
};

@Injectable({ providedIn: 'root' })
export class MockAuthService implements AuthService {
  private readonly session$ = new BehaviorSubject<AuthSession | null>(SEEDED_USER);

  readonly currentUser$: Observable<AuthSession | null> = this.session$.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(map((u) => u !== null));
}
