import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import type { Fixture, TeamCompetitionStanding } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE, type SportsDataService } from '@platform/sports-data';
import { of } from 'rxjs';
import { TeamDetail } from './team-detail';

const arsFixture: Fixture = {
  id: 'f-pl-001',
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  home: { id: 't-ars', name: 'Arsenal' },
  away: { id: 't-che', name: 'Chelsea' },
  kickoffAt: '2026-04-26T14:00:00Z',
};

const arsStanding: TeamCompetitionStanding = {
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  row: {
    position: 1,
    team: { id: 't-ars', name: 'Arsenal' },
    played: 33,
    won: 24,
    drawn: 6,
    lost: 3,
    goalsFor: 75,
    goalsAgainst: 28,
    goalDifference: 47,
    points: 78,
  },
};

function makeSportsStub(overrides: Partial<SportsDataService> = {}): SportsDataService {
  return {
    getLiveMatches: () => of([]),
    getMatch: () => of(undefined),
    getFixtures: () => of([]),
    getStandings: () => of(undefined),
    getTeamFixtures: () => of([]),
    getTeamStandings: () => of([]),
    getTeam: () => of(undefined),
    ...overrides,
  };
}

function makeActivatedRouteStub(teamId: string) {
  return {
    paramMap: of(new Map([['teamId', teamId]])),
  };
}

async function setup(teamId: string, sportsStub = makeSportsStub()) {
  await TestBed.configureTestingModule({
    imports: [TeamDetail],
    providers: [
      provideRouter([]),
      { provide: SPORTS_DATA_SERVICE, useValue: sportsStub },
      { provide: ActivatedRoute, useValue: makeActivatedRouteStub(teamId) },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(TeamDetail);
  fixture.detectChanges();
  return fixture;
}

describe('TeamDetail', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders fixture row and standings card for a known team', async () => {
    const fixture = await setup(
      't-ars',
      makeSportsStub({
        getTeamFixtures: () => of([arsFixture]),
        getTeamStandings: () => of([arsStanding]),
      })
    );
    const fixtureRows = fixture.nativeElement.querySelectorAll('mfe-team-team-fixture-row');
    expect(fixtureRows.length).toBe(1);
    const standingCards = fixture.nativeElement.querySelectorAll('mfe-team-team-standings-card');
    expect(standingCards.length).toBe(1);
  });

  it('shows empty-state copy for an unknown team', async () => {
    const fixture = await setup('unknown');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No upcoming fixtures.');
    expect(text).toContain('No standings available.');
  });
});
