# Phase 5 — Fixtures + Standings on `mfe-competition`

## Context

Phase 4 shipped a single-consumer proof of the `sports-data` contract: `mfe-live` injects `SPORTS_DATA_SERVICE`, reads `getLiveMatches()`, and renders a list of `MatchCard`s. That validates the wiring but does not yet exercise the architecture:

- **Only one remote consumes the lib.** "Provider-agnostic, cross-remote reusable" is an unproven claim until a second remote pulls the same token.
- **Only one data shape exists.** The service returns a cross-competition live stream. The product also needs **per-competition lookup** (fixtures and standings scoped to a single competition), which has different request/response ergonomics.
- **Every remote today is a single flat route.** Nested routing inside a federated remote has not been demonstrated.

Phase 5 closes these three gaps by building the smallest useful feature on `mfe-competition`: a competitions list that drills into a selected competition's **upcoming fixtures** and **current standings**. After Phase 5:

- `@platform/shared-types` gains `Fixture`, `StandingRow`, and `Standing`.
- `SportsDataService` gains `getFixtures(competitionId)` and `getStandings(competitionId)`, both backed by the mock.
- `mfe-competition` owns a nested route tree — `/competition` (overview list) and `/competition/:competitionId` (detail with fixtures + standings) — and its own domain-local components: `CompetitionList`, `CompetitionDetail`, `FixtureRow`, `StandingsTable`.
- **Zero new DS primitives.** Tables are built from CSS Grid + DS tokens inside `mfe-competition` (domain-local per CLAUDE.md). If a second remote later needs the same table shape, promote it to DS then.
- `mfe-live`, `mfe-home`, `mfe-team`, `mfe-profile` untouched.

Explicitly deferred to Phase 6+: real HTTP adapter, backend service, live polling, auth/profile/favorites, feature work on the remaining three placeholder remotes, new DS primitives (`DsTable`, `DsTabs`, `DsBreadcrumb`, etc.), match detail route on `mfe-live`.

**Why this slice:** extending the `SportsDataService` shape (parameterized reads), consuming it from a second remote, and introducing nested routing are three separable risks the platform has not yet covered. Bundling them into one small feature validates all three at once without inflating scope.

---

## Locked versions (unchanged)

Node 20.x LTS · Nx `21.6.11` · Angular `~20.3.0` · `@angular-architects/native-federation` `20.3.1` · TypeScript `~5.9.2` · Storybook `^10.3.5`. Reject upgrade prompts.

---

## Target repo layout after Phase 5

```
Nx/
├── frontend/
│   ├── apps/
│   │   ├── mfe-competition/
│   │   │   └── src/app/
│   │   │       ├── app.config.ts                    # binds SPORTS_DATA_SERVICE
│   │   │       ├── remote.routes.ts                 # nested: '' + ':competitionId'
│   │   │       ├── landing/                         # deleted (no longer routed)
│   │   │       ├── competition-list/                # NEW
│   │   │       │   ├── competition-list.ts
│   │   │       │   ├── competition-list.html
│   │   │       │   ├── competition-list.scss
│   │   │       │   └── competition-list.spec.ts
│   │   │       └── competition-detail/              # NEW
│   │   │           ├── competition-detail.ts
│   │   │           ├── competition-detail.html
│   │   │           ├── competition-detail.scss
│   │   │           ├── competition-detail.spec.ts
│   │   │           ├── fixture-row/                 # NEW — presentation
│   │   │           │   ├── fixture-row.ts
│   │   │           │   ├── fixture-row.html
│   │   │           │   ├── fixture-row.scss
│   │   │           │   └── fixture-row.spec.ts
│   │   │           └── standings-table/             # NEW — presentation
│   │   │               ├── standings-table.ts
│   │   │               ├── standings-table.html
│   │   │               ├── standings-table.scss
│   │   │               └── standings-table.spec.ts
│   │   └── (shell, mfe-home, mfe-live, mfe-team, mfe-profile untouched)
│   └── libs/
│       ├── shared-types/
│       │   └── src/lib/
│       │       ├── match.ts                         # unchanged
│       │       ├── shared-types.ts                  # adds `export * from './standings'`
│       │       ├── fixture.ts                       # NEW
│       │       └── standings.ts                     # NEW
│       └── sports-data/
│           └── src/lib/
│               ├── sports-data.service.ts           # +2 methods on interface
│               ├── mock-sports-data.service.ts     # +2 method implementations
│               ├── mock-sports-data.service.spec.ts # +coverage for new methods
│               └── fixtures/
│                   ├── live-matches.fixture.ts     # unchanged
│                   ├── fixtures.fixture.ts          # NEW
│                   └── standings.fixture.ts        # NEW
```

---

## Prerequisites

From `c:\Users\edy_0\projects\Nx`, Phase 4 baseline must be green:

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data
```

If any project fails, **stop** and rebaseline before starting Phase 5.

---

## Step 1 — Extend `shared-types` with fixture + standings shapes

### 1a. Create `frontend/libs/shared-types/src/lib/fixture.ts`

```ts
import { Competition, Team } from './shared-types';

export interface Fixture {
  readonly id: string;
  readonly competition: Competition;
  readonly home: Team;
  readonly away: Team;
  /** Kick-off time in ISO 8601. */
  readonly kickoffAt: string;
  /** Matchweek / round number within the competition, when applicable. */
  readonly matchday?: number;
}
```

Rules:
- `Fixture` ≠ `MatchSummary`. A fixture is scheduled/upcoming (no score, no status). A MatchSummary is live/finished (has status + score).
- No `venue`, no `broadcaster`, no `referee`. Add those fields when a feature needs them, not speculatively.

### 1b. Create `frontend/libs/shared-types/src/lib/standings.ts`

```ts
import { Competition, Team } from './shared-types';

export interface StandingRow {
  readonly position: number;
  readonly team: Team;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
}

export interface Standing {
  readonly competition: Competition;
  readonly rows: readonly StandingRow[];
  /** When the standings snapshot was computed (ISO 8601). */
  readonly updatedAt: string;
}
```

Rules:
- `goalDifference` is **pre-computed on the contract** so the UI never does arithmetic that could disagree with the backend.
- `readonly` throughout.
- International fixtures may not have standings in the real product; for the mock we only expose standings for `UCL`, `PL`, `LIGA`.

### 1c. Re-export from the barrel

Append to `frontend/libs/shared-types/src/lib/shared-types.ts`:

```ts
export * from './fixture';
export * from './standings';
```

### 1d. Add compile-time tests

Extend `frontend/libs/shared-types/src/lib/shared-types.spec.ts` with one test per new type (mirror the existing `MatchSummary` test pattern).

### 1e. Verify

```bash
npx nx lint shared-types && npx nx test shared-types
```

---

## Step 2 — Extend the `sports-data` contract

### 2a. Extend the interface in `frontend/libs/sports-data/src/lib/sports-data.service.ts`

```ts
export interface SportsDataService {
  getLiveMatches(): Observable<readonly MatchSummary[]>;
  getMatch(id: string): Observable<MatchSummary | undefined>;

  /** Upcoming fixtures for a competition, ordered by kickoffAt ascending. Empty array if unknown. */
  getFixtures(competitionId: string): Observable<readonly Fixture[]>;

  /** Current standings snapshot for a competition. Undefined if the competition does not have standings (e.g. INT). */
  getStandings(competitionId: string): Observable<Standing | undefined>;
}
```

Also add `Fixture` and `Standing` to the imports from `@platform/shared-types`.

### 2b. Create `frontend/libs/sports-data/src/lib/fixtures/fixtures.fixture.ts`

Provide 3–5 upcoming fixtures **per competition** (`UCL`, `PL`, `LIGA`, `INT`), keyed by competition id. Kickoff times should be in the near future (use ISO strings relative to `2026-04-23` onwards — do not import date libs).

Export shape:

```ts
export const FIXTURES_BY_COMPETITION: Readonly<Record<string, readonly Fixture[]>>;
```

### 2c. Create `frontend/libs/sports-data/src/lib/fixtures/standings.fixture.ts`

Provide full-shape `Standing` for `pl`, `liga`, `ucl` (group-stage snapshot is fine — 4–6 rows per competition is plenty). **No standings entry for `int`** (to exercise the `undefined` branch in the consumer).

Export shape:

```ts
export const STANDINGS_BY_COMPETITION: Readonly<Record<string, Standing>>;
```

Keep each table 4–8 rows. Don't invent a full 20-team Premier League; the product value is proving the data flow.

### 2d. Implement in `frontend/libs/sports-data/src/lib/mock-sports-data.service.ts`

```ts
getFixtures(competitionId: string): Observable<readonly Fixture[]> {
  return of(FIXTURES_BY_COMPETITION[competitionId] ?? []);
}

getStandings(competitionId: string): Observable<Standing | undefined> {
  return of(STANDINGS_BY_COMPETITION[competitionId]);
}
```

Rules:
- Fixture lookup returns `[]` for unknown id — empty is a valid state, not an error.
- Standings lookup returns `undefined` for unknown id — a legitimate "no standings for this competition" signal. Do not fabricate empty standings.

### 2e. Extend `frontend/libs/sports-data/src/lib/mock-sports-data.service.spec.ts`

Add coverage for:
- `getFixtures('pl')` emits a non-empty array, all fixtures have `competition.code === 'PL'`
- `getFixtures('unknown')` emits `[]`
- `getStandings('pl')` emits a `Standing` with monotonic `position` (1, 2, 3, …) and `goalDifference === goalsFor - goalsAgainst` (sanity)
- `getStandings('int')` emits `undefined`

### 2f. Barrel exports

No change to `frontend/libs/sports-data/src/index.ts`. The new fixtures are implementation detail; only the interface surface matters to consumers.

### 2g. Verify

```bash
npx nx lint sports-data && npx nx test sports-data
```

---

## Step 3 — Wire `sports-data` into `mfe-competition`

Open `frontend/apps/mfe-competition/src/app/app.config.ts` and add inside the `providers` array:

```ts
import { MockSportsDataService, SPORTS_DATA_SERVICE } from '@platform/sports-data';

{ provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService },
```

Rules mirror Phase 4:
- `useExisting` (not `useClass`) because `MockSportsDataService` is `providedIn: 'root'`.
- Binding lives in the **remote's** app.config, not the shell. Keeps `mfe-competition` independently deployable.
- Do **not** put the binding on a route-level provider.

---

## Step 4 — `CompetitionList` (the `/competition` route)

### 4a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-competition/src/app/competition-list/competition-list \
  --name=competition-list \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive
```

### 4b. Design

- Purely presentational; no sports-data call. The four competitions are static metadata (`UCL`, `PL`, `LIGA`, `INT`) with human names already in `shared-types`.
- Renders a `DsList` of `DsListItem`s; each item wraps a `routerLink="/competition/{id}"` navigation card (composed from `DsCard` with `variant="flat"`).
- Template uses native `@for` over an inline `readonly Competition[]` field defined on the class.
- Use the **shell's** `/competition/...` path (not relative) — the MFE is mounted there by the host.

### 4c. Test

Single spec: render the component, assert four list items exist, assert each has a `routerLink` pointing to `/competition/<code-lowercase>`. Provide `RouterTestingHarness` or `provideRouter([])` in the TestBed.

---

## Step 5 — `CompetitionDetail` (the `/competition/:competitionId` route)

### 5a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-competition/src/app/competition-detail/competition-detail \
  --name=competition-detail \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive
```

### 5b. Component

```ts
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import type { Fixture, Standing } from '@platform/shared-types';
import { map, switchMap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { FixtureRow } from './fixture-row/fixture-row';
import { StandingsTable } from './standings-table/standings-table';

// imports: [AsyncPipe, FixtureRow, StandingsTable, DsList, DsListItem]
// standalone + OnPush
export class CompetitionDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);

  protected readonly competitionId$: Observable<string> =
    this.route.paramMap.pipe(map((p) => p.get('competitionId') ?? ''));

  protected readonly fixtures$: Observable<readonly Fixture[]> =
    this.competitionId$.pipe(switchMap((id) => this.sportsData.getFixtures(id)));

  protected readonly standings$: Observable<Standing | undefined> =
    this.competitionId$.pipe(switchMap((id) => this.sportsData.getStandings(id)));
}
```

Rules:
- Explicit `Observable<T>` annotations — avoid the InjectionToken-generic-inference issue that bit Phase 4 under strict template type checking.
- `switchMap` on route param changes so navigating between `/competition/pl` and `/competition/ucl` re-fetches cleanly.
- No manual `subscribe()`. `AsyncPipe` only.

### 5c. Template sections

```html
<section class="competition-detail">
  @if (competitionId$ | async; as competitionId) {
    <header class="competition-detail__header">
      <a routerLink="/competition" class="competition-detail__back">← All competitions</a>
      <h1 class="competition-detail__title">{{ competitionId | uppercase }}</h1>
    </header>

    <section class="competition-detail__block">
      <h2 class="competition-detail__heading">Upcoming fixtures</h2>
      @if (fixtures$ | async; as fixtures) {
        @if (fixtures.length > 0) {
          <ds-list>
            @for (fixture of fixtures; track fixture.id) {
              <ds-list-item>
                <mfe-competition-fixture-row [fixture]="fixture" />
              </ds-list-item>
            }
          </ds-list>
        } @else {
          <p class="competition-detail__empty">No upcoming fixtures.</p>
        }
      }
    </section>

    <section class="competition-detail__block">
      <h2 class="competition-detail__heading">Standings</h2>
      @if (standings$ | async; as standings) {
        <mfe-competition-standings-table [standing]="standings" />
      } @else {
        <p class="competition-detail__empty">Standings not available for this competition.</p>
      }
    </section>
  }
</section>
```

Rules:
- Native `@if` / `@for` only, no `*ngIf` / `*ngFor`.
- No `CommonModule`; only `AsyncPipe` (and add `UpperCasePipe` if you use `| uppercase`).
- The "Standings not available" fallback exercises the `undefined` branch from Step 2d.

### 5d. Tests

Use `provideRouter([])` + `ActivatedRoute` stub with a `paramMap` of `{ competitionId: 'pl' }`. Provide the `SPORTS_DATA_SERVICE` token with a `useValue` stub identical to Phase 4's pattern. Two tests:
- With `competitionId: 'pl'`: asserts at least one fixture row + the standings table renders.
- With `competitionId: 'int'` and a stub that returns `undefined` standings: asserts the fallback copy renders.

---

## Step 6 — `FixtureRow` presentation component (domain-local)

### 6a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-competition/src/app/competition-detail/fixture-row/fixture-row \
  --name=fixture-row \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive
```

### 6b. Component

- `@Input({ required: true }) fixture!: Fixture`
- Template shows: `{{ kickoffAt | date:'EEE d MMM HH:mm' }}` · home team name · "vs" · away team name · optional `MD {{ matchday }}` chip on the right.
- Imports: `DatePipe` only. No DS primitive needed; this row lives inside a `ds-list-item`.

### 6c. SCSS — DS tokens only

CSS Grid for the row layout. No hex, no hardcoded rem. Use `--ds-space-*`, `--ds-font-size-*`, `--ds-color-text`, `--ds-color-text-muted`.

### 6d. Test

Single render test asserting team names + formatted kickoff render in the DOM.

---

## Step 7 — `StandingsTable` presentation component (domain-local)

### 7a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-competition/src/app/competition-detail/standings-table/standings-table \
  --name=standings-table \
  --standalone=true --style=scss --changeDetection=OnPush --skipTests=false --no-interactive
```

### 7b. Component

- `@Input({ required: true }) standing!: Standing`
- Renders a **semantic `<table>`** with `<thead>` (Pos, Team, P, W, D, L, GF, GA, GD, Pts) and `<tbody>` iterating `standing.rows` via `@for`.
- Accessibility: `<caption class="sr-only">{{ standing.competition.name }} standings</caption>` for screen readers.
- No DS dependency; the table is domain-specific and lives local to the remote.

### 7c. SCSS

- `:host { display: block; overflow-x: auto; }` so narrow viewports scroll.
- `.standings-table { width: 100%; border-collapse: collapse; }` — rows padded with `--ds-space-2`/`--ds-space-3`, alt-row background via `--ds-color-surface-alt` (if that token exists; otherwise add it to DS tokens as a small follow-up — **do not** add it as part of Phase 5 unless required). Numeric cells right-aligned.
- Add a `.sr-only { ... }` utility locally (standard visually-hidden pattern) — do not pull in a shared utility, there isn't one yet.

### 7d. Test

Render with a 3-row `Standing`. Assert `<tr>` count in `<tbody>` equals 3 and that positions render in order.

**Rule:** if a DS token needed for this table is missing, **stop**. Don't inline a hex; either reuse an existing token (e.g. render alt rows with `background: color-mix(...)` of existing tokens if CSS allows, or accept a single-tone table) or flag the gap.

---

## Step 8 — Route `/competition` to the nested tree

Edit `frontend/apps/mfe-competition/src/app/remote.routes.ts`:

```ts
import { Routes } from '@angular/router';

export const remoteRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./competition-list/competition-list').then((m) => m.CompetitionList),
  },
  {
    path: ':competitionId',
    loadComponent: () =>
      import('./competition-detail/competition-detail').then((m) => m.CompetitionDetail),
  },
];
```

Rules:
- Both routes `loadComponent` — no `children: [...]` nesting, because each leaf is a full page. Nested `<router-outlet>` is not needed.
- Delete `frontend/apps/mfe-competition/src/app/landing/` **only if** `nx lint mfe-competition` fails with an unused-file error after the route change. Otherwise, leave it — tightening that cleanup belongs to the later placeholder-removal sweep.

---

## Step 9 — End-to-end verification

### 9a. Affected lint + test + build

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data
```

All 9 projects × 3 targets must be green.

### 9b. Graph check

```bash
npx nx graph --file=graph.json
```

Expected new edge: `mfe-competition → sports-data`. Expected **absent** edges:
- `shell → sports-data`
- `mfe-home`, `mfe-team`, `mfe-profile` → `sports-data`
- Any remote-to-remote edge

Delete `graph.json` after inspecting.

### 9c. Dev smoke

```bash
npm run dev
```

Browser flow at `http://localhost:4200`:
1. Click **Competitions** in the top-nav → `/competition` renders the list of four competition cards.
2. Click any competition card → URL becomes `/competition/<id>`, page shows **Upcoming fixtures** list + **Standings** table (or the "Standings not available" fallback for `int`).
3. Click **← All competitions** → navigation back to the list works.
4. Click a different competition → fixtures + standings re-fetch without a full page reload.
5. Click **Live** in top-nav → Phase 4's LiveNow still works (regression guard).
6. Browser console: zero errors.

Ctrl+C.

### 9d. Storybook smoke (unchanged but verify nothing regressed)

```bash
npm run dev:storybook
```

All 5 primitive stories still render. Ctrl+C.

---

## Step 10 — Commit

```bash
git status   # sanity: no node_modules, no dist, no graph.json
git add <explicit paths>
git commit -m "Phase 5: fixtures + standings on mfe-competition"
```

Do **not** push; wait for human review.

---

## Acceptance checklist

- [ ] `shared-types` exports `Fixture`, `Standing`, `StandingRow`
- [ ] `shared-types` barrel re-exports `./fixture` and `./standings`
- [ ] `SportsDataService` interface declares `getFixtures` and `getStandings`
- [ ] `MockSportsDataService` implements both; backed by `FIXTURES_BY_COMPETITION` and `STANDINGS_BY_COMPETITION`
- [ ] New fixtures are **not** re-exported from the sports-data barrel
- [ ] `getStandings('int')` returns `undefined` (exercises the fallback branch)
- [ ] `mfe-competition/app.config.ts` binds `SPORTS_DATA_SERVICE` via `useExisting: MockSportsDataService`
- [ ] `CompetitionList`, `CompetitionDetail`, `FixtureRow`, `StandingsTable` are standalone + OnPush
- [ ] `CompetitionDetail` uses `switchMap` on `paramMap` (not `this.route.snapshot`)
- [ ] `StandingsTable` renders a semantic `<table>` with `<thead>` + `<tbody>` + `<caption class="sr-only">`
- [ ] Templates use native `@if` / `@for` — no `*ngIf`, no `CommonModule`
- [ ] No hex / hardcoded rem / px in new SCSS — DS tokens only
- [ ] `remote.routes.ts` exposes `''` → `CompetitionList` and `':competitionId'` → `CompetitionDetail`
- [ ] `nx graph` shows `mfe-competition → sports-data → shared-types` and no cross-remote edges
- [ ] `shell` does **not** depend on `sports-data`
- [ ] `npm run dev` — `/competition` list works, clicking a card deep-links, back link works, `int` shows the standings fallback
- [ ] Phase 4 `/live` page still works (regression guard)
- [ ] `CLAUDE.md` unchanged

---

## Out of scope for Phase 5

- Real HTTP adapter or backend service (stays Phase 6+).
- Live polling / WebSocket / SSE.
- New DS primitives (`DsTable`, `DsTabs`, `DsBreadcrumb`, `DsIcon`, …).
- Auth / profile / favorites / follow competitions.
- Feature work on `mfe-home`, `mfe-team`, `mfe-profile`.
- Match detail route on `mfe-live` (separate future phase).
- Storybook stories for domain-local components — Storybook is DS-only today.
- Provider-specific mapping (football-data.org, API-Football).
- Cache invalidation / in-memory cache.
- Analytics, logging, instrumentation.
- CircleCI / CloudFront / deployment changes.

---

## Guardrails for the executing model

- **Types → lib → consumer, in order.** Don't write `CompetitionDetail` before `Fixture` and `Standing` compile. Don't implement the mock before the interface changes.
- **Domain-local components stay domain-local.** `FixtureRow` and `StandingsTable` live inside `mfe-competition`. They are **not** promoted to DS or `shared-ui` in this phase. If Phase 6 shows a second remote wants the same table, promote then.
- **Never inject `MockSportsDataService` directly** in a component. Always via `SPORTS_DATA_SERVICE`.
- **Never add mock-specific methods to the interface.** The interface is the future-backend contract.
- **No shell edits.** Shell already routes `/competition` to `mfe-competition`. Nested routing is the remote's job.
- **No new Nx tag rules.** `scope:competition` already can depend on `scope:shared` and `scope:design-system`.
- **No DS changes.** If a UI shape demands a token that doesn't exist, either compose from existing tokens or stop and raise it as a DS gap — don't patch tokens as a side effect of this phase.
- **Keep the fixture small.** 4–8 standings rows per competition, 3–5 fixtures per competition. The point is flow, not realism.
- **If any step fails, stop and report.** No broken intermediate states.
- Do not modify `CLAUDE.md`. Do not bump Angular / Nx / Storybook / federation.

---

## Troubleshooting notes

- **`NullInjectorError: No provider for InjectionToken SPORTS_DATA_SERVICE`** — `mfe-competition/app.config.ts` binding missing. Re-check Step 3.
- **Route `/competition/pl` renders `CompetitionList` instead of detail** — `remote.routes.ts` has `''` first with a `pathMatch: 'full'` missing; use the exact shape from Step 8 (no `pathMatch` needed since both routes are top-level). Also confirm `mfe-competition/src/app/app.routes.ts` (the app-level wrapper) isn't hijacking the path.
- **`paramMap` emits before the mock returns** — expected; `switchMap` serializes the dependency. If the template never renders anything, check the explicit `Observable<T>` annotation (the token loses its generic under strict template type checking — same trap as Phase 4's `matches$`).
- **ESLint complains `'@platform/shared-types' has no exported member 'Fixture'`** — the barrel re-export in Step 1c is missing.
- **`StandingsTable` renders with no alt-row striping** — acceptable. Don't invent a `--ds-color-surface-alt` token to fix it; raise it as a DS follow-up if the design requires it.
- **Phase 4's `/live` page regresses** — something in sports-data broke the `getLiveMatches` branch. Check the spec added in Step 2e is still green **alongside** Phase 4's existing specs (`getLiveMatches`, `getMatch`).

---

## Risk, ownership, and rollout notes

- **Risk**: low-medium.
  - Low: Phase 4 proved the sports-data wiring pattern. Phase 5 replays it.
  - Medium: the interface is widening. If any new method leaks a mock convenience (e.g. `getFixturesIncludingFinished`), the contract becomes untrustable when the HTTP adapter lands. The guardrail above catches this.
- **Blast radius**: `/competition` only. Shell, Home, Live, Team, Profile all untouched.
- **Ownership**: `sports-data` + `shared-types` owned by platform. `mfe-competition/*` owned by the competition remote team.
- **Rollout**: single atomic unit — the new contract, the mock implementation, and the consumer ship together. Merging any one alone leaves a broken graph.
- **Backend-readiness signal**: the `Fixture` / `Standing` shapes and the two new service methods are the exact contract the future HTTP adapter (and the future backend DTO) must implement. If the mock wants a field the real backend can't produce cheaply, cut the field now.
