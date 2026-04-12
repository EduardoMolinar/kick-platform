---
name: implement-profile-favorites
description: Implement or change user profile, favorite teams, or favorite leagues. Use when building follow/unfollow flows, profile screens, personalized feeds, or backend contracts tied to user preferences.
compatibility: Designed for Claude Code on a sports app with backend-owned profile state.
---

# Goal

Implement favorites and profile behavior coherently across frontend and backend.

# Process

1. Confirm the source of truth is backend-owned.
2. Identify the full flow:
   - read profile
   - add favorite
   - remove favorite
   - refresh personalized views
3. Keep frontend state synchronized with backend truth.
4. Do not let remotes invent different follow/favorite rules.
5. Consider invalidation:
   - personalized home
   - followed competitions
   - followed teams
6. Validate optimistic vs non-optimistic behavior explicitly.
7. Summarize impact on profile-api, cache invalidation, and frontend personalization.

# Output expectations

Always include:
- backend contract touched
- invalidation behavior
- profile/favorites UX behavior
- validation steps
