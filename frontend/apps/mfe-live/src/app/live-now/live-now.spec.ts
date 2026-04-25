import { TestBed } from '@angular/core/testing';
import { AUTH_SERVICE, type AuthService } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import type { MatchSummary } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE, SportsDataService } from '@platform/sports-data';
import { of } from 'rxjs';
import { LiveNow } from './live-now';

const stubUser = { userId: 'u-test', displayName: 'Test', email: 'test@test.com' };

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

function makeSportsStub(overrides: Partial<SportsDataService> = {}): SportsDataService {
  return {
    getLiveMatches: () => of(fakeMatches),
    getMatch: () => of(undefined),
    getFixtures: () => of([]),
    getStandings: () => of(undefined),
    ...overrides,
  };
}

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

async function setup(
  sportsStub = makeSportsStub(),
  profileStub = makeProfileStub()
) {
  await TestBed.configureTestingModule({
    imports: [LiveNow],
    providers: [
      { provide: SPORTS_DATA_SERVICE, useValue: sportsStub },
      { provide: AUTH_SERVICE, useValue: makeAuthStub() },
      { provide: PROFILE_SERVICE, useValue: profileStub },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(LiveNow);
  fixture.detectChanges();
  return fixture;
}

describe('LiveNow', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders one match-card per match', async () => {
    const fixture = await setup();
    const cards = fixture.nativeElement.querySelectorAll('mfe-live-match-card');
    expect(cards.length).toBe(1);
  });

  it('renders the empty state when no matches', async () => {
    const fixture = await setup(makeSportsStub({ getLiveMatches: () => of([]) }));
    expect(fixture.nativeElement.textContent ?? '').toContain('No matches in progress');
  });

  it('calls followTeam when clicking an unfollowed team follow button', async () => {
    const profileStub = makeProfileStub();
    const followSpy = jest.spyOn(profileStub, 'followTeam').mockReturnValue(of(void 0));

    const fixture = await setup(makeSportsStub(), profileStub);

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('button.match-card__follow');
    buttons[0].click();

    expect(followSpy).toHaveBeenCalledWith('u-test', expect.objectContaining({ id: 't1' }));
  });
});
