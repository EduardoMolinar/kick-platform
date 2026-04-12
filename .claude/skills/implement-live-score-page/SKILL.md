---
name: implement-live-score-page
description: Implement or modify a live score or live stats page. Use when building match cards, live events, scoreboards, competition live views, or polling/refresh behavior for football data.
compatibility: Designed for Claude Code on a live soccer frontend with backend-mediated sports data.
---

# Goal

Build a live match experience that is responsive, correct enough, and maintainable.

# Process

1. Identify the page ownership.
   - home live widget
   - dedicated live remote
   - competition-specific live view

2. Confirm the data contract.
   - score state
   - match status
   - stats blocks
   - standings dependency if any
   - provider normalization assumptions

3. Keep backend as the source for provider data.
4. Use frontend in-memory cache only for short-lived navigation smoothing.
5. Make refresh behavior explicit.
   - polling cadence
   - focus regain behavior
   - TTL or stale indicator
6. Show last-updated or equivalent trust indicator when appropriate.
7. Validate route behavior, empty states, and loading transitions.

# Output expectations

Always include:
- data contract touched
- refresh behavior
- cache behavior
- user-visible trust/freshness notes
