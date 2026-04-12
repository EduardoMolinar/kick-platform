import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { AuthState, AuthStatus, Session } from './auth.types';

/**
 * AuthService — single source of truth for session state.
 *
 * Rules:
 *   - Access token is memory-resident only. Never written to localStorage.
 *   - Shell calls bootstrap() once on app start (reads secure httpOnly cookie
 *     via a /api/auth/session endpoint — the backend returns a short-lived
 *     access token in the response body).
 *   - Remotes read session state via the exported signals — they never call
 *     login/logout/bootstrap directly.
 *   - On logout, the token is cleared and a backend /api/auth/logout call
 *     invalidates the httpOnly cookie server-side.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _state = signal<AuthState>({
    status: 'loading',
    session: null,
  });

  /** Current auth status as a signal. */
  readonly status = computed(() => this._state().status);

  /** Current session (null when unauthenticated or loading). */
  readonly session = computed(() => this._state().session);

  /** True when a valid session exists. */
  readonly isAuthenticated = computed(
    () => this._state().status === 'authenticated',
  );

  /**
   * Called once by the shell during app bootstrap.
   * Exchanges the httpOnly session cookie for a memory-resident access token.
   * On failure (no cookie, expired), transitions to 'unauthenticated'.
   */
  async bootstrap(): Promise<void> {
    try {
      const session = await firstValueFrom(
        this.http.post<Session>('/api/auth/session', {}),
      );
      this._state.set({ status: 'authenticated', session });
    } catch {
      this._state.set({ status: 'unauthenticated', session: null });
    }
  }

  /**
   * Called when the user explicitly logs out.
   * Clears memory token and tells the backend to invalidate the session cookie.
   */
  async logout(): Promise<void> {
    this._state.set({ status: 'unauthenticated', session: null });
    try {
      await firstValueFrom(this.http.post('/api/auth/logout', {}));
    } catch {
      // Cookie invalidation is best-effort — local state is already cleared.
    }
  }

  /**
   * Returns the current access token, or null if not authenticated.
   * Used by the auth interceptor — not intended for direct use in components.
   */
  getAccessToken(): string | null {
    return this._state().session?.accessToken ?? null;
  }
}
