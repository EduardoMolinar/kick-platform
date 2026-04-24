import { Routes } from '@angular/router';
import { MockSportsDataService, SPORTS_DATA_SERVICE } from '@platform/sports-data';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [{ provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService }],
    loadComponent: () => import('./live-now/live-now').then((m) => m.LiveNow),
  },
];
