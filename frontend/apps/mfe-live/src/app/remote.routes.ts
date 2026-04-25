import { Routes } from '@angular/router';
import { MockProfileService, PROFILE_SERVICE } from '@platform/profile';
import { MockSportsDataService, SPORTS_DATA_SERVICE } from '@platform/sports-data';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [
      { provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService },
      { provide: PROFILE_SERVICE, useExisting: MockProfileService },
    ],
    loadComponent: () => import('./live-now/live-now').then((m) => m.LiveNow),
  },
];
