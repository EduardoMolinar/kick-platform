---
name: scaffold-new-remote
description: Scaffold a new Angular micro-frontend remote correctly. Use when adding a new domain area such as live, competition, team, or profile while preserving shell and remote boundaries.
compatibility: Designed for Claude Code on an Angular + Nx micro-frontend repo.
---

# Goal

Add a new remote with correct ownership, routing, naming, and deployment expectations.

# Process

1. Confirm the domain and ownership.
2. Choose naming that aligns with existing remote conventions.
3. Add top-level route ownership in shell only.
4. Keep the new remote self-contained.
5. Create only the shared-library dependencies that are truly cross-cutting.
6. Add validations:
   - affected lint
   - targeted build
   - local route verification
7. Summarize release impact:
   - manifest change?
   - shell route change?
   - remote-only deployment or not?

# Output expectations

Always include:
- remote name
- route prefix
- shared library dependencies introduced
- deployment implications
