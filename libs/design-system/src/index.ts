/**
 * @kick/design-system — public API
 *
 * Import order:
 *  1. Token constants (TS)       — DS_COLOR, DS_SPACE, DS_FONT_SIZE, DS_DURATION
 *  2. Primitive components       — ButtonComponent, BadgeComponent, etc.
 *  3. Composite components       — CardComponent, etc.
 *
 * For styles import global.scss into your app or Storybook:
 *   import '@kick/design-system/src/styles/global.scss';
 */

// ── Tokens ────────────────────────────────────────────────────────────────────
export { DS_COLOR, DS_SPACE, DS_FONT_SIZE, DS_DURATION } from './tokens/tokens';

// ── Primitives ────────────────────────────────────────────────────────────────
export { ButtonComponent } from './lib/button/button.component';
export { BadgeComponent }  from './lib/badge/badge.component';
export type { BadgeVariant } from './lib/badge/badge.component';
export { PillComponent }   from './lib/pill/pill.component';
export { ToggleComponent } from './lib/toggle/toggle.component';
export { AvatarComponent } from './lib/avatar/avatar.component';
export type { AvatarSize } from './lib/avatar/avatar.component';
export { IconComponent }   from './lib/icon/icon.component';
export type { IconName, IconSize } from './lib/icon/icon.component';
export { SpinnerComponent } from './lib/spinner/spinner.component';
export type { SpinnerSize } from './lib/spinner/spinner.component';

// ── Composite ─────────────────────────────────────────────────────────────────
export { CardComponent }         from './lib/card/card.component';
export type { CardVariant, CardPadding } from './lib/card/card.component';
export { MatchScoreComponent }   from './lib/match-score/match-score.component';
export type { MatchStatus, MatchScoreSize } from './lib/match-score/match-score.component';
export { StatBarComponent }      from './lib/stat-bar/stat-bar.component';
export { StandingsRowComponent } from './lib/standings-row/standings-row.component';
export type { FormResult, StandingsZone } from './lib/standings-row/standings-row.component';
