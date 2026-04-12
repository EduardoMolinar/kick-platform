import { type Routes } from '@angular/router';
import { loadRemoteModule } from '@nx/angular/mf';
import { authGuard } from '@kick/auth';
import { ShellLayoutComponent } from './shell-layout/shell-layout.component';

/**
 * Top-level routes.
 *
 * Layout route:  '/'   → ShellLayoutComponent (guarded)
 *   Children are the domain MFE routes, lazy-loaded via Module Federation.
 *   Each child resolves from its remote's exposed './Routes' file.
 *
 * Auth route:    '/login' → LoginComponent (unguarded)
 *
 * Catch-all redirects to root, which redirects to /home.
 *
 * NOTE: loadRemoteModule() will throw if the remote is not running.
 * Phase 1 validation only requires the shell to load; remote errors
 * at runtime are expected until each MFE is scaffolded.
 */
export const appRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: ShellLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadChildren: () =>
          loadRemoteModule('mfe-home', './Routes').then((m) => m.HOME_ROUTES),
      },
      {
        path: 'live',
        loadChildren: () =>
          loadRemoteModule('mfe-live', './Routes').then((m) => m.LIVE_ROUTES),
      },
      {
        path: 'competition',
        loadChildren: () =>
          loadRemoteModule('mfe-competition', './Routes').then(
            (m) => m.COMPETITION_ROUTES,
          ),
      },
      {
        path: 'team',
        loadChildren: () =>
          loadRemoteModule('mfe-team', './Routes').then((m) => m.TEAM_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          loadRemoteModule('mfe-profile', './Routes').then(
            (m) => m.PROFILE_ROUTES,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
