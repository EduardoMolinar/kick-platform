import { TestBed } from '@angular/core/testing';
import { firstValueFrom, take, toArray } from 'rxjs';
import { MockProfileService } from './mock-profile.service';

const ARSENAL = { id: 't-ars', name: 'Arsenal', shortName: 'ARS' } as const;
const CHELSEA = { id: 't-che', name: 'Chelsea', shortName: 'CHE' } as const;
const PL = { id: 'pl', name: 'Premier League', code: 'PL' } as const;

describe('MockProfileService', () => {
  let service: MockProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockProfileService] });
    service = TestBed.inject(MockProfileService);
  });

  // --- Existing read coverage ---

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

  // --- isFollowing predicates ---

  it('isFollowingTeam$ returns true for a seeded team', async () => {
    const result = await firstValueFrom(service.isFollowingTeam$('u-demo-001', 't-ars'));
    expect(result).toBe(true);
  });

  it('isFollowingTeam$ returns false for an unknown userId', async () => {
    const result = await firstValueFrom(service.isFollowingTeam$('never-seen', 't-ars'));
    expect(result).toBe(false);
  });

  it('isFollowingCompetition$ returns true for a seeded competition', async () => {
    const result = await firstValueFrom(service.isFollowingCompetition$('u-demo-001', 'ucl'));
    expect(result).toBe(true);
  });

  it('isFollowingCompetition$ returns false for an unknown competition', async () => {
    const result = await firstValueFrom(service.isFollowingCompetition$('u-demo-001', 'pl'));
    expect(result).toBe(false);
  });

  // --- Write: followTeam ---

  it('followTeam adds the team to the favorites list', async () => {
    await firstValueFrom(service.followTeam('u-demo-001', CHELSEA));
    const teams = await firstValueFrom(service.getFavoriteTeams('u-demo-001'));
    expect(teams.map((t) => t.id)).toContain('t-che');
  });

  it('followTeam is idempotent when team already followed', async () => {
    await firstValueFrom(service.followTeam('u-demo-001', ARSENAL));
    const teams = await firstValueFrom(service.getFavoriteTeams('u-demo-001'));
    const arsCopies = teams.filter((t) => t.id === 't-ars');
    expect(arsCopies.length).toBe(1);
  });

  it('followTeam works for a brand-new userId', async () => {
    await firstValueFrom(service.followTeam('new-user', CHELSEA));
    const teams = await firstValueFrom(service.getFavoriteTeams('new-user'));
    expect(teams.map((t) => t.id)).toContain('t-che');
  });

  // --- Write: unfollowTeam ---

  it('unfollowTeam removes the team from the favorites list', async () => {
    await firstValueFrom(service.unfollowTeam('u-demo-001', 't-ars'));
    const teams = await firstValueFrom(service.getFavoriteTeams('u-demo-001'));
    expect(teams.map((t) => t.id)).not.toContain('t-ars');
  });

  // --- Write: followCompetition / unfollowCompetition ---

  it('followCompetition adds the competition', async () => {
    await firstValueFrom(service.followCompetition('u-demo-001', PL));
    const comps = await firstValueFrom(service.getFavoriteCompetitions('u-demo-001'));
    expect(comps.map((c) => c.id)).toContain('pl');
  });

  it('unfollowCompetition removes the competition', async () => {
    await firstValueFrom(service.unfollowCompetition('u-demo-001', 'ucl'));
    const comps = await firstValueFrom(service.getFavoriteCompetitions('u-demo-001'));
    expect(comps.map((c) => c.id)).not.toContain('ucl');
  });

  // --- Reactive updates via isFollowing$ ---

  it('isFollowingTeam$ transitions: true → false → true on unfollow then re-follow', async () => {
    const emissions = service.isFollowingTeam$('u-demo-001', 't-ars').pipe(take(3), toArray());
    const result$ = emissions.toPromise();

    await firstValueFrom(service.unfollowTeam('u-demo-001', 't-ars'));
    await firstValueFrom(service.followTeam('u-demo-001', ARSENAL));

    const values = await result$;
    expect(values).toEqual([true, false, true]);
  });

  it('isFollowingCompetition$ transitions on follow of a new competition', async () => {
    const first = await firstValueFrom(service.isFollowingCompetition$('u-demo-001', 'pl'));
    expect(first).toBe(false);

    await firstValueFrom(service.followCompetition('u-demo-001', PL));

    const second = await firstValueFrom(service.isFollowingCompetition$('u-demo-001', 'pl'));
    expect(second).toBe(true);
  });

  it('getFavoriteTeams$ reactively reflects follow writes', async () => {
    const before = await firstValueFrom(service.getFavoriteTeams('u-demo-001'));
    expect(before.length).toBe(2);

    await firstValueFrom(service.followTeam('u-demo-001', CHELSEA));

    const after = await firstValueFrom(service.getFavoriteTeams('u-demo-001'));
    expect(after.length).toBe(3);
  });
});
