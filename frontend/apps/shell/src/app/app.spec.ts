import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AUTH_SERVICE } from '@platform/auth';
import { THEME_SERVICE, type ThemeService } from '@platform/design-system';
import { BehaviorSubject, of } from 'rxjs';
import { App } from './app';

const stubUser = { userId: 'x', displayName: 'Jamie', email: 'j@x.test' };

function makeThemeStub(): ThemeService {
  const mode = new BehaviorSubject<'dark' | 'light' | 'system'>('dark');
  return {
    mode$: mode.asObservable(),
    resolved$: of('dark' as const),
    setMode: (m) => mode.next(m),
  };
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: AUTH_SERVICE,
          useValue: { currentUser$: of(stubUser), isAuthenticated$: of(true) },
        },
        { provide: THEME_SERVICE, useValue: makeThemeStub() },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the signed-in greeting', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Hi, Jamie');
  });

  it('renders the theme toggle', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('ds-theme-toggle');
    expect(toggle).toBeTruthy();
  });
});
