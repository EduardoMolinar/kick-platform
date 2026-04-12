import { Component } from '@angular/core';
import { type Routes } from '@angular/router';

/**
 * Placeholder home page component.
 * Replace with real domain components as mfe-home is developed.
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <div style="padding: 2rem">
      <h1>Home</h1>
      <p>Match feed and personalized content coming soon.</p>
    </div>
  `,
})
class HomePageComponent {}

/**
 * HOME_ROUTES — exposed via './Routes' to the shell.
 * Shell loads this via:
 *   loadRemoteModule('mfe-home', './Routes').then(m => m.HOME_ROUTES)
 */
export const HOME_ROUTES: Routes = [
  { path: '', component: HomePageComponent },
];
