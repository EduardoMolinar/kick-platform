# Phase 7 — Favorites write actions (follow / unfollow)

## Context

Phase 6 wired `libs/auth` + `libs/profile` and built a read-only `mfe-profile` page. The favorites loop is half-built:

- ✅ User identity bootstrapped in shell, propagated to remotes via DI inheritance.
- ✅ `ProfileService` exposes `getFavoriteTeams(userId)` / `getFavoriteCompetitions(userId)`.
- ✅ Mock data is seeded for `u-demo-001` (Arsenal + Real Madrid + UCL).
- ❌ **No way for the user to follow or unfollow anything from the UI.**
- ❌ `mfe-live` and `mfe-competition` are not yet aware of profile state — they show fixtures and standings without any "are you following this team / competition?" signal.
- ❌ The mock store is a frozen record, so it can't react to writes.

Phase 7 closes the loop:

- `ProfileService` gains `followTeam`, `unfollowTeam`, `followCompetition`, `unfollowCompetition`, plus reactive `isFollowingTeam$` / `isFollowingCompetition$` for live button state.
- `MockProfileService` migrates from a frozen record to a `BehaviorSubject<Map<userId, Favorites>>` so writes invalidate reads automatically.
- `mfe-live` adds a "Follow team" pill next to each team in the match card.
- `mfe-competition` adds a "Follow competition" pill on each competition card and on the competition detail header.
- `mfe-profile` tiles gain an "Unfollow" affordance.
- Both `mfe-live` and `mfe-competition` start consuming `PROFILE_SERVICE` and `AUTH_SERVICE` (route-level providers, the Phase 5 rule).

**Explicitly deferred to Phase 8+:**
- HTTP adapter behind `SportsDataService` / `ProfileService`.
- Optimistic UI with rollback (the mock is synchronous; no server to fail).
- Anonymous / unauthenticated UX paths (mock always returns a seeded user).
- Notifications when a followed team plays.
- Match detail page on `mfe-live`.
- `mfe-home` and `mfe-team` placeholder removal.
- `shared-ui` lib creation (a `FollowButton` primitive is *tempting* — see "Why no shared lib" below).

**Why this slice and not the HTTP adapter**: the HTTP adapter is a horizontal cut. Doing it now would re-shape one or two services without delivering a new product capability. Shipping favorites-write first means we ship one more user-visible feature, the contract gets one more round of pressure-testing under real flows, and the eventual HTTP adapter has a wider, more stable surface to replace.

---

## Locked versions (unchanged)

Node 20.x LTS · Nx `21.6.11` · Angular `~20.3.0` · `@angular-architects/native-federation` `20.3.1` · TypeScript `~5.9.2` · RxJS `~7.8.0`. **Reject upgrade prompts.**

---

## Why no shared `FollowButton` lib (yet)

CLAUDE.md says: *"Domain-specific code stays in the owning remote unless it is clearly cross-cutting."* A follow button looks cross-cutting because two remotes need it. But:

- The button itself is ~15 lines: a `DsButton` + `(click)` + an `[disabled]` bound to `isFollowing$ | async`.
- Each remote calls a different shape — `followTeam(userId, team)` vs. `followCompetition(userId, competition)`.
- A shared `<follow-button [kind]="'team' | 'competition'">` would carry both shapes, which is more glue than just inlining.

**Rule:** keep the button **domain-local** in each remote for Phase 7. If Phase 8 introduces a third follow-target (e.g. players), promote then. Phase 7 is not the time to invent `libs/shared-ui`.

---

## Target repo layout after Phase 7

```
Nx/
├── frontend/
│   ├── apps/
│   │   ├── mfe-live/
│   │   │   └── src/app/
│   │   │       ├── remote.routes.ts                          # +PROFILE_SERVICE, +AUTH_SERVICE bindings
│   │   │       └── live-now/
│   │   │           ├── match-card/
│   │   │           │   ├── match-card.ts                     # +follow buttons per side
│   │   │           │   ├── match-card.html                   # +<button> per home/away
│   │   │           │   └── match-card.spec.ts                # +follow-flow assertion
│   │   │           └── live-now.spec.ts                      # widened ProfileService stub
│   │   ├── mfe-competition/
│   │   │   └── src/app/
│   │   │       ├── remote.routes.ts                          # +PROFILE_SERVICE, +AUTH_SERVICE on parent providers
│   │   │       ├── competition-list/
│   │   │       │   ├── competition-list.ts                   # +follow button per row
│   │   │       │   └── competition-list.html                 # +<button>
│   │   │       └── competition-detail/
│   │   │           ├── competition-detail.ts                 # +follow button in header
│   │   │           └── competition-detail.html               # +<button> in header
│   │   └── mfe-profile/
│   │       └── src/app/profile-page/
│   │           ├── team-tile/
│   │           │   ├── team-tile.ts                          # +unfollow output
│   │           │   └── team-tile.html                        # +<button>
│   │           ├── competition-tile/
│   │           │   ├── competition-tile.ts                   # +unfollow output
│   │           │   └── competition-tile.html                 # +<button>
│   │           └── profile-page.ts                           # wires unfollow events to PROFILE_SERVICE
│   └── libs/
│       └── profile/
│           └── src/lib/
│               ├── profile.service.ts                        # +4 write methods, +2 reactive predicates
│               ├── mock-profile.service.ts                   # rewritten with BehaviorSubject store
│               └── mock-profile.service.spec.ts              # +write-path coverage
```

No new libs. No new DS primitives. No app deletions.

---

## Prerequisites

From `c:\Users\edy_0\projects\Nx`, Phase 6 baseline must be green:

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data,auth,profile
```

If any project fails, **stop** and rebaseline before starting Phase 7.

---

## Step 1 — Extend `ProfileService` contract

### 1a. Update [frontend/libs/profile/src/lib/profile.service.ts](frontend/libs/profile/src/lib/profile.service.ts)

```ts
export interface ProfileService {
  // Reads (existing)
  getFavoriteTeams(userId: string): Observable<readonly Team[]>;
  getFavoriteCompetitions(userId: string): Observable<readonly Competition[]>;

  // Reactive predicates (new)
  /** Emits true when `teamId` is in the user's favorites; emits a fresh value on every follow/unfollow. */
  isFollowingTeam$(userId: string, teamId: string): Observable<boolean>;
  isFollowingCompetition$(userId: string, competitionId: string): Observable<boolean>;

  // Writes (new)
  followTeam(userId: string, team: Team): Observable<void>;
  unfollowTeam(userId: string, teamId: string): Observable<void>;
  followCompetition(userId: string, competition: Competition): Observable<void>;
  unfollowCompetition(userId: string, competitionId: string): Observable<void>;
}
```

Rules:
- Writes return `Observable<void>` — completes when the write lands. Mirrors what an HTTP write would look like (`PUT` → 204).
- Writes take **the full `Team`/`Competition`** so the store can index it without an extra lookup. Unfollows take the id (you already know what you're removing).
- `isFollowingTeam$` is a **separate method**, not derived in the consumer from `getFavoriteTeams`. Reason: each follow-button shouldn't subscribe to the entire favorites list. The mock can implement it as a `map(list => list.some(...))`, but the contract reserves the right to be cheaper for a real backend.
- No `toggleFollow*`. Toggles are a UI concern; the service stays explicit.

### 1b. Verify

```bash
npx nx lint profile && npx nx build profile
```

(`npx nx test profile` will fail until Step 2 ships; that's fine.)

---

## Step 2 — Migrate `MockProfileService` to a reactive store

### 2a. Rewrite [frontend/libs/profile/src/lib/mock-profile.service.ts](frontend/libs/profile/src/lib/mock-profile.service.ts)

Replace the frozen `FAVORITES_BY_USER` record with a `BehaviorSubject` that holds a mutable `Map<userId, { teams: Map<teamId, Team>; competitions: Map<compId, Competition> }>`. Seed it from the existing fixture.

Sketch:

```ts
@Injectable({ providedIn: 'root' })
export class MockProfileService implements ProfileService {
  private readonly store$ = new BehaviorSubject<FavoritesStore>(seedStore());

  getFavoriteTeams(userId: string): Observable<readonly Team[]> {
    return this.store$.pipe(map((s) => Array.from(s.get(userId)?.teams.values() ?? [])));
  }

  getFavoriteCompetitions(userId: string): Observable<readonly Competition[]> {
    return this.store$.pipe(map((s) => Array.from(s.get(userId)?.competitions.values() ?? [])));
  }

  isFollowingTeam$(userId: string, teamId: string): Observable<boolean> {
    return this.store$.pipe(map((s) => s.get(userId)?.teams.has(teamId) ?? false), distinctUntilChanged());
  }

  isFollowingCompetition$(userId: string, competitionId: string): Observable<boolean> {
    return this.store$.pipe(map((s) => s.get(userId)?.competitions.has(competitionId) ?? false), distinctUntilChanged());
  }

  followTeam(userId: string, team: Team): Observable<void> {
    this.mutate(userId, (entry) => entry.teams.set(team.id, team));
    return of(void 0);
  }
  unfollowTeam(userId: string, teamId: string): Observable<void> {
    this.mutate(userId, (entry) => entry.teams.delete(teamId));
    return of(void 0);
  }
  followCompetition(userId: string, comp: Competition): Observable<void> { /* symmetric */ }
  unfollowCompetition(userId: string, compId: string): Observable<void> { /* symmetric */ }

  private mutate(userId: string, fn: (entry: UserFavorites) => void) {
    const next = cloneStore(this.store$.value);
    const entry = next.get(userId) ?? { teams: new Map(), competitions: new Map() };
    fn(entry);
    next.set(userId, entry);
    this.store$.next(next);
  }
}
```

Rules:
- `mutate` clones the store on every write. Reasoning: `BehaviorSubject.next` only fires on reference change, and even with reference change the inner Maps must not be aliased to the previous emission — otherwise consumers using `distinctUntilChanged` on derived Maps see stale equality.
- Use `Map`, not arrays, for O(1) follow/unfollow and dedup-by-id.
- Wrap reads in `distinctUntilChanged` for the boolean predicates so a follow on team A doesn't re-emit `false` for team B.
- Do **not** debounce or batch writes. The mock is sync; the real backend will introduce its own latency model later.

### 2b. Update fixtures

Move the seed data into a `seedStore()` factory inside the same file (or keep `favorites.fixture.ts` as the source of seed data and convert it in the factory). Either is fine; keep one file for readability.

### 2c. Update [frontend/libs/profile/src/lib/mock-profile.service.spec.ts](frontend/libs/profile/src/lib/mock-profile.service.spec.ts)

Add coverage:

- `followTeam` then `getFavoriteTeams` → list contains the new team.
- `unfollowTeam` of a seeded team → list no longer contains it.
- `isFollowingTeam$('u-demo-001', 't-ars')` initially `true`; after `unfollowTeam`, emits `false`; after `followTeam` again, emits `true`.
- `isFollowingTeam$` for a never-seen userId → `false` (does not throw).
- `followTeam` of an already-followed team → idempotent (list length unchanged, predicate stays `true`).
- Symmetric tests for competitions.

Use marble-style `toArray()` only if you must; `take(N)` + `firstValueFrom` is sufficient.

### 2d. Verify

```bash
npx nx lint profile && npx nx test profile && npx nx build profile
```

---

## Step 3 — Wire `PROFILE_SERVICE` + `AUTH_SERVICE` into `mfe-live` and `mfe-competition`

### 3a. [frontend/apps/mfe-live/src/app/remote.routes.ts](frontend/apps/mfe-live/src/app/remote.routes.ts)

Add to the existing `providers`:

```ts
import { MockProfileService, PROFILE_SERVICE } from '@platform/profile';

providers: [
  { provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService },
  { provide: PROFILE_SERVICE, useExisting: MockProfileService },
],
```

`AUTH_SERVICE` is **already** available — shell binds it; remotes inherit. Do not re-bind.

### 3b. [frontend/apps/mfe-competition/src/app/remote.routes.ts](frontend/apps/mfe-competition/src/app/remote.routes.ts)

Same addition on the parent route's `providers` array (the one wrapping the `''` and `:competitionId` children).

### 3c. Sanity

```bash
npx nx lint mfe-live mfe-competition
```

---

## Step 4 — Add follow buttons to `mfe-live`'s `MatchCard`

### 4a. Component change

`MatchCard` currently renders `home` / `away` `Team`s. Inject:

```ts
private readonly profile = inject(PROFILE_SERVICE);
private readonly auth = inject(AUTH_SERVICE);

protected readonly user$ = this.auth.currentUser$.pipe(filter((u): u is AuthSession => u !== null));

protected isFollowingHome$ = combineLatest([this.user$, this.match$]).pipe(
  switchMap(([u, m]) => this.profile.isFollowingTeam$(u.userId, m.home.id))
);
// symmetric for away
```

Note: `MatchCard` is presentational today and takes `match` as `@Input()`. Keep the input but expose it as a setter that pushes into a `BehaviorSubject<MatchSummary>` so the `combineLatest` re-pulls when the input changes. Or — simpler — accept the input, and compute `isFollowing$` in the parent (`LiveNow`) where the team id is already known. **Pick the parent-computed approach** — it keeps `MatchCard` free of `PROFILE_SERVICE`.

So the actual change:
- **`LiveNow`** owns the follow button and the `isFollowing$` per team.
- **`MatchCard`** stays presentational; gains optional `[homeFollowing]` / `[awayFollowing]` boolean inputs and `(homeFollowToggle)` / `(awayFollowToggle)` outputs.

This keeps the architecture clean and the spec-friendly seam at the smart-component boundary.

### 4b. Template

In `MatchCard.html`, beside each team name:

```html
<button
  type="button"
  class="match-card__follow"
  [attr.aria-pressed]="homeFollowing"
  (click)="homeFollowToggle.emit()"
>
  {{ homeFollowing ? 'Following' : 'Follow' }}
</button>
```

Rules:
- Plain `<button>`, not `DsButton`, because it's a small inline pill — the visual is closer to a chip than a primary action. Or wrap a `DsButton` with a `size="sm"` variant if/when DS exposes one. **Don't add the variant to DS as part of Phase 7.**
- `aria-pressed` for screen readers. Toggle button semantics.
- Disabled state when no user — covered in 4d.

### 4c. SCSS — DS tokens only

Use `--ds-color-primary` for active, `--ds-color-border` for inactive, `--ds-space-1`/`--ds-space-2` for padding, `--ds-radius-sm` for the pill.

### 4d. Auth-gated UX

In mock mode `auth.currentUser$` always emits `u-demo-001`. So the button is always live. **Do not** add a "Sign in to follow" path in Phase 7 — that's a Phase 8+ flow when real auth lands. Document the assumption with a one-line comment in `LiveNow`:

```ts
// Mock auth always emits a user; real auth will gate the follow buttons.
```

### 4e. Tests

Update [live-now.spec.ts](frontend/apps/mfe-live/src/app/live-now/live-now.spec.ts):
- Stub `PROFILE_SERVICE` with the full widened interface (six new methods + two existing).
- One test: render with `isFollowingTeam$` returning `false`, click the home follow button, assert `followTeam` was called with the right `(userId, team)`.

---

## Step 5 — Add follow buttons to `mfe-competition`

### 5a. `CompetitionList`

Per row, add the same follow pill bound to `isFollowingCompetition$(user.userId, competition.id)`. Click → `followCompetition` or `unfollowCompetition`.

Pattern: smart `CompetitionList` injects `PROFILE_SERVICE` + `AUTH_SERVICE` and computes a `Map<competitionId, Observable<boolean>>` of follow states. Or simpler: keep an inline `@for` and inject a child `<follow-pill>` component that takes `competitionId` + emits toggle.

**Pick the simpler path:** inline. Don't introduce `<follow-pill>` until at least the third use site exists.

### 5b. `CompetitionDetail`

Add the same pill in the header next to the competition title. Same pattern.

### 5c. Tests

Mirror the `mfe-live` test approach. One follow-flow assertion per smart component is enough.

---

## Step 6 — Add unfollow affordance to `mfe-profile` tiles

### 6a. `TeamTile`

Add an `(unfollow)` output and a small "Remove" button. The tile stays presentational; `ProfilePage` wires the click to `profile.unfollowTeam(user.userId, team.id)`.

### 6b. `CompetitionTile`

Symmetric.

### 6c. `ProfilePage`

Subscribe to the writes via the consumer side: the mock store's `BehaviorSubject` already drives `getFavoriteTeams$` reactively, so the list will visibly shrink without manual re-fetch. **Verify this in the dev smoke step.**

### 6d. Tests

`profile-page.spec.ts`: assert that clicking the team-tile remove button calls `unfollowTeam` and that the rendered tile count drops. Stub `getFavoriteTeams` with a `BehaviorSubject` so the test can simulate the emission.

---

## Step 7 — End-to-end verification

### 7a. Affected lint + test + build

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data,auth,profile
```

All 11 projects × 3 targets must be green.

### 7b. Graph check

```bash
npx nx graph --file=graph.json
```

Expected new edges:
- `mfe-live → profile`
- `mfe-competition → profile`

Expected absent edges:
- `mfe-home → profile`, `mfe-team → profile` (they don't follow anything)
- Any cross-remote edge.
- `shell → profile` (shell still only depends on `auth`).

Delete `graph.json` after inspecting.

### 7c. Dev smoke

```bash
npm run dev
```

Browser flow at `http://localhost:4200`:

1. **Live page (`/live`)**: each match card shows two "Follow" pills. Arsenal already shows "Following" (seeded). Click "Follow" on a non-followed team → it flips to "Following".
2. Navigate to **Profile (`/profile`)**: the just-followed team appears as a new tile **without page reload**.
3. Click "Remove" on a profile team tile → tile disappears.
4. Navigate back to **Live (`/live`)**: that team's pill is now "Follow" again.
5. **Competition list (`/competition`)**: UCL shows "Following" (seeded). Click "Follow" on PL → flips. Profile page now shows two competitions.
6. **Competition detail (`/competition/pl`)**: header pill says "Following". Click → flips to "Follow". Profile page reflects the change.
7. Browser console: zero errors.
8. Hard reload — favorites reset to seed (mock = in-memory; document this is expected).

Ctrl+C.

---

## Step 8 — Commit

Two commits to mirror Phase 6's split:

```bash
# Commit 1: contract + mock store
git add frontend/libs/profile
git commit -m "Phase 7 (1/2): profile service write methods + reactive store"

# Commit 2: consumers
git add frontend/apps/mfe-live frontend/apps/mfe-competition frontend/apps/mfe-profile
git commit -m "Phase 7 (2/2): follow / unfollow buttons across remotes"
```

Do **not** push.

---

## Acceptance checklist

- [ ] `ProfileService` interface declares `followTeam`, `unfollowTeam`, `followCompetition`, `unfollowCompetition`, `isFollowingTeam$`, `isFollowingCompetition$`.
- [ ] `MockProfileService` is backed by a `BehaviorSubject<Map<...>>`; reads are reactive to writes.
- [ ] `mfe-live/remote.routes.ts` and `mfe-competition/remote.routes.ts` bind `PROFILE_SERVICE` on route-level providers (Phase 5 rule).
- [ ] Neither remote re-binds `AUTH_SERVICE` (it inherits from shell).
- [ ] Follow pill on every team in `MatchCard`, every row in `CompetitionList`, and the `CompetitionDetail` header.
- [ ] Unfollow affordance on every tile in `ProfilePage`.
- [ ] Toggling follow in one remote updates `mfe-profile` without a reload.
- [ ] All buttons have `type="button"` and `aria-pressed`.
- [ ] No `*ngIf` / `*ngFor` / `CommonModule`. Only `AsyncPipe`, native control flow.
- [ ] No hex / rem / px in new SCSS — DS tokens only.
- [ ] No new lib added.
- [ ] No DS primitive changed.
- [ ] `nx graph` shows `mfe-live → profile` and `mfe-competition → profile`; no cross-remote edges.
- [ ] Phase 4 / 5 / 6 features all still work (regression guard).
- [ ] `CLAUDE.md` unchanged.

---

## Out of scope for Phase 7

- HTTP adapter behind any service.
- Optimistic UI / rollback / pending state UX (mock is synchronous).
- Sign-in / sign-out flow.
- Notifications when a followed team plays.
- Sorting / filtering favorites.
- A `shared-ui` library or `FollowButton` primitive.
- `mfe-home` and `mfe-team` content.
- Storybook stories for follow buttons (DS-only Storybook today).
- Persistence across reloads.
- Multi-user fixtures.

---

## Guardrails for the executing model

- **Service first, then consumers.** Don't write a follow button before the contract compiles and tests pass.
- **No `toggleFollow*` on the service.** UI computes the toggle from `isFollowing$ | async`.
- **Never inject `MockProfileService` directly** in a component. Always via `PROFILE_SERVICE`.
- **Do not promote to `shared-ui`.** If you find yourself wanting to, stop and re-read "Why no shared `FollowButton` lib".
- **Route-level providers only** for `PROFILE_SERVICE`. Not `app.config.ts` (Phase 5 rule).
- **No backend, no HTTP, no real auth.** That's Phase 8+.
- **Keep the mock store's clone semantics intact.** Mutating in place breaks reactivity.
- If any step fails, **stop and report.** No broken intermediates.
- Do not modify `CLAUDE.md`. Do not bump Angular / Nx / federation / Storybook / RxJS.

---

## Troubleshooting notes

- **`No provider for InjectionToken PROFILE_SERVICE`** in `mfe-live` or `mfe-competition`: missing route-level providers binding (Step 3).
- **Follow pill works but profile page doesn't update**: `BehaviorSubject` is being mutated in place rather than cloned. Check `mutate()` clones the outer Map *and* the inner Maps.
- **`isFollowingTeam$` keeps re-emitting on unrelated team follows**: missing `distinctUntilChanged`.
- **`AUTH_SERVICE` undefined in `mfe-live`/`mfe-competition`**: don't re-bind it on the remote — confirm shell still binds it in `app.config.ts`. If shell's binding regressed, re-add it there.
- **Tests fail with "missing method on stub"**: the `ProfileService` stub in old specs needs the six new methods. Either widen the stubs or use `Partial<ProfileService>` and cast.
- **Click on follow pill but no write occurs**: check the smart-component is bound to `(homeFollowToggle)` output, and that the click handler in the smart component calls `followTeam` not `followTeam(...).subscribe()` — the `Observable<void>` is hot for the mock but the consumer should still subscribe (or use `firstValueFrom`).

---

## Risk, ownership, and rollout

- **Risk**: low.
  - Phase 6 proved the auth/profile DI propagation works.
  - Phase 5 proved route-level providers compose with multiple services.
  - The only new pattern is the reactive store, and the failure mode (clone semantics) is visible in the dev smoke (Step 7c #2).
- **Blast radius**: `mfe-live`, `mfe-competition`, `mfe-profile`, `libs/profile`. Shell, `mfe-home`, `mfe-team`, all other libs untouched.
- **Ownership**: `libs/profile` owned by platform. Per-remote follow UI owned by each remote.
- **Rollout**: two atomic commits (lib first, then consumers). Either is shippable in isolation but the consumer commit is meaningless without the lib commit.
- **Backend-readiness signal**: the four write methods + two reactive predicates are the contract the future profile-api HTTP adapter must implement. If a write needs more than `(userId, entity)` to land server-side (e.g. an idempotency key), cut it now.
