import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockAuthService } from './mock-auth.service';

describe('MockAuthService', () => {
  let service: MockAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockAuthService] });
    service = TestBed.inject(MockAuthService);
  });

  it('emits a non-null seeded user', async () => {
    const user = await firstValueFrom(service.currentUser$);
    expect(user).not.toBeNull();
    expect(user?.userId).toBe('u-demo-001');
    expect(user?.displayName).toBe('Demo User');
  });

  it('emits true for isAuthenticated$', async () => {
    const auth = await firstValueFrom(service.isAuthenticated$);
    expect(auth).toBe(true);
  });
});
