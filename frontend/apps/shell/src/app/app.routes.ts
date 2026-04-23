import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

const loadRemote = (remoteName: string) =>
  loadRemoteModule({ remoteName, exposedModule: './Routes' }).then(
    (m) => m.remoteRoutes
  );

export const appRoutes: Route[] = [
  { path: 'home', loadChildren: () => loadRemote('mfe-home') },
  { path: 'live', loadChildren: () => loadRemote('mfe-live') },
  { path: 'competition', loadChildren: () => loadRemote('mfe-competition') },
  { path: 'team', loadChildren: () => loadRemote('mfe-team') },
  { path: 'profile', loadChildren: () => loadRemote('mfe-profile') },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
