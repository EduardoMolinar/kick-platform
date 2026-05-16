# Phase 16 — HTTP sports-data adapter on AWS serverless

## Context

After Phase 15 the platform has rich live-match, fixture, standings, and team data flowing through the UI — all from `MockSportsDataService` returning hardcoded fixtures. To make this real, we need a backend that calls API-Football (RapidAPI) and a frontend `HttpSportsDataService` that swaps in for the mock via DI.

CLAUDE.md is explicit: no third-party sports calls from the browser. The proxy must live server-side, hold the API key, and expose a provider-agnostic surface to the frontend. The user has chosen AWS serverless to keep costs low.

After Phase 16:
- A new Python 3.12 Lambda lives in [backend/sports-proxy/](backend/sports-proxy/), proxying API-Football v3 endpoints. Python is chosen for faster cold starts, smaller artifact, mature `aws-lambda-powertools`, and so future analytics / ML work stays in its natural language.
- A CDK stack (TypeScript — keeps `infra/` aligned with the frontend toolchain) in [infra/](infra/) provisions API Gateway HTTP API + Python Lambda + SSM Parameter Store + DynamoDB cache.
- `frontend/libs/sports-data` gains `HttpSportsDataService` implementing the existing `SportsDataService` interface.
- Each remote's `remote.routes.ts` swaps `MockSportsDataService` for `HttpSportsDataService` when a build-time `SPORTS_DATA_API_BASE_URL` is set; mock stays the default for tests and local dev.
- A new GitHub Actions workflow deploys the backend on push to `main` (re-uses the existing AWS OIDC role).

Real authentication (Cognito/Auth0) stays deferred to a later phase.

---

## Provider: API-Football (RapidAPI) — practical constraints

- **Free tier: 100 requests / day.** This is the binding constraint. The architecture must minimize calls via aggressive caching, otherwise a single user clicking around will exhaust quota in minutes.
- **Schema**: API-Football returns nested objects with numeric `league.id`, `team.id`, `fixture.id`. We map their IDs to our slug IDs (`pl`, `ucl`, `t-ars`, etc.) in the proxy.
- **Authentication**: header `X-RapidAPI-Key` + `X-RapidAPI-Host: api-football-v1.p.rapidapi.com`. Key stored in SSM Parameter Store SecureString.
- **Season**: API-Football needs a `season` query param (e.g. `2026`). Hardcoded as `CURRENT_SEASON` env var in the Lambda; configurable per deploy.

---

## Target architecture

```
              ┌─────────────┐
              │  Browser    │ (shell + 5 MFEs on CloudFront)
              └──────┬──────┘
                     │ HTTPS, CORS
                     ▼
          ┌──────────────────────┐
          │  API Gateway HTTP    │ (custom domain optional, free tier 1M req)
          │   /v1/*              │
          └──────────┬───────────┘
                     │
                     ▼
       ┌──────────────────────────────┐
       │  Lambda  sports-proxy        │ Python 3.12 · aws-lambda-powertools
       │  - reads cache (DynamoDB)    │ Memory: 256MB · Timeout: 8s
       │  - on miss → API-Football    │
       │  - writes cache with TTL     │
       │  - normalizes → our DTOs     │
       └────────┬─────────────────────┘
                │                  │
                ▼                  ▼
        ┌──────────────┐   ┌──────────────────┐
        │ DynamoDB     │   │ SSM Param Store  │
        │ sports-cache │   │ /sports/api-key  │
        │ TTL 60–600s  │   │ SecureString     │
        └──────────────┘   └──────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │ API-Football (v3)    │
                        │ RapidAPI             │
                        └──────────────────────┘
```

**Cost estimate (low-traffic dev)**: Lambda + API Gateway HTTP API + DynamoDB on-demand + SSM all under their free tiers (≲ $1/month even with 100k calls/day).

---

## Endpoint contract (proxy ↔ frontend)

Proxy exposes seven endpoints mapping 1:1 to `SportsDataService` methods. All return JSON shaped exactly like our existing types — the frontend's `HttpSportsDataService` does no shape transformation, only HTTP plumbing.

| HTTP | Path | Returns | Maps to |
|------|------|---------|---------|
| GET | `/v1/live` | `MatchSummary[]` | `getLiveMatches()` |
| GET | `/v1/matches/:id` | `MatchSummary \| null` | `getMatch(id)` |
| GET | `/v1/competitions/:id/fixtures` | `Fixture[]` | `getFixtures(competitionId)` |
| GET | `/v1/competitions/:id/standings` | `Standing \| null` | `getStandings(competitionId)` |
| GET | `/v1/teams/:id/fixtures` | `Fixture[]` | `getTeamFixtures(teamId)` |
| GET | `/v1/teams/:id/standings` | `TeamCompetitionStanding[]` | `getTeamStandings(teamId)` |
| GET | `/v1/teams/:id` | `Team \| null` | `getTeam(teamId)` |

CORS: allow `GET` from the production CloudFront origin + `http://localhost:4200` for dev.

---

## Step 1 — `backend/sports-proxy/` Lambda skeleton

The [backend/](backend/) directory exists as a placeholder per [backend/README.md](backend/README.md). Add a new sibling project:

```
backend/sports-proxy/
├── pyproject.toml              # PEP 621 metadata, deps pinned here
├── requirements.txt            # exported from pyproject for CDK bundling
├── requirements-dev.txt        # pytest, ruff, mypy
├── src/
│   └── sports_proxy/
│       ├── __init__.py
│       ├── handler.py          # Lambda entry — `lambda_handler(event, context)`
│       ├── router.py           # Tiny path matcher: '/v1/live' | '/v1/matches/<id>' | ...
│       ├── provider/
│       │   ├── __init__.py
│       │   ├── api_football.py # Provider adapter: httpx + auth header + parse
│       │   └── id_mapping.py   # Slug ID ↔ API-Football numeric ID maps
│       ├── normalize/
│       │   ├── __init__.py
│       │   ├── match.py        # API-Football fixture → MatchSummary
│       │   ├── fixture.py      # → Fixture
│       │   ├── standing.py     # → Standing + TeamCompetitionStanding
│       │   └── team.py         # → Team
│       ├── types.py            # TypedDict definitions mirroring @platform/shared-types
│       ├── cache.py            # DynamoDB get/put with TTL (boto3)
│       └── secrets.py          # SSM Parameter Store read (cached in module scope)
├── tests/
│   ├── conftest.py             # pytest fixtures (moto for DynamoDB/SSM mocking)
│   ├── test_normalize.py       # unit tests for the schema mapping
│   ├── test_router.py          # routing dispatch tests
│   └── fixtures/
│       └── api_football_*.json # canned API-Football response samples
└── README.md
```

Rules:
- **Python 3.12 runtime.** PEP 621 `pyproject.toml` is the source of truth for metadata; `requirements.txt` is generated from it so CDK bundling can consume a flat lockfile.
- **Dependencies (pinned):**
  - `aws-lambda-powertools[tracer,logger,parameters]` — structured logging, AWS X-Ray tracing, SSM/Secrets Manager parameter caching
  - `boto3` — DynamoDB only (SSM goes through Powertools)
  - `httpx` — sync client for API-Football calls (native `fetch` doesn't exist in Python stdlib)
  - Dev: `pytest`, `pytest-asyncio` (optional), `moto[dynamodb,ssm]`, `ruff`, `mypy`
- **No `requirements.txt` in the Lambda zip directly** — CDK's `PythonFunction` construct (from `@aws-cdk/aws-lambda-python-alpha`) installs deps into the bundle via Docker.
- **DTOs as `TypedDict`** (`src/sports_proxy/types.py`). They mirror `@platform/shared-types` exactly — same field names, same JSON shape on the wire. The frontend receives plain JSON; Python's `TypedDict` is purely a static-type aid for the proxy author. Document this duplication; a future phase could codegen the types from a shared schema.
- **Logging via Powertools `Logger`** — JSON-formatted, includes request ID, correlation IDs, cache hit/miss markers. No `print()`.

### ID mapping (`provider/id_mapping.py`)

Static dicts. Slug → API-Football numeric, plus inverse. Seeded for the four competitions and the teams we use in mock data:

```python
COMPETITION_TO_PROVIDER: dict[str, int] = {
    "pl": 39,      # English Premier League
    "ucl": 2,      # UEFA Champions League
    "liga": 140,   # Spanish La Liga
    "int": 1,      # World Cup / international (placeholder, handled specially)
}

TEAM_TO_PROVIDER: dict[str, int] = {
    "t-ars": 42,   # Arsenal
    "t-rma": 541,  # Real Madrid
    "t-mci": 50,   # Manchester City
    "t-liv": 40,   # Liverpool
    "t-che": 49,   # Chelsea
    "t-tot": 47,   # Tottenham
    "t-fcb": 529,  # FC Barcelona
    "t-atl": 530,  # Atlético Madrid
    # ... only the ones we use in the mock; extend as new teams appear
}
```

When the proxy encounters a slug not in the map, return `404` (which the frontend interprets as `undefined`/empty).

### Caching strategy (`cache.ts`)

DynamoDB on-demand table `sports-cache`:
- Partition key: `cacheKey` (string, e.g. `live`, `match:m-ucl-001`, `competition:pl:fixtures`)
- Attribute: `payload` (compressed JSON string), `expiresAt` (epoch seconds, DynamoDB TTL attribute)

TTL by endpoint:
- Live matches: **60 seconds** (tight; the data ticks)
- Single match: **60 seconds**
- Fixtures, standings, team identity: **600 seconds** (10 min — these change slowly)

On request: read from DynamoDB → if hit and not expired, return payload. Else call API-Football, normalize, write to DynamoDB, return.

### CORS

Lambda response always includes:
```
Access-Control-Allow-Origin: <allowed-origin>
Access-Control-Allow-Methods: GET, OPTIONS
Vary: Origin
```

The Lambda checks the `Origin` header against an allowlist set via env (`ALLOWED_ORIGINS` comma-separated): the production CloudFront URL + `http://localhost:4200`.

### Unit tests

Spec coverage in `backend/sports-proxy/tests/`:
- `test_normalize.py` — load canned API-Football responses from `tests/fixtures/`, assert our DTO shapes are produced correctly (MatchSummary, Standing with `position` ascending, Team)
- `test_router.py` — assert `/v1/live` dispatches to live handler, `/v1/teams/<id>` extracts the id, unknown paths return 404
- `test_cache.py` — using `moto` to mock DynamoDB, assert cache hit returns cached payload and cache miss triggers provider call

Run via `pytest backend/sports-proxy/tests/` (or `pytest -q` from inside the dir).

---

## Step 2 — Provider adapter (`provider/api_football.py`)

Single class `ApiFootballClient` with one method per backend endpoint. Each method:
1. Builds the API-Football URL (e.g. `https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all`).
2. Sets headers: `X-RapidAPI-Key` (cached from SSM via Powertools `parameters.get_parameter`), `X-RapidAPI-Host`.
3. Fetches via `httpx.Client` (reused across invocations to share connections in warm containers).
4. On 429 (rate limited) → raises `RateLimitError`; the handler catches and returns 503 to the frontend.
5. On 200 → parses JSON, normalizes via the corresponding `normalize/*.py` mapper, returns our DTO.

The `CURRENT_SEASON` env var supplies the `season` query param (2026 for Phase 16's locked timeframe).

The `httpx.Client` is created at module scope so warm-container invocations share the connection pool. Timeout: 5 seconds (Lambda's overall timeout is 8 s, leaving margin for cache + serialization).

---

## Step 3 — CDK infrastructure (`infra/`)

The [infra/](infra/) directory exists as a placeholder per [infra/README.md](infra/README.md). Add an AWS CDK project (TypeScript):

```
infra/
├── package.json                # standalone CDK project
├── cdk.json
├── tsconfig.json
├── bin/
│   └── infra.ts                # CDK app entry
├── lib/
│   └── sports-proxy-stack.ts   # the Stack
└── README.md
```

Stack provisions:
1. **DynamoDB table** `sports-cache`: on-demand billing, TTL attribute `expiresAt`.
2. **SSM Parameter** `/pitch/sports/api-football-key`: SecureString. Bootstrapped manually (`aws ssm put-parameter`) outside the stack; CDK references by name only — never embeds the secret.
3. **Lambda function** `sports-proxy`: built via `aws_lambda_python_alpha.PythonFunction` which Docker-bundles `requirements.txt` into the deployment package. Runtime `PYTHON_3_12`, entry `src/sports_proxy/handler.py`, handler `sports_proxy.handler.lambda_handler`. Env vars: `CACHE_TABLE_NAME`, `SSM_KEY_NAME`, `CURRENT_SEASON`, `ALLOWED_ORIGINS`, `POWERTOOLS_SERVICE_NAME=sports-proxy`, `POWERTOOLS_LOG_LEVEL=INFO`. 256 MB memory, 8 s timeout.
4. **IAM role** for the Lambda: `dynamodb:GetItem`/`PutItem` on the cache table, `ssm:GetParameter`/`kms:Decrypt` on the API key.
5. **API Gateway HTTP API**: a single integration to the Lambda, route `ANY /v1/{proxy+}`.
6. **CloudWatch log group** with 14-day retention.

Output: `apiUrl` (the HTTP API endpoint) — captured by the GitHub Actions workflow and surfaced to the frontend.

CDK commands (local): `npm --prefix infra run synth`, `npm --prefix infra run deploy`. Both require AWS credentials.

---

## Step 4 — Frontend `HttpSportsDataService`

Add to [frontend/libs/sports-data/src/lib/http-sports-data.service.ts](frontend/libs/sports-data/src/lib/http-sports-data.service.ts):

```ts
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

export const SPORTS_DATA_API_BASE_URL = new InjectionToken<string>('SPORTS_DATA_API_BASE_URL');

@Injectable({ providedIn: 'root' })
export class HttpSportsDataService implements SportsDataService {
  constructor(
    private readonly http: HttpClient,
    @Inject(SPORTS_DATA_API_BASE_URL) private readonly baseUrl: string
  ) {}

  getLiveMatches(): Observable<readonly MatchSummary[]> {
    return this.http.get<readonly MatchSummary[]>(`${this.baseUrl}/v1/live`).pipe(
      catchError(() => of([] as readonly MatchSummary[]))
    );
  }
  // ... one method per interface entry, each wrapping http.get with a catchError that
  //     falls back to the empty value (undefined / empty array / no events).
}
```

All methods follow the same pattern: HTTP GET → on error fall back to the "empty" value of the return shape. This keeps the UI from crashing if the backend is down or rate-limited; the user sees empty sections rather than an error.

Add a `provideHttpClient()` to the shell's [app.config.ts](frontend/apps/shell/src/app/app.config.ts) (currently doesn't include HttpClient).

### Provider swap

In each remote's `remote.routes.ts`, replace:
```ts
{ provide: SPORTS_DATA_SERVICE, useExisting: MockSportsDataService }
```
with a `useFactory` that picks based on whether `SPORTS_DATA_API_BASE_URL` is provided:

```ts
{
  provide: SPORTS_DATA_SERVICE,
  useFactory: () => {
    const url = inject(SPORTS_DATA_API_BASE_URL, { optional: true });
    return url ? inject(HttpSportsDataService) : inject(MockSportsDataService);
  },
}
```

The shell binds `SPORTS_DATA_API_BASE_URL` (or doesn't) in `app.config.ts`. When set, all remotes use HTTP; when unset, all remotes use mock.

### How the URL gets to the shell

Use Angular file replacements:
- [frontend/apps/shell/src/environments/environment.ts](frontend/apps/shell/src/environments/environment.ts) → exports `{ sportsApiBaseUrl: '' }` (mock mode).
- [frontend/apps/shell/src/environments/environment.prod.ts](frontend/apps/shell/src/environments/environment.prod.ts) → exports `{ sportsApiBaseUrl: 'https://<api-gateway-url>' }`.
- Configure file replacements in the shell's `project.json` esbuild target for production.
- `app.config.ts` imports `environment` and provides `SPORTS_DATA_API_BASE_URL` if `sportsApiBaseUrl` is truthy.

This keeps the URL out of the codebase and per-environment.

---

## Step 5 — GitHub Actions backend deploy workflow

Add [.github/workflows/deploy-backend.yml](.github/workflows/deploy-backend.yml):

```yaml
name: Deploy backend (sports-proxy)
on:
  push:
    branches: [main]
    paths:
      - 'backend/sports-proxy/**'
      - 'infra/**'
      - '.github/workflows/deploy-backend.yml'
permissions:
  id-token: write
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - name: Setup Node (for CDK)
        uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Install backend dev deps
        run: |
          python -m pip install --upgrade pip
          pip install -r backend/sports-proxy/requirements-dev.txt
      - name: Lint + test backend
        run: |
          cd backend/sports-proxy
          ruff check src/ tests/
          pytest tests/ -q
      - name: Install CDK deps
        run: npm --prefix infra ci
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_OIDC_ROLE_ARN }}
          aws-region: eu-west-1
      - name: CDK deploy
        run: npm --prefix infra run deploy -- --require-approval=never
```

Re-uses the existing `AWS_OIDC_ROLE_ARN` secret from the frontend deploy workflow. The OIDC role's permissions may need to widen to include CDK bootstrap actions; document the IAM changes in `infra/README.md`.

After deploy, the CDK Outputs surface `apiUrl`. Initially the operator captures this manually and updates `environment.prod.ts` (followed by a frontend deploy). A later phase could automate this via a release pipeline.

---

## Step 6 — Frontend lib updates + new HTTP barrel

`frontend/libs/sports-data/src/index.ts` adds:
```ts
export * from './lib/http-sports-data.service';
```

No consumer specs need changes — `MockSportsDataService` stays the default in test environments (no `SPORTS_DATA_API_BASE_URL` provided in TestBed). The new `HttpSportsDataService` gets its own spec that uses `HttpTestingController` to assert HTTP calls per endpoint.

---

## Step 7 — End-to-end verification

### Local

```bash
# 1. Verify backend lint + tests pass (no AWS calls)
cd backend/sports-proxy
python -m venv .venv && source .venv/bin/activate    # or .venv\Scripts\activate on Windows
pip install -r requirements-dev.txt
ruff check src/ tests/
mypy src/
pytest tests/ -q
cd ../..

# 2. Verify CDK synth works (no deploy yet). Requires Docker running.
npm --prefix infra ci
npm --prefix infra run synth              # emits CloudFormation template;
                                          # PythonFunction triggers Docker bundle

# 3. Verify frontend still builds and tests pass (mock default)
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data,profile,auth

# 4. Dev smoke (still using mock)
npm run dev
# All five remotes render mock data as before — no regression.
```

### AWS

```bash
# 5. Manual one-time SSM bootstrap (NOT in CDK)
aws ssm put-parameter \
  --name /pitch/sports/api-football-key \
  --type SecureString \
  --value '<RAPIDAPI_KEY>' \
  --region eu-west-1

# 6. Manual deploy (first run, to capture API URL)
npm --prefix infra run deploy
# Note the apiUrl output (e.g. https://abc123.execute-api.eu-west-1.amazonaws.com)

# 7. Update environment.prod.ts with the apiUrl, commit, push to main
# → triggers frontend deploy via existing release-affected.yml.

# 8. After frontend prod deploy, hit the live CloudFront URL:
#    - /live should show real live matches from API-Football
#    - /competition/pl should show real Premier League fixtures + standings
#    - DynamoDB cache table should populate (verify via console)
#    - CloudWatch logs for Lambda should show cache hits on repeat requests
```

### Quota safety check

```bash
# Verify free-tier doesn't get nuked. After steady-state browsing:
aws logs filter-log-events \
  --log-group-name /aws/lambda/sports-proxy \
  --filter-pattern '{ $.cacheHit = false }' \
  --max-items 200
# Count of MISS lines / 24h should stay well under 100 for free tier.
```

---

## Acceptance checklist

- [ ] `backend/sports-proxy/` Lambda builds and unit-tests pass
- [ ] `infra/` CDK stack synthesizes without errors
- [ ] CDK deploys end-to-end to AWS via `npm --prefix infra run deploy`
- [ ] API Gateway URL is reachable and returns valid JSON for all 7 endpoints
- [ ] CORS allows `http://localhost:4200` and the prod CloudFront origin
- [ ] DynamoDB cache populates and TTL evicts entries
- [ ] SSM SecureString holds the API key; Lambda reads it once per cold start
- [ ] Lambda IAM role has minimal permissions (read SSM + DynamoDB R/W on that table only)
- [ ] Frontend `HttpSportsDataService` implements every `SportsDataService` method
- [ ] Each remote `remote.routes.ts` picks Http vs Mock via `useFactory`
- [ ] `environment.prod.ts` carries the API URL; file replacement configured in shell `project.json`
- [ ] GitHub Actions `deploy-backend.yml` runs on `main` push when backend/ or infra/ changes
- [ ] Mock stays the default in tests and local dev (no env var set)
- [ ] All existing 11 projects still pass lint+test+build (no breakage)
- [ ] CLAUDE.md unchanged

---

## Out of scope

- **Cognito/Auth0** — explicit per-user request; later phase.
- **profile-api** — DynamoDB for favorites stays mock-side for now; a separate phase mirrors this architecture.
- **CloudFront in front of API Gateway** — DynamoDB cache covers the quota concern adequately; CDN-level caching is a later optimization.
- **Custom domain on API Gateway** — use the default `*.execute-api.*.amazonaws.com` URL.
- **Production observability** — CloudWatch logs only; X-Ray/Datadog/etc. later.
- **Match events / lineups / live stats** — API-Football has these but the mock didn't, so the existing `getMatch()` returns the same `MatchSummary` shape. Extending to live events is a follow-up.
- **More competitions / teams** — only the seeded slug-to-provider IDs ship; extending the map is incremental.

---

## Risk and rollout

- **Risk: low–medium.** New backend infra is the main risk surface. Mitigated by:
  - Mock stays the default; the system still works if backend is down (frontend `catchError` falls back to empty).
  - Cache absorbs quota pressure.
  - Deploy is reversible — empty `environment.prod.ts` URL reverts to mock.
- **Blast radius**: any frontend breakage limited to live/competition/team/home pages. Profile page unaffected (uses `profile` lib, separate).
- **Rollout**: deploy backend first, verify endpoints manually, then update `environment.prod.ts`, then ship frontend. Two PRs.
- **Cost**: under $1/month at current traffic (Lambda + API GW + DynamoDB + SSM all well within free tier). RapidAPI free quota is the binding constraint, not AWS cost.

---

## Critical files to be modified or created

**New files (backend, Python):**
- [backend/sports-proxy/pyproject.toml](backend/sports-proxy/pyproject.toml)
- [backend/sports-proxy/requirements.txt](backend/sports-proxy/requirements.txt)
- [backend/sports-proxy/requirements-dev.txt](backend/sports-proxy/requirements-dev.txt)
- [backend/sports-proxy/src/sports_proxy/handler.py](backend/sports-proxy/src/sports_proxy/handler.py)
- [backend/sports-proxy/src/sports_proxy/router.py](backend/sports-proxy/src/sports_proxy/router.py)
- [backend/sports-proxy/src/sports_proxy/types.py](backend/sports-proxy/src/sports_proxy/types.py)
- [backend/sports-proxy/src/sports_proxy/provider/api_football.py](backend/sports-proxy/src/sports_proxy/provider/api_football.py)
- [backend/sports-proxy/src/sports_proxy/provider/id_mapping.py](backend/sports-proxy/src/sports_proxy/provider/id_mapping.py)
- `backend/sports-proxy/src/sports_proxy/normalize/*.py` (match.py, fixture.py, standing.py, team.py)
- [backend/sports-proxy/src/sports_proxy/cache.py](backend/sports-proxy/src/sports_proxy/cache.py)
- [backend/sports-proxy/src/sports_proxy/secrets.py](backend/sports-proxy/src/sports_proxy/secrets.py)
- `backend/sports-proxy/tests/conftest.py`, `tests/test_normalize.py`, `tests/test_router.py`, `tests/fixtures/*.json`

**New files (infra, TypeScript CDK):**
- [infra/package.json](infra/package.json)
- [infra/cdk.json](infra/cdk.json)
- [infra/bin/infra.ts](infra/bin/infra.ts)
- [infra/lib/sports-proxy-stack.ts](infra/lib/sports-proxy-stack.ts)

**New files (frontend):**
- [frontend/libs/sports-data/src/lib/http-sports-data.service.ts](frontend/libs/sports-data/src/lib/http-sports-data.service.ts)
- [frontend/libs/sports-data/src/lib/http-sports-data.service.spec.ts](frontend/libs/sports-data/src/lib/http-sports-data.service.spec.ts)
- [frontend/apps/shell/src/environments/environment.ts](frontend/apps/shell/src/environments/environment.ts)
- [frontend/apps/shell/src/environments/environment.prod.ts](frontend/apps/shell/src/environments/environment.prod.ts)

**New files (CI):**
- [.github/workflows/deploy-backend.yml](.github/workflows/deploy-backend.yml)
- `PHASE_16_PLAN.md` at repo root (mirrors prior phase convention)

**Modified files:**
- [frontend/libs/sports-data/src/index.ts](frontend/libs/sports-data/src/index.ts) — export `HttpSportsDataService` + `SPORTS_DATA_API_BASE_URL` token
- [frontend/apps/shell/src/app/app.config.ts](frontend/apps/shell/src/app/app.config.ts) — `provideHttpClient()` + bind `SPORTS_DATA_API_BASE_URL` from environment
- [frontend/apps/shell/project.json](frontend/apps/shell/project.json) — esbuild file replacements for environment.ts
- [frontend/apps/mfe-home/src/app/remote.routes.ts](frontend/apps/mfe-home/src/app/remote.routes.ts) — `useFactory` swap
- [frontend/apps/mfe-live/src/app/remote.routes.ts](frontend/apps/mfe-live/src/app/remote.routes.ts) — same
- [frontend/apps/mfe-competition/src/app/remote.routes.ts](frontend/apps/mfe-competition/src/app/remote.routes.ts) — same
- [frontend/apps/mfe-team/src/app/remote.routes.ts](frontend/apps/mfe-team/src/app/remote.routes.ts) — same
- [backend/README.md](backend/README.md), [infra/README.md](infra/README.md) — update to document the new project layout

**Existing utilities reused:**
- `SportsDataService` interface at [frontend/libs/sports-data/src/lib/sports-data.service.ts](frontend/libs/sports-data/src/lib/sports-data.service.ts) — unchanged. `HttpSportsDataService` implements it 1:1.
- `MockSportsDataService` at [frontend/libs/sports-data/src/lib/mock-sports-data.service.ts](frontend/libs/sports-data/src/lib/mock-sports-data.service.ts) — unchanged; stays the test/dev fallback.
- Existing TypeScript types in `@platform/shared-types` — mirrored as Python `TypedDict` definitions in `backend/sports-proxy/src/sports_proxy/types.py` (intentional cross-language duplication — backend must build standalone, and there's no shared schema layer yet). A future phase could codegen one side from the other.
- Existing AWS OIDC role from [.github/workflows/release-affected.yml](.github/workflows/release-affected.yml) — re-used by the new backend deploy workflow. The role's policy may need `lambda:*`, `apigateway:*`, `dynamodb:*` on the relevant resources, plus CDK bootstrap — document in `infra/README.md`.
