# Phase 6 — Auth bootstrap + favorites on `mfe-profile`

## Context

Phase 5 validated the second cross-remote consumer of `sports-data` and nested routing. What's still unproven:

- **User identity has never flowed through the system.** No remote knows who the user is. There is no `AuthService`, no session bootstrap, no auth-aware UI.
- **Shell has no responsibility beyond layout.** CLAUDE.md says the shell owns "auth bootstrap" — this has not happened.
- **mfe-profile is a placeholder.** A third remote becoming a real feature consumer (of a *different* lib than `sports-data`) completes the triangle: one remote per lib family can't validate "any remote can consume any shared lib."
- **No precedent for user-scoped reads.** `sports-data` takes `competitionId` as a key. `profile` takes `userId`. The contract shape for user-centric reads (backend-owned state, frontend reflects truth) has never been drawn.

Phase 6 closes all four gaps with the smallest useful slice:

- `@platform/auth` — new lib: `AuthSession`, `AuthService` interface, `AUTH_SERVICE` InjectionToken, `MockAuthService` that emits a hardcoded session.
- `@platform/profile` — new lib: `ProfileService` interface, `PROFILE_SERVICE` InjectionToken, `MockProfileService` that returns in-memory favorites for the seeded user.
- **Shell owns auth.** `AUTH_SERVICE` is bound in the shell (per CLAUDE.md) so the top-nav can display "Hi, {name}" and any remote can consume `AuthService` on demand.
- **mfe-profile consumes both.** The page reads `AuthService.currentUser$`, pipes the userId into `ProfileService`, and renders **Followed teams** + **Followed competitions** using the `Team` and `Competition` types from `shared-types`.
- Phase-5's provider-placement rule is applied from the start: bindings on **exposed route `providers`**, never in `app.config.ts`. Shell's binding is the one exception (shell's `app.config.ts` is a real bootstrap, not a federated route).

Out of scope — Phase 7+ territory:

- Favorites buttons on `mfe-live` / `mfe-competition` match cards or competition cards (this phase is read-only).
- Real IdP (Cognito, Auth0, OAuth flow). Session is hardcoded, not negotiated.
- Real DynamoDB persistence.
- HTTP adapter behind `ProfileService`.
- Login / logout UI. The user is already "logged in" for the whole session.
- Notifications, preferences, or any profile field beyond favorites.
- Storybook stories for domain-local `mfe-profile` components (Storybook is still DS-only).
- Guard routes by auth state — the user is always present in Phase 6.

---

## Locked versions (unchanged)

Node 20.x LTS · Nx `21.6.11` · Angular `~20.3.0` · `@angular-architects/native-federation` `20.3.1` · TypeScript `~5.9.2` · Storybook `^10.3.5`. Reject upgrade prompts.

---

## Target repo layout after Phase 6

```
Nx/
├── frontend/
│   ├── apps/
│   │   ├── shell/
│   │   │   └── src/app/
│   │   │       ├── app.config.ts          # binds AUTH_SERVICE
│   │   │       ├── app.ts                 # injects AuthService for top-nav greeting
│   │   │       ├── app.html               # adds user greeting slot beside top-nav
│   │   │       └── app.scss               # minor layout tweak for greeting
│   │   ├── mfe-profile/
│   │   │   └── src/app/
│   │   │       ├── app.config.ts          # unchanged — no remote bindings in app.config
│   │   │       ├── remote.routes.ts       # binds PROFILE_SERVICE on exposed route
│   │   │       ├── landing/               # delete if unused
│   │   │       └── profile-page/          # NEW
│   │   │           ├── profile-page.ts
│   │   │           ├── profile-page.html
│   │   │           ├── profile-page.scss
│   │   │           ├── profile-page.spec.ts
│   │   │           ├── team-tile/         # NEW — presentation
│   │   │           │   ├── team-tile.ts
│   │   │           │   ├── team-tile.html
│   │   │           │   ├── team-tile.scss
│   │   │           │   └── team-tile.spec.ts
│   │   │           └── competition-tile/  # NEW — presentation
│   │   │               ├── competition-tile.ts
│   │   │               ├── competition-tile.html
│   │   │               ├── competition-tile.scss
│   │   │               └── competition-tile.spec.ts
│   │   └── (mfe-home, mfe-live, mfe-competition, mfe-team untouched)
│   └── libs/
│       ├── auth/                          # NEW lib
│       │   ├── project.json
│       │   ├── src/
│       │   │   ├── index.ts
│       │   │   └── lib/
│       │   │       ├── auth-session.ts
│       │   │       ├── auth.service.ts         # interface + token
│       │   │       ├── mock-auth.service.ts    # mock implementation
│       │   │       └── mock-auth.service.spec.ts
│       │   └── tsconfig*.json
│       └── profile/                       # NEW lib
│           ├── project.json
│           ├── src/
│           │   ├── index.ts
│           │   └── lib/
│           │       ├── profile.service.ts       # interface + token
│           │       ├── mock-profile.service.ts  # mock implementation
│           │       ├── mock-profile.service.spec.ts
│           │       └── fixtures/
│           │           └── favorites.fixture.ts # seeded favorites per userId
│           └── tsconfig*.json
```

**Nx tags (add to `project.json` for new libs):**
- `auth`: `["type:shared", "scope:shared"]`
- `profile`: `["type:shared", "scope:shared"]`

Both are consumable from any remote and the shell, same tier as `sports-data`.

---

## Prerequisites

From `c:\Users\edy_0\projects\Nx`, current tree must be green:

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data
```

Phase 5 work should be committed (or at least be a clean working tree) before starting Phase 6 to keep review diffs honest.

---

## Step 1 — Create `libs/auth`

### 1a. Generate the lib

```bash
npx nx g @nx/js:library \
  --directory=frontend/libs/auth \
  --name=auth \
  --importPath=@platform/auth \
  --bundler=none \
  --unitTestRunner=jest \
  --linter=eslint \
  --tags=type:shared,scope:shared \
  --no-interactive
```

After generation: delete the scaffolded `auth.ts` / `auth.spec.ts` demo files. Replace with the files in 1b–1e.

### 1b. [frontend/libs/auth/src/lib/auth-session.ts](frontend/libs/auth/src/lib/auth-session.ts)

```ts
export interface AuthSession {
  readonly userId: string;
  readonly displayName: string;
  readonly email: string;
}
```

Rules:
- No token field on the frontend contract. CLAUDE.md says access tokens stay memory-resident on the client; they do not belong on the type that flows through UI. The mock doesn't need one. If a future phase adds an HTTP adapter that needs a token, it goes on a private field inside the concrete service, not on `AuthSession`.
- `readonly` throughout.

### 1c. [frontend/libs/auth/src/lib/auth.service.ts](frontend/libs/auth/src/lib/auth.service.ts)

```ts
import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AuthSession } from './auth-session';

export interface AuthService {
  readonly currentUser$: Observable<AuthSession | null>;
  readonly isAuthenticated$: Observable<boolean>;
}

export const AUTH_SERVICE = new InjectionToken<AuthService>('AUTH_SERVICE');
```

Rules:
- Streams, not snapshots. Consumers always pipe through `AsyncPipe`.
- `null` is a legitimate state (anonymous). No login/logout methods in Phase 6 — the session is seeded and stable.

### 1d. [frontend/libs/auth/src/lib/mock-auth.service.ts](frontend/libs/auth/src/lib/mock-auth.service.ts)

```ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, type Observable } from 'rxjs';
import type { AuthSession } from './auth-session';
import type { AuthService } from './auth.service';

const SEEDED_USER: AuthSession = {
  userId: 'u-demo-001',
  displayName: 'Demo User',
  email: 'demo@platform.local',
};

@Injectable({ providedIn: 'root' })
export class MockAuthService implements AuthService {
  private readonly session$ = new BehaviorSubject<AuthSession | null>(SEEDED_USER);

  readonly currentUser$: Observable<AuthSession | null> = this.session$.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(map((u) => u !== null));
}
```

Rules:
- `providedIn: 'root'` — the class auto-registers. The **token** still needs an explicit binding; see Step 3.
- Seeded user is static. No login flow.

### 1e. [frontend/libs/auth/src/lib/mock-auth.service.spec.ts](frontend/libs/auth/src/lib/mock-auth.service.spec.ts)

Coverage:
- `currentUser$` emits a non-null session with the seeded `userId`.
- `isAuthenticated$` emits `true` for the seeded session.

### 1f. Barrel [frontend/libs/auth/src/index.ts](frontend/libs/auth/src/index.ts)

```ts
export * from './lib/auth-session';
export * from './lib/auth.service';
export * from './lib/mock-auth.service';
```

### 1g. Verify

```bash
npx nx lint auth && npx nx test auth
```

### 1h. Register the path alias

Add to `tsconfig.base.json`:

```json
"@platform/auth": ["frontend/libs/auth/src/index.ts"]
```

---

## Step 2 — Create `libs/profile`

### 2a. Generate the lib

```bash
npx nx g @nx/js:library \
  --directory=frontend/libs/profile \
  --name=profile \
  --importPath=@platform/profile \
  --bundler=none \
  --unitTestRunner=jest \
  --linter=eslint \
  --tags=type:shared,scope:shared \
  --no-interactive
```

Delete scaffolded demo files after generation.

### 2b. [frontend/libs/profile/src/lib/profile.service.ts](frontend/libs/profile/src/lib/profile.service.ts)

```ts
import { InjectionToken } from '@angular/core';
import type { Competition, Team } from '@platform/shared-types';
import type { Observable } from 'rxjs';

export interface ProfileService {
  /** Teams this user follows. Empty array if none. */
  getFavoriteTeams(userId: string): Observable<readonly Team[]>;

  /** Competitions this user follows. Empty array if none. */
  getFavoriteCompetitions(userId: string): Observable<readonly Competition[]>;
}

export const PROFILE_SERVICE = new InjectionToken<ProfileService>('PROFILE_SERVICE');
```

Rules:
- Returns **full** `Team` / `Competition` objects, not just IDs. The frontend should never have to round-trip through a second service to resolve a favorite. This is the normalized-backend-contract rule from CLAUDE.md.
- No `addFavoriteX` / `removeFavoriteX` in Phase 6. Read-only. Writes land in Phase 7 when buttons ship.
- The `userId` parameter is explicit, not implicit-from-session. Keeps the service testable without auth coupling and matches how the real backend will key reads.

### 2c. [frontend/libs/profile/src/lib/fixtures/favorites.fixture.ts](frontend/libs/profile/src/lib/fixtures/favorites.fixture.ts)

```ts
import type { Competition, Team } from '@platform/shared-types';

export interface SeededFavorites {
  readonly teams: readonly Team[];
  readonly competitions: readonly Competition[];
}

export const FAVORITES_BY_USER: Readonly<Record<string, SeededFavorites>> = {
  'u-demo-001': {
    teams: [
      { id: 't-ars', name: 'Arsenal', shortName: 'ARS' },
      { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' },
    ],
    competitions: [
      { id: 'ucl', name: 'Champions League', code: 'UCL' },
    ],
  },
};
```

Rules:
- Only the seeded demo user has favorites. Any other `userId` returns empty arrays — exercises the empty-state branch.

### 2d. [frontend/libs/profile/src/lib/mock-profile.service.ts](frontend/libs/profile/src/lib/mock-profile.service.ts)

```ts
import { Injectable } from '@angular/core';
import type { Competition, Team } from '@platform/shared-types';
import { Observable, of } from 'rxjs';
import { FAVORITES_BY_USER } from './fixtures/favorites.fixture';
import type { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class MockProfileService implements ProfileService {
  getFavoriteTeams(userId: string): Observable<readonly Team[]> {
    return of(FAVORITES_BY_USER[userId]?.teams ?? []);
  }

  getFavoriteCompetitions(userId: string): Observable<readonly Competition[]> {
    return of(FAVORITES_BY_USER[userId]?.competitions ?? []);
  }
}
```

### 2e. [frontend/libs/profile/src/lib/mock-profile.service.spec.ts](frontend/libs/profile/src/lib/mock-profile.service.spec.ts)

Coverage:
- `getFavoriteTeams('u-demo-001')` → non-empty array containing `t-ars` and `t-rma`.
- `getFavoriteCompetitions('u-demo-001')` → array with `ucl`.
- `getFavoriteTeams('unknown')` → `[]`.
- `getFavoriteCompetitions('unknown')` → `[]`.

### 2f. Barrel [frontend/libs/profile/src/index.ts](frontend/libs/profile/src/index.ts)

```ts
export * from './lib/profile.service';
export * from './lib/mock-profile.service';
```

`favorites.fixture.ts` stays implementation-private (same rule as `sports-data`'s fixtures).

### 2g. Register the path alias

Add to `tsconfig.base.json`:

```json
"@platform/profile": ["frontend/libs/profile/src/index.ts"]
```

### 2h. Verify

```bash
npx nx lint profile && npx nx test profile
```

---

## Step 3 — Shell binds `AUTH_SERVICE`

Shell owns auth bootstrap per CLAUDE.md. The shell is a real bootstrap entry point (unlike remotes, whose `app.config.ts` never runs when federated), so binding here is correct.

Edit [frontend/apps/shell/src/app/app.config.ts](frontend/apps/shell/src/app/app.config.ts) to add:

```ts
import { AUTH_SERVICE, MockAuthService } from '@platform/auth';
// ...
providers: [
  // existing providers
  { provide: AUTH_SERVICE, useExisting: MockAuthService },
],
```

Rules:
- `useExisting` (not `useClass`) because `MockAuthService` is `providedIn: 'root'`.
- Do **not** also put this on a route-level provider in the shell. App.config runs for the shell because the shell is a bootstrap entry point.
- Do **not** bind `PROFILE_SERVICE` in the shell. Profile is mfe-profile's domain in Phase 6. If Phase 7 needs it cross-remote, promote then.

---

## Step 4 — Shell top-nav shows signed-in user

Minimal UI: display the user's `displayName` next to the top-nav. Do **not** modify `DsTopNav`; this is a shell-level concern, not a DS concern.

### 4a. Template change — [frontend/apps/shell/src/app/app.html](frontend/apps/shell/src/app/app.html)

Wrap or extend the existing nav area with a right-aligned user greeting:

```html
<div class="shell__header">
  <ds-top-nav>
    <!-- existing nav items -->
  </ds-top-nav>
  @if (currentUser$ | async; as user) {
    <span class="shell__user" aria-live="polite">Hi, {{ user.displayName }}</span>
  }
</div>
```

### 4b. Component — [frontend/apps/shell/src/app/app.ts](frontend/apps/shell/src/app/app.ts)

Inject `AUTH_SERVICE`, expose `currentUser$` as a protected field. Add `AsyncPipe` to imports.

```ts
protected readonly currentUser$ = inject(AUTH_SERVICE).currentUser$;
```

Rules:
- Explicit `Observable<AuthSession | null>` annotation on the field if the template type checker complains about the InjectionToken generic.
- No logic beyond exposing the stream. UI only.

### 4c. SCSS — [frontend/apps/shell/src/app/app.scss](frontend/apps/shell/src/app/app.scss)

Light flex layout placing `.shell__user` to the right of the nav. Use `--ds-color-text-muted`, `--ds-font-size-sm`. No hex.

### 4d. Spec — [frontend/apps/shell/src/app/app.spec.ts](frontend/apps/shell/src/app/app.spec.ts)

Extend with a test that stubs `AUTH_SERVICE` with `currentUser$: of({ userId: 'x', displayName: 'Jamie', email: 'j@x' })` and asserts the greeting renders `Hi, Jamie`.

---

## Step 5 — Build `ProfilePage` on `mfe-profile`

### 5a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-profile/src/app/profile-page/profile-page \
  --name=profile-page \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive
```

### 5b. Component

```ts
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AUTH_SERVICE } from '@platform/auth';
import { PROFILE_SERVICE } from '@platform/profile';
import type { AuthSession } from '@platform/auth';
import type { Competition, Team } from '@platform/shared-types';
import { filter, map, shareReplay, switchMap, type Observable } from 'rxjs';
import { CompetitionTile } from './competition-tile/competition-tile';
import { TeamTile } from './team-tile/team-tile';

// imports: [AsyncPipe, DsList, DsListItem, TeamTile, CompetitionTile]
// standalone, OnPush
export class ProfilePage {
  private readonly auth = inject(AUTH_SERVICE);
  private readonly profile = inject(PROFILE_SERVICE);

  protected readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected readonly favoriteTeams$: Observable<readonly Team[]> = this.user$.pipe(
    switchMap((u) => this.profile.getFavoriteTeams(u.userId))
  );

  protected readonly favoriteCompetitions$: Observable<readonly Competition[]> = this.user$.pipe(
    switchMap((u) => this.profile.getFavoriteCompetitions(u.userId))
  );
}
```

Rules:
- Explicit `Observable<T>` annotations — same trap as Phases 4/5 with InjectionToken generics under strict template type checking.
- `filter` to narrow `AuthSession | null` → `AuthSession` for downstream consumers. Anonymous-state UI is out of scope for Phase 6; if it enters later, swap the filter for a conditional branch in the template.
- `shareReplay({ bufferSize: 1, refCount: true })` so both downstream pipes share a single auth subscription.

### 5c. Template sections

```html
<section class="profile-page">
  @if (user$ | async; as user) {
    <header class="profile-page__header">
      <h1 class="profile-page__title">Your profile</h1>
      <p class="profile-page__meta">
        {{ user.displayName }} · <span class="profile-page__email">{{ user.email }}</span>
      </p>
    </header>

    <section class="profile-page__block">
      <h2 class="profile-page__heading">Followed teams</h2>
      @if (favoriteTeams$ | async; as teams) {
        @if (teams.length > 0) {
          <ds-list>
            @for (team of teams; track team.id) {
              <ds-list-item>
                <mfe-profile-team-tile [team]="team" />
              </ds-list-item>
            }
          </ds-list>
        } @else {
          <p class="profile-page__empty">You don't follow any teams yet.</p>
        }
      }
    </section>

    <section class="profile-page__block">
      <h2 class="profile-page__heading">Followed competitions</h2>
      @if (favoriteCompetitions$ | async; as comps) {
        @if (comps.length > 0) {
          <ds-list>
            @for (comp of comps; track comp.id) {
              <ds-list-item>
                <mfe-profile-competition-tile [competition]="comp" />
              </ds-list-item>
            }
          </ds-list>
        } @else {
          <p class="profile-page__empty">You don't follow any competitions yet.</p>
        }
      }
    </section>
  }
</section>
```

### 5d. SCSS

DS tokens only. Mirror the structure used by `mfe-competition/competition-detail.scss`.

### 5e. Spec

Two tests with fake AUTH/PROFILE stubs:
- Seeded user + 2 teams + 1 competition → asserts team-tile count 2, competition-tile count 1.
- Seeded user with empty arrays → asserts both empty-state copies render.

---

## Step 6 — Presentation components `TeamTile` and `CompetitionTile`

Domain-local, same rules as Phase 5's `FixtureRow`.

### 6a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-profile/src/app/profile-page/team-tile/team-tile \
  --name=team-tile \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive

npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-profile/src/app/profile-page/competition-tile/competition-tile \
  --name=competition-tile \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive
```

### 6b. APIs

- `TeamTile`: `@Input({ required: true }) team!: Team`. Renders `team.shortName` (or `team.name` fallback) and `team.name`. No crest yet (the `crestUrl` field is optional; showing a placeholder or omitting is both fine — omit for Phase 6 to keep the visual contract tight).
- `CompetitionTile`: `@Input({ required: true }) competition!: Competition`. Renders `competition.code` and `competition.name`.

### 6c. Template + SCSS

Flat `ds-card` with two stacked text elements. DS tokens for all colors/spacing. No interactive behavior — Phase 6 is read-only.

### 6d. Specs

One render test per component asserting the name + short form render in the DOM.

---

## Step 7 — Route `/profile`

### 7a. Edit [frontend/apps/mfe-profile/src/app/remote.routes.ts](frontend/apps/mfe-profile/src/app/remote.routes.ts)

```ts
import { Routes } from '@angular/router';
import { MockProfileService, PROFILE_SERVICE } from '@platform/profile';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [{ provide: PROFILE_SERVICE, useExisting: MockProfileService }],
    loadComponent: () =>
      import('./profile-page/profile-page').then((m) => m.ProfilePage),
  },
];
```

Rules (carried over from Phase 5):
- Route-level providers. **Not** `app.config.ts`. This is load-bearing for federation correctness.
- Do **not** bind `AUTH_SERVICE` here — the shell already provides it and the remote's injector inherits.

### 7b. Optional cleanup

Delete `frontend/apps/mfe-profile/src/app/landing/` if `nx lint mfe-profile` complains about unused files. Otherwise leave it for a later sweep.

---

## Step 8 — End-to-end verification

### 8a. Full matrix

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data,auth,profile
```

11 projects × 3 targets. All must be green.

### 8b. Graph check

```bash
npx nx graph --file=graph.json
```

Expected new edges:
- `shell → auth`
- `mfe-profile → auth, profile, shared-types, design-system`
- `profile → shared-types`

Expected **absent** edges:
- `shell → profile`
- `mfe-live`, `mfe-home`, `mfe-competition`, `mfe-team` → `auth` or `profile`
- Any cross-remote edge

Delete `graph.json` after inspecting.

### 8c. Dev smoke

```bash
npm run dev
```

Browser at `http://localhost:4200`:

1. Shell top-nav shows **Hi, Demo User** (right side of the header).
2. Click **Profile** in top-nav → `/profile` renders user header + 2 followed teams + 1 followed competition.
3. Click **Live** → Phase 4's `LiveNow` still works (regression guard).
4. Click **Competitions** → Phase 5's list + `/competition/ucl` detail still work (regression guard).
5. Hard reload `/profile` — the greeting and favorites persist (mock is memory-seeded, so reload is fine).
6. Browser console: zero errors. **Especially** no `NG0201` (the Phase-5 lesson).

Ctrl+C.

### 8d. Storybook smoke

```bash
npm run dev:storybook
```

All 5 primitive stories still render. No new stories this phase. Ctrl+C.

---

## Step 9 — Commit

Two commits recommended:

1. **libs/auth + libs/profile** as one commit (both are read-only contract + mock; they ship together).
2. **Shell auth-bootstrap + mfe-profile page** as a second commit (consumer integration).

Alternatively one bundled commit if the review prefers. No push; wait for human review.

---

## Acceptance checklist

- [ ] `@platform/auth` exports `AuthSession`, `AuthService`, `AUTH_SERVICE`, `MockAuthService`
- [ ] `@platform/profile` exports `ProfileService`, `PROFILE_SERVICE`, `MockProfileService`
- [ ] `AuthSession` has **no token field**
- [ ] `MockAuthService.currentUser$` emits a seeded non-null user
- [ ] `MockProfileService.getFavoriteTeams('u-demo-001')` returns a non-empty array
- [ ] `MockProfileService.getFavoriteTeams('unknown')` returns `[]`
- [ ] `tsconfig.base.json` has `@platform/auth` and `@platform/profile` paths
- [ ] Shell `app.config.ts` binds `AUTH_SERVICE` via `useExisting: MockAuthService`
- [ ] Shell top-nav renders `Hi, {displayName}` from `AUTH_SERVICE.currentUser$`
- [ ] `mfe-profile/remote.routes.ts` binds `PROFILE_SERVICE` on the exposed route's `providers` — **not** `app.config.ts`
- [ ] `ProfilePage`, `TeamTile`, `CompetitionTile` are standalone + OnPush
- [ ] `ProfilePage` uses `AsyncPipe` only, native `@if`/`@for`, no `CommonModule`, no `*ngIf`/`*ngFor`
- [ ] No hex / hardcoded rem / px in new SCSS — DS tokens only
- [ ] `nx graph` shows `shell → auth`, `mfe-profile → auth + profile`, `profile → shared-types`, and **no** cross-remote edges
- [ ] `npm run dev` — greeting visible, `/profile` lists 2 teams + 1 competition, `/live` + `/competition` still work, browser console clean
- [ ] `CLAUDE.md` unchanged

---

## Guardrails for the executing model

- **Types → libs → consumer, in order.** Don't write `ProfilePage` before `AuthService` and `ProfileService` compile.
- **Shell binds `AUTH_SERVICE` in `app.config.ts`.** It's the one bootstrap entry point in the system. Remotes do not.
- **Remotes bind their domain tokens on the exposed route's `providers`.** Never in the remote's `app.config.ts`. This rule is absolute after Phase 5's fix — see `feedback_remote_providers.md`.
- **Never import from `rxjs/operators`.** Use top-level `'rxjs'` — same Phase-5 lesson.
- **Domain-local presentation components stay domain-local.** `TeamTile` / `CompetitionTile` live in `mfe-profile`. Do not promote to DS or shared-ui in this phase.
- **Never inject `MockAuthService` or `MockProfileService` directly.** Always via their `InjectionToken`.
- **Never add mock-only methods to the interface.** The interface is the future-HTTP contract.
- **No login / logout UI.** Phase 6 is read-only identity + read-only favorites.
- **No DS changes.** If visually tempting to add a user avatar primitive, resist — it's a Phase 7+ DS conversation.
- **No HTTP client yet.** No `provideHttpClient`, no `HttpClient` imports. Phase 7+.
- **Keep fixtures tiny.** 2 teams + 1 competition for the seeded user. Realism is not the point; data flow is.
- **If any step fails, stop and report.** No broken intermediate states.
- Do not modify `CLAUDE.md`. Do not bump Angular / Nx / Storybook / federation.

---

## Troubleshooting notes

- **`NG0201: No provider found for InjectionToken AUTH_SERVICE`** in the shell — shell's `app.config.ts` binding missing. Step 3.
- **`NG0201: No provider found for InjectionToken PROFILE_SERVICE`** in `/profile` — `mfe-profile/remote.routes.ts` is not wrapping the route in a parent with `providers`. Step 7a.
- **Greeting never appears, but no console error** — `AsyncPipe` is missing from `app.ts` imports, or the `currentUser$` field is typed as `Observable<AuthSession | null | undefined>` and the template checker rejects `as user`. Add the explicit annotation.
- **`favorites.fixture.ts` leaks through barrel** — remove it from `libs/profile/src/index.ts`. Only the service + token + mock should re-export.
- **`@nx/js:library` generated a bundler config** — ensure `--bundler=none`. The lib ships as TS consumed by Angular apps.
- **Tag violations (`@nx/enforce-module-boundaries`)** — verify both new libs have `type:shared, scope:shared` in their `project.json`. No new tag rules required; existing tag allow-list already permits remotes and shell to depend on `type:shared`.
- **Shell's `app.spec.ts` fails after adding auth** — add a default `AUTH_SERVICE` stub in the existing TestBed configureTestingModule. Tests that don't care can stub with `currentUser$: of(null)`.

---

## Risk, ownership, and rollout notes

- **Risk:** medium.
  - Medium because two new libs are introduced in one phase, plus shell behavior changes.
  - Mitigated by: (a) both libs are read-only contracts with memory-seeded mocks — no network, no persistence, no auth protocol; (b) shell greeting is a text node, not a route; (c) Phase 5's provider-placement rule is now memorized, so the NG0201 class of bug is unlikely to repeat.
- **Blast radius:**
  - Shell: top-nav area updates. `/profile` route behavior changes. All other shell behavior unchanged.
  - mfe-profile: placeholder → real page.
  - mfe-home, mfe-live, mfe-competition, mfe-team: untouched.
- **Ownership:**
  - `libs/auth` — platform (shell-owned auth bootstrap boundary). Future: backed by a real IdP adapter.
  - `libs/profile` — platform today; profile-team domain when the team emerges. Future: backed by a backend profile-api.
  - `mfe-profile` — profile remote team.
- **Rollout:** single atomic unit. Remote and libs ship together; merging any one alone leaves the others orphaned. No backend gate.
- **Backend-readiness signal:** `AuthService` and `ProfileService` are the exact contracts a future IdP adapter and a future `profile-api` service must honor. If either mock wants a field the real backend can't produce cheaply, cut the field now.

---

## What Phase 7 looks like (explicit deferral)

- Favorite/unfavorite button on team pages + competition cards + match cards.
- Writes land on `ProfileService` via `addFavoriteTeam(userId, teamId)` and mirror methods.
- Optimistic UI + rollback on error.
- Potentially promote `PROFILE_SERVICE` binding from `mfe-profile` up to the shell once `mfe-live` and `mfe-competition` also consume it — that decision belongs to Phase 7, not 6.
- A `libs/shared-ui` `FavoriteToggle` button primitive may enter the DS as part of Phase 7 if the visual pattern stabilizes.
