import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AvatarComponent, IconComponent } from '@kick/design-system';
import type { IconName } from '@kick/design-system';
import { AuthService } from '@kick/auth';

interface NavItem {
  label: string;
  icon: IconName;
  path: string;
}

/**
 * ShellLayoutComponent — persistent chrome wrapping all authenticated routes.
 *
 * Layout: CSS grid with a collapsible sidebar (collapses to icons at ≤860 px)
 * and a topbar. The main content area hosts the router outlet where MFE routes
 * are rendered.
 *
 * Auth state is read from AuthService signals — no subscriptions needed.
 */
@Component({
  selector: 'app-shell-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgFor,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    IconComponent,
    AvatarComponent,
  ],
  templateUrl: './shell-layout.component.html',
  styleUrls: ['./shell-layout.component.scss'],
})
export class ShellLayoutComponent {
  protected readonly auth = inject(AuthService);

  protected readonly navItems: NavItem[] = [
    { label: 'Home',         icon: 'home',   path: '/home' },
    { label: 'Live',         icon: 'live',   path: '/live' },
    { label: 'Competitions', icon: 'trophy', path: '/competition' },
    { label: 'Teams',        icon: 'users',  path: '/team' },
    { label: 'Profile',      icon: 'user',   path: '/profile' },
  ];

  /** Single initial derived from the session userId — no profile API needed in Phase 1. */
  protected readonly userInitials = computed(() => {
    const session = this.auth.session();
    return session ? session.userId.charAt(0).toUpperCase() : '';
  });
}
