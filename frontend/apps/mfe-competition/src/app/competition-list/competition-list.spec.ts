import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_SERVICE, type AuthService } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import { of } from 'rxjs';
import { CompetitionList } from './competition-list';

const stubUser = { userId: 'u-test', displayName: 'Test', email: 'test@test.com' };

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

describe('CompetitionList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionList],
      providers: [
        provideRouter([]),
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        { provide: PROFILE_SERVICE, useValue: makeProfileStub() },
      ],
    }).compileComponents();
  });

  it('renders four competition links pointing to /competition/<id>', () => {
    const fixture = TestBed.createComponent(CompetitionList);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a[href]');
    expect(links.length).toBe(4);

    const hrefs = Array.from(links).map((el) => (el as HTMLAnchorElement).getAttribute('href'));
    expect(hrefs).toEqual([
      '/competition/ucl',
      '/competition/pl',
      '/competition/liga',
      '/competition/int',
    ]);
  });

  it('renders a follow button per competition row', () => {
    const fixture = TestBed.createComponent(CompetitionList);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button.competition-list__follow');
    expect(buttons.length).toBe(4);
  });

  it('shows Following when isFollowingCompetition$ returns true for UCL', () => {
    TestBed.overrideProvider(PROFILE_SERVICE, {
      useValue: makeProfileStub({
        isFollowingCompetition$: (_userId: string, compId: string) =>
          of(compId === 'ucl'),
      }),
    });
    const fixture = TestBed.createComponent(CompetitionList);
    fixture.detectChanges();

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      'button.competition-list__follow'
    );
    expect(buttons[0].textContent?.trim()).toBe('Following');
    expect(buttons[1].textContent?.trim()).toBe('Follow');
  });

  it('calls followCompetition when clicking an unfollowed competition', () => {
    const profileStub = makeProfileStub();
    const followSpy = jest.spyOn(profileStub, 'followCompetition').mockReturnValue(of(void 0));
    TestBed.overrideProvider(PROFILE_SERVICE, { useValue: profileStub });

    const fixture = TestBed.createComponent(CompetitionList);
    fixture.detectChanges();

    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      'button.competition-list__follow'
    );
    buttons[0].click();

    expect(followSpy).toHaveBeenCalledWith('u-test', expect.objectContaining({ id: 'ucl' }));
  });
});
