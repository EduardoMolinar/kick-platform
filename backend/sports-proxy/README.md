# sports-proxy

AWS Lambda that proxies the [API-Football](https://www.api-football.com/) (RapidAPI) v3 API
for the Pitch frontend.

## Architecture

```
Browser → API Gateway HTTP API → Lambda (this) → API-Football
                                       ↓
                                  DynamoDB cache
                                  SSM Parameter Store (API key)
```

## Layout

```
src/sports_proxy/
├── handler.py       # Lambda entrypoint
├── router.py        # path matching
├── types.py         # TypedDict DTOs (mirror @platform/shared-types)
├── secrets.py       # SSM Parameter Store helpers
├── cache.py         # DynamoDB cache helpers
├── provider/
│   ├── api_football.py
│   └── id_mapping.py
└── normalize/
    ├── match.py
    ├── fixture.py
    ├── standing.py
    └── team.py
```

## Local development

```bash
python -m venv .venv
# Linux/macOS:
source .venv/bin/activate
# Windows PowerShell:
.venv\Scripts\Activate.ps1

pip install -r requirements-dev.txt

# Run tests
pytest -q

# Lint
ruff check src/ tests/

# Type-check
mypy src/
```

## Deployment

The Lambda is deployed via the CDK stack in [`../../infra/`](../../infra/). See that
project's README for the deploy workflow. The API key must be pre-seeded in SSM:

```bash
aws ssm put-parameter \
  --name /pitch/sports/api-football-key \
  --type SecureString \
  --value '<RAPIDAPI_KEY>' \
  --region eu-west-1
```

## Environment variables (set by CDK)

| Name | Purpose |
|------|---------|
| `CACHE_TABLE_NAME` | DynamoDB table for response caching |
| `SSM_KEY_NAME` | SSM parameter holding the API-Football key |
| `CURRENT_SEASON` | API-Football season query param (e.g. `2026`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist |
| `POWERTOOLS_SERVICE_NAME` | `sports-proxy` |
| `POWERTOOLS_LOG_LEVEL` | `INFO` in prod, `DEBUG` for verbose |
