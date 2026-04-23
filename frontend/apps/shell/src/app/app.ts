import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsTopNav, DsTopNavItem } from '@platform/design-system';

@Component({
  imports: [RouterOutlet, DsTopNav],
  selector: 'app-root',
  standalone: true,
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
}
