import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AUTH_SERVICE } from '@platform/auth';
import { of } from 'rxjs';
import { App } from './app';

const stubUser = { userId: 'x', displayName: 'Jamie', email: 'j@x.test' };

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AUTH_SERVICE, useValue: { currentUser$: of(stubUser), isAuthenticated$: of(true) } },
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
});
