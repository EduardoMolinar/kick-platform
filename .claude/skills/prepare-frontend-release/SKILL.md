---
name: prepare-frontend-release
description: Prepare a frontend release for shell or remotes. Use when cutting a release, updating CircleCI, validating artifact paths, confirming CloudFront invalidation scope, or documenting rollout and rollback steps.
compatibility: Designed for Claude Code on CloudFront/S3 frontend deployments with CircleCI.
---

# Goal

Produce a clear release plan with minimal blast radius and obvious rollback.

# Process

1. Identify the release unit.
   - shell
   - one remote
   - multiple remotes
   - manifest/config only

2. Confirm artifact path and deployment target.
3. Confirm whether shell rebuild is required.
4. Confirm cache-sensitive files.
   - shell entry
   - remote entry or manifest
   - immutable hashed assets

5. Prepare rollout notes.
   - what changes
   - expected user-visible impact
   - validation checks after deploy

6. Prepare rollback notes.
   - what to revert
   - what to invalidate
   - what should remain untouched

# Output expectations

Always include:
- release unit
- artifact path(s)
- invalidation scope
- validation checklist
- rollback steps
