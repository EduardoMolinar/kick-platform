/**
 * Default (development) environment.
 *
 * `sportsApiBaseUrl` is empty here, which signals the remotes' `useFactory`
 * provider in remote.routes.ts to bind `MockSportsDataService`. Mock data flows.
 *
 * For production, this file is replaced with `environment.prod.ts` via the
 * `fileReplacements` entry in `frontend/apps/shell/project.json` esbuild config.
 */
export const environment = {
  production: false,
  sportsApiBaseUrl: 'https://ulcojhxgj5.execute-api.us-east-1.amazonaws.com',
};
