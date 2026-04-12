---
name: build-design-system-foundation
description: Build or extend the foundation of the design system. Use when creating tokens, primitives, layout patterns, typography, icon strategy, theming, Storybook baseline, or first-class reusable components.
compatibility: Designed for Claude Code on Angular repos with a design system built from scratch.
---

# Goal

Create a scalable, modern design-system foundation rather than one-off reusable pieces.

# Process

1. Decide the ownership layer:
   - tokens
   - primitives
   - composite components
   - product-specific UI

2. Start with semantics, not raw visual values.
   - spacing
   - color roles
   - typography roles
   - surface and border semantics
   - motion rules if applicable

3. Design public APIs carefully.
   - avoid prop explosion
   - avoid arbitrary style flags
   - favor clear variants and composition

4. Check accessibility from the start.
5. Add or update Storybook stories for reusable components.
6. Document any pattern that should become a standard.

# Output expectations

Always include:
- ownership layer
- tokens or primitives added/changed
- accessibility notes
- Storybook impact
