import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * AppComponent — top-level host component.
 *
 * Intentionally minimal: it only renders the router outlet.
 * The actual shell chrome (sidebar, topbar) lives in ShellLayoutComponent,
 * which is mounted as a layout route wrapping all authenticated routes.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {}
