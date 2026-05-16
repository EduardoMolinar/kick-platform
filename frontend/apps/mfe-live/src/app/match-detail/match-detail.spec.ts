import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import type { MatchSummary } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE, type SportsDataService } from '@platform/sports-data';
import { of } from 'rxjs';
import { MatchDetail } from './match-detail';

const baseMatch: MatchSummary = {
  id: 'm-ucl-001',
  competition: { id: 'ucl', name: 'Champions League', code: 'UCL' },
  status: 'live',
  home: { team: { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' }, score: 1 },
  away: { team: { id: 't-mci', name: 'Manchester City', shortName: 'MCI' }, score: 1 },
  kickoffAt: '2026-04-22T19:00:00Z',
  minute: 67,
  events: [
    { minute: 41, type: 'goal', side: 'away', player: 'E. Haaland' },
    { minute: 23, type: 'goal', side: 'home', player: 'K. Mbappé' },
    { minute: 58, type: 'yellow-card', side: 'away', player: 'Rodri' },
  ],
};

function makeSportsStub(overrides: Partial<SportsDataService> = {}): SportsDataService {
  return {
    getLiveMatches: () => of([]),
    getMatch: () => of(baseMatch),
    getFixtures: () => of([]),
    getStandings: () => of(undefined),
    getTeamFixtures: () => of([]),
    getTeamStandings: () => of([]),
    getTeam: () => of(undefined),
    ...overrides,
  };
}

function makeActivatedRouteStub(matchId: string) {
  return { paramMap: of(new Map([['matchId', matchId]])) };
}

async function setup(matchId: string, sportsStub = makeSportsStub()) {
  await TestBed.configureTestingModule({
    imports: [MatchDetail],
    providers: [
      provideRouter([]),
      { provide: SPORTS_DATA_SERVICE, useValue: sportsStub },
      { provide: ActivatedRoute, useValue: makeActivatedRouteStub(matchId) },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(MatchDetail);
  fixture.detectChanges();
  return fixture;
}

describe('MatchDetail', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders the hero with team names and score', async () => {
    const fixture = await setup('m-ucl-001');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Real Madrid');
    expect(text).toContain('Manchester City');
    expect(text).toContain("LIVE 67'");
  });

  it('renders all events sorted by minute ascending', async () => {
    const fixture = await setup('m-ucl-001');
    const rows = fixture.nativeElement.querySelectorAll('mfe-live-match-event-row');
    expect(rows.length).toBe(3);
    // First row should be minute 23 (sorted ascending), then 41, then 58.
    const firstText = (rows[0] as HTMLElement).textContent ?? '';
    expect(firstText).toContain("23'");
  });

  it('shows "No events yet." for a match with empty events', async () => {
    const fixture = await setup(
      'm-empty',
      makeSportsStub({
        getMatch: () => of({ ...baseMatch, id: 'm-empty', events: [] }),
      })
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No events yet.');
  });

  it('shows a not-found message for unknown matchId', async () => {
    const fixture = await setup(
      'unknown',
      makeSportsStub({ getMatch: () => of(undefined) })
    );
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('not found');
  });
});
