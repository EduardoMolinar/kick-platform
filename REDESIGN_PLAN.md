# Redesign — Floodlight × Wire — Implementation Plan

## Context

The Phase 0–9 product is functional but visually neutral. We've now picked a design direction: **Floodlight × Wire** — Stadium Floodlight's bento layout structure with Live Wire's color palette (charcoal + electric lime + hot pink + cyan + gradient meshes) and Live Wire's typography (Bebas Neue display, Inter Tight body, JetBrains Mono for technical labels). Reference mockup: [design-mockups/04-floodlight-wire.html](design-mockups/04-floodlight-wire.html).

The redesign also adds **theme support**: dark (primary), light, and system (follows `prefers-color-scheme`). Dark is the boot default; light and system are user-selected and persisted.

This document maps the redesign across **five sequential phases (10–14)**. Each phase is independently shippable. Feature work that was deferred (HTTP adapter, match detail, etc.) resumes as Phase 15+ once the redesign is in.

---

## Phase map at a glance

| # | Phase | Scope | Risk | Approx files |
|---|-------|-------|------|--------------|
| 10 | **Token foundation + theme switcher** | DS color/type/space tokens, light+dark variants, `ThemeService`, `DsThemeToggle`, font loading, all existing primitives migrate to new tokens | Low (CSS-variable swap; primitives keep their APIs) | ~15 |
| 11 | **DS primitives upgrade + new primitives** | Redesign `DsButton`/`DsCard`/`DsBadge`/`DsList`/`DsTopNav` visuals; add `DsLiveDot`, `DsScore`, `DsCompPill`, `DsAvatar`, `DsRank`, `DsKbd`. Storybook stories for all | Low–Med (visual changes ripple to all consumers) | ~25 |
| 12 | **Shell + Home redesign** | New shell layout (sticky blur nav, theme toggle, user chip), redesign `mfe-home` with hero match + live grid + bento layout | Med (highest visibility; first impression page) | ~20 |
| 13 | **Live + Competition redesign** | Redesign `mfe-live` (hero match feature + match-card grid), redesign `mfe-competition` (list + detail with new fixture rows + standings table) | Med (data-density correctness matters) | ~25 |
| 14 | **Team + Profile redesign** | Redesign `mfe-team` (list + detail with bg-rank cards) and `mfe-profile` (richer dashboard, theme settings panel) | Low–Med (smaller surface, late in sequence) | ~20 |

After Phase 14: HTTP adapter, match detail, live polling, etc. resume as Phase 15+.

---

## Theme architecture

### Three modes

- **`dark`** — boot default, primary. Charcoal + lime palette per the mockup.
- **`light`** — user-selected. Same brand colors, surfaces inverted to warm-white.
- **`system`** — user-selected. Follows `window.matchMedia('(prefers-color-scheme: dark)')` and updates live as the OS preference changes.

### Where state lives

- **Shell** owns the side effects (localStorage read/write, matchMedia subscription, `data-theme` attribute on `<html>`). New `ThemeService` lives in `frontend/libs/design-system/src/lib/theme/` (DS already owns Angular components — natural home alongside the tokens it themes).
- **Design system** owns the tokens (CSS custom properties scoped under `[data-theme="dark"]` and `[data-theme="light"]` selectors), and exposes a presentational `DsThemeToggle` that takes `mode` input and emits `modeChange`. The toggle is dumb — it doesn't read or write storage.
- **Persistence**: localStorage key `pitch-theme`, value `'dark' | 'light' | 'system'`.
- **Boot**: if key absent, default to `'dark'`. If `'system'`, resolve via matchMedia and apply.

### Service interface

```ts
// frontend/libs/design-system/src/lib/theme/theme.service.ts
export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeService {
  /** The user's chosen mode (including 'system'). */
  readonly mode$: Observable<ThemeMode>;
  /** What's actually applied to the DOM right now. */
  readonly resolved$: Observable<ResolvedTheme>;
  setMode(mode: ThemeMode): void;
}

export const THEME_SERVICE = new InjectionToken<ThemeService>('THEME_SERVICE');
```

Same DI pattern as `AUTH_SERVICE` / `SPORTS_DATA_SERVICE` / `PROFILE_SERVICE`. Mockable for tests.

### How CSS consumes the theme

```scss
// frontend/libs/design-system/src/lib/tokens/theme.scss
:root, [data-theme="dark"] {
  --bg: #0E0E10;
  --surface-1: #18181C;
  --ink: #FFFFFF;
  --ink-muted: #8E8E93;
  /* ... */
}

[data-theme="light"] {
  --bg: #FAFAF8;
  --surface-1: #F4F4F2;
  --ink: #0E0E10;
  --ink-muted: #5A5A60;
  /* ... */
}
```

Brand colors (`--lime`, `--pink`, `--cyan`, `--orange`, `--violet`) are **constant across themes** to keep brand identity stable. The high-saturation feels "stadium scoreboard" on light too (intentional — hi-vis sport).

For places where contrast fails on light (e.g. lime as text on white), we use a `--brand-strong` semantic token that maps to `--lime` in dark and `--lime-dim` (#94BF00) in light.

### Toggle UX

- Icon button in the top nav (right side, before user chip): sun (light), monitor (system), moon (dark) — current state shown.
- Click opens a small dropdown with three options.
- Phase 12 wires this into the shell. Phase 14 also surfaces the toggle in `/profile` settings.

### Flash-of-incorrect-theme prevention

The shell's `index.html` runs a tiny inline script in `<head>` (before any Angular bootstrap) that reads localStorage and sets `data-theme` on `<html>`. This means the very first paint already has the correct surface color — no light flash on a dark-mode user's first paint.

```html
<script>
  (function() {
    var k = 'pitch-theme';
    var stored = localStorage.getItem(k);
    var mode = stored || 'dark';
    var resolved = mode === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.setAttribute('data-theme', resolved);
  })();
</script>
```

The `ThemeService` synchronizes its in-memory state with whatever the inline script set, so there's no race.

---

## Phase 10 — Token foundation + theme switcher (detailed)

### Goal

Replace the current DS tokens with the Floodlight × Wire palette in both dark and light variants, load Bebas Neue / Inter Tight / JetBrains Mono, ship the theme service + toggle. After Phase 10, every existing component automatically picks up the new colors and typography because it reads CSS custom properties — no consumer code changes. Layouts stay as-is (those come in Phase 12+).

### Out of scope for Phase 10

- Component visual redesigns (Phase 11).
- New primitives (Phase 11).
- Page layout changes (Phase 12+).
- Self-hosting fonts (defer; load from Google Fonts CDN for now).
- Animation / motion specs beyond the existing live-dot pulse.

### Step 1 — DS tokens

Create [frontend/libs/design-system/src/lib/tokens/theme.scss](frontend/libs/design-system/src/lib/tokens/theme.scss) with the dark + light variable definitions. Keep brand colors constant. Add the type families (`--font-display`, `--font-body`, `--font-mono`).

Token surface (final list):

```
SURFACES                       DARK       LIGHT
--bg                           #0E0E10    #FAFAF8
--surface-1                    #18181C    #F4F4F2
--surface-2                    #222229    #ECECE8
--surface-3                    #2C2C36    #E2E2DD
--border                       #2A2A33    #DCDCD8
--border-strong                #3F3F4A    #C5C5C0

INK                            DARK       LIGHT
--ink                          #FFFFFF    #0E0E10
--ink-muted                    #8E8E93    #5A5A60
--ink-dim                      #5A5A60    #8E8E93

BRAND (constant)
--lime                         #C8FF00
--pink                         #FF1F8A
--cyan                         #00D1FF
--orange                       #FF6B35
--violet                       #B945FF

SEMANTIC INTENTS               DARK       LIGHT
--brand-strong (text-safe)     --lime     --lime-dim (#94BF00)
--live (pulse color)           --pink     --pink (same)
--success                      --lime     --lime-dim
--warn                         --orange   --orange
--info                         --cyan     #0099CC

TYPE
--font-display                 'Bebas Neue', Impact, sans-serif
--font-body                    'Inter Tight', system-ui, sans-serif
--font-mono                    'JetBrains Mono', ui-monospace, monospace

SPACE (unchanged)
--ds-space-1..8                4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

RADII
--ds-radius-sm                 8px
--ds-radius-md                 12px
--ds-radius-lg                 18px
--ds-radius-xl                 24px

ELEVATION
--ds-shadow-sm                 0 2px 8px rgba(0,0,0,0.18)
--ds-shadow-md                 0 8px 24px rgba(0,0,0,0.32)
--ds-shadow-lg                 0 24px 56px rgba(0,0,0,0.40)
```

The existing `--ds-color-*` token names (referenced by current primitives like `DsCard`/`DsButton`/etc.) are **preserved as aliases** that map to the new variables, so Phase 10 doesn't break consumers. Phase 11 will rename them at primitive-redesign time.

Aliases (new file, kept until Phase 11):

```scss
:root {
  --ds-color-bg: var(--bg);
  --ds-color-surface: var(--surface-1);
  --ds-color-surface-alt: var(--surface-2);
  --ds-color-text: var(--ink);
  --ds-color-text-muted: var(--ink-muted);
  --ds-color-border: var(--border);
  --ds-color-primary: var(--lime);
  --ds-color-primary-fg: var(--bg);
  /* ...whatever else is currently referenced */
}
```

### Step 2 — Font loading

Update [frontend/apps/shell/src/index.html](frontend/apps/shell/src/index.html) to add the Google Fonts `<link>` for Bebas Neue + Inter Tight + JetBrains Mono. Same approach the mockups use.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
```

Apply the body-font default in DS global styles so consumers get Inter Tight automatically. Display-font usage is opt-in per primitive.

### Step 3 — Theme service

Create [frontend/libs/design-system/src/lib/theme/theme.service.ts](frontend/libs/design-system/src/lib/theme/theme.service.ts):

```ts
import { Injectable, InjectionToken } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, fromEvent, map, startWith } from 'rxjs';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeService {
  readonly mode$: Observable<ThemeMode>;
  readonly resolved$: Observable<ResolvedTheme>;
  setMode(mode: ThemeMode): void;
}

export const THEME_SERVICE = new InjectionToken<ThemeService>('THEME_SERVICE');
const STORAGE_KEY = 'pitch-theme';

@Injectable({ providedIn: 'root' })
export class BrowserThemeService implements ThemeService {
  private readonly mode = new BehaviorSubject<ThemeMode>(this.readStoredMode());
  readonly mode$ = this.mode.asObservable();

  private readonly systemDark$ = fromEvent<MediaQueryListEvent>(
    matchMedia('(prefers-color-scheme: dark)'), 'change'
  ).pipe(
    map((e) => e.matches),
    startWith(matchMedia('(prefers-color-scheme: dark)').matches)
  );

  readonly resolved$: Observable<ResolvedTheme> = combineLatest([this.mode$, this.systemDark$]).pipe(
    map(([mode, sysDark]) =>
      mode === 'system' ? (sysDark ? 'dark' : 'light') : mode
    )
  );

  constructor() {
    this.resolved$.subscribe((theme) => {
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  setMode(mode: ThemeMode): void {
    localStorage.setItem(STORAGE_KEY, mode);
    this.mode.next(mode);
  }

  private readStoredMode(): ThemeMode {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' || v === 'light' || v === 'system' ? v : 'dark';
  }
}
```

Bind in [frontend/apps/shell/src/app/app.config.ts](frontend/apps/shell/src/app/app.config.ts):

```ts
{ provide: THEME_SERVICE, useExisting: BrowserThemeService },
```

### Step 4 — Inline boot script

Add the FOUC-prevention script to [frontend/apps/shell/src/index.html](frontend/apps/shell/src/index.html) `<head>` (before the Google Fonts link, before the federation manifest, before everything). This guarantees the first paint has the correct theme.

### Step 5 — `DsThemeToggle` primitive

New presentational component in [frontend/libs/design-system/src/lib/theme-toggle/](frontend/libs/design-system/src/lib/theme-toggle/):

- `@Input() mode: ThemeMode = 'dark'`
- `@Output() readonly modeChange = new EventEmitter<ThemeMode>()`
- Renders three icons (sun / monitor / moon) in a segmented control. Or an icon button that opens a small dropdown — both are acceptable; segmented is more discoverable.
- Standalone, OnPush.
- Uses inline SVG icons (no icon font dependency).
- DS tokens only.

Storybook story added with knobs for each mode.

### Step 6 — Wire toggle into shell top-nav

Update [frontend/apps/shell/src/app/app.ts](frontend/apps/shell/src/app/app.ts) to inject `THEME_SERVICE`. Update [frontend/apps/shell/src/app/app.html](frontend/apps/shell/src/app/app.html) to render `<ds-theme-toggle [mode]="(themeMode$ | async) ?? 'dark'" (modeChange)="onThemeChange($event)">`. Wire `onThemeChange` to call `theme.setMode(mode)`.

### Step 7 — Migrate existing primitives' SCSS to new tokens

Each primitive's SCSS file (`button.scss`, `card.scss`, `badge.scss`, `list.scss`, `top-nav.scss`) gets a sweep:
- No API changes
- Every `--ds-color-*` reference stays (they're aliased)
- Where a primitive used a hardcoded value (if any), replace with the new variable
- Verify each renders correctly in **both** dark and light

Verify in Storybook by toggling the storybook background (a manual test for now; Phase 11 will add a proper theme add-on).

### Step 8 — Verify no consumer regressions

```bash
npx nx run-many -t lint,test,build -p shell,mfe-home,mfe-live,mfe-competition,mfe-team,mfe-profile,design-system,shared-types,sports-data,profile,auth
```

All 11 projects × 3 targets must be green.

Dev smoke (`npm run dev`):
1. Land on `/` → page boots in dark theme without flashing light.
2. Click theme toggle in nav → switch to light. Surfaces, ink, and borders update across all pages instantly.
3. Switch to system. With OS in dark mode → dark. Toggle OS to light mode → page updates without reload.
4. Reload page. Last-chosen mode persists.
5. Open dev tools, clear localStorage, reload → defaults to dark.
6. Phase 4–9 features all still work; the look is updated but the layouts are unchanged.

### Acceptance checklist

- [ ] DS tokens defined for both `[data-theme="dark"]` and `[data-theme="light"]`
- [ ] Brand colors (lime/pink/cyan/orange/violet) are constant across themes
- [ ] Existing `--ds-color-*` tokens preserved as aliases (no consumer breakage)
- [ ] Bebas Neue, Inter Tight, JetBrains Mono loaded in shell `index.html`
- [ ] FOUC-prevention inline script in `<head>` before all other resources
- [ ] `ThemeService` interface + `BrowserThemeService` impl + `THEME_SERVICE` token in DS
- [ ] Shell `app.config.ts` binds `THEME_SERVICE`
- [ ] `DsThemeToggle` renders three modes with icons; standalone + OnPush
- [ ] Shell top-nav surfaces the toggle
- [ ] localStorage persistence works (key: `pitch-theme`)
- [ ] System mode reacts live to OS preference change (no reload)
- [ ] First-load default is `dark` when no stored preference
- [ ] All 11 projects pass lint + test + build
- [ ] No visual regressions on existing pages — only color/type updates
- [ ] No console errors / NG0201 / hydration warnings

---

## Phase 11 — DS primitives upgrade + new primitives (outline)

### Existing primitives to redesign visually (no API changes)

- **`DsCard`** — softer 18–24px radii, subtle border, optional `variant="raised"` adds gradient mesh background, `variant="flat"` keeps minimal. Add competition-keyed `[stripe]` input that adds a left-edge color bar.
- **`DsButton`** — three variants: `primary` (lime fill, dark ink), `secondary` (border only, lime hover), `ghost` (no border, lime hover). Bebas Neue typography.
- **`DsBadge`** — pill shape, competition-keyed colors, optional pulse animation for `variant="live"`.
- **`DsList` / `DsListItem`** — tighter rhythm, optional dividers, hover states.
- **`DsTopNav`** — backdrop blur, sticky, slot-based for nav items + actions.

### New primitives

- **`DsLiveDot`** — pulsing dot, 3 sizes, configurable color (defaults to `--live`).
- **`DsScore`** — Bebas Neue tabular score display, sizes `sm` / `md` / `lg` / `hero`. Has `[leading]` boolean to color-tint the larger score.
- **`DsCompPill`** — competition badge, takes `code` (`'PL'|'UCL'|'LIGA'|'INT'`), auto-keys color.
- **`DsAvatar`** — initials-based circular avatar, gradient backgrounds, sizes `sm`/`md`/`lg`.
- **`DsRank`** — large stylized rank number with optional `(suffix)` "st/nd/rd/th". Used in team cards. Can render as background-watermark or foreground.
- **`DsKbd`** — small keyboard hint badge (for power-user shortcuts later).

Storybook stories for all, exercising both themes.

### Acceptance

- All existing pages auto-pick-up the visual upgrade (no consumer code changes needed for visual lift, since primitives keep their selectors and inputs).
- Storybook shows both themes.
- All 11 projects still pass.

---

## Phase 12 — Shell + Home redesign (outline)

### Shell

- New top-nav structure: logo with gradient mark, blur backdrop, primary nav links (Bebas Neue uppercase), action cluster (theme toggle + user chip). Sticky.
- New global font baseline (Inter Tight body).
- Greeting strip moved out of shell into Home (where it belongs).

### `mfe-home`

Rebuild the page to match [design-mockups/04-floodlight-wire.html](design-mockups/04-floodlight-wire.html):

- Greeting hero (Bebas Neue 80px, lime accent, live count + date meta).
- Featured live match (full-width hero card with gradient mesh, 144px Bebas Neue score).
- Live now grid (4-up cards with competition stripes).
- Two-column section: Upcoming fixtures + Your teams.
- Team cards with bg-rank watermark.
- Mobile responsive at 768px.

New domain-local components in `mfe-home`: `HeroMatch`, replaces `LiveTile` and `FixtureTile` with redesigned versions.

---

## Phase 13 — Live + Competition redesign (outline)

### `mfe-live`

- Hero match feature card at top (the user's most-followed live match).
- Match grid below with the new `DsCompPill` color stripes.
- Filter bar (chip group) for competition selection.
- Match detail (stretch goal — could defer to Phase 15 if scope creeps).

### `mfe-competition`

- Competition list: grid of competition cards with hero imagery slot (placeholder for now, real assets later) and live-match-count badge.
- Competition detail: header band with competition color, fixtures list with new `FixtureRow` typography, standings table redesigned (Bebas Neue position numbers, alternating zebra in surface-2, the user's followed teams highlighted with lime left-border).
- Standings table sticky header on long lists.

---

## Phase 14 — Team + Profile redesign (outline)

### `mfe-team`

- Team list: cards with bg-rank watermark, the position number rendered at 220px in 6% lime opacity behind the team name (the signature Live Wire treatment).
- Team detail: hero with team identity (real team name resolved via the deferred `getTeam(teamId)` method, OR keep slug fallback if that's still pending). Fixtures list with the (H)/(A) treatment in the new typography. Standings cards redesigned with bg-rank.

### `mfe-profile`

- Profile becomes a richer dashboard: header with avatar + name + email + member-since, followed teams + competitions in two columns, a **theme settings panel** with the same `DsThemeToggle` (in-line, three radios with descriptions explaining each mode).
- Tile components redesigned with bg-rank watermark for "Your X" sections.

---

## Risk + rollout

### Per-phase risk

- **Phase 10 (low)**: pure token + service additions; CSS variable swap. Existing layouts unchanged. The rollback is a single CSS file revert. Worst case: consumer SCSS that referenced an aliased token name keeps working because the alias maps to the new variable.
- **Phase 11 (low–med)**: primitive visuals change. Old templates referencing `<ds-card variant="raised">` still work — the visual changes ripple automatically. Risk: if a consumer relied on a specific pixel value (e.g. card padding), it'll shift. Storybook visual review catches these.
- **Phase 12 (med)**: home page is the most-seen surface. Mistakes here are highly visible. Smoke testing across breakpoints required.
- **Phase 13 (med)**: data-density correctness — standings tables must remain readable at the new typography. Verify the table at 5, 10, 20 row counts.
- **Phase 14 (low–med)**: smaller surface area; the patterns are now established.

### In-between states

After Phase 10, the app looks "lifted" but layouts are old — that's fine, it's a coherent evolution. After Phase 11, components look modern. After 12 (home) but before 13, `/home` is new and `/live` is old-but-lifted. This intermediate state is acceptable for a product not yet in production. If at some point the product launches publicly and we're mid-redesign, the per-page rollout is still preferable to a big-bang merge.

### Branch strategy

- One git branch per phase (`phase-10-tokens-theme`, `phase-11-ds-primitives`, etc.).
- Each PR is independently reviewable.
- No long-running feature branch.

### Versioning

- The DS lib doesn't have a semantic version yet (all consumers use it via Nx workspace path aliases). A future Phase will add semver if/when DS is published externally.
- Consumer remotes are still independently deployable; the redesign rolls out per remote build.

---

## What this redesign defers

The previously-planned Phase 10 candidates (HTTP adapter, match detail on `mfe-live`, live polling, real auth, `libs/shared-ui`) are paused until Phase 14 ships. They become Phase 15+. None of them conflict with the redesign — they're orthogonal feature/architecture work that lands cleanly on top of the new design system.

---

## Acceptance for the whole redesign sequence

- [ ] Three themes work: dark default, light, system (live-reactive)
- [ ] Theme persistence across reload
- [ ] No FOUC on dark-mode users
- [ ] Bebas Neue / Inter Tight / JetBrains Mono load on every page
- [ ] All five remotes' pages match the design language of the mockup
- [ ] Storybook covers all DS primitives in both themes
- [ ] All 11 projects (or whatever count after Phase 14) pass lint + test + build
- [ ] No regressions in feature behavior across Phases 4–9
- [ ] Mobile responsive at 768px breakpoint across every page
- [ ] Browser console clean across the smoke flow
