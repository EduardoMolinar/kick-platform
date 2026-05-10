import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_SERVICE, type AuthService } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import { of } from 'rxjs';
import { TeamList } from './team-list';

const stubUser = { userId: 'u-test', displayName: 'Test', email: 'test@test.com' };

function makeAuthStub(): AuthService {
  return { currentUser$: of(stubUser), isAuthenticated$: of(true) };
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

async function setup(profileStub = makeProfileStub()) {
  await TestBed.configureTestingModule({
    imports: [TeamList],
    providers: [
      provideRouter([]),
      { provide: AUTH_SERVICE, useValue: makeAuthStub() },
      { provide: PROFILE_SERVICE, useValue: profileStub },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(TeamList);
  fixture.detectChanges();
  return fixture;
}

describe('TeamList', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders a card link for each followed team', async () => {
    const fixture = await setup(
      makeProfileStub({
        getFavoriteTeams: () =>
          of([
            { id: 't-ars', name: 'Arsenal' },
            { id: 't-rma', name: 'Real Madrid' },
          ]),
      })
    );
    const links = fixture.nativeElement.querySelectorAll('a.team-list__card');
    expect(links.length).toBe(2);
    expect((links[0] as HTMLAnchorElement).getAttribute('href')).toBe('/team/t-ars');
    expect((links[1] as HTMLAnchorElement).getAttribute('href')).toBe('/team/t-rma');
  });

  it('shows empty state when user has no followed teams', async () => {
    const fixture = await setup();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain("You don't follow any teams yet.");
  });
});
