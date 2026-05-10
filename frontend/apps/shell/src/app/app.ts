import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AUTH_SERVICE } from '@platform/auth';
import type { AuthSession } from '@platform/auth';
import {
  DsThemeToggle,
  DsTopNav,
  DsTopNavItem,
  THEME_SERVICE,
  ThemeMode,
} from '@platform/design-system';
import type { Observable } from 'rxjs';

@Component({
  imports: [RouterOutlet, DsTopNav, DsThemeToggle, AsyncPipe],
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly theme = inject(THEME_SERVICE);

  protected readonly navItems: readonly DsTopNavItem[] = [
    { label: 'Home', path: '/home' },
    { label: 'Live', path: '/live' },
    { label: 'Competitions', path: '/competition' },
    { label: 'Teams', path: '/team' },
    { label: 'Profile', path: '/profile' },
  ];

  protected readonly currentUser$: Observable<AuthSession | null> =
    inject(AUTH_SERVICE).currentUser$;

  protected readonly themeMode$: Observable<ThemeMode> = this.theme.mode$;

  protected onThemeChange(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }
}
