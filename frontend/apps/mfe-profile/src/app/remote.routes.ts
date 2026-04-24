import { Routes } from '@angular/router';
import { MockProfileService, PROFILE_SERVICE } from '@platform/profile';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [{ provide: PROFILE_SERVICE, useExisting: MockProfileService }],
    loadComponent: () =>
      import('./profile-page/profile-page').then((m) => m.ProfilePage),
  },
];
