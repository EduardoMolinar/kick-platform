# Phase 0 — Foundation Scaffold

Goal: take an empty repository and end with a working Angular shell app under Nx,
configured as a Native Federation host, with the monorepo structured so that
backend services and CI/CD live alongside (not inside) the frontend.

Phase 0 is scaffolding only. No remotes, no shared libs, no design system, no
backend, no CI/CD. Those belong to later phases.

---

## Locked versions

Do not substitute these. They are the pinned, compatible set at time of writing.

| Tool | Version | Why |
| --- | --- | --- |
| Node | 20.x LTS | matches Nx 21 + Angular 20 engine ranges |
| npm | bundled with Node 20 | — |
| Nx | `21.6.11` | supports Angular `>=18 <21`; latest in the 21 line |
| Angular | `20.3.x` (LTS) | LTS line; installed automatically by Nx 21 preset |
| `@angular-architects/native-federation` | `20.3.1` | matches Angular 20.3 |
| TypeScript | whatever Nx 21 + Angular 20 install (currently `5.8.x`) | do not override |

If any package manager tries to bump Angular to 21 or Nx to 22, reject the
upgrade in Phase 0. Upgrades are a separate decision.

---

## Target repo layout after Phase 0

```
Nx/
├── .git/
├── .claude/
├── .gitignore                      # top-level, monorepo-aware
├── CLAUDE.md                       # already exists, do not modify
├── PHASE_0_PLAN.md                 # this file
├── README.md                       # top-level overview of the three tiers
├── frontend/                       # Nx 21 Angular monorepo
│   ├── apps/
│   │   └── shell/                  # Angular host app, configured as NF host
│   │       ├── src/
│   │       │   ├── app/
│   │       │   ├── bootstrap.ts    # added by native-federation:init
│   │       │   ├── main.ts         # rewritten by native-federation:init
│   │       │   └── ...
│   │       ├── public/
│   │       │   └── federation.manifest.json   # empty remotes list for now
│   │       ├── federation.config.js           # added by native-federation:init
│   │       ├── project.json                   # serve/build targets updated
│   │       └── ...
│   ├── libs/                                  # empty (Phase 1 fills it)
│   ├── nx.json
│   ├── package.json
│   ├── tsconfig.base.json
│   ├── eslint.config.js (or .eslintrc.json)
│   └── .prettierrc
├── backend/                        # placeholder, outside Nx workspace
│   └── README.md
└── infra/                          # placeholder, outside Nx workspace
    └── README.md
```

Rules for the next model:

- `frontend/` is the Nx workspace root. All `nx` commands run from there.
- `backend/` and `infra/` are **not** part of the Nx workspace. They are plain
  folders so backend services and CI/CD can evolve independently.
- Do not move, rename, or delete `CLAUDE.md`.

---

## Prerequisites

From `c:\Users\edy_0\projects\Nx`, verify:

```bash
node -v     # expect v20.x
npm -v
git --version
```

If Node is not 20 LTS, install it before continuing. The pinned Nx/Angular
set will not install cleanly on Node 18 or Node 23+.

---

## Step 1 — Create the Nx Angular workspace in `frontend/`

From `c:\Users\edy_0\projects\Nx`:

```bash
npx create-nx-workspace@21.6.11 frontend \
  --preset=angular-monorepo \
  --appName=shell \
  --style=scss \
  --e2eTestRunner=none \
  --ssr=false \
  --bundler=esbuild \
  --prefix=app \
  --nxCloud=skip \
  --interactive=false
```

Flag rationale:

- `--preset=angular-monorepo` → `apps/` + `libs/` layout, required for MFE later
- `--appName=shell` → the host app is called `shell`
- `--style=scss` → design system will use SCSS tokens
- `--e2eTestRunner=none` → Phase 0 does not need E2E infra
- `--ssr=false` → this is a SPA; SSR is out of scope
- `--bundler=esbuild` → Angular 20's modern application builder
- `--prefix=app` → component selector prefix
- `--nxCloud=skip` → no Nx Cloud for now

Expected outcome: a new `frontend/` directory with an Nx 21 workspace and a
functioning `apps/shell` Angular 20 app.

Troubleshooting:

- If `npm warn deprecated whatwg-encoding@2.0.0` causes an exit-1, re-run with
  `--verbose`; it's usually a transient npm-registry/cache issue on Windows.
  Clear with `npm cache clean --force` and retry.
- On Windows, run this from a terminal where the path has no spaces.
- If the command creates `frontend/` but fails partway, delete the folder and
  retry — do not try to patch a half-created workspace.

---

## Step 2 — Verify the baseline app works (before Federation)

From `c:\Users\edy_0\projects\Nx\frontend`:

```bash
npx nx serve shell
# Visit http://localhost:4200, confirm the default Angular page renders.
# Ctrl+C to stop.

npx nx build shell
npx nx lint shell
```

All three must succeed before moving on. If `lint` or `build` fails on a fresh
scaffold, stop and diagnose; do not add Federation on top of a broken baseline.

---

## Step 3 — Install Native Federation

From `c:\Users\edy_0\projects\Nx\frontend`:

```bash
npm install @angular-architects/native-federation@20.3.1 --save
```

Pin the exact version. Do not use `^20.3.1` here; we will manage the upgrade
path explicitly later.

---

## Step 4 — Configure `shell` as a Native Federation host

From `c:\Users\edy_0\projects\Nx\frontend`:

```bash
npx nx g @angular-architects/native-federation:init \
  --project=shell \
  --port=4200 \
  --type=host
```

What this generator does:

- adds `apps/shell/federation.config.js` (empty `exposes`, since shell is a host)
- creates `apps/shell/src/bootstrap.ts` and rewrites `main.ts` to dynamically
  import `bootstrap.ts` after the Native Federation runtime initializes
- swaps `apps/shell/project.json` `build` and `serve` targets to the
  `@angular-architects/native-federation` executors (esbuild-backed)
- emits an initial `federation.manifest.json` (in `apps/shell/public/` or
  `apps/shell/src/assets/` depending on generator version) with an empty
  remotes object

If the generator prompts for options, accept defaults. If the schema has
changed in a newer patch, re-read the generator's `schema.json` under
`frontend/node_modules/@angular-architects/native-federation/src/schematics/init/`
and match the flags to the current schema rather than guessing.

---

## Step 5 — Verify the shell still serves under Native Federation

From `c:\Users\edy_0\projects\Nx\frontend`:

```bash
npx nx serve shell
# Visit http://localhost:4200.
# Expected: the shell renders. Console shows Native Federation init log.
# federation.manifest.json is fetched; remotes list is empty (no remotes yet).
# Ctrl+C.

npx nx build shell
# Expected: build succeeds. dist/apps/shell contains:
#   - hashed Angular assets
#   - remoteEntry/importmap-shim bootstrap emitted by NF
#   - federation.manifest.json (copied from source)
```

If the build fails with a module-resolution error around `@angular-architects/native-federation`,
the most common cause is a mismatched `@angular-architects/native-federation-runtime`
version. Run `npm ls @angular-architects/native-federation` and confirm a single
resolved version in the tree.

---

## Step 6 — Top-level repo files (backend/infra placeholders + hygiene)

From `c:\Users\edy_0\projects\Nx`:

```bash
mkdir backend
mkdir infra
```

### `c:\Users\edy_0\projects\Nx\backend\README.md`

```markdown
# Backend

Placeholder for backend services — e.g. `sports-api`, `profile-api`, and an
optional BFF. Each service will live in its own subfolder with its own
language/runtime and its own deployment pipeline.

This folder is **not** part of the Nx workspace in `frontend/`.
```

### `c:\Users\edy_0\projects\Nx\infra\README.md`

```markdown
# Infrastructure

Placeholder for CI/CD (CircleCI config), CloudFront/S3 deployment scripts,
IaC (Terraform or CDK), and release tooling for both frontend and backend.

This folder is **not** part of the Nx workspace in `frontend/`.
```

### `c:\Users\edy_0\projects\Nx\README.md`

```markdown
# Platform monorepo

Top-level structure:

- `frontend/` — Nx 21 Angular 20 micro-frontend workspace (shell + remotes)
- `backend/`  — backend services (sports-api, profile-api, BFF if needed)
- `infra/`    — CI/CD and infrastructure-as-code

Phase 0 is complete when `frontend/apps/shell` builds and serves as a Native
Federation host, and `backend/` + `infra/` exist as placeholder directories.

## Running the frontend

```bash
cd frontend
npx nx serve shell
```
```

### `c:\Users\edy_0\projects\Nx\.gitignore`

```gitignore
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Nx
frontend/.nx/cache
frontend/.nx/workspace-data
frontend/dist
frontend/tmp

# Editors
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.local
.env.*.local
```

Note: Nx also generates its own `.gitignore` inside `frontend/`. Keep both.
The top-level one covers the whole repo; the frontend one covers Nx-specific
artifacts that live under `frontend/`.

---

## Step 7 — Phase 0 acceptance checklist

All must pass before calling Phase 0 done:

- [ ] `node -v` reports v20.x
- [ ] `frontend/` is a valid Nx 21 workspace
- [ ] `cd frontend && npx nx report` succeeds and shows:
  - Nx 21.6.x
  - `@nx/angular` 21.6.x
  - Angular 20.3.x
  - `@angular-architects/native-federation` 20.3.1
- [ ] `cd frontend && npx nx build shell` succeeds
- [ ] `cd frontend && npx nx serve shell` serves at http://localhost:4200
- [ ] `cd frontend && npx nx lint shell` is clean
- [ ] `frontend/apps/shell/federation.config.js` exists
- [ ] `frontend/apps/shell/src/bootstrap.ts` exists
- [ ] `frontend/apps/shell/src/main.ts` uses the dynamic-import bootstrap
  pattern (the NF generator's rewrite)
- [ ] `federation.manifest.json` exists under `frontend/apps/shell/public/`
  or `frontend/apps/shell/src/assets/` (generator-version dependent)
- [ ] `backend/README.md` and `infra/README.md` exist
- [ ] Top-level `README.md` and `.gitignore` exist
- [ ] `CLAUDE.md` at repo root is unchanged

---

## Step 8 — Commit Phase 0

From `c:\Users\edy_0\projects\Nx`:

```bash
git add .
git status      # sanity-check — no node_modules, no dist, no .nx/cache
git commit -m "Phase 0: Nx 21 + Angular 20 frontend with Native Federation host"
```

Do **not** push yet. Wait for human review.

---

## Explicitly out of scope for Phase 0

Do not create any of the following in Phase 0. They belong to Phase 1+:

- Remotes: `mfe-home`, `mfe-live`, `mfe-competition`, `mfe-team`, `mfe-profile`
- Shared libs: `design-system`, `auth`, `sports-data`, `profile`, `shared-ui`,
  `shared-types`, `shared-utils`
- Routing between shell and remotes
- Storybook
- Any mock/in-memory data layer
- Backend services (even stubs)
- CircleCI config
- CloudFront/S3 deployment scripts
- Auth bootstrap logic

If tempted to add any of the above "while we're here" — don't. Phase 0 is
deliberately boring on purpose: a clean scaffold that the next phase can
build on without rework.

---

## Guardrails for the executing model

- Never skip Step 2 (baseline verification) to save time — it isolates
  scaffold bugs from Federation bugs.
- Never pass `--force` or `--legacy-peer-deps` unless the executing model has
  first identified the specific peer-dependency conflict and confirmed the
  workaround is safe.
- Never commit `node_modules/`, `dist/`, or `.nx/cache/`.
- Never "modernize" flags that aren't in this plan. If the Nx generator
  changes its schema, match the current schema minimally — do not opt into
  new defaults silently.
- If any step fails, stop and report. Do not proceed to the next step with
  a broken intermediate state.
