import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import type { Session } from './auth.types';

const MOCK_SESSION: Session = {
  accessToken: 'test-token-abc',
  expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  userId: 'user-123',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts in loading state', () => {
    expect(service.status()).toBe('loading');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('transitions to authenticated after successful bootstrap', async () => {
    const promise = service.bootstrap();
    const req = httpMock.expectOne('/api/auth/session');
    req.flush(MOCK_SESSION);
    await promise;

    expect(service.status()).toBe('authenticated');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getAccessToken()).toBe('test-token-abc');
  });

  it('transitions to unauthenticated when bootstrap fails', async () => {
    const promise = service.bootstrap();
    const req = httpMock.expectOne('/api/auth/session');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    await promise;

    expect(service.status()).toBe('unauthenticated');
    expect(service.getAccessToken()).toBeNull();
  });

  it('clears session on logout', async () => {
    // Authenticate first
    const bootstrapPromise = service.bootstrap();
    httpMock.expectOne('/api/auth/session').flush(MOCK_SESSION);
    await bootstrapPromise;

    const logoutPromise = service.logout();
    httpMock.expectOne('/api/auth/logout').flush({});
    await logoutPromise;

    expect(service.status()).toBe('unauthenticated');
    expect(service.getAccessToken()).toBeNull();
  });
});
