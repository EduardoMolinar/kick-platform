import { Routes } from '@angular/router';
import { AUTH_SERVICE, MockAuthService } from '@platform/auth';
import { BrowserThemeService, THEME_SERVICE } from '@platform/design-system';
import { MockProfileService, PROFILE_SERVICE } from '@platform/profile';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [
      { provide: AUTH_SERVICE, useExisting: MockAuthService },
      { provide: THEME_SERVICE, useExisting: BrowserThemeService },
      { provide: PROFILE_SERVICE, useExisting: MockProfileService },
    ],
    loadComponent: () =>
      import('./profile-page/profile-page').then((m) => m.ProfilePage),
  },
];
