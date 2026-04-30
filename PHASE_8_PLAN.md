# Phase 8 — Personalized `mfe-home` dashboard

## Context

Phase 7 made favorites real, reactive, and writable. The favorites loop is now closed: a user can follow/unfollow teams from `/live`, follow/unfollow competitions from `/competition`, and remove items from `/profile`. But:

- ✅ User identity flows through the system (Phase 6).
- ✅ Favorites are seeded, reactive, and writable from three remotes (Phase 7).
- ❌ **The literal landing page is still a Phase 0 placeholder.** `/` redirects to `/home`, which renders a hardcoded "Champions League" title and a `Follow` button wired to nothing ([home.ts:14](frontend/apps/mfe-home/src/app/home/home.ts#L14), [home.html](frontend/apps/mfe-home/src/app/home/home.html)).
- ❌ **No remote has shown multi-source composition.** `mfe-live` reads `sports-data`. `mfe-competition` reads `sports-data`. `mfe-profile` reads `auth` + `profile`. Nothing has stitched all three into one view-model — which is the BFF-shape the eventual backend aggregator will serve.
- ❌ **`mfe-home` consumes zero platform libs.** It imports only `DsButton` and a `Competition` type. It has never been pulled into the `auth` / `profile` / `sports-data` graph.

Phase 8 turns `/home` into a personalized dashboard that:

1. **Live now (from your favorites)** — filters `getLiveMatches()` to matches where home or away team is followed OR the competition is followed.
2. **Upcoming for your followed competitions** — top 3 fixtures across the union of `getFixtures(competitionId)` for each followed competition, sorted by `kickoffAt` ascending.
3. **Empty state** — when the user has zero favorites, a CTA paragraph linking to `/competition` ("Browse competitions to personalize your home").

Why this slice and not match-detail or the HTTP adapter:

- **Highest visibility per change.** `/home` is the *default route* for every user. Today they land on scaffold; tomorrow they land on a real personalized page.
- **Third consumer of both libs.** `sports-data` is consumed by `mfe-live` + `mfe-competition`; `profile` is consumed by `mfe-live` + `mfe-competition` + `mfe-profile`. Adding `mfe-home` to both proves the contracts hold for a *composition* shape (filter-by-favorites), not just direct reads. This is meaningful coverage for "any remote can consume any shared lib."
- **First multi-source `vm$`.** No remote has done this yet. The shape is exactly what a future BFF / profile-aware sports endpoint will serve — so the composition logic earns its keep both as a UI and as a contract test.
- **HTTP adapter is a horizontal cut with no new product capability.** Doing it before Phase 8 would re-shape services without delivering anything user-visible. Phase 8 keeps shipping features; HTTP can land in Phase 9+ on a wider, more stable surface.

**Explicitly deferred to Phase 9+:**

- HTTP adapter behind `SportsDataService` or `ProfileService`.
- Live polling / SSE / refresh interval.
- `mfe-team` placeholder removal.
- Match detail page on `mfe-live`.
- Promoting `MatchCard` (in `mfe-live`) or `FixtureRow` (in `mfe-competition`) to a `shared-ui` lib (Phase 8 builds slim domain-local tiles in `mfe-home` instead — promotion lands when a third consumer of the *same* shape appears).
- Standings on home (deferred — live + upcoming is the high-leverage proof).
- New DS primitives (`DsTable`, `DsTabs`, `DsAvatar`, ...).
- Anonymous / unauthenticated UX paths.
- Notifications when a followed team plays.
- Sorting / filtering / pagination on home sections.
- Storybook stories for the new domain-local tiles (Storybook stays DS-only).

---

## Locked versions (unchanged)

Node 20.x LTS · Nx `21.6.11` · Angular `~20.3.0` · `@angular-architects/native-federation` `20.3.1` · TypeScript `~5.9.2` · RxJS `~7.8.0` · Storybook `^10.3.5`. **Reject upgrade prompts.**

---

## Why no shared `LiveTile` / `FixtureTile` lib (yet)

CLAUDE.md says: *"Domain-specific code stays in the owning remote unless it is clearly cross-cutting."* It would be tempting to promote `MatchCard` and `FixtureRow` to a new `libs/shared-ui` so `mfe-home` can reuse them. But:

- `MatchCard` in `mfe-live` carries Phase 7's follow-toggle outputs. The home dashboard already filters by favorites — toggling on home would be confusing UX. So home wants a *different* shape (no buttons, smaller).
- `FixtureRow` in `mfe-competition` is ~30 lines. Building a slimmer `FixtureTile` in `mfe-home` is cheaper than spinning up a new `shared-ui` lib.
- The "two consumers" rule for shared-ui has only one shape (`FixtureRow`). Phase 8 makes it the *second* consumer of that shape — that's the threshold to *consider* promotion, not to *do* it. Wait until a third consumer appears or until the duplication actually hurts.

**Rule:** keep tiles **domain-local** in `mfe-home` for Phase 8. Promotion to `libs/shared-ui` is a Phase 9+ conversation if and when a third consumer materializes.

---

## Target repo layout after Phase 8

```
Nx/
├── frontend/
│   └── apps/
│       └── mfe-home/
│           └── src/app/
│               ├── remote.routes.ts                # MODIFIED — adds providers (SPORTS_DATA + PROFILE)
│               └── home/
│                   ├── home.ts                     # REWRITTEN — smart container with vm$
│                   ├── home.html                   # REWRITTEN — sections + empty state
│                   ├── home.scss                   # MODIFIED — section grid
│                   ├── home.spec.ts                # REWRITTEN — vm coverage
│                   ├── live-tile/                  # NEW — presentational
│                   │   ├── live-tile.ts
│                   │   ├── live-tile.html
│                   │   ├── live-tile.scss
│                   │   └── live-tile.spec.ts
│                   └── fixture-tile/               # NEW — presentational
│                       ├── fixture-tile.ts
│                       ├── fixture-tile.html
│                       ├── fixture-tile.scss
│                       └── fixture-tile.spec.ts
```

Untouched: `shell`, `mfe-live`, `mfe-competition`, `mfe-team`, `mfe-profile`, all libs, `app.routes.ts` in shell, federation manifest, all DS primitives.

No new libs. No new DS primitives. No app deletions.

---

## Prerequisites

From `c:\Users\edy_0\projects\Nx`, the Phase 7 baseline must be green:

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data,profile,auth
```

If any of the 11 projects fails, **stop** and rebaseline before starting Phase 8.

---

## Step 1 — Wire platform tokens onto the remote route

Edit [frontend/apps/mfe-home/src/app/remote.routes.ts](frontend/apps/mfe-home/src/app/remote.routes.ts) to mirror the Phase 5 / 7 pattern from `mfe-competition`:

```ts
import { Routes } from '@angular/router';
import { MockProfileService, PROFILE_SERVICE } from '@platform/profile';
import { MockSportsDataService, SPORTS_DATA_SERVICE } from '@platform/sports-data';

export const remoteRoutes: Routes = [
  {
    path: '',
    providers: [
      { provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService },
      { provide: PROFILE_SERVICE, useExisting: MockProfileService },
    ],
    loadComponent: () => import('./home/home').then((m) => m.Home),
  },
];
```

Rules:
- `useExisting` (not `useClass`) because both `MockProfileService` and `MockSportsDataService` are `providedIn: 'root'`.
- Bindings live on the **route's** `providers` array, not in the remote's `app.config.ts`. Native Federation skips remote app config (memory: `feedback_remote_providers`).
- Do **not** add `AUTH_SERVICE` here — the shell binds it in [frontend/apps/shell/src/app/app.config.ts](frontend/apps/shell/src/app/app.config.ts) and remotes inherit it through the platform injector.

---

## Step 2 — `LiveTile` (domain-local presentational)

### 2a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-home/src/app/home/live-tile/live-tile \
  --name=live-tile \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive
```

### 2b. Component

- `@Input({ required: true }) match!: MatchSummary`
- Selector: `mfe-home-live-tile`
- Imports: `DsBadge`, `DsCard`. **No follow buttons** — the home dashboard already filters by favorites; toggling here would be confusing UX.

### 2c. Template

```html
<ds-card variant="raised">
  <header class="live-tile__header">
    <span class="live-tile__competition">{{ match.competition.code }}</span>
    <ds-badge variant="live">
      @switch (match.status) {
        @case ('live') { LIVE {{ match.minute }}' }
        @case ('halftime') { HT }
        @case ('finished') { FT }
        @default { {{ match.status }} }
      }
    </ds-badge>
  </header>
  <div class="live-tile__teams">
    <div class="live-tile__row"><span>{{ match.home.team.name }}</span><span>{{ match.home.score }}</span></div>
    <div class="live-tile__row"><span>{{ match.away.team.name }}</span><span>{{ match.away.score }}</span></div>
  </div>
</ds-card>
```

### 2d. SCSS — DS tokens only

`--ds-space-*`, `--ds-font-size-*`, `--ds-color-text*`. No hex, no hardcoded rem.

### 2e. Spec

- Renders home + away team names and scores.
- Asserts `LIVE 67'` for `live`/`minute: 67` and `HT` for `halftime`.
- Reuses the `baseMatch` shape from [match-card.spec.ts](frontend/apps/mfe-live/src/app/live-now/match-card/match-card.spec.ts) (no follow inputs).

---

## Step 3 — `FixtureTile` (domain-local presentational)

### 3a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-home/src/app/home/fixture-tile/fixture-tile \
  --name=fixture-tile \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive
```

### 3b. Component

- `@Input({ required: true }) fixture!: Fixture`
- Selector: `mfe-home-fixture-tile`
- Imports: `DatePipe`. No DS dependency (lives inside `<ds-list-item>`).

### 3c. Template

```html
<div class="fixture-tile">
  <span class="fixture-tile__date">{{ fixture.kickoffAt | date:'EEE d MMM HH:mm' }}</span>
  <span class="fixture-tile__competition">{{ fixture.competition.code }}</span>
  <span class="fixture-tile__teams">{{ fixture.home.name }} <span class="fixture-tile__vs">vs</span> {{ fixture.away.name }}</span>
</div>
```

### 3d. SCSS

CSS Grid `grid-template-columns: auto auto 1fr`, gap `--ds-space-3`. Tokens only.

### 3e. Spec

Single render test — assert both team names render. **Avoid asserting on locale-specific weekday strings** (locale-fragile in JSDOM).

---

## Step 4 — `Home` smart container

### 4a. View model shape

Define inside [home.ts](frontend/apps/mfe-home/src/app/home/home.ts) (do not export — internal to the component):

```ts
interface HomeVm {
  readonly user: AuthSession;
  readonly liveFromFavorites: readonly MatchSummary[];
  readonly upcomingFromFavorites: readonly Fixture[];
  readonly hasAnyFavorites: boolean;
}
```

### 4b. Component

```ts
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUTH_SERVICE, type AuthSession } from '@platform/auth';
import { DsCard, DsList, DsListItem } from '@platform/design-system';
import { PROFILE_SERVICE } from '@platform/profile';
import type { Competition, Fixture, MatchSummary, Team } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import { combineLatest, filter, map, of, shareReplay, switchMap, type Observable } from 'rxjs';
import { FixtureTile } from './fixture-tile/fixture-tile';
import { LiveTile } from './live-tile/live-tile';

@Component({
  selector: 'mfe-home-home',
  standalone: true,
  imports: [AsyncPipe, RouterLink, DsCard, DsList, DsListItem, LiveTile, FixtureTile],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly auth = inject(AUTH_SERVICE);
  private readonly profile = inject(PROFILE_SERVICE);
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);

  private readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected readonly vm$: Observable<HomeVm> = this.user$.pipe(
    switchMap((user) =>
      combineLatest([
        this.profile.getFavoriteTeams(user.userId),
        this.profile.getFavoriteCompetitions(user.userId),
      ]).pipe(
        switchMap(([teams, competitions]) =>
          combineLatest([
            this.liveFromFavorites$(teams, competitions),
            this.upcomingFromFavorites$(competitions),
          ]).pipe(
            map(([live, upcoming]) => ({
              user,
              liveFromFavorites: live,
              upcomingFromFavorites: upcoming,
              hasAnyFavorites: teams.length > 0 || competitions.length > 0,
            }))
          )
        )
      )
    )
  );

  private liveFromFavorites$(
    teams: readonly Team[],
    competitions: readonly Competition[]
  ): Observable<readonly MatchSummary[]> {
    const teamIds = new Set(teams.map((t) => t.id));
    const competitionIds = new Set(competitions.map((c) => c.id));
    return this.sportsData.getLiveMatches().pipe(
      map((matches) =>
        matches.filter(
          (m) =>
            teamIds.has(m.home.team.id) ||
            teamIds.has(m.away.team.id) ||
            competitionIds.has(m.competition.id)
        )
      )
    );
  }

  private upcomingFromFavorites$(
    competitions: readonly Competition[]
  ): Observable<readonly Fixture[]> {
    if (competitions.length === 0) return of([]);
    return combineLatest(competitions.map((c) => this.sportsData.getFixtures(c.id))).pipe(
      map((groups) =>
        groups
          .flat()
          .slice()
          .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt))
          .slice(0, 3)
      )
    );
  }
}
```

Rules (drawn from prior phases' bug postmortems):

- **Explicit `Observable<T>` annotations** on every observable field — `InjectionToken` generic inference is fragile under strict template type checking (Phases 4 + 5 history).
- **`switchMap` on `user$`** so future real auth changes cleanly tear down stale subscriptions.
- **`shareReplay({ bufferSize: 1, refCount: true })` on `user$`** — both downstream pipes share a single auth subscription.
- **No manual `subscribe()`.** `AsyncPipe` only.
- **ISO-8601 sort with `localeCompare`** — no `Date` parsing, no date library. The `kickoffAt` strings sort lexically.
- **`combineLatest([])` never emits.** The `competitions.length === 0` guard returns `of([])` to avoid stalling the stream.
- **`.slice()` before `.sort()`** so the upstream `readonly Fixture[]` isn't mutated.

### 4c. Template — [home.html](frontend/apps/mfe-home/src/app/home/home.html)

```html
<section class="home">
  @if (vm$ | async; as vm) {
    <header class="home__header">
      <h1 class="home__title">Welcome back, {{ vm.user.displayName }}</h1>
    </header>

    @if (!vm.hasAnyFavorites) {
      <ds-card variant="flat">
        <p class="home__empty">
          You don't follow anything yet.
          <a routerLink="/competition" class="home__cta">Browse competitions</a>
          to personalize your home.
        </p>
      </ds-card>
    } @else {
      <section class="home__block">
        <h2 class="home__heading">Live now</h2>
        @if (vm.liveFromFavorites.length > 0) {
          <div class="home__live-grid">
            @for (match of vm.liveFromFavorites; track match.id) {
              <mfe-home-live-tile [match]="match" />
            }
          </div>
        } @else {
          <p class="home__empty">No live matches involving your favorites right now.</p>
        }
      </section>

      <section class="home__block">
        <h2 class="home__heading">Upcoming</h2>
        @if (vm.upcomingFromFavorites.length > 0) {
          <ds-list>
            @for (fixture of vm.upcomingFromFavorites; track fixture.id) {
              <ds-list-item>
                <mfe-home-fixture-tile [fixture]="fixture" />
              </ds-list-item>
            }
          </ds-list>
        } @else {
          <p class="home__empty">No upcoming fixtures in your followed competitions.</p>
        }
      </section>
    }
  }
</section>
```

Rules:
- Native control flow only — no `*ngIf`, no `*ngFor`, no `CommonModule`.
- `routerLink="/competition"` (absolute path — shell route, not relative inside the remote).
- `track` keys are stable IDs (`match.id`, `fixture.id`).

### 4d. SCSS

- `.home` block padding `--ds-space-4`.
- `.home__live-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); gap: var(--ds-space-3); }`.
- All other spacing via DS tokens.
- No hex.

---

## Step 5 — Tests for `Home`

Rewrite [home.spec.ts](frontend/apps/mfe-home/src/app/home/home.spec.ts). **Mirror the `setup()`-helper pattern from [live-now.spec.ts](frontend/apps/mfe-live/src/app/live-now/live-now.spec.ts)** — TestBed.configureTestingModule + createComponent + detectChanges all inside the helper, with `afterEach(() => TestBed.resetTestingModule())` so each test gets a fresh injector. (This is the lesson from Phase 7's `Cannot override provider when the test module has already been instantiated` failure.)

```ts
async function setup(profileStub = makeProfileStub(), sportsStub = makeSportsStub()) {
  await TestBed.configureTestingModule({
    imports: [Home],
    providers: [
      provideRouter([]),
      { provide: AUTH_SERVICE, useValue: makeAuthStub() },
      { provide: PROFILE_SERVICE, useValue: profileStub },
      { provide: SPORTS_DATA_SERVICE, useValue: sportsStub },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(Home);
  fixture.detectChanges();
  return fixture;
}
```

### Test cases (all `async`)

1. **Empty state**: profile returns empty arrays from both `getFavoriteTeams` and `getFavoriteCompetitions`. Asserts text contains "Browse competitions" and zero `mfe-home-live-tile` elements render.
2. **Live filter by team**: profile returns `Team` `t-ars`; sports returns 2 live matches (one with `home.team.id = 't-ars'`, one with neither). Asserts exactly one `mfe-home-live-tile` renders.
3. **Live filter by competition**: profile returns one `Competition` `{ id: 'pl' }`, no teams; sports returns 2 matches (one `competition.id = 'pl'`, one `'liga'`). Asserts exactly one tile.
4. **Upcoming sorted across followed competitions**: profile returns `[{id:'pl'},{id:'liga'}]`; sports returns `getFixtures('pl')` with kickoff `2026-05-01T...` and `getFixtures('liga')` with kickoff `2026-04-30T...`. Asserts `mfe-home-fixture-tile` count is 2 and the **first** rendered fixture is the `liga` one (sorted ascending).
5. **Upcoming capped at 3**: 5 fixtures across followed competitions → exactly 3 `mfe-home-fixture-tile` elements render.
6. **No live, has favorites**: empty live matches but non-empty favorites → "No live matches involving your favorites right now." copy renders. Asserts no `mfe-home-live-tile`.

Rules:
- Use `provideRouter([])` so `routerLink="/competition"` doesn't throw.
- Stub returns must satisfy the **full** `ProfileService` and `SportsDataService` interfaces (Phase 7 widening pattern). `getMatch: () => of(undefined)`, `getStandings: () => of(undefined)`, etc.

---

## Step 6 — End-to-end verification

### 6a. Lint + test + build

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data,profile,auth
```

All 11 projects × 3 targets must be green.

### 6b. Graph check

```bash
npx nx graph --file=graph.json
```

Expected new edges:
- `mfe-home → sports-data`
- `mfe-home → profile`
- `mfe-home → auth` (direct injection of `AUTH_SERVICE` adds an explicit edge)

Expected **absent**:
- `shell → sports-data`, `shell → profile`
- Any cross-remote edge (`mfe-home → mfe-live`, etc.)
- Any new edge from `mfe-team`

Delete `graph.json` after inspecting.

### 6c. Dev smoke

```bash
npm run dev
```

Browser flow at `http://localhost:4200`:

1. Land on `/` → redirects to `/home` → see "Welcome back, Demo User" header.
2. Live section shows the **Arsenal vs Liverpool** match (Arsenal seeded) and the **Real Madrid vs Manchester City** match (Real Madrid followed AND UCL followed). Should NOT show Chelsea vs Tottenham.
3. Upcoming section shows 3 fixtures from UCL (the only seeded followed competition), sorted by kickoff ascending.
4. Click "Live" in top-nav → Phase 4's LiveNow still works.
5. Click "Profile" → Phase 7 unfollow Arsenal → click "Home" in top-nav → Live section no longer shows Arsenal vs Liverpool. (Validates reactivity end-to-end.)
6. From Profile, unfollow UCL too → Home → empty state copy renders, "Browse competitions" link navigates to `/competition`.
7. Browser console: zero errors.

Ctrl+C.

### 6d. Storybook smoke

```bash
npm run dev:storybook
```

All 5 primitive stories still render — Phase 8 makes no DS changes. Ctrl+C.

---

## Step 7 — Commit (on a new branch, do not push)

```bash
git checkout -b phase-8-personalized-home
git status   # sanity: no node_modules, no dist, no graph.json
git add <explicit paths under frontend/apps/mfe-home> PHASE_8_PLAN.md
git commit -m "Phase 8: personalized home dashboard"
```

Single commit is fine — all changes are confined to `mfe-home`. Wait for human review.

---

## Acceptance checklist

- [ ] `mfe-home/remote.routes.ts` binds `SPORTS_DATA_SERVICE` and `PROFILE_SERVICE` on the route's `providers` (not in `app.config.ts`).
- [ ] `Home` is standalone + OnPush.
- [ ] `Home` injects `AUTH_SERVICE`, `PROFILE_SERVICE`, `SPORTS_DATA_SERVICE` via the InjectionTokens — never the concrete classes.
- [ ] `vm$` is a single `Observable<HomeVm>` consumed once via `AsyncPipe`.
- [ ] Live filter matches by team OR competition membership.
- [ ] Upcoming list is sorted by `kickoffAt` ascending and capped at 3.
- [ ] `LiveTile` and `FixtureTile` are domain-local (under `mfe-home/`), standalone, OnPush, with `@Input({ required: true })`.
- [ ] No `*ngIf`, no `*ngFor`, no `CommonModule` in any new template.
- [ ] No hex / hardcoded rem / px in new SCSS — DS tokens only.
- [ ] Empty state copy + `routerLink="/competition"` CTA renders when both favorites lists are empty.
- [ ] All 6 spec cases pass; specs use the `setup()` helper pattern with `afterEach` reset.
- [ ] `nx graph` shows `mfe-home → sports-data`, `mfe-home → profile`, `mfe-home → auth`; no cross-remote edges; `shell → sports-data` still absent.
- [ ] `npm run dev` smoke: live filter, upcoming sort, reactive update after unfollow, empty state CTA all work.
- [ ] Phase 4 `/live`, Phase 5 `/competition`, Phase 6 `/profile`, Phase 7 follow/unfollow flows still work (regression guard).
- [ ] `CLAUDE.md` unchanged.

---

## Guardrails for the executing model

- **Bind tokens on the route's `providers`, not in `app.config.ts`.** Native Federation skips remote app config (memory: `feedback_remote_providers`).
- **Never inject `MockSportsDataService` or `MockProfileService` directly.** Always via `SPORTS_DATA_SERVICE` / `PROFILE_SERVICE`.
- **No cross-remote imports.** Even if `MatchCard` (`mfe-live`) and `FixtureRow` (`mfe-competition`) look reusable, do not import them. Build slim domain-local equivalents in `mfe-home`. Promotion to `shared-ui` is a future phase.
- **No new DS primitives.** Compose from existing tokens or accept the visual gap. Don't patch the DS as a side effect.
- **Explicit `Observable<T>` annotations** on every observable field — InjectionToken generic inference has bitten Phases 4 and 5.
- **`combineLatest([])` never emits** — guard `competitions.length === 0` with `of([])`.
- **No `Date` parsing for sort** — ISO-8601 strings sort correctly with `localeCompare`.
- **Cap upcoming at 3.** The point is the personalization signal, not exhaustive listing.
- **Never import from `rxjs/operators`.** Use top-level `'rxjs'` (Phase 5 lesson).
- **Do not modify `CLAUDE.md`.** Do not bump Angular / Nx / Storybook / federation / RxJS.
- **If any step fails, stop and report.** No broken intermediate states.

---

## Troubleshooting notes

- **`NullInjectorError: No provider for InjectionToken SPORTS_DATA_SERVICE`** — Step 1 binding missing or placed in `app.config.ts`.
- **Empty page, no errors** — `vm$` likely never emits. Check that the seeded user `u-demo-001` exists in the auth mock and that `getFavoriteTeams`/`getFavoriteCompetitions` return synchronously via `of([...])`. Check the explicit `Observable<HomeVm>` annotation; without it the async pipe silently emits `null` under strict template type checking.
- **`combineLatest never emits`** — likely an empty array passed to `combineLatest([])` in `upcomingFromFavorites$`. The `competitions.length === 0` guard is mandatory.
- **Live tile shows the wrong match** — recheck OR logic: `teamIds.has(m.home.team.id) || teamIds.has(m.away.team.id) || competitionIds.has(m.competition.id)`.
- **Upcoming order looks random** — `sort` mutates; ensure `.slice()` before `.sort()` so the upstream `readonly Fixture[]` isn't mutated and `.slice(0, 3)` operates on the sorted copy.
- **Phase 7 `/profile` page regresses** — Phase 8 should not touch any profile code paths; if it does, the diff has crept out of `mfe-home`.
- **`routerLink="/competition"` throws "no router"** — TestBed missing `provideRouter([])`.
- **`Cannot override provider...`** — TestBed already instantiated. Move `createComponent`/`detectChanges` into the `setup()` helper and reset in `afterEach`.

---

## Risk, ownership, and rollout notes

- **Risk:** low.
  - The pattern re-applies Phase 4 (sports-data binding) + Phase 7 (profile binding + reactive `vm$`). No new contracts, no new libs, no DS changes.
  - The only new shape is multi-source composition, and it's a pure read/filter pipeline.
- **Blast radius:** `/home` only. All other remotes untouched. Shell untouched. Libs untouched.
- **Ownership:** `mfe-home/*` owned by the home remote team. No platform-lib changes.
- **Rollout:** independently deployable. New remote consumes existing public contracts; no shell rebuild required.
- **Backend-readiness signal:** `liveFromFavorites$` + `upcomingFromFavorites$` are the exact aggregation a future BFF (or a profile-aware sports endpoint) should serve as a single payload. If frontend latency becomes an issue once HTTP is wired, this composition is the first candidate to push backend-side.

---

## What Phase 9 looks like (explicit deferral)

- HTTP adapter behind `SportsDataService` (or `ProfileService`) — replace the mock with a real `fetch`-based implementation, keep the mock as a dev/test fallback.
- `mfe-team` page activation: drill-down from a followed team showing recent + upcoming fixtures + the team's standings row.
- Match detail route on `mfe-live` (`/live/:matchId`).
- `libs/shared-ui` lib creation — promote `FixtureRow` (or its slim `FixtureTile` variant) once the third consumer materializes.
- Live polling / refresh interval for the live sections.
