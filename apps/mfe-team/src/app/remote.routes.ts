import { Component } from '@angular/core';
import { type Routes } from '@angular/router';

/**
 * Placeholder team page component.
 * Replace with real domain components as mfe-team is developed.
 */
@Component({
  selector: 'app-team-page',
  standalone: true,
  template: `
    <div style="padding: 2rem">
      <h1>Team</h1>
      <p>Team squad, stats, and fixtures coming soon.</p>
    </div>
  `,
})
class TeamPageComponent {}

/**
 * TEAM_ROUTES — exposed via './Routes' to the shell.
 * Shell loads this via:
 *   loadRemoteModule('mfe-team', './Routes').then(m => m.TEAM_ROUTES)
 */
export const TEAM_ROUTES: Routes = [
  { path: '', component: TeamPageComponent },
];
