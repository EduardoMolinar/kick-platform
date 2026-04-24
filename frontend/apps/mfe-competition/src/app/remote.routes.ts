import { Routes } from '@angular/router';
import { MockSportsDataService, SPORTS_DATA_SERVICE } from '@platform/sports-data';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [{ provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService }],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./competition-list/competition-list').then((m) => m.CompetitionList),
      },
      {
        path: ':competitionId',
        loadComponent: () =>
          import('./competition-detail/competition-detail').then((m) => m.CompetitionDetail),
      },
    ],
  },
];
