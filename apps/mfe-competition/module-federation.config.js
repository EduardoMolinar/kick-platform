/**
 * mfe-competition Module Federation config — remote.
 *
 * Exposes './Routes' so the shell can load COMPETITION_ROUTES via:
 *   loadRemoteModule('mfe-competition', './Routes').then(m => m.COMPETITION_ROUTES)
 */
module.exports = {
  name: 'mfe-competition',
  exposes: {
    './Routes': 'apps/mfe-competition/src/app/remote.routes.ts',
  },
};
