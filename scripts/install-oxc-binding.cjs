#!/usr/bin/env node
/**
 * Installs the platform-specific @oxc-parser/binding-* package required by
 * the transitive oxc-parser@0.8.0 (pulled in via @angular-architects/native-federation).
 *
 * Why this exists:
 *   oxc-parser@0.8.0 lists its native bindings as optionalDependencies, but the
 *   binding packages publish `libc: [null]` in their package.json. Modern npm
 *   (10+) interprets `libc: [null]` as "must match libc=null", which never
 *   matches any real system, so npm skips them on every platform. The bindings
 *   never end up in node_modules, and Native Federation builds fail at runtime
 *   with "Cannot find module '@oxc-parser/binding-...'".
 *
 *   This script side-steps the broken filter by installing the matching binding
 *   for the current platform using `--force --ignore-scripts`.
 *
 *   --ignore-scripts breaks the recursion (the nested install won't re-trigger
 *   this postinstall). --no-save --no-package-lock keeps the operation
 *   invisible to the lockfile so it doesn't drift between platforms.
 */

const { execSync } = require('node:child_process');

const OXC_VERSION = '0.8.0';

const platformMap = {
  'win32-x64': '@oxc-parser/binding-win32-x64-msvc',
  'win32-arm64': '@oxc-parser/binding-win32-arm64-msvc',
  'darwin-x64': '@oxc-parser/binding-darwin-x64',
  'darwin-arm64': '@oxc-parser/binding-darwin-arm64',
  'linux-x64': '@oxc-parser/binding-linux-x64-gnu',
  'linux-arm64': '@oxc-parser/binding-linux-arm64-gnu',
};

const key = `${process.platform}-${process.arch}`;
const pkg = platformMap[key];

if (!pkg) {
  console.warn(`[install-oxc-binding] No binding mapped for ${key}; skipping`);
  process.exit(0);
}

try {
  require.resolve(pkg);
  process.exit(0);
} catch {
  // not installed; fall through
}

console.log(`[install-oxc-binding] Installing ${pkg}@${OXC_VERSION} for ${key}`);
try {
  execSync(
    `npm install --no-save --no-package-lock --force --ignore-scripts ${pkg}@${OXC_VERSION}`,
    { stdio: 'inherit' },
  );
} catch (e) {
  console.error(`[install-oxc-binding] Failed: ${e.message}`);
  process.exit(1);
}
