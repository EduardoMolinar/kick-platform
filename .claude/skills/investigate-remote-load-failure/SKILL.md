---
name: investigate-remote-load-failure
description: Debug a micro-frontend that fails to load, route, or bootstrap. Use when a shell cannot load a remote, remoteEntry fails, a route 404s, or dev/prod pathing behaves differently.
compatibility: Designed for Claude Code on Angular micro-frontend repos using shell and remotes.
---

# Goal

Find the failing layer quickly and fix the smallest root cause.

# Debug order

1. Confirm which runtime path is failing.
   - local dev
   - shell route
   - remoteEntry fetch
   - asset path
   - route mount
   - build artifact path
   - CloudFront path

2. Check the contract.
   - shell route definition
   - remote exposure name
   - manifest or remote mapping
   - deployment prefix/path

3. Check environment mismatch.
   - local path vs deployed path
   - base href / deploy URL / public path assumptions
   - stale remoteEntry or manifest caching

4. Validate with the narrowest repro.
   - browser network traces
   - local serve
   - targeted build
   - direct artifact inspection

5. Fix the ownership layer that is actually broken.
   - shell config
   - remote config
   - manifest
   - CI/deploy path
   - CloudFront invalidation

# Output expectations

Always include:
- exact failing layer
- root cause
- fix
- whether local, CI, or production config also needs updating
