import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { MatchSummary } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE, SportsDataService } from '@platform/sports-data';
import { of } from 'rxjs';
import { LiveNow } from './live-now';

const fakeMatches: readonly MatchSummary[] = [
  {
    id: 'a',
    competition: { id: 'pl', name: 'Premier League', code: 'PL' },
    status: 'live',
    home: { team: { id: 't1', name: 'Arsenal' }, score: 1 },
    away: { team: { id: 't2', name: 'Chelsea' }, score: 0 },
    kickoffAt: '2026-04-22T18:00:00Z',
    minute: 30,
  },
];

describe('LiveNow', () => {
  let fixture: ComponentFixture<LiveNow>;

  beforeEach(async () => {
    const stub: SportsDataService = {
      getLiveMatches: () => of(fakeMatches),
      getMatch: () => of(undefined),
      getFixtures: () => of([]),
      getStandings: () => of(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [LiveNow],
      providers: [{ provide: SPORTS_DATA_SERVICE, useValue: stub }],
    }).compileComponents();
    fixture = TestBed.createComponent(LiveNow);
    fixture.detectChanges();
  });

  it('renders one match-card per match', () => {
    const cards = fixture.nativeElement.querySelectorAll('mfe-live-match-card');
    expect(cards.length).toBe(1);
  });

  it('renders the empty state when no matches', async () => {
    const empty: SportsDataService = {
      getLiveMatches: () => of([]),
      getMatch: () => of(undefined),
      getFixtures: () => of([]),
      getStandings: () => of(undefined),
    };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LiveNow],
      providers: [{ provide: SPORTS_DATA_SERVICE, useValue: empty }],
    }).compileComponents();
    const f = TestBed.createComponent(LiveNow);
    f.detectChanges();
    expect(f.nativeElement.textContent ?? '').toContain('No matches in progress');
  });
});
