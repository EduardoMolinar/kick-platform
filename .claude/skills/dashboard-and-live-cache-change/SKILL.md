---
name: dashboard-and-live-cache-change
description: Change caching behavior for dashboard or live sports data. Use when adjusting frontend in-memory caching, Redis TTL strategy, invalidation triggers, or freshness indicators for live football views.
compatibility: Designed for Claude Code on a sports app with Redis backend caching and short-lived frontend memory caching.
---

# Goal

Improve performance without undermining user trust or correctness.

# Process

1. Identify the cache layer being changed.
   - frontend in-memory
   - backend Redis
   - both
2. Classify the data:
   - live score
   - match stats
   - standings
   - profile-driven dashboard
3. Decide acceptable staleness.
4. Define invalidation triggers explicitly.
5. Preserve security-sensitive behavior:
   - no sensitive persistence in browser
   - backend remains source of truth
6. Surface freshness to the user when it matters.

# Output expectations

Always include:
- cache layer(s) changed
- TTL or freshness policy
- invalidation triggers
- user-visible trust implications
