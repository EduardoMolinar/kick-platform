const { withModuleFederation } = require('@nx/angular/module-federation');
const config = require('./module-federation.config');

/**
 * Shell webpack config — wraps the base Angular webpack config with
 * Module Federation (host mode, dynamic remotes via manifest).
 *
 * NX_TSCONFIG_PATH is set by @nx/angular:webpack-browser and points to
 * a generated tsconfig that remaps buildable lib paths.
 */
module.exports = withModuleFederation(config);
