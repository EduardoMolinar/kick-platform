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
});
