// ── @kick/auth — public API ───────────────────────────────────────────────────

export { AuthService }    from './lib/auth.service';
export { authGuard }      from './lib/auth.guard';
export { authInterceptor } from './lib/auth.interceptor';
export { provideAuth }    from './lib/auth.provider';
export type { AuthState, AuthStatus, Session } from './lib/auth.types';
