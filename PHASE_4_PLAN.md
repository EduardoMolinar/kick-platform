# Phase 4 — Mock `sports-data` Lib + First Live-Scores Feature in `mfe-live`

## Context

Phases 0–3 built the architectural skeleton and the visual vocabulary:

- **Phase 0/1/2**: Nx workspace, shell-as-host, 5 Native Federation remotes, Nx tag boundaries, shell top-nav.
- **Phase 3**: Design system tokens + 5 primitives (`DsButton`, `DsTopNav`, `DsCard`, `DsList`/`DsListItem`, `DsBadge`) and Storybook.

Every remote is still a placeholder landing page. The DS primitives have **no real consumer**, so their APIs are theoretical until they render actual content. The platform cannot be demoed end-to-end because no remote shows anything a user would care about.

Phase 4 closes this gap by building one **coherent vertical slice**: a mock sports-data layer → a service contract → a real "Live now" feature on `mfe-live` that composes DS primitives to render live matches. This proves the full stack works: `shared-types` → `sports-data` (provider-agnostic contract) → `mfe-live` (domain UI) → `design-system` (visual primitives).

After Phase 4 the product has:

- **`shared-types` extended** with match/score/fixture types that match what a backend contract will later return.
- **New `libs/sports-data`** — a zero-HTTP mock layer exposing an injectable `SportsDataService` via a DI token. In-memory fixtures, RxJS observables, provider-agnostic. Designed so Phase 6+ can swap the mock for a real HTTP implementation without touching any consumer.
- **`mfe-live` renders a real "Live now" list page** composed of `DsCard` + `DsBadge` + `DsList`, fed by the mock service. Navigating to `/live` in the shell shows live matches for UCL, Premier League, La Liga, and International.
- **Zero new DS primitives.** The existing 5 must be enough for this feature; if one proves awkward, that's feedback to address in a later DS iteration, not now.
- **Zero backend.** The mock layer satisfies the frontend contract entirely in-memory. The service interface is the contract a future backend will implement.
- **Other 4 remotes stay placeholder.** `mfe-home`, `mfe-competition`, `mfe-team`, `mfe-profile` are untouched.

Explicitly deferred to Phase 5+: real HTTP client, backend services, provider adapter (football-data.org / API-Football), Redis cache strategy, auth/session, user profile, favorites/follows, feature work on the other 4 remotes, further DS primitives, live polling/WebSocket updates, error and empty-state design, routing into match details.

**Why this slice:** the 5 DS primitives from Phase 3 need a real consumer before they can be trusted. The mock sports-data contract needs to be designed against a real feature before it can be trusted. Building both together, in the smallest vertical slice that spans types → data → service → UI → DS, lets one feature validate every layer at once.

---

## Locked versions (unchanged)

- Node 20.x LTS
- Nx `21.6.11`
- Angular `~20.3.0`
- `@angular-architects/native-federation` `20.3.1`
- TypeScript `~5.9.2`
- Storybook `^10.3.5`

Reject upgrade prompts.

---

## Target repo layout after Phase 4

```
Nx/
├── frontend/
│   ├── apps/
│   │   ├── shell/                                # unchanged
│   │   ├── mfe-home/                             # unchanged
│   │   ├── mfe-live/
│   │   │   └── src/app/
│   │   │       ├── app.config.ts                 # provides SPORTS_DATA_SERVICE
│   │   │       ├── remote.routes.ts              # /live -> live-now feature
│   │   │       ├── landing/                      # (kept, no longer routed)
│   │   │       └── live-now/                     # NEW — the feature
│   │   │           ├── live-now.ts
│   │   │           ├── live-now.html
│   │   │           ├── live-now.scss
│   │   │           ├── live-now.spec.ts
│   │   │           └── match-card/               # NEW — local presentation cmp
│   │   │               ├── match-card.ts
│   │   │               ├── match-card.html
│   │   │               ├── match-card.scss
│   │   │               └── match-card.spec.ts
│   │   ├── mfe-competition/                      # unchanged
│   │   ├── mfe-team/                             # unchanged
│   │   └── mfe-profile/                          # unchanged
│   └── libs/
│       ├── design-system/                        # unchanged
│       ├── shared-types/
│       │   └── src/lib/
│       │       ├── shared-types.ts               # existing (Team, Competition)
│       │       └── match.ts                      # NEW — match/score/status types
│       └── sports-data/                          # NEW LIB
│           ├── project.json                      # tags: type:util, scope:shared
│           ├── src/
│           │   ├── index.ts                      # barrel exports
│           │   └── lib/
│           │       ├── sports-data.service.ts    # abstract + DI token
│           │       ├── sports-data.service.spec.ts
│           │       ├── mock-sports-data.service.ts
│           │       ├── mock-sports-data.service.spec.ts
│           │       └── fixtures/
│           │           └── live-matches.fixture.ts
│           ├── jest.config.ts
│           ├── tsconfig.json
│           ├── tsconfig.lib.json
│           ├── tsconfig.spec.json
│           └── eslint.config.mjs
└── tsconfig.base.json                            # adds @platform/sports-data path
```

---

## Prerequisites

From `c:\Users\edy_0\projects\Nx`, Phase 3 must be green:

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types
npx nx build-storybook design-system
```

All green. If anything fails, **stop** — Phase 4 depends on a working Phase 3 baseline.

---

## Step 1 — Extend `shared-types` with match types

Types are the contract both the mock layer and the future backend must honor. Define them first so every later step references a single source of truth.

### 1a. Create `frontend/libs/shared-types/src/lib/match.ts`

```ts
import { Competition, Team } from './shared-types';

export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed';

export interface Score {
  readonly home: number;
  readonly away: number;
}

export interface TeamSide {
  readonly team: Team;
  readonly score: number;
}

export interface MatchSummary {
  readonly id: string;
  readonly competition: Competition;
  readonly status: MatchStatus;
  readonly home: TeamSide;
  readonly away: TeamSide;
  /** Kick-off time in ISO 8601. */
  readonly kickoffAt: string;
  /** Live minute (e.g. 67) — present only when status is 'live' or 'halftime'. */
  readonly minute?: number;
}
```

Rules:
- `readonly` on every field — the frontend never mutates server-shaped data.
- No provider-specific fields (no `football_data_id`, no raw nested provider payloads).
- Keep the shape flat enough to render directly; only split into sub-objects where UI needs the sub-shape (e.g. `TeamSide` groups score with team).

### 1b. Re-export from `shared-types` barrel

Append to `frontend/libs/shared-types/src/lib/shared-types.ts`:

```ts
export * from './match';
```

(If the barrel is in `src/lib/index.ts` instead, adapt — the existing re-export convention wins.)

### 1c. Test the types compile

Append to `frontend/libs/shared-types/src/lib/shared-types.spec.ts`:

```ts
import { MatchSummary } from './match';

describe('match types', () => {
  it('should accept a valid MatchSummary shape', () => {
    const match: MatchSummary = {
      id: 'm1',
      competition: { id: 'ucl', name: 'Champions League', code: 'UCL' },
      status: 'live',
      home: { team: { id: 't1', name: 'Real Madrid' }, score: 1 },
      away: { team: { id: 't2', name: 'Manchester City' }, score: 1 },
      kickoffAt: '2026-04-22T19:00:00Z',
      minute: 67,
    };
    expect(match.status).toBe('live');
    expect(match.home.score + match.away.score).toBe(2);
  });
});
```

### 1d. Verify

```bash
npx nx lint shared-types
npx nx test shared-types
```

Both green.

---

## Step 2 — Scaffold `libs/sports-data`

### 2a. Generate the lib

From `c:\Users\edy_0\projects\Nx`:

```bash
npx nx g @nx/angular:library \
  --directory=frontend/libs/sports-data \
  --name=sports-data \
  --importPath=@platform/sports-data \
  --prefix=sd \
  --standalone=true \
  --tags=type:util,scope:shared \
  --skipModule=true \
  --no-interactive
```

Flag rationale:
- `type:util` — the lib ships services, not UI. A future `scope:live` consumer can depend on `scope:shared` (which `sports-data` carries), no new boundary rule needed.
- `scope:shared` — consumable by any remote that later needs sports data. Phase 4 only wires `mfe-live`, but the lib itself is cross-cutting.
- `--standalone=true` — no NgModules anywhere in the repo.
- `--skipModule=true` — generator-written `.module.ts` is useless for a service-only lib.
- `--importPath=@platform/sports-data` — matches the existing alias convention.

### 2b. Confirm the generator landed the expected shape

```bash
npx nx show project sports-data --json | grep -E '"tags"|"lint"|"test"'
```

Expect `"tags": ["type:util", "scope:shared"]` and both `lint` and `test` targets.

### 2c. Confirm the alias in `tsconfig.base.json`

The generator usually adds `"@platform/sports-data": ["frontend/libs/sports-data/src/index.ts"]` to `compilerOptions.paths`. If it did not, add it by hand.

### 2d. Delete generator-written component scaffolding if any

The generator may drop a `sports-data.component.ts` or `sports-data.ts` file. Delete everything under `src/lib/` that is not the folder itself — Step 3 writes the real contents from scratch. `src/index.ts` stays (will be rewritten in Step 3e).

### 2e. Verify the empty lib builds

```bash
npx nx lint sports-data
npx nx test sports-data
```

Test may report "no tests" — that's fine at this stage. Lint must be clean.

---

## Step 3 — Define the service contract + DI token

The contract is what consumers depend on. The implementation (mock today, HTTP later) is injected via DI so consumers never import a concrete class.

### 3a. Create `frontend/libs/sports-data/src/lib/sports-data.service.ts`

```ts
import { InjectionToken } from '@angular/core';
import type { MatchSummary } from '@platform/shared-types';
import type { Observable } from 'rxjs';

/**
 * Provider-agnostic contract for reading sports data.
 * The mock implementation (Phase 4) and the future HTTP implementation
 * must both satisfy this shape.
 */
export interface SportsDataService {
  /** Stream of matches currently in progress across all tracked competitions. */
  getLiveMatches(): Observable<readonly MatchSummary[]>;

  /** Single match by id. Emits `undefined` if not found. */
  getMatch(id: string): Observable<MatchSummary | undefined>;
}

export const SPORTS_DATA_SERVICE = new InjectionToken<SportsDataService>(
  'SPORTS_DATA_SERVICE'
);
```

Rules:
- Return **Observables**, not Promises — the future backend will push live updates; designing against observables now avoids a rewrite later.
- Return `readonly` arrays — UI never mutates the source.
- No mock-specific methods on this interface (e.g. no `_reset()`). The contract is the future HTTP contract.

### 3b. Create `frontend/libs/sports-data/src/lib/fixtures/live-matches.fixture.ts`

```ts
import type { MatchSummary } from '@platform/shared-types';

export const LIVE_MATCHES_FIXTURE: readonly MatchSummary[] = [
  {
    id: 'm-ucl-001',
    competition: { id: 'ucl', name: 'Champions League', code: 'UCL' },
    status: 'live',
    home: { team: { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' }, score: 1 },
    away: { team: { id: 't-mci', name: 'Manchester City', shortName: 'MCI' }, score: 1 },
    kickoffAt: '2026-04-22T19:00:00Z',
    minute: 67,
  },
  {
    id: 'm-pl-014',
    competition: { id: 'pl', name: 'Premier League', code: 'PL' },
    status: 'live',
    home: { team: { id: 't-ars', name: 'Arsenal', shortName: 'ARS' }, score: 2 },
    away: { team: { id: 't-liv', name: 'Liverpool', shortName: 'LIV' }, score: 0 },
    kickoffAt: '2026-04-22T18:30:00Z',
    minute: 54,
  },
  {
    id: 'm-pl-015',
    competition: { id: 'pl', name: 'Premier League', code: 'PL' },
    status: 'halftime',
    home: { team: { id: 't-che', name: 'Chelsea', shortName: 'CHE' }, score: 0 },
    away: { team: { id: 't-tot', name: 'Tottenham', shortName: 'TOT' }, score: 0 },
    kickoffAt: '2026-04-22T18:45:00Z',
    minute: 45,
  },
  {
    id: 'm-liga-007',
    competition: { id: 'liga', name: 'La Liga', code: 'LIGA' },
    status: 'live',
    home: { team: { id: 't-fcb', name: 'FC Barcelona', shortName: 'FCB' }, score: 3 },
    away: { team: { id: 't-atl', name: 'Atlético Madrid', shortName: 'ATM' }, score: 2 },
    kickoffAt: '2026-04-22T19:15:00Z',
    minute: 72,
  },
  {
    id: 'm-int-003',
    competition: { id: 'int', name: 'International', code: 'INT' },
    status: 'live',
    home: { team: { id: 't-bra', name: 'Brazil', shortName: 'BRA' }, score: 0 },
    away: { team: { id: 't-arg', name: 'Argentina', shortName: 'ARG' }, score: 1 },
    kickoffAt: '2026-04-22T20:00:00Z',
    minute: 31,
  },
];
```

Keep the fixture small (3–6 matches) but cover every `MatchStatus` UI will render (`live`, `halftime`) and every competition code so the UI surface exercises all competitions.

### 3c. Create `frontend/libs/sports-data/src/lib/mock-sports-data.service.ts`

```ts
import { Injectable } from '@angular/core';
import type { MatchSummary } from '@platform/shared-types';
import { Observable, of } from 'rxjs';
import { LIVE_MATCHES_FIXTURE } from './fixtures/live-matches.fixture';
import type { SportsDataService } from './sports-data.service';

@Injectable({ providedIn: 'root' })
export class MockSportsDataService implements SportsDataService {
  getLiveMatches(): Observable<readonly MatchSummary[]> {
    return of(LIVE_MATCHES_FIXTURE);
  }

  getMatch(id: string): Observable<MatchSummary | undefined> {
    return of(LIVE_MATCHES_FIXTURE.find((m) => m.id === id));
  }
}
```

Rules:
- `providedIn: 'root'` — the concrete class is tree-shakeable if not used.
- Consumers must **not** inject `MockSportsDataService` directly — they inject via `SPORTS_DATA_SERVICE` token (bound in `app.config.ts`, Step 5). This keeps the swap-to-HTTP path single-source.
- No polling, no timers, no simulated latency. Add those only if a concrete feature needs them — not speculatively.

### 3d. Write tests

`frontend/libs/sports-data/src/lib/mock-sports-data.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockSportsDataService } from './mock-sports-data.service';

describe('MockSportsDataService', () => {
  let service: MockSportsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockSportsDataService] });
    service = TestBed.inject(MockSportsDataService);
  });

  it('emits the live-matches fixture', async () => {
    const matches = await firstValueFrom(service.getLiveMatches());
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((m) => m.id.length > 0)).toBe(true);
  });

  it('emits a known match by id', async () => {
    const match = await firstValueFrom(service.getMatch('m-ucl-001'));
    expect(match?.competition.code).toBe('UCL');
  });

  it('emits undefined for unknown id', async () => {
    const match = await firstValueFrom(service.getMatch('does-not-exist'));
    expect(match).toBeUndefined();
  });
});
```

`frontend/libs/sports-data/src/lib/sports-data.service.spec.ts`:

```ts
import { SPORTS_DATA_SERVICE } from './sports-data.service';

describe('SportsDataService contract', () => {
  it('exports a DI token', () => {
    expect(SPORTS_DATA_SERVICE.toString()).toContain('SPORTS_DATA_SERVICE');
  });
});
```

(The interface has no runtime; a smoke test on the token is enough to prove the module imports cleanly.)

### 3e. Barrel exports in `frontend/libs/sports-data/src/index.ts`

```ts
export { SPORTS_DATA_SERVICE } from './lib/sports-data.service';
export type { SportsDataService } from './lib/sports-data.service';
export { MockSportsDataService } from './lib/mock-sports-data.service';
```

Rules:
- Export the **interface as a type-only export** — consumers should never receive runtime JavaScript for it.
- Do **not** re-export the fixture. Fixtures are implementation detail; they're internal to the mock.

### 3f. Verify

```bash
npx nx lint sports-data
npx nx test sports-data
```

Both green.

---

## Step 4 — Wire `sports-data` into `mfe-live`

### 4a. Provide the service in `frontend/apps/mfe-live/src/app/app.config.ts`

Open the file and, inside the `ApplicationConfig.providers` array, add:

```ts
import { MockSportsDataService, SPORTS_DATA_SERVICE } from '@platform/sports-data';

// inside providers:
{ provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService },
```

`useExisting` — because `MockSportsDataService` is already `providedIn: 'root'`. Using `useClass` would create a second instance.

Rules:
- Do **not** provide the mock in the shell. Each remote declares its own sports-data binding so remotes stay independently deployable.
- Do **not** put this binding in `remote.routes.ts`. Providers scoped to a lazy route don't compose well with Native Federation remote bootstrapping — app-level is correct.

---

## Step 5 — Build the `match-card` presentation component

The `match-card` lives inside `mfe-live` because it is domain-specific (match shape, `LIVE`/`HT` badges, competition codes). Per CLAUDE.md: "Domain-specific code stays in the owning remote unless it is clearly cross-cutting." It is not cross-cutting today.

### 5a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-live/src/app/live-now/match-card/match-card \
  --name=match-card \
  --standalone=true \
  --style=scss \
  --changeDetection=OnPush \
  --skipTests=false \
  --no-interactive
```

### 5b. `match-card.ts`

```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DsBadge, DsCard } from '@platform/design-system';
import type { MatchSummary } from '@platform/shared-types';

@Component({
  selector: 'mfe-live-match-card',
  standalone: true,
  imports: [DsCard, DsBadge],
  templateUrl: './match-card.html',
  styleUrl: './match-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCard {
  @Input({ required: true }) match!: MatchSummary;

  protected get badgeVariant(): 'live' | 'neutral' | 'warning' {
    switch (this.match.status) {
      case 'live':
        return 'live';
      case 'halftime':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  protected get statusLabel(): string {
    switch (this.match.status) {
      case 'live':
        return this.match.minute != null ? `LIVE ${this.match.minute}'` : 'LIVE';
      case 'halftime':
        return 'HT';
      case 'finished':
        return 'FT';
      case 'scheduled':
        return 'SCHED';
      case 'postponed':
        return 'PPD';
    }
  }
}
```

Rules:
- `@Input({ required: true })` — the component has no meaningful empty state; upstream must always pass a match.
- Status-to-badge mapping lives here, not in the service. The service ships normalized data; the UI decides how to render it.
- No `CommonModule` — use `@if`/`@for` in the template.

### 5c. `match-card.html`

```html
<ds-card variant="flat" [attr.aria-label]="'Match: ' + match.home.team.name + ' vs ' + match.away.team.name">
  <div ds-card-header class="match-card__header">
    <span class="match-card__competition">{{ match.competition.code }}</span>
    <ds-badge [variant]="badgeVariant">{{ statusLabel }}</ds-badge>
  </div>

  <div class="match-card__teams">
    <div class="match-card__row">
      <span class="match-card__team-name">{{ match.home.team.name }}</span>
      <span class="match-card__score">{{ match.home.score }}</span>
    </div>
    <div class="match-card__row">
      <span class="match-card__team-name">{{ match.away.team.name }}</span>
      <span class="match-card__score">{{ match.away.score }}</span>
    </div>
  </div>
</ds-card>
```

### 5d. `match-card.scss`

Only layout — all colors/spacing/typography via DS tokens. No hex, no hardcoded rem:

```scss
:host {
  display: block;
}

.match-card {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-3);
  }

  &__competition {
    font-size: var(--ds-font-size-xs);
    font-weight: var(--ds-font-weight-bold);
    letter-spacing: 0.04em;
    color: var(--ds-color-text-muted);
    text-transform: uppercase;
  }

  &__teams {
    display: flex;
    flex-direction: column;
    gap: var(--ds-space-2);
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-4);
    font-size: var(--ds-font-size-md);
  }

  &__team-name {
    color: var(--ds-color-text);
  }

  &__score {
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-text);
    min-width: var(--ds-space-5);
    text-align: right;
  }
}
```

### 5e. `match-card.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { MatchSummary } from '@platform/shared-types';
import { MatchCard } from './match-card';

const baseMatch: MatchSummary = {
  id: 'm-test',
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  status: 'live',
  home: { team: { id: 't1', name: 'Arsenal' }, score: 2 },
  away: { team: { id: 't2', name: 'Liverpool' }, score: 0 },
  kickoffAt: '2026-04-22T18:30:00Z',
  minute: 54,
};

describe('MatchCard', () => {
  let fixture: ComponentFixture<MatchCard>;
  let component: MatchCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MatchCard] }).compileComponents();
    fixture = TestBed.createComponent(MatchCard);
    component = fixture.componentInstance;
    component.match = baseMatch;
    fixture.detectChanges();
  });

  it('renders both team names and scores', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Arsenal');
    expect(text).toContain('Liverpool');
    expect(text).toContain('2');
    expect(text).toContain('0');
  });

  it('shows LIVE <minute> for a live match', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain("LIVE 54'");
  });

  it('shows HT for a halftime match', () => {
    component.match = { ...baseMatch, status: 'halftime' };
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('HT');
  });

  it('shows FT for a finished match', () => {
    component.match = { ...baseMatch, status: 'finished', minute: undefined };
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('FT');
  });
});
```

### 5f. Verify

```bash
npx nx lint mfe-live
npx nx test mfe-live
```

Both green.

---

## Step 6 — Build the `live-now` feature component

`live-now` is the route destination. It subscribes to `getLiveMatches()` and renders a `DsList` of `match-card`s.

### 6a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/mfe-live/src/app/live-now/live-now \
  --name=live-now \
  --standalone=true \
  --style=scss \
  --changeDetection=OnPush \
  --skipTests=false \
  --no-interactive
```

### 6b. `live-now.ts`

```ts
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DsList, DsListItem } from '@platform/design-system';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import { MatchCard } from './match-card/match-card';

@Component({
  selector: 'mfe-live-live-now',
  standalone: true,
  imports: [AsyncPipe, DsList, DsListItem, MatchCard],
  templateUrl: './live-now.html',
  styleUrl: './live-now.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveNow {
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);
  protected readonly matches$ = this.sportsData.getLiveMatches();
}
```

Rules:
- `inject()` function, not constructor DI — Angular 20 standalone idiom.
- `AsyncPipe` in `imports` (per project memory: "always add pipes to @Component.imports").
- Field name exposes `$` suffix convention only because the template uses `async` — pick whichever convention the existing remote follows; be consistent.

### 6c. `live-now.html`

```html
<section class="live-now">
  <header class="live-now__header">
    <h1 class="live-now__title">Live now</h1>
  </header>

  @if (matches$ | async; as matches) {
    @if (matches.length > 0) {
      <ds-list>
        @for (match of matches; track match.id) {
          <ds-list-item>
            <mfe-live-match-card [match]="match" />
          </ds-list-item>
        }
      </ds-list>
    } @else {
      <p class="live-now__empty">No matches in progress.</p>
    }
  }
</section>
```

Rules:
- Native `@if`/`@for` control flow — no `*ngIf`, no `*ngFor`, no `NgIf`/`NgFor` in imports.
- `track match.id` — required in `@for`.
- Empty state is plain `<p>` for now — a proper empty-state primitive is out of scope.
- No loading skeleton — the mock is synchronous. Add a skeleton when there's real latency to cover.

### 6d. `live-now.scss`

```scss
:host {
  display: block;
  padding: var(--ds-space-5) var(--ds-space-4);
}

.live-now {
  max-width: 48rem;
  margin: 0 auto;

  &__header {
    margin-bottom: var(--ds-space-4);
  }

  &__title {
    margin: 0;
    font-size: var(--ds-font-size-xl);
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-text);
  }

  &__empty {
    color: var(--ds-color-text-muted);
    font-size: var(--ds-font-size-md);
  }
}
```

### 6e. `live-now.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { MatchSummary } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE, SportsDataService } from '@platform/sports-data';
import { LiveNow } from './live-now';

const fakeMatches: readonly MatchSummary[] = [
  {
    id: 'a',
    competition: { id: 'pl', name: 'Premier League', code: 'PL' },
    status: 'live',
    home: { team: { id: 't1', name: 'Arsenal' }, score: 1 },
    away: { team: { id: 't2', name: 'Chelsea' }, score: 0 },
    kickoffAt: '2026-04-22T18:00:00Z',
    minute: 30,
  },
];

describe('LiveNow', () => {
  let fixture: ComponentFixture<LiveNow>;

  beforeEach(async () => {
    const stub: SportsDataService = {
      getLiveMatches: () => of(fakeMatches),
      getMatch: () => of(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [LiveNow],
      providers: [{ provide: SPORTS_DATA_SERVICE, useValue: stub }],
    }).compileComponents();
    fixture = TestBed.createComponent(LiveNow);
    fixture.detectChanges();
  });

  it('renders one match-card per match', () => {
    const cards = fixture.nativeElement.querySelectorAll('mfe-live-match-card');
    expect(cards.length).toBe(1);
  });

  it('renders the empty state when no matches', async () => {
    const empty: SportsDataService = {
      getLiveMatches: () => of([]),
      getMatch: () => of(undefined),
    };
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LiveNow],
      providers: [{ provide: SPORTS_DATA_SERVICE, useValue: empty }],
    }).compileComponents();
    const f = TestBed.createComponent(LiveNow);
    f.detectChanges();
    expect((f.nativeElement.textContent ?? '')).toContain('No matches in progress');
  });
});
```

### 6f. Verify

```bash
npx nx lint mfe-live
npx nx test mfe-live
```

Both green.

---

## Step 7 — Route `/live` to `LiveNow`

### 7a. Edit `frontend/apps/mfe-live/src/app/remote.routes.ts`

```ts
import { Routes } from '@angular/router';

export const remoteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./live-now/live-now').then((m) => m.LiveNow),
  },
];
```

The old `landing` route is removed. The `landing/` folder stays on disk for now (no-op; will be deleted in a later phase) — **do not** delete it as part of Phase 4. Keep the diff to what's needed for the live feature.

> Exception: if the `Landing` component is never imported from anywhere in the tree, `nx lint` will complain about an unused file. If that happens, delete the `landing/` folder — the plan anticipates this. Check with `grep -r "landing/landing" frontend/apps/mfe-live/`.

### 7b. Verify the remote still boots standalone

```bash
npx nx build mfe-live
```

Must succeed.

---

## Step 8 — End-to-end verification

### 8a. Lint + test + build the affected projects

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data
```

All 9 projects × 3 targets green.

### 8b. Graph check

```bash
npx nx graph --file=graph.json
```

Inspect:
- New edges expected: `mfe-live → sports-data`, `mfe-live → shared-types` (already existed via DS/shared-types for other reasons), `sports-data → shared-types`.
- No new edges from any **other** remote to `sports-data`. Phase 4 only wires `mfe-live`.
- `shell → sports-data` must **not** exist. The shell does not consume sports data.
- No new static edges between shell and remotes or remote-to-remote.

Delete `graph.json` after inspecting.

### 8c. Dev smoke — feature works end-to-end

```bash
npm run dev
```

Wait for shell + 5 remotes to build. In the browser:
1. Open http://localhost:4200 — shell loads, top-nav visible.
2. Click **Live** — the `/live` route lazy-loads `mfe-live` via federation and renders the `LiveNow` page.
3. Expect: page heading "Live now", a bordered list of 5 match cards (from the fixture), each card showing competition code, a `LIVE` or `HT` badge in the right color, both team names, both scores.
4. Tokens must visibly apply: shadows/borders per DS, badge colors consistent with Storybook.
5. Browser console: zero errors.
6. Navigate away (click **Home**), then back to **Live** — the page re-renders cleanly.

Ctrl+C to stop.

### 8d. Storybook smoke (DS unchanged but verify nothing regressed)

```bash
npm run dev:storybook
```

Open Storybook — all 5 primitive stories still render. Ctrl+C.

---

## Step 9 — Acceptance checklist

- [ ] `frontend/libs/shared-types/src/lib/match.ts` exports `MatchStatus`, `Score`, `TeamSide`, `MatchSummary`
- [ ] `frontend/libs/shared-types/src/lib/shared-types.ts` re-exports `./match`
- [ ] `shared-types` spec exercises a `MatchSummary` literal
- [ ] `frontend/libs/sports-data/` exists with tags `type:util`, `scope:shared`
- [ ] `tsconfig.base.json` has `@platform/sports-data` path
- [ ] `SPORTS_DATA_SERVICE` token and `SportsDataService` interface are exported from the barrel as type-only for the interface
- [ ] `MockSportsDataService` implements `SportsDataService`, is `providedIn: 'root'`, and emits from `LIVE_MATCHES_FIXTURE`
- [ ] Fixture is **not** re-exported from the barrel
- [ ] `mfe-live`'s `app.config.ts` binds `SPORTS_DATA_SERVICE` to `MockSportsDataService` via `useExisting`
- [ ] `MatchCard` component lives in `mfe-live/src/app/live-now/match-card/`, standalone + OnPush, composes `DsCard` + `DsBadge`
- [ ] `LiveNow` component lives in `mfe-live/src/app/live-now/`, standalone + OnPush, uses `inject(SPORTS_DATA_SERVICE)` + `AsyncPipe` + `DsList`/`DsListItem`
- [ ] `mfe-live/src/app/remote.routes.ts` routes `''` to `LiveNow` (not `Landing`)
- [ ] Templates use native `@if` / `@for` control flow (no `*ngIf`, no `CommonModule`)
- [ ] No hardcoded hex or rem in `mfe-live` SCSS — only DS tokens
- [ ] `npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data` all green
- [ ] `npm run dev` — clicking **Live** shows the `LiveNow` page with 5 match cards from the fixture
- [ ] `nx graph` shows `mfe-live → sports-data → shared-types` and no unintended new edges
- [ ] `CLAUDE.md` unchanged
- [ ] No new cross-remote or remote-to-remote edges
- [ ] Shell does not depend on `sports-data`

---

## Step 10 — Commit Phase 4

From `c:\Users\edy_0\projects\Nx`:

```bash
git status
# Sanity-check: no node_modules, no dist, no storybook-static, no .nx/cache, no graph.json
git add .
git commit -m "Phase 4: sports-data mock lib + first live-scores feature on mfe-live"
```

Do NOT push — wait for human review.

---

## Explicitly out of scope for Phase 4

Do not create in Phase 4:

- Real HTTP client or backend adapter (football-data.org, API-Football)
- Backend services (sports-api, profile-api, BFF), API Gateway, ECS, Redis
- Any `auth` or `profile` lib; no favorites, no follows, no login
- Feature work in `mfe-home`, `mfe-competition`, `mfe-team`, `mfe-profile`
- Further DS primitives (`DsInput`, `DsModal`, `DsTabs`, `DsIcon`, `DsSpinner`, `DsAvatar`)
- Dark-mode / theming
- Live polling, WebSocket, SSE, or any real-time subscription plumbing
- Loading skeletons, proper error states, retry UX — the mock is synchronous and always succeeds
- Match detail route, team pages, competition pages, fixtures, standings
- Storybook stories for `MatchCard` or `LiveNow` — these are remote-owned; Storybook is DS-only today
- Cache layer (in-memory or otherwise) — mock is trivial enough that caching is premature
- Instrumentation, analytics, logging
- CircleCI pipeline changes, CloudFront config, deployment

If tempted to add any of the above — don't.

---

## Guardrails for the executing model

- **Types first, lib second, service third, consumer last.** Each gates the next. Don't write `MatchCard` before `MatchSummary` compiles; don't bind `SPORTS_DATA_SERVICE` before the token exists.
- **Never import `MockSportsDataService` from `mfe-live` feature components.** Consumers inject via the token only. If a feature needs to import the mock class, the DI wiring is wrong.
- **Never add mock-specific methods to the `SportsDataService` interface.** The interface is the backend contract. Test seams belong on the mock class, not the contract.
- **Never put sports-data providers in the shell.** Each remote owns its own data bindings so remotes stay independently deployable.
- **Keep the lib zero-dep beyond Angular + RxJS + `@platform/shared-types`.** No HTTP client. No icon packs. No date libs — ISO strings are fine.
- **No hardcoded hex / rem / ms in `mfe-live` SCSS.** Only DS tokens. If a value isn't in tokens, **stop** — adding new tokens is a DS change, not a feature change.
- **Never break existing DS public APIs.** `DsCard`, `DsBadge`, `DsList`, `DsListItem` are consumed as-is. If a feature wants a new DS API, file it as future-DS work; don't mutate current components.
- **Never add `CommonModule` or module-based imports.** Standalone Angular + native control flow.
- **Respect tag boundaries.** `mfe-live` (`scope:live`) can depend on `scope:shared` (where `sports-data` lives) and `scope:design-system`. No other edges. No new depConstraints needed.
- **Placeholder remotes stay placeholder.** Do not touch `mfe-home`, `mfe-competition`, `mfe-team`, `mfe-profile`.
- If any step fails, stop and report. Do not ship a broken intermediate state.
- Do not modify `CLAUDE.md`.
- Do not bump Angular, Nx, Storybook, or federation versions.

---

## Troubleshooting notes

- **`NG0203: inject() must be called from an injection context`** — called at a field initializer outside a standalone component or service. Move the `inject()` call inside the component class body as a field, not at module top level.
- **`NullInjectorError: No provider for InjectionToken SPORTS_DATA_SERVICE`** — `app.config.ts` doesn't bind the token. Add the `{ provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService }` provider.
- **`Can't bind to 'match' since it isn't a known property`** — the component consuming `MatchCard` forgot to add `MatchCard` to its `imports` array.
- **Empty page when clicking Live** — check the shell's federation manifest still lists `mfe-live: http://localhost:4202/remoteEntry.json` and that `mfe-live`'s `remote.routes.ts` exports `remoteRoutes`. Don't edit `mfe-live`'s exposed module name.
- **`sports-data` test fails with `NullInjectorError`** — Angular TestBed needs `MockSportsDataService` in `providers`, OR the test should call `TestBed.inject(MockSportsDataService)` (works because `providedIn: 'root'`). Don't reach across the DI boundary in tests with manual `new MockSportsDataService()`.
- **ESLint complains `'@platform/sports-data' not found`** — `tsconfig.base.json` path wasn't added. Add it.
- **`mfe-live` build succeeds but at runtime the Live page renders nothing** — the `AsyncPipe` subscription may be evaluating against a strict-null mismatch. Check the `@if (matches$ | async; as matches)` brace is present; without `as matches` the template can't reach the emitted value.
- **Storybook regresses after Phase 4** — it shouldn't; Phase 4 does not touch `design-system` or `.storybook/`. If it does, revert any accidental edit outside `mfe-live/` and `libs/sports-data/` and `libs/shared-types/`.
- **Unused `landing/` folder causes lint to fail** — delete `frontend/apps/mfe-live/src/app/landing/` (the whole folder). This is the one file-deletion Phase 4 sanctions.

---

## Risk, ownership, and rollout notes

- **Risk**: low-medium.
  - Low: DS primitives, shared-types, shell, other 4 remotes are not touched.
  - Medium: this is the first lib in the repo that exposes a service via an injection token. If the DI wiring is wrong, the feature silently fails. Tests in Step 6e (empty-state branch using `{ provide: SPORTS_DATA_SERVICE, useValue: stub }`) catch this.
- **Blast radius if the mock service breaks**: only `/live` fails. Other 4 remotes do not inject `SPORTS_DATA_SERVICE`.
- **Ownership**: `sports-data` owned by platform + sports-data-integration role. `LiveNow` / `MatchCard` owned by the `mfe-live` remote team.
- **Rollout**: ship as one unit. Merging the lib without the consumer leaves dead code; merging the consumer without the lib won't build.
- **Backend-readiness signal**: the `SportsDataService` interface is the exact contract a future HTTP adapter (Phase 5+) must implement. Keep the interface narrow and obvious — any field added for the mock's convenience is a contract leak.
