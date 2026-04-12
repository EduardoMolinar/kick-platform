import { Component } from '@angular/core';
import { type Routes } from '@angular/router';

/**
 * Placeholder profile page component.
 * Replace with real domain components as mfe-profile is developed.
 */
@Component({
  selector: 'app-profile-page',
  standalone: true,
  template: `
    <div style="padding: 2rem">
      <h1>Profile</h1>
      <p>User profile, favorite teams, and leagues coming soon.</p>
    </div>
  `,
})
class ProfilePageComponent {}

/**
 * PROFILE_ROUTES — exposed via './Routes' to the shell.
 * Shell loads this via:
 *   loadRemoteModule('mfe-profile', './Routes').then(m => m.PROFILE_ROUTES)
 */
export const PROFILE_ROUTES: Routes = [
  { path: '', component: ProfilePageComponent },
];
