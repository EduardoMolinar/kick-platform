import { isPlatformBrowser } from '@angular/common';
import { Injectable, InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  fromEvent,
  map,
  of,
  startWith,
} from 'rxjs';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeService {
  /** The user's chosen mode, including 'system'. */
  readonly mode$: Observable<ThemeMode>;
  /** What's actually applied to the DOM right now, after resolving 'system'. */
  readonly resolved$: Observable<ResolvedTheme>;
  setMode(mode: ThemeMode): void;
}

export const THEME_SERVICE = new InjectionToken<ThemeService>('THEME_SERVICE');

const STORAGE_KEY = 'pitch-theme';
const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

@Injectable({ providedIn: 'root' })
export class BrowserThemeService implements ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly mode = new BehaviorSubject<ThemeMode>(this.readStoredMode());
  readonly mode$ = this.mode.asObservable();

  private readonly systemDark$: Observable<boolean> = this.isBrowser
    ? this.makeSystemDark$()
    : of(true);

  readonly resolved$: Observable<ResolvedTheme> = combineLatest([
    this.mode$,
    this.systemDark$,
  ]).pipe(
    map(([mode, sysDark]) =>
      mode === 'system' ? (sysDark ? 'dark' : 'light') : mode
    )
  );

  constructor() {
    if (this.isBrowser) {
      this.resolved$.subscribe((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
      });
    }
  }

  setMode(mode: ThemeMode): void {
    if (this.isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // Ignore — private mode or storage disabled.
      }
    }
    this.mode.next(mode);
  }

  private readStoredMode(): ThemeMode {
    if (!this.isBrowser) return 'dark';
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'dark' || v === 'light' || v === 'system' ? v : 'dark';
    } catch {
      return 'dark';
    }
  }

  private makeSystemDark$(): Observable<boolean> {
    const mql = window.matchMedia(SYSTEM_DARK_QUERY);
    return fromEvent<MediaQueryListEvent>(mql, 'change').pipe(
      map((e) => e.matches),
      startWith(mql.matches)
    );
  }
}
