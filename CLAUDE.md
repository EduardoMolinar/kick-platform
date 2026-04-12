# Project: Live Soccer Scores & Stats Platform

This repository contains an Angular micro-frontend platform for live soccer scores, fixtures, standings, match stats, and user personalization.

## Product scope

Primary competitions in scope:
- UEFA Champions League
- La Liga
- Premier League
- International football

Core product capabilities:
- Live match results
- Live match stats
- Fixtures and standings
- Team and competition pages
- User profile
- Follow favorite teams and leagues
- Notifications-ready architecture (future)
- Design system built from scratch in this repo

## Architecture goals

- One coherent web application for users
- Independently deployable frontend domains
- Strong design-system consistency
- Secure session handling
- Backend-mediated access to external sports APIs
- Scalable caching for live and read-heavy data
- Maintainable CI/CD with clear release units

## Frontend architecture

We use an Nx monorepo with Angular standalone components only.

High-level ownership:
- Shell owns global layout, app shell, top-level navigation, auth bootstrap, and runtime composition.
- Remotes own domain routes, domain state, and domain UI flows.
- Shared libraries own cross-cutting code only.

Target app structure:
- apps/shell
- apps/mfe-home
- apps/mfe-live
- apps/mfe-competition
- apps/mfe-team
- apps/mfe-profile

Target shared library structure:
- libs/design-system
- libs/auth
- libs/sports-data
- libs/profile
- libs/shared-ui
- libs/shared-types
- libs/shared-utils

Rules:
- No cross-remote imports.
- No NgModules. Standalone Angular only.
- Shared libraries must remain small, explicit, and stable.
- Domain-specific code stays in the owning remote unless it is clearly cross-cutting.
- Do not introduce hidden shell-to-remote or remote-to-remote coupling.

## Design system rules

We are building the design system from scratch.

Rules:
- Treat the design system as a product, not a folder of reusable leftovers.
- Public component APIs must be minimal and stable.
- Accessibility is required.
- New reusable UI patterns belong in the design system or shared UI layer, not scattered across remotes.
- Storybook stories are expected for reusable components.
- Prefer design tokens and semantic primitives over hardcoded visual values.
- Use standalone components only.
- Prefer OnPush for reusable components unless there is a specific reason not to.

## Sports data strategy

All third-party sports data calls go through the backend.

Do not:
- call third-party sports APIs directly from the browser
- expose sports API keys in frontend code
- build frontend logic that depends on provider-specific response shapes if a normalized backend contract can be used instead

Preferred approach:
- API Gateway -> ECS/Fargate service(s) -> provider adapter layer -> Redis cache -> frontend
- Normalize provider responses in backend
- Expose frontend contracts that are provider-agnostic
- Keep provider-specific mapping logic out of remotes

Initial provider candidates to evaluate:
- football-data.org
- API-Football

Selection criteria:
- coverage for Champions League, La Liga, Premier League, and international fixtures
- live data freshness
- free-tier viability for early stages
- terms of use and production suitability
- quota behavior
- reliability and schema consistency

## Backend assumptions

Current backend direction:
- API Gateway in front
- ECS on Fargate for API services
- Redis for shared backend caching
- DynamoDB for profile/favorites persistence
- Read-only frontend consumption through backend APIs

Preferred service split:
- sports-api service
- profile-api service
- optional BFF aggregation layer if needed for frontend simplification

Profile domain:
- user profile
- favorite teams
- favorite leagues
- personalization preferences

DynamoDB guidance:
- Keep user profile and favorites schemas simple and access-pattern driven.
- Prefer keys designed around user-centric reads such as profile-by-user and favorites-by-user.
- Avoid leaking DynamoDB-specific shapes into frontend contracts.
- Use backend services to map DynamoDB records into frontend-ready DTOs.

## Cache rules

Backend cache is authoritative for shared and expensive read data.

Redis use:
- live score/stats responses
- fixtures/standings snapshots
- normalized provider responses
- short-lived shared dashboard payloads

Frontend cache rules:
- frontend may use short-lived in-memory cache only
- do not persist sensitive session data in localStorage
- do not persist live sports data in localStorage by default
- if browser persistence is used for preferences, keep it limited to non-sensitive UX state

Invalidate frontend in-memory caches when:
- user changes followed teams/leagues
- a write changes profile-driven personalization
- TTL expires
- app regains focus after TTL expiry for live views

## Auth and profile rules

Auth/session rules:
- do not persist sensitive tokens in localStorage
- prefer secure cookies for session continuity where applicable
- keep access-token-like state memory-resident on the client
- shell/shared auth layer is the source of truth for auth bootstrap
- remotes consume shared session state instead of inventing their own auth logic

Profile rules:
- favorites and follows are backend-owned state
- DynamoDB is the persistence layer, not the frontend
- frontend reflects backend truth
- do not let remotes diverge in profile behavior

## Quality rules

Before claiming work is done:
- run lint for touched projects
- run relevant tests
- run affected build if architecture or shared code changed
- summarize risk, ownership, and rollout impact

Prefer:
- minimal, coherent diffs
- narrow public APIs
- typed contracts
- explicit ownership boundaries
- test coverage proportional to risk

Avoid:
- cross-remote imports
- over-abstracted shared libraries
- provider-specific sports data logic in UI components
- shell knowing remote internals
- large speculative refactors unless requested

## CI/CD and deployment

CI/CD uses CircleCI.

Deployment rules:
- shell and remotes are independent release units
- stable CloudFront paths matter
- invalidation scope should be as small as possible
- remote changes should not require shell rebuild unless contracts or manifests change
- keep rollback obvious and documented

CloudFront conventions:
- shell served from root path
- remotes served from stable /remotes/<remote-name>/ paths
- cache-sensitive files like manifest or remote entry should have shorter TTL than hashed assets

## Commands

Common repo commands:
- nx graph
- nx affected -t lint,test,build
- nx serve shell
- nx build <project>
- nx test <project>

Design system expectations:
- Storybook should build for reusable UI changes
- visual and accessibility impact should be called out in summaries

## Agent behavior expectations

When making changes:
1. decide ownership first
2. inspect existing patterns before creating new ones
3. prefer the smallest durable implementation
4. call out architecture, security, and release impact
5. validate before finalizing

When unsure:
- ask whether the change belongs in shell, remote, shared lib, design system, or backend
- avoid guessing on provider contracts or deployment behavior
