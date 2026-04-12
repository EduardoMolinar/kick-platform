/**
 * Auth domain types.
 *
 * The frontend never parses or validates JWTs — that is the backend's job.
 * The shell receives an opaque access token from the backend and stores it
 * in memory only (never localStorage, never sessionStorage).
 */

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface Session {
  /** Opaque access token — only sent to our own backend API. */
  accessToken: string;
  /** ISO 8601 expiry time — used to decide whether to refresh. */
  expiresAt: string;
  /** User ID — used to scope profile requests. */
  userId: string;
}

export interface AuthState {
  status: AuthStatus;
  session: Session | null;
}
