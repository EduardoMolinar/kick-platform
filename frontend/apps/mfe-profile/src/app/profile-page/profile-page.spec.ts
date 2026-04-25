import { TestBed } from '@angular/core/testing';
import { AUTH_SERVICE, type AuthService } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import { BehaviorSubject, of } from 'rxjs';
import { ProfilePage } from './profile-page';

const stubUser = { userId: 'u-demo-001', displayName: 'Demo User', email: 'demo@platform.local' };

function makeAuthStub(overrides: Partial<AuthService> = {}): AuthService {
  return {
    currentUser$: of(stubUser),
    isAuthenticated$: of(true),
    ...overrides,
  };
}

function makeProfileStub(overrides: Partial<ProfileService> = {}): ProfileService {
  return {
    getFavoriteTeams: () => of([
      { id: 't-ars', name: 'Arsenal', shortName: 'ARS' },
      { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' },
    ]),
    getFavoriteCompetitions: () => of([
      { id: 'ucl', name: 'Champions League', code: 'UCL' },
    ]),
    isFollowingTeam$: () => of(false),
    isFollowingCompetition$: () => of(false),
    followTeam: () => of(void 0),
    unfollowTeam: () => of(void 0),
    followCompetition: () => of(void 0),
    unfollowCompetition: () => of(void 0),
    ...overrides,
  };
}

describe('ProfilePage', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders team tiles and competition tile for seeded user', async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        { provide: PROFILE_SERVICE, useValue: makeProfileStub() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();

    const teamTiles = fixture.nativeElement.querySelectorAll('mfe-profile-team-tile');
    expect(teamTiles.length).toBe(2);
    const compTiles = fixture.nativeElement.querySelectorAll('mfe-profile-competition-tile');
    expect(compTiles.length).toBe(1);
  });

  it('renders empty-state copy when user has no favorites', async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        {
          provide: PROFILE_SERVICE,
          useValue: makeProfileStub({
            getFavoriteTeams: () => of([]),
            getFavoriteCompetitions: () => of([]),
          }),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain("You don't follow any teams yet.");
    expect(text).toContain("You don't follow any competitions yet.");
  });

  it('calls unfollowTeam when clicking Remove on a team tile', async () => {
    const profileStub = makeProfileStub();
    const unfollowSpy = jest.spyOn(profileStub, 'unfollowTeam').mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        { provide: PROFILE_SERVICE, useValue: profileStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();

    const removeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.team-tile__unfollow');
    expect(removeBtn).toBeTruthy();
    removeBtn.click();

    expect(unfollowSpy).toHaveBeenCalledWith('u-demo-001', 't-ars');
  });

  it('tile list shrinks when getFavoriteTeams emits fewer items after unfollow', async () => {
    const teams$ = new BehaviorSubject([
      { id: 't-ars', name: 'Arsenal', shortName: 'ARS' },
      { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' },
    ]);

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        {
          provide: PROFILE_SERVICE,
          useValue: makeProfileStub({ getFavoriteTeams: () => teams$.asObservable() }),
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('mfe-profile-team-tile').length).toBe(2);

    teams$.next([{ id: 't-rma', name: 'Real Madrid', shortName: 'RMA' }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('mfe-profile-team-tile').length).toBe(1);
  });

  it('calls unfollowCompetition when clicking Remove on a competition tile', async () => {
    const profileStub = makeProfileStub();
    const unfollowSpy = jest.spyOn(profileStub, 'unfollowCompetition').mockReturnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AUTH_SERVICE, useValue: makeAuthStub() },
        { provide: PROFILE_SERVICE, useValue: profileStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();

    const removeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('button.competition-tile__unfollow');
    expect(removeBtn).toBeTruthy();
    removeBtn.click();

    expect(unfollowSpy).toHaveBeenCalledWith('u-demo-001', 'ucl');
  });
});
