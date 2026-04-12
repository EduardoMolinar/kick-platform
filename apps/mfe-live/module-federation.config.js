/**
 * mfe-live Module Federation config — remote.
 *
 * Exposes './Routes' so the shell can load LIVE_ROUTES via:
 *   loadRemoteModule('mfe-live', './Routes').then(m => m.LIVE_ROUTES)
 */
module.exports = {
  name: 'mfe-live',
  exposes: {
    './Routes': 'apps/mfe-live/src/app/remote.routes.ts',
  },
};
