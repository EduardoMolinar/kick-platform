import { setRemoteDefinitions } from '@nx/angular/mf';

/**
 * Dynamic Module Federation bootstrap.
 *
 * 1. Fetch the manifest — maps remote names to their remoteEntry URLs.
 * 2. Register those definitions so loadRemoteModule() can resolve them.
 * 3. Import bootstrap.ts, which triggers Angular's bootstrapApplication().
 *
 * This two-file split (main → bootstrap) is required by webpack's module
 * federation: shared singletons must be initialized before the Angular
 * bootstrap runs, and the dynamic import boundary ensures that.
 */
fetch('/assets/module-federation.manifest.json')
  .then((res) => res.json())
  .then((definitions) => setRemoteDefinitions(definitions))
  .then(() => import('./bootstrap').catch((err) => console.error(err)));
