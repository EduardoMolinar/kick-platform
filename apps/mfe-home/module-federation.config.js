/**
 * mfe-home Module Federation config — remote.
 *
 * Exposes './Routes' so the shell can load HOME_ROUTES via:
 *   loadRemoteModule('mfe-home', './Routes').then(m => m.HOME_ROUTES)
 */
module.exports = {
  name: 'mfe-home',
  exposes: {
    './Routes': 'apps/mfe-home/src/app/remote.routes.ts',
  },
};
