import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AUTH_SERVICE, type AuthService } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import type { Fixture, Standing } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE, SportsDataService } from '@platform/sports-data';
import { of } from 'rxjs';
import { CompetitionDetail } from './competition-detail';

const stubUser = { userId: 'u-test', displayName: 'Test', email: 'test@test.com' };

const plFixtures: readonly Fixture[] = [
  {
    id: 'f1',
    competition: { id: 'pl', name: 'Premier League', code: 'PL' },
    home: { id: 't1', name: 'Arsenal' },
    away: { id: 't2', name: 'Chelsea' },
    kickoffAt: '2026-04-26T14:00:00Z',
    matchday: 34,
  },
];

const plStanding: Standing = {
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  updatedAt: '2026-04-22T00:00:00Z',
  rows: [
    {
      position: 1,
      team: { id: 't1', name: 'Arsenal' },
      played: 10, won: 8, drawn: 1, lost: 1,
      goalsFor: 24, goalsAgainst: 8, goalDifference: 16, points: 25,
    },
  ],
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
    getFixtures: () => of(plFixtures),
    getStandings: () => of(plStanding),
    ...overrides,
  };
}

describe('CompetitionDetail', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders a fixture row and the standings table for a known competition', async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionDetail],
      providers: [
        provideRouter([]),
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        { provide: PROFILE_SERVICE, useValue: makeProfileStub() },
        { provide: SPORTS_DATA_SERVICE, useValue: makeSportsStub() },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ competitionId: 'pl' })) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CompetitionDetail);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('mfe-competition-fixture-row');
    expect(rows.length).toBe(1);
    const table = fixture.nativeElement.querySelector('mfe-competition-standings-table');
    expect(table).toBeTruthy();
  });

  it('renders the fallback copy when standings are undefined', async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionDetail],
      providers: [
        provideRouter([]),
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        { provide: PROFILE_SERVICE, useValue: makeProfileStub() },
        {
          provide: SPORTS_DATA_SERVICE,
          useValue: makeSportsStub({
            getFixtures: () => of([]),
            getStandings: () => of(undefined),
          }),
        },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ competitionId: 'int' })) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CompetitionDetail);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent ?? '').toContain('Standings not available');
  });

  it('shows Follow button and calls followCompetition on click', async () => {
    const profileStub = makeProfileStub();
    const followSpy = jest.spyOn(profileStub, 'followCompetition').mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [CompetitionDetail],
      providers: [
        provideRouter([]),
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        { provide: PROFILE_SERVICE, useValue: profileStub },
        { provide: SPORTS_DATA_SERVICE, useValue: makeSportsStub() },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ competitionId: 'pl' })) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CompetitionDetail);
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button.competition-detail__follow');
    expect(btn).toBeTruthy();
    expect(btn.textContent?.trim()).toBe('Follow');

    btn.click();
    expect(followSpy).toHaveBeenCalledWith('u-test', expect.objectContaining({ id: 'pl' }));
  });
});
