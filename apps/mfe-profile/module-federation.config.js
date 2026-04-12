/**
 * mfe-profile Module Federation config — remote.
 *
 * Exposes './Routes' so the shell can load PROFILE_ROUTES via:
 *   loadRemoteModule('mfe-profile', './Routes').then(m => m.PROFILE_ROUTES)
 */
module.exports = {
  name: 'mfe-profile',
  exposes: {
    './Routes': 'apps/mfe-profile/src/app/remote.routes.ts',
  },
};
