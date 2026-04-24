import { TestBed } from '@angular/core/testing';
import { AUTH_SERVICE, type AuthService } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import { of } from 'rxjs';
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
});
