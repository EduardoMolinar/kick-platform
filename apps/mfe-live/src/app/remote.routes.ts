import { Component } from '@angular/core';
import { type Routes } from '@angular/router';

/**
 * Placeholder live page component.
 * Replace with real domain components as mfe-live is developed.
 */
@Component({
  selector: 'app-live-page',
  standalone: true,
  template: `
    <div style="padding: 2rem">
      <h1>Live</h1>
      <p>Live match scores and stats coming soon.</p>
    </div>
  `,
})
class LivePageComponent {}

/**
 * LIVE_ROUTES — exposed via './Routes' to the shell.
 * Shell loads this via:
 *   loadRemoteModule('mfe-live', './Routes').then(m => m.LIVE_ROUTES)
 */
export const LIVE_ROUTES: Routes = [
  { path: '', component: LivePageComponent },
];
