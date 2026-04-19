# Platform monorepo

Repo structure:

- `frontend/apps/` — Angular 20 micro-frontend apps (shell + remotes)
- `frontend/libs/` — shared Angular libraries (design system, auth, sports-data, etc.)
- `backend/`       — backend services (sports-api, profile-api, BFF if needed)
- `infra/`         — CI/CD and infrastructure-as-code

The Nx workspace root is the repo root. `backend/` and `infra/` are plain directories excluded from Nx.

## Stack

- Nx 21.6.11
- Angular 20.3.x (LTS)
- Native Federation (`@angular-architects/native-federation@20.3.1`)
- TypeScript ~5.9.2
- esbuild (`@angular/build:application` executor)

## Running the frontend

```bash
npx nx serve shell
```

Visit http://localhost:4200.

## Building

```bash
npx nx build shell
npx nx affected -t lint,test,build
```
