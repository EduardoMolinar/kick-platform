import { inject } from '@angular/core';
import {
  type HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { AuthService } from './auth.service';

/**
 * HTTP interceptor — attaches the Bearer token to all /api/* requests.
 *
 * Only /api/* paths get the header. External URLs (CDN assets, provider
 * URLs if somehow leaked to the browser) are explicitly excluded.
 *
 * Security notes:
 *   - Token is read from memory via AuthService.getAccessToken().
 *   - The check `req.url.startsWith('/api/')` prevents token leakage to
 *     third-party domains if a relative URL is somehow used.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const auth = inject(AuthService);

  // Only attach to our own backend API — never to external URLs.
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  const token = auth.getAccessToken();
  if (!token) {
    return next(req);
  }

  const authedReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  return next(authedReq);
};
