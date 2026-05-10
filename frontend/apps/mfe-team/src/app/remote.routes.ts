import { Routes } from '@angular/router';
import { AUTH_SERVICE, MockAuthService } from '@platform/auth';
import { MockProfileService, PROFILE_SERVICE } from '@platform/profile';
import { MockSportsDataService, SPORTS_DATA_SERVICE } from '@platform/sports-data';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [
      { provide: AUTH_SERVICE, useExisting: MockAuthService },
      { provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService },
      { provide: PROFILE_SERVICE, useExisting: MockProfileService },
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./team-list/team-list').then((m) => m.TeamList),
      },
      {
        path: ':teamId',
        loadComponent: () =>
          import('./team-detail/team-detail').then((m) => m.TeamDetail),
      },
    ],
  },
];
