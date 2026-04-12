import { Component } from '@angular/core';
import { type Routes } from '@angular/router';

/**
 * Placeholder competition page component.
 * Replace with real domain components as mfe-competition is developed.
 */
@Component({
  selector: 'app-competition-page',
  standalone: true,
  template: `
    <div style="padding: 2rem">
      <h1>Competition</h1>
      <p>Standings, fixtures, and competition details coming soon.</p>
    </div>
  `,
})
class CompetitionPageComponent {}

/**
 * COMPETITION_ROUTES — exposed via './Routes' to the shell.
 * Shell loads this via:
 *   loadRemoteModule('mfe-competition', './Routes').then(m => m.COMPETITION_ROUTES)
 */
export const COMPETITION_ROUTES: Routes = [
  { path: '', component: CompetitionPageComponent },
];
