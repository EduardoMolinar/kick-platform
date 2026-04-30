import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_SERVICE, type AuthService } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import type { Competition, Fixture, MatchSummary, Team } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE, type SportsDataService } from '@platform/sports-data';
import { of } from 'rxjs';
import { Home } from './home';

const stubUser = { userId: 'u-test', displayName: 'Test', email: 'test@test.com' };

const arsTeam: Team = { id: 't-ars', name: 'Arsenal' };
const chelseaTeam: Team = { id: 't-che', name: 'Chelsea' };
const plComp: Competition = { id: 'pl', name: 'Premier League', code: 'PL' };
const ligaComp: Competition = { id: 'liga', name: 'La Liga', code: 'LIGA' };

const arsMatch: MatchSummary = {
  id: 'm1',
  competition: plComp,
  status: 'live',
  home: { team: arsTeam, score: 1 },
  away: { team: chelseaTeam, score: 0 },
  kickoffAt: '2026-04-22T18:30:00Z',
  minute: 30,
};

const otherMatch: MatchSummary = {
  id: 'm2',
  competition: ligaComp,
  status: 'live',
  home: { team: { id: 't-fcb', name: 'FC Barcelona' }, score: 2 },
  away: { team: { id: 't-atl', name: 'Atletico Madrid' }, score: 1 },
  kickoffAt: '2026-04-22T19:00:00Z',
  minute: 60,
};

function makeAuthStub(): AuthService {
  return {
    currentUser$: of(stubUser),
    isAuthenticated$: of(true),
  };
}

function makeProfileStub(overrides: Partial<ProfileService> = {}): ProfileService {
  return {
    getFavoriteTeams: () => of([]),
    getFavoriteCompetitions: () => of([]),
    isFollowingTeam$: () => of(false),
    isFollowingCompetition$: () => of(false),
    followTeam: () => of(void 0),
    unfollowTeam: () => of(void 0),
    followCompetition: () => of(void 0),
    unfollowCompetition: () => of(void 0),
    ...overrides,
  };
}

function makeSportsStub(overrides: Partial<SportsDataService> = {}): SportsDataService {
  return {
    getLiveMatches: () => of([]),
    getMatch: () => of(undefined),
    getFixtures: () => of([]),
    getStandings: () => of(undefined),
    ...overrides,
  };
}

async function setup(
  profileStub = makeProfileStub(),
  sportsStub = makeSportsStub()
) {
  await TestBed.configureTestingModule({
    imports: [Home],
    providers: [
      provideRouter([]),
      { provide: AUTH_SERVICE, useValue: makeAuthStub() },
      { provide: PROFILE_SERVICE, useValue: profileStub },
      { provide: SPORTS_DATA_SERVICE, useValue: sportsStub },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(Home);
  fixture.detectChanges();
  return fixture;
}

describe('Home', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('shows empty state when user has no favorites', async () => {
    const fixture = await setup();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Browse competitions');
    const tiles = fixture.nativeElement.querySelectorAll('mfe-home-live-tile');
    expect(tiles.length).toBe(0);
  });

  it('filters live matches by followed team', async () => {
    const fixture = await setup(
      makeProfileStub({ getFavoriteTeams: () => of([arsTeam]) }),
      makeSportsStub({ getLiveMatches: () => of([arsMatch, otherMatch]) })
    );
    const tiles = fixture.nativeElement.querySelectorAll('mfe-home-live-tile');
    expect(tiles.length).toBe(1);
  });

  it('filters live matches by followed competition', async () => {
    const fixture = await setup(
      makeProfileStub({ getFavoriteCompetitions: () => of([plComp]) }),
      makeSportsStub({ getLiveMatches: () => of([arsMatch, otherMatch]) })
    );
    const tiles = fixture.nativeElement.querySelectorAll('mfe-home-live-tile');
    expect(tiles.length).toBe(1);
  });

  it('sorts upcoming fixtures ascending across followed competitions', async () => {
    const plFixture: Fixture = {
      id: 'f-pl',
      competition: plComp,
      home: { id: 't1', name: 'Arsenal' },
      away: { id: 't2', name: 'Chelsea' },
      kickoffAt: '2026-05-01T18:00:00Z',
    };
    const ligaFixture: Fixture = {
      id: 'f-liga',
      competition: ligaComp,
      home: { id: 't3', name: 'Barcelona' },
      away: { id: 't4', name: 'Madrid' },
      kickoffAt: '2026-04-30T20:00:00Z',
    };

    const fixture = await setup(
      makeProfileStub({ getFavoriteCompetitions: () => of([plComp, ligaComp]) }),
      makeSportsStub({
        getFixtures: (id: string) => of(id === 'pl' ? [plFixture] : [ligaFixture]),
      })
    );

    const tiles = fixture.nativeElement.querySelectorAll('mfe-home-fixture-tile');
    expect(tiles.length).toBe(2);
    // liga fixture (Apr 30) must render before pl fixture (May 1)
    const firstText = (tiles[0] as HTMLElement).textContent ?? '';
    expect(firstText).toContain('Barcelona');
  });

  it('caps upcoming fixtures at 3', async () => {
    const makeFixture = (id: string, kickoffAt: string): Fixture => ({
      id,
      competition: plComp,
      home: { id: 't1', name: 'Arsenal' },
      away: { id: 't2', name: 'Chelsea' },
      kickoffAt,
    });
    const fiveFixtures = [
      makeFixture('f1', '2026-05-01T18:00:00Z'),
      makeFixture('f2', '2026-05-02T18:00:00Z'),
      makeFixture('f3', '2026-05-03T18:00:00Z'),
      makeFixture('f4', '2026-05-04T18:00:00Z'),
      makeFixture('f5', '2026-05-05T18:00:00Z'),
    ];

    const fixture = await setup(
      makeProfileStub({ getFavoriteCompetitions: () => of([plComp]) }),
      makeSportsStub({ getFixtures: () => of(fiveFixtures) })
    );

    const tiles = fixture.nativeElement.querySelectorAll('mfe-home-fixture-tile');
    expect(tiles.length).toBe(3);
  });

  it('shows no-live-matches copy when favorites exist but no live matches', async () => {
    const fixture = await setup(
      makeProfileStub({ getFavoriteTeams: () => of([arsTeam]) }),
      makeSportsStub({ getLiveMatches: () => of([]) })
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No live matches involving your favorites');
    const tiles = fixture.nativeElement.querySelectorAll('mfe-home-live-tile');
    expect(tiles.length).toBe(0);
  });
});
