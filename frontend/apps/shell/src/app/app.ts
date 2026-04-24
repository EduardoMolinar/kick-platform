import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AUTH_SERVICE } from '@platform/auth';
import type { AuthSession } from '@platform/auth';
import { DsTopNav, DsTopNavItem } from '@platform/design-system';
import type { Observable } from 'rxjs';

@Component({
  imports: [RouterOutlet, DsTopNav, AsyncPipe],
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly navItems: readonly DsTopNavItem[] = [
    { label: 'Home', path: '/home' },
    { label: 'Live', path: '/live' },
    { label: 'Competitions', path: '/competition' },
    { label: 'Teams', path: '/team' },
    { label: 'Profile', path: '/profile' },
  ];

  protected readonly currentUser$: Observable<AuthSession | null> =
    inject(AUTH_SERVICE).currentUser$;
}
