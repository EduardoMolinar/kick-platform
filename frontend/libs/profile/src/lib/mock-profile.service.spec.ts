import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockProfileService } from './mock-profile.service';

describe('MockProfileService', () => {
  let service: MockProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockProfileService] });
    service = TestBed.inject(MockProfileService);
  });

  it('returns seeded teams for the demo user', async () => {
    const teams = await firstValueFrom(service.getFavoriteTeams('u-demo-001'));
    expect(teams.length).toBe(2);
    expect(teams.map((t) => t.id)).toContain('t-ars');
    expect(teams.map((t) => t.id)).toContain('t-rma');
  });

  it('returns seeded competition for the demo user', async () => {
    const comps = await firstValueFrom(service.getFavoriteCompetitions('u-demo-001'));
    expect(comps.length).toBe(1);
    expect(comps[0].id).toBe('ucl');
  });

  it('returns empty teams for an unknown user', async () => {
    const teams = await firstValueFrom(service.getFavoriteTeams('unknown'));
    expect(teams).toEqual([]);
  });

  it('returns empty competitions for an unknown user', async () => {
    const comps = await firstValueFrom(service.getFavoriteCompetitions('unknown'));
    expect(comps).toEqual([]);
  });
});
