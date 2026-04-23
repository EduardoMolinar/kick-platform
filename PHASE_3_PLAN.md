# Phase 3 — Design System Expansion + Storybook

## Context

Phases 0–2 built the architectural skeleton: Nx workspace, shell-as-host, 5 Native Federation remotes, Nx tag boundaries, and two DS primitives (`DsButton`, `DsTopNav`). The DS today has:

- **Hardcoded color values** (`#0b5fff`, `rgba(0,0,0,0.08)`) duplicated across two components — no single source of truth
- **No tokens file** — no semantic layer between "button color" and "blue"
- **No Storybook** — reviewing visuals/a11y today requires running the entire 6-app dev stack
- **Only 2 primitives** — any Phase 4+ feature work will either hardcode one-off cards/badges/lists (drift) or block waiting for DS work

Phase 3 closes these gaps so the DS is actually usable as a product (per CLAUDE.md's "DS is a product, not a folder of reusable leftovers") when real features start landing in Phase 4+.

After Phase 3 the DS has:
- **Design tokens** (color, spacing, radius, typography, elevation) exposed as CSS custom properties
- **Three new primitives**: `DsCard`, `DsList` / `DsListItem`, `DsBadge` — all standalone, OnPush, a11y-ready, zero-dep
- **DsButton + DsTopNav refactored** to consume tokens (no more hardcoded hex)
- **Storybook** wired to the design-system project with one story per primitive and a global tokens preview
- **Every app's `styles.scss`** imports the DS tokens so components render identically in the shell and remotes

Explicitly deferred to Phase 4+: `sports-data` mock lib, `auth`, `profile`, `shared-ui`, `shared-utils`, real feature work inside remotes, further primitives (`DsInput`, `DsModal`, `DsTabs`, `DsIcon`, `DsSpinner`), dark-mode theming, a11y audit tooling (axe), visual regression (Chromatic / Loki), backend services.

**Why this slice:** foundation before features. Shipping the first real feature (live scores) on top of a DS with hardcoded hex and no visual review surface means every first-draft feature either drifts or blocks on DS work. Front-loading tokens + three primitives + Storybook makes Phase 4 dramatically cheaper.

---

## Locked versions (unchanged)

- Node 20.x LTS
- Nx `21.6.11`
- Angular `~20.3.0`
- `@angular-architects/native-federation` `20.3.1`
- TypeScript `~5.9.2`

Storybook version is whatever `@nx/storybook:configuration` installs on Nx 21.6.11 (expected Storybook 8.x). **Do not hand-pin Storybook** — let Nx pick a compatible version.

Reject Angular/Nx upgrade prompts.

---

## Target repo layout after Phase 3

```
Nx/
├── frontend/
│   ├── apps/
│   │   ├── shell/
│   │   │   └── src/styles.scss                   # imports DS tokens
│   │   ├── mfe-home/src/styles.scss              # imports DS tokens
│   │   ├── mfe-live/src/styles.scss              # imports DS tokens
│   │   ├── mfe-competition/src/styles.scss       # imports DS tokens
│   │   ├── mfe-team/src/styles.scss              # imports DS tokens
│   │   └── mfe-profile/src/styles.scss           # imports DS tokens
│   └── libs/
│       └── design-system/
│           ├── .storybook/                       # NEW — Storybook config
│           │   ├── main.ts
│           │   ├── preview.ts                    # globally imports tokens
│           │   └── tsconfig.json
│           ├── src/
│           │   ├── index.ts                      # re-exports all primitives
│           │   ├── styles/                       # NEW — global styles entry
│           │   │   ├── _tokens.scss              # :root custom properties
│           │   │   └── index.scss                # @forward tokens
│           │   └── lib/
│           │       ├── button/                   # (refactored to use tokens)
│           │       │   ├── button.ts
│           │       │   ├── button.html
│           │       │   ├── button.scss
│           │       │   ├── button.spec.ts
│           │       │   └── button.stories.ts     # NEW
│           │       ├── top-nav/                  # (refactored to use tokens)
│           │       │   ├── top-nav.ts
│           │       │   ├── top-nav.html
│           │       │   ├── top-nav.scss
│           │       │   ├── top-nav.spec.ts
│           │       │   └── top-nav.stories.ts    # NEW
│           │       ├── card/                     # NEW — DsCard
│           │       │   ├── card.ts
│           │       │   ├── card.html
│           │       │   ├── card.scss
│           │       │   ├── card.spec.ts
│           │       │   └── card.stories.ts
│           │       ├── list/                     # NEW — DsList / DsListItem
│           │       │   ├── list.ts
│           │       │   ├── list.html
│           │       │   ├── list.scss
│           │       │   ├── list-item.ts
│           │       │   ├── list-item.html
│           │       │   ├── list-item.scss
│           │       │   ├── list.spec.ts
│           │       │   └── list.stories.ts
│           │       └── badge/                    # NEW — DsBadge
│           │           ├── badge.ts
│           │           ├── badge.html
│           │           ├── badge.scss
│           │           ├── badge.spec.ts
│           │           └── badge.stories.ts
│           └── project.json                      # gets storybook + build-storybook targets
└── package.json                                  # Nx adds storybook devDeps
```

---

## Prerequisites

From `c:\Users\edy_0\projects\Nx`, Phase 2 must be green:

```bash
npm run dev:shell -- --help    # confirm the Phase 2 npm scripts land
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types
```

All green. If anything fails, **stop** — Phase 3 depends on a working Phase 2 baseline.

---

## Step 1 — Design tokens foundation

Tokens are the contract between "what the component asks for" and "what hex/rem value that resolves to." Getting this right once means every later primitive stays consistent without re-argument.

### 1a. Create the tokens SCSS file

Create `frontend/libs/design-system/src/styles/_tokens.scss`:

```scss
:root {
  // ——— Color — brand ———
  --ds-color-primary: #0b5fff;
  --ds-color-primary-hover: #0848c7;
  --ds-color-primary-contrast: #ffffff;

  // ——— Color — surface ———
  --ds-color-surface: #ffffff;
  --ds-color-surface-muted: #f4f6fa;
  --ds-color-surface-raised: #ffffff;

  // ——— Color — text ———
  --ds-color-text: #111418;
  --ds-color-text-muted: #5b6573;
  --ds-color-text-inverse: #ffffff;

  // ——— Color — border ———
  --ds-color-border: rgba(0, 0, 0, 0.08);
  --ds-color-border-strong: rgba(0, 0, 0, 0.16);

  // ——— Color — semantic ———
  --ds-color-live: #e0352b;        // live match indicator
  --ds-color-success: #1f8a43;
  --ds-color-warning: #c27a00;
  --ds-color-danger: #c2372f;

  // ——— Spacing (4px base) ———
  --ds-space-1: 0.25rem;   // 4
  --ds-space-2: 0.5rem;    // 8
  --ds-space-3: 0.75rem;   // 12
  --ds-space-4: 1rem;      // 16
  --ds-space-5: 1.5rem;    // 24
  --ds-space-6: 2rem;      // 32
  --ds-space-7: 3rem;      // 48

  // ——— Radius ———
  --ds-radius-sm: 0.25rem;
  --ds-radius-md: 0.5rem;
  --ds-radius-lg: 1rem;
  --ds-radius-pill: 999px;

  // ——— Typography ———
  --ds-font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --ds-font-size-xs: 0.75rem;
  --ds-font-size-sm: 0.875rem;
  --ds-font-size-md: 1rem;
  --ds-font-size-lg: 1.25rem;
  --ds-font-size-xl: 1.5rem;

  --ds-font-weight-regular: 400;
  --ds-font-weight-medium: 500;
  --ds-font-weight-bold: 700;

  --ds-line-height-tight: 1.2;
  --ds-line-height-normal: 1.5;

  // ——— Elevation ———
  --ds-shadow-1: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
  --ds-shadow-2: 0 4px 8px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.04);

  // ——— Motion ———
  --ds-duration-fast: 120ms;
  --ds-duration-base: 200ms;
  --ds-easing-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

**Tokens are CSS custom properties** (not SCSS `$variables`) because:
- They work across Angular component style scoping
- They support runtime theming (future phase)
- Components reference them as `color: var(--ds-color-text)` regardless of the consumer's SCSS setup

### 1b. Create the DS styles entry

Create `frontend/libs/design-system/src/styles/index.scss`:

```scss
@forward 'tokens';
```

### 1c. Wire tokens into every app

For each of the 6 apps (`shell`, `mfe-home`, `mfe-live`, `mfe-competition`, `mfe-team`, `mfe-profile`), edit `frontend/apps/<APP>/src/styles.scss` and add at the top:

```scss
@use '../../../libs/design-system/src/styles' as *;

html,
body {
  margin: 0;
  font-family: var(--ds-font-family);
  color: var(--ds-color-text);
  background: var(--ds-color-surface);
}
```

The relative path resolves against each app's `src/` — verify it (in shell: `frontend/apps/shell/src/styles.scss` → up 3 to `frontend/` → `libs/design-system/src/styles/index.scss`). Same depth for remotes.

### 1d. Verify

```bash
npx nx build shell
npx nx build mfe-home
```

Both must succeed and the output CSS must contain `--ds-color-primary`. If a relative path breaks, fix it (don't work around by duplicating tokens).

---

## Step 2 — Refactor existing primitives to consume tokens

Do this **before** adding new primitives so the refactor pattern is proven on simple cases first.

### 2a. Refactor `DsButton`

Replace `frontend/libs/design-system/src/lib/button/button.scss`:

```scss
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-space-2) var(--ds-space-4);
  border: 1px solid transparent;
  border-radius: var(--ds-radius-sm);
  font: inherit;
  font-weight: var(--ds-font-weight-medium);
  cursor: pointer;
  transition: background var(--ds-duration-fast) var(--ds-easing-standard),
              color var(--ds-duration-fast) var(--ds-easing-standard);

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &--primary {
    background: var(--ds-color-primary);
    color: var(--ds-color-primary-contrast);

    &:hover:not([disabled]) {
      background: var(--ds-color-primary-hover);
    }
  }

  &--secondary {
    background: transparent;
    color: var(--ds-color-primary);
    border-color: var(--ds-color-primary);

    &:hover:not([disabled]) {
      background: var(--ds-color-primary);
      color: var(--ds-color-primary-contrast);
    }
  }

  &--ghost {
    background: transparent;
    color: inherit;
  }
}
```

### 2b. Refactor `DsTopNav`

Replace `frontend/libs/design-system/src/lib/top-nav/top-nav.scss`:

```scss
.ds-top-nav {
  display: block;
  border-bottom: 1px solid var(--ds-color-border);
  padding: 0 var(--ds-space-4);
  background: var(--ds-color-surface);

  &__list {
    display: flex;
    gap: var(--ds-space-5);
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
    padding: var(--ds-space-3) 0;
    color: var(--ds-color-text);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    font-size: var(--ds-font-size-md);

    &:hover {
      color: var(--ds-color-primary);
    }

    &--active {
      border-bottom-color: var(--ds-color-primary);
      color: var(--ds-color-primary);
      font-weight: var(--ds-font-weight-bold);
    }
  }
}
```

### 2c. Verify

```bash
npx nx build design-system
npx nx test design-system
npx nx lint design-system
```

All green. Existing specs must still pass — the tokens refactor changes visuals but not public APIs.

---

## Step 3 — Add `DsCard` primitive

A simple container with header / body / footer projection slots. Will back match cards, team cards, competition cards in later phases.

### 3a. Generate the component

From `c:\Users\edy_0\projects\Nx`:

```bash
npx nx g @nx/angular:component \
  --path=frontend/libs/design-system/src/lib/card/card \
  --name=card \
  --standalone=true \
  --style=scss \
  --changeDetection=OnPush \
  --skipTests=false \
  --export=true \
  --no-interactive
```

### 3b. `card.ts`

Replace `frontend/libs/design-system/src/lib/card/card.ts`:

```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DsCardVariant = 'raised' | 'flat';

@Component({
  selector: 'ds-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsCard {
  @Input() variant: DsCardVariant = 'raised';
  @Input('aria-label') ariaLabel?: string;
}
```

### 3c. `card.html`

```html
<article
  class="ds-card ds-card--{{ variant }}"
  [attr.aria-label]="ariaLabel ?? null"
>
  <header class="ds-card__header">
    <ng-content select="[ds-card-header]"></ng-content>
  </header>
  <div class="ds-card__body">
    <ng-content></ng-content>
  </div>
  <footer class="ds-card__footer">
    <ng-content select="[ds-card-footer]"></ng-content>
  </footer>
</article>
```

### 3d. `card.scss`

```scss
.ds-card {
  display: flex;
  flex-direction: column;
  background: var(--ds-color-surface-raised);
  border-radius: var(--ds-radius-md);
  overflow: hidden;

  &--raised {
    box-shadow: var(--ds-shadow-1);
  }

  &--flat {
    border: 1px solid var(--ds-color-border);
  }

  &__header {
    padding: var(--ds-space-4);
    border-bottom: 1px solid var(--ds-color-border);

    &:empty {
      display: none;
    }
  }

  &__body {
    padding: var(--ds-space-4);
    flex: 1;
  }

  &__footer {
    padding: var(--ds-space-3) var(--ds-space-4);
    border-top: 1px solid var(--ds-color-border);

    &:empty {
      display: none;
    }
  }
}
```

### 3e. Replace `card.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsCard } from './card';

describe('DsCard', () => {
  let component: DsCard;
  let fixture: ComponentFixture<DsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DsCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to raised variant', () => {
    expect(component.variant).toBe('raised');
    const root = fixture.nativeElement.querySelector('.ds-card');
    expect(root.classList.contains('ds-card--raised')).toBe(true);
  });

  it('should switch to flat variant', () => {
    component.variant = 'flat';
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.ds-card');
    expect(root.classList.contains('ds-card--flat')).toBe(true);
  });
});
```

### 3f. Export from DS entry

Edit `frontend/libs/design-system/src/index.ts`, add:

```ts
export * from './lib/card/card';
```

### 3g. Verify

```bash
npx nx lint design-system
npx nx test design-system
npx nx build design-system
```

All green.

---

## Step 4 — Add `DsList` and `DsListItem`

A semantic vertical list with dividers. Two components because consumers need to both scope the list container and project rows.

### 4a. Generate `DsList`

```bash
npx nx g @nx/angular:component \
  --path=frontend/libs/design-system/src/lib/list/list \
  --name=list \
  --standalone=true \
  --style=scss \
  --changeDetection=OnPush \
  --skipTests=false \
  --export=true \
  --no-interactive
```

### 4b. Generate `DsListItem` (same folder)

```bash
npx nx g @nx/angular:component \
  --path=frontend/libs/design-system/src/lib/list/list-item \
  --name=list-item \
  --standalone=true \
  --style=scss \
  --changeDetection=OnPush \
  --skipTests=false \
  --export=true \
  --no-interactive
```

### 4c. `list.ts`

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-list',
  standalone: true,
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsList {}
```

### 4d. `list.html`

```html
<ul class="ds-list" role="list">
  <ng-content></ng-content>
</ul>
```

### 4e. `list.scss`

```scss
.ds-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-md);
  background: var(--ds-color-surface-raised);
  overflow: hidden;
}
```

### 4f. `list-item.ts`

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-list-item',
  standalone: true,
  templateUrl: './list-item.html',
  styleUrl: './list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsListItem {}
```

### 4g. `list-item.html`

```html
<li class="ds-list-item">
  <ng-content></ng-content>
</li>
```

### 4h. `list-item.scss`

```scss
.ds-list-item {
  padding: var(--ds-space-3) var(--ds-space-4);
  border-bottom: 1px solid var(--ds-color-border);
  font-size: var(--ds-font-size-md);
  color: var(--ds-color-text);

  &:last-child {
    border-bottom: none;
  }
}
```

### 4i. Replace specs

`list.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsList } from './list';

describe('DsList', () => {
  let component: DsList;
  let fixture: ComponentFixture<DsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsList] }).compileComponents();
    fixture = TestBed.createComponent(DsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a <ul> with role="list"', () => {
    const ul = fixture.nativeElement.querySelector('ul.ds-list');
    expect(ul).toBeTruthy();
    expect(ul.getAttribute('role')).toBe('list');
  });
});
```

`list-item.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsListItem } from './list-item';

describe('DsListItem', () => {
  let component: DsListItem;
  let fixture: ComponentFixture<DsListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsListItem] }).compileComponents();
    fixture = TestBed.createComponent(DsListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### 4j. Export from DS entry

Append to `frontend/libs/design-system/src/index.ts`:

```ts
export * from './lib/list/list';
export * from './lib/list/list-item';
```

### 4k. Verify

```bash
npx nx lint design-system
npx nx test design-system
npx nx build design-system
```

All green.

---

## Step 5 — Add `DsBadge`

A small labeled pill for status (`LIVE`, `FT`, minute counters, score states). Three variants to start: `neutral`, `live`, `success`.

### 5a. Generate

```bash
npx nx g @nx/angular:component \
  --path=frontend/libs/design-system/src/lib/badge/badge \
  --name=badge \
  --standalone=true \
  --style=scss \
  --changeDetection=OnPush \
  --skipTests=false \
  --export=true \
  --no-interactive
```

### 5b. `badge.ts`

```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DsBadgeVariant = 'neutral' | 'live' | 'success' | 'warning';

@Component({
  selector: 'ds-badge',
  standalone: true,
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsBadge {
  @Input() variant: DsBadgeVariant = 'neutral';
}
```

### 5c. `badge.html`

```html
<span class="ds-badge ds-badge--{{ variant }}">
  <ng-content></ng-content>
</span>
```

### 5d. `badge.scss`

```scss
.ds-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--ds-space-1) var(--ds-space-2);
  border-radius: var(--ds-radius-pill);
  font-size: var(--ds-font-size-xs);
  font-weight: var(--ds-font-weight-bold);
  line-height: var(--ds-line-height-tight);
  letter-spacing: 0.04em;
  text-transform: uppercase;

  &--neutral {
    background: var(--ds-color-surface-muted);
    color: var(--ds-color-text-muted);
  }

  &--live {
    background: var(--ds-color-live);
    color: var(--ds-color-text-inverse);
  }

  &--success {
    background: var(--ds-color-success);
    color: var(--ds-color-text-inverse);
  }

  &--warning {
    background: var(--ds-color-warning);
    color: var(--ds-color-text-inverse);
  }
}
```

### 5e. Replace `badge.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsBadge } from './badge';

describe('DsBadge', () => {
  let component: DsBadge;
  let fixture: ComponentFixture<DsBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsBadge] }).compileComponents();
    fixture = TestBed.createComponent(DsBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to neutral variant', () => {
    const span = fixture.nativeElement.querySelector('.ds-badge');
    expect(span.classList.contains('ds-badge--neutral')).toBe(true);
  });

  it('applies the live variant class', () => {
    component.variant = 'live';
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('.ds-badge');
    expect(span.classList.contains('ds-badge--live')).toBe(true);
  });
});
```

### 5f. Export from DS entry

Append to `frontend/libs/design-system/src/index.ts`:

```ts
export * from './lib/badge/badge';
```

### 5g. Verify

```bash
npx nx lint design-system
npx nx test design-system
npx nx build design-system
```

All green.

---

## Step 6 — Wire Storybook to `design-system`

### 6a. Install & configure

From `c:\Users\edy_0\projects\Nx`:

```bash
npx nx g @nx/angular:storybook-configuration design-system \
  --interactionTests=false \
  --configureStaticServe=false \
  --generateStories=false \
  --no-interactive
```

Flag rationale:
- `--interactionTests=false` — skip `@storybook/test-runner` setup; add later if visual/interaction testing becomes needed
- `--configureStaticServe=false` — we can serve via `nx storybook design-system` directly
- `--generateStories=false` — we'll hand-write stories for quality, not auto-generate noise

This generator:
- Installs `@storybook/angular`, `@nx/storybook`, and related devDeps
- Writes `frontend/libs/design-system/.storybook/main.ts`, `preview.ts`, `tsconfig.json`
- Adds `storybook` and `build-storybook` targets to `frontend/libs/design-system/project.json`
- May add a workspace-level `@nx/storybook` entry to `package.json`

### 6b. Confirm Storybook targets landed

```bash
npx nx show project design-system --json | grep -E '"storybook"|"build-storybook"'
```

Both targets present.

### 6c. Make the preview load DS tokens

Storybook stories render in an iframe with no application-level `styles.scss` — tokens must be loaded explicitly.

Edit `frontend/libs/design-system/.storybook/preview.ts` and add (preserving whatever the generator wrote for `parameters`):

```ts
import '../src/styles/index.scss';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
```

If the generator already wrote `preview.ts` with parameters, only add the `import '../src/styles/index.scss';` line at the top.

### 6d. Verify Storybook builds

```bash
npx nx build-storybook design-system
```

Output at `frontend/libs/design-system/storybook-static/`. Must succeed with no stories yet — we just want the pipeline validated before writing content.

---

## Step 7 — Write stories for every primitive

One story file per primitive, co-located with the component. Use CSF3 (Component Story Format 3).

### 7a. `button.stories.ts`

Create `frontend/libs/design-system/src/lib/button/button.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { DsButton } from './button';

const meta: Meta<DsButton> = {
  title: 'Primitives/DsButton',
  component: DsButton,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'primary', disabled: false },
};
export default meta;

type Story = StoryObj<DsButton>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Disabled: Story = { args: { variant: 'primary', disabled: true } };
```

### 7b. `top-nav.stories.ts`

Create `frontend/libs/design-system/src/lib/top-nav/top-nav.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { DsTopNav } from './top-nav';

const meta: Meta<DsTopNav> = {
  title: 'Primitives/DsTopNav',
  component: DsTopNav,
  decorators: [
    applicationConfig({ providers: [provideRouter([])] }),
    moduleMetadata({ imports: [DsTopNav] }),
  ],
};
export default meta;

type Story = StoryObj<DsTopNav>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', path: '/home' },
      { label: 'Live', path: '/live' },
      { label: 'Competitions', path: '/competition' },
      { label: 'Teams', path: '/team' },
      { label: 'Profile', path: '/profile' },
    ],
  },
};
```

### 7c. `card.stories.ts`

Create `frontend/libs/design-system/src/lib/card/card.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { DsCard } from './card';

const meta: Meta<DsCard> = {
  title: 'Primitives/DsCard',
  component: DsCard,
  argTypes: {
    variant: { control: 'select', options: ['raised', 'flat'] },
  },
  args: { variant: 'raised' },
  render: (args) => ({
    props: args,
    template: `
      <ds-card [variant]="variant" aria-label="Example card">
        <strong ds-card-header>Match · UCL Group D</strong>
        <div>Real Madrid vs Manchester City — placeholder body content.</div>
        <span ds-card-footer>Kick-off in 20'</span>
      </ds-card>
    `,
  }),
};
export default meta;

type Story = StoryObj<DsCard>;

export const Raised: Story = { args: { variant: 'raised' } };
export const Flat: Story = { args: { variant: 'flat' } };
```

### 7d. `list.stories.ts`

Create `frontend/libs/design-system/src/lib/list/list.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { DsList } from './list';
import { DsListItem } from './list-item';

const meta: Meta<DsList> = {
  title: 'Primitives/DsList',
  component: DsList,
  decorators: [moduleMetadata({ imports: [DsList, DsListItem] })],
  render: () => ({
    template: `
      <ds-list>
        <ds-list-item>Premier League</ds-list-item>
        <ds-list-item>La Liga</ds-list-item>
        <ds-list-item>UEFA Champions League</ds-list-item>
        <ds-list-item>International</ds-list-item>
      </ds-list>
    `,
  }),
};
export default meta;

type Story = StoryObj<DsList>;

export const Default: Story = {};
```

### 7e. `badge.stories.ts`

Create `frontend/libs/design-system/src/lib/badge/badge.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { DsBadge } from './badge';

const meta: Meta<DsBadge> = {
  title: 'Primitives/DsBadge',
  component: DsBadge,
  argTypes: {
    variant: { control: 'select', options: ['neutral', 'live', 'success', 'warning'] },
  },
  args: { variant: 'neutral' },
  render: (args) => ({
    props: args,
    template: `<ds-badge [variant]="variant">{{ variant }}</ds-badge>`,
  }),
};
export default meta;

type Story = StoryObj<DsBadge>;

export const Neutral: Story = { args: { variant: 'neutral' } };
export const Live: Story = { args: { variant: 'live' } };
export const Success: Story = { args: { variant: 'success' } };
export const Warning: Story = { args: { variant: 'warning' } };
```

### 7f. Run Storybook

```bash
npx nx storybook design-system
```

Open the URL Storybook prints (usually `http://localhost:4400/`). All 5 primitives visible under "Primitives" section, tokens visibly applied (buttons are blue, list has borders, badges pill-shaped, etc.).

### 7g. Production build

```bash
npx nx build-storybook design-system
```

Must succeed. Output at `frontend/libs/design-system/storybook-static/`.

---

## Step 8 — Add dev:storybook npm script

Edit `package.json` and extend the `scripts` block (which already has `dev`, `dev:remotes`, `dev:shell` from the Phase 2 + dev-env work):

```json
"scripts": {
  "dev": "nx run-many -t serve -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile --parallel=6",
  "dev:remotes": "nx run-many -t serve -p mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile --parallel=5",
  "dev:shell": "nx serve shell",
  "dev:storybook": "nx storybook design-system"
}
```

---

## Step 9 — End-to-end verification

### 9a. Lint + test + build everything

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types
```

All 8 projects × 3 targets green. If a remote fails because it can't find a token, the tokens import path in its `styles.scss` is wrong — fix it (don't duplicate tokens into the remote).

### 9b. Build Storybook

```bash
npx nx build-storybook design-system
```

Must succeed. Spot-check `frontend/libs/design-system/storybook-static/index.html` exists.

### 9c. Graph check

```bash
npx nx graph --file=graph.json
```

Inspect:
- **No new edges** compared to Phase 2. `design-system` still depends only on `@angular/*`. Storybook is a tool, not a runtime dep.
- `shell → design-system` still exists (DsTopNav). No new static edges between shell and remotes.

Delete `graph.json` after inspecting.

### 9d. Visual smoke

```bash
npm run dev:storybook
```

Open Storybook (default http://localhost:4400/):
- `Primitives/DsButton` — 4 stories (primary, secondary, ghost, disabled), hover primary → darkens.
- `Primitives/DsTopNav` — renders 5 router links.
- `Primitives/DsCard` — both raised and flat variants render with header/body/footer slots populated.
- `Primitives/DsList` — bordered rounded list with 4 items, last item has no bottom border.
- `Primitives/DsBadge` — 4 variant stories, live = red, neutral = gray, success = green, warning = amber.

Ctrl+C.

```bash
npm run dev
```

Open http://localhost:4200 — the shell top-nav should **look identical** to before (tokens refactor must not regress visuals). Navigate between remotes. Each landing page should render with the `font-family` token applied.

---

## Step 10 — Acceptance checklist

- [ ] `frontend/libs/design-system/src/styles/_tokens.scss` exists and declares `--ds-color-*`, `--ds-space-*`, `--ds-radius-*`, `--ds-font-*`, `--ds-shadow-*`, `--ds-duration-*`
- [ ] `frontend/libs/design-system/src/styles/index.scss` re-forwards `tokens`
- [ ] All 6 apps' `src/styles.scss` import `libs/design-system/src/styles` via relative path and set html/body base styles using tokens
- [ ] `DsButton` and `DsTopNav` SCSS contain no hardcoded hex values — only `var(--ds-…)` references
- [ ] `DsCard` (standalone, OnPush) exists with `variant` input (`raised` | `flat`) and 3 projection slots
- [ ] `DsList` + `DsListItem` (standalone, OnPush) exist and render a bordered `<ul role="list">` with `<li>` items
- [ ] `DsBadge` (standalone, OnPush) exists with `variant` input (`neutral` | `live` | `success` | `warning`)
- [ ] `frontend/libs/design-system/src/index.ts` re-exports all 5 primitives
- [ ] `frontend/libs/design-system/.storybook/main.ts` + `preview.ts` + `tsconfig.json` exist
- [ ] `preview.ts` imports `../src/styles/index.scss` so stories see tokens
- [ ] Stories exist for all 5 primitives: button, top-nav, card, list, badge
- [ ] `frontend/libs/design-system/project.json` has `storybook` and `build-storybook` targets
- [ ] `package.json` has a `dev:storybook` npm script
- [ ] `npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types` all green
- [ ] `npx nx build-storybook design-system` green
- [ ] `npm run dev` — shell still looks correct (no visual regression from tokens refactor)
- [ ] `CLAUDE.md` unchanged
- [ ] No new edges in `nx graph`; no new cross-remote or shell→remote static edges

---

## Step 11 — Commit Phase 3

From `c:\Users\edy_0\projects\Nx`:

```bash
git status
# Sanity-check: no node_modules, no dist, no storybook-static, no .nx/cache
git add .
git commit -m "Phase 3: DS tokens + DsCard/DsList/DsBadge + Storybook"
```

Do NOT push — wait for human review.

---

## Explicitly out of scope for Phase 3

Do not create in Phase 3:

- `sports-data`, `auth`, `profile`, `shared-ui`, `shared-utils` libs
- Any feature work inside the 5 remotes (landings stay placeholders)
- Further DS primitives beyond the three added here — no `DsInput`, `DsModal`, `DsTabs`, `DsIcon`, `DsSpinner`, `DsAvatar`
- Dark-mode / theming (single theme only — tokens structure leaves room for this later)
- `@storybook/addon-a11y` or `@storybook/test-runner` — add when there's enough surface to audit
- Visual regression (Chromatic / Loki / Playwright screenshots)
- Backend services, API clients, HTTP plumbing
- CircleCI / CloudFront / S3 / deployment
- Changing any app's component code (apps get touched **only** at `src/styles.scss`)

If tempted to add any of the above — don't.

---

## Guardrails for the executing model

- **Tokens first, primitives second, Storybook third, stories last.** Each phase gates the next. Don't scaffold Storybook before primitives compile; don't write stories before `preview.ts` loads tokens.
- **Refactor existing primitives (DsButton, DsTopNav) in Step 2 before adding new ones.** If the refactor breaks tests, the tokens aren't right — fix them before scaffolding more components on top.
- **One primitive at a time, fully, before the next.** Same discipline as Phase 2's remote fan-out.
- **Never hardcode hex, rem, or ms values in primitive SCSS.** If a value isn't in tokens, add it to tokens first, then reference it. No magic numbers.
- **Keep `design-system` zero-dep beyond Angular + `@platform/shared-types`.** Adding `rxjs`, HTTP clients, icon packs, or anything else is a Phase-4+ decision.
- **Never break the existing public API.** `DsButton`'s `variant`/`disabled` inputs and `DsTopNav`'s `items` input stay identical — only internals change in Step 2.
- **Storybook is a dev tool.** Don't add it to app bundles. Don't add story files to apps — stories live in the DS lib only.
- **Never add `imports` for `CommonModule`.** Everything is standalone; use native `@if`/`@for` control flow.
- **Never relax ESLint tag boundaries.** DS remains `scope:design-system`, `type:ui`.
- If any step fails, stop and report. Do not ship a broken intermediate state.
- Do not modify `CLAUDE.md`.

---

## Troubleshooting notes

- **`Can't find stylesheet to import` when building an app**: the relative path in `src/styles.scss` is wrong. From `frontend/apps/<APP>/src/`, the DS styles are at `../../../libs/design-system/src/styles`. Verify with `ls frontend/libs/design-system/src/styles/index.scss`.
- **`var(--ds-color-primary)` renders as the literal string in Storybook**: `preview.ts` isn't importing `../src/styles/index.scss`. Add the import.
- **`@storybook/angular` generator fails with peer-dep conflicts**: don't pass `--force` or `--legacy-peer-deps`. Identify the conflict first — likely an Angular major-version mismatch; stop and report.
- **`nx storybook design-system` port 4400 is in use**: another Storybook is running from a prior attempt. `netstat -ano | findstr :4400` to find the PID; kill it. Don't change the port.
- **DsCard `:empty` selector doesn't hide empty header/footer**: whitespace inside `<ng-content>` counts as content in some browsers. If this regresses, switch to an `@if` guard driven by a `@ContentChild` query — but only if visually broken, not speculatively.
- **Storybook story for `DsTopNav` throws `No provider for Router`**: the `applicationConfig({ providers: [provideRouter([])] })` decorator is missing from the story's `decorators` array.
- **Nx generator `@nx/angular:storybook-configuration` is not found**: `npm install` hasn't been re-run after Nx pulled in Storybook devDeps. Re-install.
- **Mismatched Storybook versions**: Don't hand-pin. Let Nx's generator choose a compatible set. If versions drift later, use `npx nx migrate` — don't edit `package.json` by hand.

---

## Risk, ownership, and rollout notes

- **Risk**: low — no runtime code path changes in the 6 apps other than their `styles.scss` adding a token import. Federation plumbing, routes, and remote boundaries are untouched.
- **Blast radius if tokens break**: visuals regress across all 6 apps. Caught instantly by opening the shell after Step 1. No data or auth implications.
- **Ownership**: design-system. Shell and remotes consume, they don't author tokens.
- **Rollout**: merge as one unit. Attempting to ship tokens without the `styles.scss` imports in remotes = unstyled remotes. Attempting to ship Storybook without stories = empty Storybook. The plan is one coherent release.
