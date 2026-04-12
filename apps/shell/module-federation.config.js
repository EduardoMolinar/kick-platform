/**
 * Shell Module Federation config — host (dynamic federation).
 *
 * Remotes are NOT listed here. They are loaded at runtime from:
 *   src/assets/module-federation.manifest.json
 *
 * To add a remote at dev time, add it to the manifest and call
 * setRemoteDefinitions() before bootstrapping (already done in main.ts).
 */
module.exports = {
  name: 'shell',
  remotes: [],
};
