import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockSportsDataService } from './mock-sports-data.service';

describe('MockSportsDataService', () => {
  let service: MockSportsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockSportsDataService] });
    service = TestBed.inject(MockSportsDataService);
  });

  it('emits the live-matches fixture', async () => {
    const matches = await firstValueFrom(service.getLiveMatches());
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((m) => m.id.length > 0)).toBe(true);
  });

  it('emits a known match by id', async () => {
    const match = await firstValueFrom(service.getMatch('m-ucl-001'));
    expect(match?.competition.code).toBe('UCL');
  });

  it('emits undefined for unknown id', async () => {
    const match = await firstValueFrom(service.getMatch('does-not-exist'));
    expect(match).toBeUndefined();
  });

  it('emits fixtures for a known competition with matching competition code', async () => {
    const fixtures = await firstValueFrom(service.getFixtures('pl'));
    expect(fixtures.length).toBeGreaterThan(0);
    expect(fixtures.every((f) => f.competition.code === 'PL')).toBe(true);
  });

  it('emits an empty array for an unknown competition', async () => {
    const fixtures = await firstValueFrom(service.getFixtures('unknown'));
    expect(fixtures).toEqual([]);
  });

  it('emits standings with monotonic positions and consistent goal difference', async () => {
    const standing = await firstValueFrom(service.getStandings('pl'));
    if (!standing) {
      throw new Error('expected standings for pl');
    }
    standing.rows.forEach((row, i) => {
      expect(row.position).toBe(i + 1);
      expect(row.goalDifference).toBe(row.goalsFor - row.goalsAgainst);
    });
  });

  it('emits undefined standings for international competitions', async () => {
    const standing = await firstValueFrom(service.getStandings('int'));
    expect(standing).toBeUndefined();
  });

  it('emits fixtures for a known team', async () => {
    const fixtures = await firstValueFrom(service.getTeamFixtures('t-ars'));
    expect(fixtures.length).toBeGreaterThan(0);
    expect(fixtures.every((f) => f.home.id === 't-ars' || f.away.id === 't-ars')).toBe(true);
  });

  it('emits an empty array for an unknown teamId', async () => {
    const fixtures = await firstValueFrom(service.getTeamFixtures('unknown'));
    expect(fixtures).toEqual([]);
  });

  it('emits team fixtures sorted by kickoffAt ascending', async () => {
    const fixtures = await firstValueFrom(service.getTeamFixtures('t-rma'));
    expect(fixtures.length).toBeGreaterThan(1);
    for (let i = 1; i < fixtures.length; i++) {
      expect(fixtures[i - 1].kickoffAt.localeCompare(fixtures[i].kickoffAt)).toBeLessThanOrEqual(0);
    }
  });

  it('emits team standings for a known team', async () => {
    const standings = await firstValueFrom(service.getTeamStandings('t-ars'));
    expect(standings.length).toBeGreaterThan(0);
    expect(standings.every((s) => s.row.team.id === 't-ars')).toBe(true);
  });

  it('emits empty team standings for an unknown teamId', async () => {
    const standings = await firstValueFrom(service.getTeamStandings('unknown'));
    expect(standings).toEqual([]);
  });

  it('resolves a team identity by id from standings', async () => {
    const team = await firstValueFrom(service.getTeam('t-ars'));
    expect(team).toBeDefined();
    expect(team?.name).toBe('Arsenal');
  });

  it('resolves a team identity from live matches when not in standings', async () => {
    // 't-bra' (Brazil) appears in live matches but not in standings (INT has none).
    const team = await firstValueFrom(service.getTeam('t-bra'));
    expect(team?.name).toBe('Brazil');
  });

  it('emits undefined for an unknown teamId', async () => {
    const team = await firstValueFrom(service.getTeam('does-not-exist'));
    expect(team).toBeUndefined();
  });
});
