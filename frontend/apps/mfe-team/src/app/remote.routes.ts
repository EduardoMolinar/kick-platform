import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { AUTH_SERVICE, MockAuthService } from '@platform/auth';
import { MockProfileService, PROFILE_SERVICE } from '@platform/profile';
import {
  HttpSportsDataService,
  MockSportsDataService,
  SPORTS_DATA_API_BASE_URL,
  SPORTS_DATA_SERVICE,
} from '@platform/sports-data';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [
      { provide: AUTH_SERVICE, useExisting: MockAuthService },
      { provide: PROFILE_SERVICE, useExisting: MockProfileService },
      {
        provide: SPORTS_DATA_SERVICE,
        useFactory: () => {
          const baseUrl = inject(SPORTS_DATA_API_BASE_URL, { optional: true });
          return baseUrl ? inject(HttpSportsDataService) : inject(MockSportsDataService);
        },
      },
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
