/**
 * mfe-team Module Federation config — remote.
 *
 * Exposes './Routes' so the shell can load TEAM_ROUTES via:
 *   loadRemoteModule('mfe-team', './Routes').then(m => m.TEAM_ROUTES)
 */
module.exports = {
  name: 'mfe-team',
  exposes: {
    './Routes': 'apps/mfe-team/src/app/remote.routes.ts',
  },
};
