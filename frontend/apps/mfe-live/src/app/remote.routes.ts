import { Routes } from '@angular/router';

export const remoteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./live-now/live-now').then((m) => m.LiveNow),
  },
];
