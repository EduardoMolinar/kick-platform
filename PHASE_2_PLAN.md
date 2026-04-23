# Phase 2 — Fan Out 4 Remaining Remotes + Shell Top-Nav

## Context

Phase 1 proved the template end-to-end: `shell` (NF host) lazy-loads `mfe-home` (NF remote) via `loadRemoteModule`, the remote consumes `@platform/design-system` (`DsButton`) and `@platform/shared-types`, Nx tag boundaries enforce ownership, and `nx graph` shows no static shell→remote edge.

Phase 2 scales that template out to the remaining 4 domain remotes and wires the shell with global navigation so a human can actually click through the app.

After Phase 2 the product has:
- 5 remotes wired through the federation manifest: `mfe-home`, `mfe-live`, `mfe-competition`, `mfe-team`, `mfe-profile`
- A shell top-nav that switches between all 5
- A second DS primitive: `DsTopNav`
- Tag boundaries updated for 4 new domain scopes
- No real data yet — every remote shows a placeholder landing page

Explicitly deferred to Phase 3+: `sports-data` / mock data layer, `auth`, `profile` persistence, any backend, real competition/fixture/team rendering, Storybook, CI/CD.

**Why this slice:** the Phase 1 remote pattern must survive being copied 4× without drift. Doing that before investing in any one remote's feature code makes the template the source of truth. The shell top-nav is added now (not deferred) because without it there is no way to demo or test routing across remotes.

---

## Locked versions (unchanged from Phase 0 / Phase 1)

- Node 20.x LTS
- Nx `21.6.11`
- Angular `~20.3.0`
- `@angular-architects/native-federation` `20.3.1`
- TypeScript `~5.9.2`

Reject upgrades.

---

## Target repo layout after Phase 2

```
Nx/
├── frontend/
│   ├── apps/
│   │   ├── shell/
│   │   │   ├── public/federation.manifest.json   # 5 remotes
│   │   │   └── src/app/
│   │   │       ├── app.ts                        # imports DsTopNav
│   │   │       ├── app.html                      # <ds-top-nav> + <router-outlet>
│   │   │       └── app.routes.ts                 # 5 lazy loadRemoteModule routes
│   │   ├── mfe-home/                             # (from Phase 1)
│   │   ├── mfe-live/                             # NEW — port 4202
│   │   ├── mfe-competition/                      # NEW — port 4203
│   │   ├── mfe-team/                             # NEW — port 4204
│   │   └── mfe-profile/                          # NEW — port 4205
│   └── libs/
│       ├── shared-types/                         # (from Phase 1)
│       └── design-system/
│           └── src/lib/
│               ├── button/                       # (from Phase 1)
│               └── top-nav/                      # NEW — DsTopNav
├── eslint.config.mjs                             # depConstraints extended with 4 new scopes
└── tsconfig.base.json                            # unchanged
```

Every remote has the exact same shape as `mfe-home` does now.

---

## Port assignments

| Remote | Port |
| --- | --- |
| mfe-home | 4201 (existing) |
| mfe-live | 4202 |
| mfe-competition | 4203 |
| mfe-team | 4204 |
| mfe-profile | 4205 |

Shell stays on 4200.

---

## Prerequisites

Phase 1 must be green. From `c:\Users\edy_0\projects\Nx`:

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,design-system,shared-types
```

All 4 green. If anything fails, stop — Phase 2 depends on a working Phase 1 baseline.

---

## Step 1 — Extend ESLint tag boundaries for 4 new scopes

Edit `eslint.config.mjs` — add four new `scope:*` entries inside `depConstraints` alongside the existing `scope:home` block. Each new domain scope should be allowed to depend on `scope:shared`, `scope:design-system`, and itself.

Replace the current `depConstraints` array so it contains (in addition to the existing `type:*` rules and the existing `scope:home`, `scope:design-system`, `scope:shared` rules) these four new entries:

```js
{
  sourceTag: 'scope:live',
  onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:live'],
},
{
  sourceTag: 'scope:competition',
  onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:competition'],
},
{
  sourceTag: 'scope:team',
  onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:team'],
},
{
  sourceTag: 'scope:profile',
  onlyDependOnLibsWithTags: ['scope:shared', 'scope:design-system', 'scope:profile'],
},
```

Verify the existing rules (type:*, scope:home, scope:design-system, scope:shell, scope:shared) are preserved.

---

## Step 2 — Add `DsTopNav` to the design-system

A simple standalone OnPush component that takes a list of `{ label, path }` items and renders them as `routerLink`s with `routerLinkActive` styling.

### 2a. Generate the component

From `c:\Users\edy_0\projects\Nx`:

```bash
npx nx g @nx/angular:component \
  --path=frontend/libs/design-system/src/lib/top-nav/top-nav \
  --name=top-nav \
  --standalone=true \
  --style=scss \
  --changeDetection=OnPush \
  --skipTests=false \
  --export=true \
  --no-interactive
```

### 2b. Write `top-nav.ts`

Replace `frontend/libs/design-system/src/lib/top-nav/top-nav.ts`:

```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface DsTopNavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'ds-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTopNav {
  @Input() items: readonly DsTopNavItem[] = [];
}
```

### 2c. Write `top-nav.html`

```html
<nav class="ds-top-nav" aria-label="Primary">
  <ul class="ds-top-nav__list">
    @for (item of items; track item.path) {
      <li class="ds-top-nav__item">
        <a
          class="ds-top-nav__link"
          [routerLink]="item.path"
          routerLinkActive="ds-top-nav__link--active"
        >
          {{ item.label }}
        </a>
      </li>
    }
  </ul>
</nav>
```

### 2d. Write `top-nav.scss`

```scss
.ds-top-nav {
  display: block;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 0 1rem;

  &__list {
    display: flex;
    gap: 1.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 0;
    color: inherit;
    text-decoration: none;
    border-bottom: 2px solid transparent;

    &--active {
      border-bottom-color: #0b5fff;
      font-weight: 600;
    }
  }
}
```

### 2e. Update the DS public API

Edit `frontend/libs/design-system/src/index.ts`:

```ts
export * from './lib/button/button';
export * from './lib/top-nav/top-nav';
```

### 2f. Verify

```bash
npx nx lint design-system
npx nx test design-system
```

Both must pass.

---

## Step 3 — Scaffold the 4 new remotes (repeated pattern)

Each of the 4 remotes (`mfe-live`, `mfe-competition`, `mfe-team`, `mfe-profile`) follows the exact same pattern as `mfe-home` in Phase 1. Execute Steps 3a–3g once per remote.

Placeholders for variables used in the commands below:
- `<REMOTE>` — one of `mfe-live`, `mfe-competition`, `mfe-team`, `mfe-profile`
- `<PREFIX>` — one of `mfe-live`, `mfe-competition`, `mfe-team`, `mfe-profile` (same as remote name)
- `<SCOPE>` — one of `live`, `competition`, `team`, `profile`
- `<PORT>` — 4202 / 4203 / 4204 / 4205 (see port table)
- `<LANDING_SELECTOR>` — one of `mfe-live-landing`, `mfe-competition-landing`, `mfe-team-landing`, `mfe-profile-landing`

### 3a. Generate the Angular application

From `c:\Users\edy_0\projects\Nx`:

```bash
npx nx g @nx/angular:application \
  --directory=frontend/apps/<REMOTE> \
  --name=<REMOTE> \
  --prefix=<PREFIX> \
  --style=scss \
  --standalone=true \
  --routing=true \
  --ssr=false \
  --bundler=esbuild \
  --e2eTestRunner=none \
  --unitTestRunner=jest \
  --linter=eslint \
  --tags=scope:<SCOPE>,type:remote \
  --no-interactive
```

Sanity check before federation:

```bash
npx nx build <REMOTE>
npx nx lint <REMOTE>
npx nx test <REMOTE>
```

All three must pass.

### 3b. Configure as Native Federation remote

```bash
npx nx g @angular-architects/native-federation:init \
  --project=<REMOTE> \
  --port=<PORT> \
  --type=remote
```

### 3c. Rewrite `federation.config.js`

Replace `frontend/apps/<REMOTE>/federation.config.js` — the generator exposes `./Component` → `app.ts` by default; replace with `./Routes` → `remote.routes.ts`:

```js
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: '<REMOTE>',

  exposes: {
    './Routes': './frontend/apps/<REMOTE>/src/app/remote.routes.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],

  features: {
    ignoreUnusedDeps: true,
  },
});
```

### 3d. Fix the lint warning in `main.ts`

The NF generator writes `.then(_ => import('./bootstrap'))` which trips `@typescript-eslint/no-unused-vars`. Replace with `.then(() => import('./bootstrap'))`:

```ts
import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch(err => console.error(err))
  .then(() => import('./bootstrap'))
  .catch(err => console.error(err));
```

### 3e. Create the `Landing` component

Each remote gets one standalone OnPush `Landing` component that imports `DsButton` so we can visually confirm DS consumption works in every remote.

```bash
npx nx g @nx/angular:component \
  --path=frontend/apps/<REMOTE>/src/app/landing/landing \
  --name=landing \
  --standalone=true \
  --style=scss \
  --changeDetection=OnPush \
  --skipTests=false \
  --export=false \
  --no-interactive
```

Replace `frontend/apps/<REMOTE>/src/app/landing/landing.ts`:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsButton } from '@platform/design-system';

@Component({
  selector: '<LANDING_SELECTOR>',
  standalone: true,
  imports: [DsButton],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {
  protected readonly remoteName = '<REMOTE>';
}
```

Replace `frontend/apps/<REMOTE>/src/app/landing/landing.html`:

```html
<section class="landing">
  <h1>{{ remoteName }}</h1>
  <p>Placeholder landing page. Real content lands in Phase 3.</p>
  <ds-button variant="secondary">Placeholder action</ds-button>
</section>
```

### 3f. Create `remote.routes.ts`

Create `frontend/apps/<REMOTE>/src/app/remote.routes.ts`:

```ts
import { Routes } from '@angular/router';

export const remoteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing').then((m) => m.Landing),
  },
];
```

### 3g. Make the remote work standalone + clean scaffolding cruft

Replace `frontend/apps/<REMOTE>/src/app/app.routes.ts`:

```ts
import { Route } from '@angular/router';
import { remoteRoutes } from './remote.routes';

export const appRoutes: Route[] = [...remoteRoutes];
```

Replace `frontend/apps/<REMOTE>/src/app/app.ts`:

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: '<PREFIX>-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = '<REMOTE>';
}
```

Replace `frontend/apps/<REMOTE>/src/app/app.html`:

```html
<router-outlet></router-outlet>
```

Replace `frontend/apps/<REMOTE>/src/app/app.spec.ts`:

```ts
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

Delete the generator's default welcome file:

```bash
rm frontend/apps/<REMOTE>/src/app/nx-welcome.ts
```

### 3h. Verify per remote

```bash
npx nx build <REMOTE>
npx nx lint <REMOTE>
npx nx test <REMOTE>
```

All green before moving to the next remote. If a step fails, fix it before scaffolding the next remote — a broken template replicated 4× is the main risk this phase is designed to avoid.

---

## Step 4 — Wire all 5 remotes into the shell

### 4a. Replace `frontend/apps/shell/public/federation.manifest.json`

```json
{
  "mfe-home": "http://localhost:4201/remoteEntry.json",
  "mfe-live": "http://localhost:4202/remoteEntry.json",
  "mfe-competition": "http://localhost:4203/remoteEntry.json",
  "mfe-team": "http://localhost:4204/remoteEntry.json",
  "mfe-profile": "http://localhost:4205/remoteEntry.json"
}
```

### 4b. Replace `frontend/apps/shell/src/app/app.routes.ts`

```ts
import { Route } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

const loadRemote = (remoteName: string) =>
  loadRemoteModule({ remoteName, exposedModule: './Routes' }).then(
    (m) => m.remoteRoutes
  );

export const appRoutes: Route[] = [
  { path: 'home', loadChildren: () => loadRemote('mfe-home') },
  { path: 'live', loadChildren: () => loadRemote('mfe-live') },
  { path: 'competition', loadChildren: () => loadRemote('mfe-competition') },
  { path: 'team', loadChildren: () => loadRemote('mfe-team') },
  { path: 'profile', loadChildren: () => loadRemote('mfe-profile') },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
```

### 4c. Wire `DsTopNav` into shell

Replace `frontend/apps/shell/src/app/app.ts`:

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsTopNav, DsTopNavItem } from '@platform/design-system';

@Component({
  imports: [RouterOutlet, DsTopNav],
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly navItems: readonly DsTopNavItem[] = [
    { label: 'Home', path: '/home' },
    { label: 'Live', path: '/live' },
    { label: 'Competitions', path: '/competition' },
    { label: 'Teams', path: '/team' },
    { label: 'Profile', path: '/profile' },
  ];
}
```

Replace `frontend/apps/shell/src/app/app.html`:

```html
<ds-top-nav [items]="navItems"></ds-top-nav>
<main>
  <router-outlet></router-outlet>
</main>
```

`app.spec.ts` already uses `provideRouter([])` from Phase 1 — no change needed.

---

## Step 5 — End-to-end verification

### 5a. Lint + test + build everything

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types
```

All 8 projects green. If lint fails on boundary rules, fix imports — do not weaken the ESLint rules.

### 5b. Check the dependency graph

```bash
npx nx graph --file=graph.json
```

Inspect `graph.json` — expected edges:

- `mfe-home` → `design-system`
- `mfe-live` → `design-system`
- `mfe-competition` → `design-system`
- `mfe-team` → `design-system`
- `mfe-profile` → `design-system`
- `shell` → `design-system` (new in Phase 2, via `DsTopNav`)

Expected **non**-edges:
- No static build edge from `shell` to any `mfe-*` remote
- No edges between remotes

Delete `graph.json` after inspecting.

### 5c. Serve all 6 apps and smoke-test in the browser

Open 6 terminals in `c:\Users\edy_0\projects\Nx` (or use a concurrently runner):

```bash
# Terminal 1
npx nx serve mfe-home
# Terminal 2
npx nx serve mfe-live
# Terminal 3
npx nx serve mfe-competition
# Terminal 4
npx nx serve mfe-team
# Terminal 5
npx nx serve mfe-profile
# Terminal 6
npx nx serve shell
```

Wait for each NF "Application bundle generation complete" message (the first run builds the shared package cache — expect ~30–60s per remote on first build).

Open http://localhost:4200:

- Top nav renders 5 links: Home, Live, Competitions, Teams, Profile.
- Clicking each link navigates without a full page reload.
- Each target route renders the remote's landing page with the `DsButton` visible.
- `/` redirects to `/home`.
- DevTools → Network confirms `remoteEntry.json` is fetched lazily from the correct port when each link is first clicked.
- DevTools → Console: no errors beyond the NF init log.

Each standalone dev URL also works:
- http://localhost:4201/ → mfe-home landing
- http://localhost:4202/ → mfe-live landing
- http://localhost:4203/ → mfe-competition landing
- http://localhost:4204/ → mfe-team landing
- http://localhost:4205/ → mfe-profile landing

---

## Step 6 — Acceptance checklist

- [ ] `frontend/apps/mfe-live/`, `mfe-competition/`, `mfe-team/`, `mfe-profile/` exist
- [ ] Each remote's `federation.config.js` declares `name: '<REMOTE>'` and exposes `./Routes` → `remote.routes.ts`
- [ ] Each remote's `Landing` component imports `DsButton` from `@platform/design-system`
- [ ] Each remote's `project.json` has `tags: ["scope:<SCOPE>", "type:remote"]`
- [ ] Each remote serves standalone on its assigned port and renders its Landing page
- [ ] `frontend/libs/design-system/src/lib/top-nav/top-nav.ts` exports `DsTopNav` (standalone, OnPush) and `DsTopNavItem`
- [ ] `frontend/libs/design-system/src/index.ts` re-exports `DsTopNav`
- [ ] `frontend/apps/shell/public/federation.manifest.json` lists all 5 remotes with their dev URLs
- [ ] `frontend/apps/shell/src/app/app.routes.ts` has 5 `loadRemoteModule` lazy routes + redirects
- [ ] `frontend/apps/shell/src/app/app.ts` imports `DsTopNav` and declares `navItems`
- [ ] `eslint.config.mjs` has tag constraints for `scope:live`, `scope:competition`, `scope:team`, `scope:profile`
- [ ] `npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types` all green
- [ ] `npx nx graph` shows no static build edge from `shell` to any `mfe-*` remote
- [ ] Clicking each top-nav link renders the corresponding remote's landing page in the shell
- [ ] `CLAUDE.md` at repo root unchanged

---

## Step 7 — Commit Phase 2

From `c:\Users\edy_0\projects\Nx`:

```bash
git status
# Sanity-check: no node_modules, no dist, no .nx/cache, no .angular
git add .
git commit -m "Phase 2: fan out 4 remaining remotes + DsTopNav + shell top-nav"
```

Do NOT push — wait for human review.

---

## Explicitly out of scope for Phase 2

Do not create in Phase 2:

- `sports-data`, `auth`, `profile`, `shared-ui`, `shared-utils` libs
- Real competition/fixture/team/live data, even as mocks
- DS primitives beyond `DsButton` + `DsTopNav` (no `DsCard`, `DsList`, etc.)
- Design tokens file (`_tokens.scss`) — defer to DS expansion phase
- Storybook
- Backend services, API clients, or HTTP plumbing
- CircleCI / CloudFront / S3 / deployment scripts
- Auth bootstrap, session, cookies, guards
- Any cross-remote communication or shared runtime state

If tempted to add any of the above — don't. Phase 2 is a fan-out phase, not a feature phase.

---

## Guardrails for the executing model

- **Scaffold remotes one at a time, fully, before moving to the next.** Do not generate all 4 apps first and then retrofit federation on all of them. The bug-isolation cost of a broken remote replicated 4× is the failure mode this phase is designed to prevent.
- Never skip Step 3a's baseline verification (serve/build/lint/test before adding federation).
- Never pass `--force` or `--legacy-peer-deps` without identifying the specific peer conflict first.
- Never import directly from a remote app into the shell or another remote. The only link is `loadRemoteModule` at runtime.
- Never relax ESLint `depConstraints` to make an import work. If boundaries fail, the import is wrong.
- Keep `DsTopNav` a zero-dep primitive: it depends on `@angular/core` and `@angular/router` only.
- Do not put any domain logic in remotes yet (no match data, no API calls, no mock data). Landing pages are placeholders.
- If any step fails, stop and report. Do not proceed with a broken intermediate state.
- Do not modify `CLAUDE.md`.

---

## Troubleshooting notes

- **Generator rejects `@nx/angular:application` positional arg with `Schema does not support positional arguments`**: use `--directory=frontend/apps/<REMOTE> --name=<REMOTE>` instead of a positional name. Same pattern applied in Phase 1.
- **Generator rejects `@nx/angular:component` with `'project' is not found in schema`**: use `--path=... --name=...` instead of `--project=...`. Same pattern applied in Phase 1.
- **NF `init` writes `.then(_ => import(...))` which trips ESLint `no-unused-vars`**: replace `_` with `()`. Same fix applied in Phase 1.
- **Shell top-nav links don't highlight as active**: `routerLinkActive` requires `RouterLink` imported in the component's `imports`; both are already in `DsTopNav`. Confirm `DsTopNav` is imported into `App`, not declared ambient.
- **`Cannot find module '@platform/design-system'`**: `tsconfig.base.json` `paths` was populated when `design-system` was generated in Phase 1. If it was lost, re-add:
  ```json
  "paths": {
    "@platform/design-system": ["frontend/libs/design-system/src/index.ts"],
    "@platform/shared-types": ["frontend/libs/shared-types/src/index.ts"]
  }
  ```
- **`Module federation init failed` for remote X**: confirm remote X is actually serving on its assigned port. The shell's manifest is fetched at boot; if a remote isn't up, navigation to its route will fail but the shell itself still loads.
- **Nx graph shows `shell → mfe-*` at build time**: the shell is statically importing remote code. Grep shell for each remote name — only manifest JSON + the `'mfe-*'` string arguments to `loadRemoteModule` should appear.
- **Port conflicts on Windows**: `netstat -ano | findstr :420X` to find the PID holding a port. Kill it rather than changing the remote's port — the port table is referenced by `federation.manifest.json`.
