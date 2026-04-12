/**
 * Design tokens as TypeScript constants.
 *
 * Use these only when CSS custom properties cannot be consumed — for example
 * in Canvas contexts, programmatic animations, or third-party charting libs.
 * Prefer CSS custom properties (var(--ds-*)) everywhere else.
 */

// ── Colors ───────────────────────────────────────────────────────────────────

export const DS_COLOR = {
  // Background
  BG_BASE:          '#0d0f14',
  BG_SURFACE:       '#161920',
  BG_ELEVATED:      '#1e2230',
  BG_OVERLAY:       '#252a3a',

  // Border
  BORDER:           '#2a2f42',
  BORDER_SUBTLE:    '#1c1f2e',

  // Brand
  BRAND:            '#00e676',
  BRAND_DIM:        '#00c962',

  // Accent
  ACCENT_BLUE:      '#3d8ef8',
  ACCENT_AMBER:     '#f5a623',
  ACCENT_RED:       '#f25555',

  // Text
  TEXT_PRIMARY:     '#f0f2f7',
  TEXT_SECONDARY:   '#8b93a8',
  TEXT_MUTED:       '#525870',
  TEXT_INVERSE:     '#0d0f14',

  // Semantic
  LIVE:             '#f25555',
  WIN:              '#00e676',
  LOSS:             '#f25555',
  DRAW:             '#8b93a8',
} as const;

// ── Spacing ───────────────────────────────────────────────────────────────────

export const DS_SPACE = {
  S1:  4,
  S2:  8,
  S3:  12,
  S4:  16,
  S5:  20,
  S6:  24,
  S8:  32,
  S10: 40,
  S12: 48,
  S16: 64,
} as const;

// ── Typography ────────────────────────────────────────────────────────────────

export const DS_FONT_SIZE = {
  XS:   11,
  SM:   13,
  BASE: 15,
  MD:   17,
  LG:   20,
  XL:   24,
  '2XL': 30,
  '3XL': 38,
} as const;

// ── Duration ──────────────────────────────────────────────────────────────────

export const DS_DURATION = {
  INSTANT: 0,
  FAST:    120,
  BASE:    200,
  SLOW:    350,
} as const;
