/**
 * Icon registry — maps IconName to the inner SVG content (paths, polygons, etc.).
 *
 * All icons are drawn on a 24×24 viewBox using stroke-based Feather icon style:
 *   fill="none", stroke="currentColor", stroke-width="2",
 *   stroke-linecap="round", stroke-linejoin="round"
 *
 * The SVG attributes above are set on the <svg> element in the component template.
 * Only the inner child elements (path, polyline, polygon, circle, line) live here.
 *
 * SECURITY: These strings are from our own codebase, not user input.
 * DomSanitizer.bypassSecurityTrustHtml is used in the component — this is safe
 * because the values never originate from external or user-provided data.
 */

export type IconName =
  // Navigation
  | 'home'
  | 'live'
  | 'trophy'
  | 'users'
  | 'user'
  // Actions
  | 'search'
  | 'bell'
  | 'settings'
  // Directional
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  // Status / misc
  | 'x'
  | 'check'
  | 'star'
  | 'clock'
  | 'external-link';

export const ICONS: Record<IconName, string> = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  home:
    '<path d="M3 12L12 3l9 9"/>' +
    '<path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/>',

  live:
    '<polygon points="5 3 19 12 5 21 5 3"/>',

  trophy:
    '<path d="M8 21h8M12 17v4"/>' +
    '<path d="M17 3H7L6 8c0 3.31 2.69 6 6 6s6-2.69 6-6l-1-5z"/>' +
    '<path d="M6 8H3l1 4a4 4 0 003.86 3M18 8h3l-1 4a4 4 0 01-3.86 3"/>',

  users:
    '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>' +
    '<circle cx="9" cy="7" r="4"/>' +
    '<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',

  user:
    '<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>' +
    '<circle cx="12" cy="7" r="4"/>',

  // ── Actions ─────────────────────────────────────────────────────────────────
  search:
    '<circle cx="11" cy="11" r="8"/>' +
    '<line x1="21" y1="21" x2="16.65" y2="16.65"/>',

  bell:
    '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
    '<path d="M13.73 21a2 2 0 01-3.46 0"/>',

  settings:
    '<circle cx="12" cy="12" r="3"/>' +
    '<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>',

  // ── Directional ─────────────────────────────────────────────────────────────
  'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  'chevron-left':  '<polyline points="15 18 9 12 15 6"/>',
  'chevron-down':  '<polyline points="6 9 12 15 18 9"/>',
  'chevron-up':    '<polyline points="18 15 12 9 6 15"/>',

  // ── Status / misc ───────────────────────────────────────────────────────────
  x:
    '<line x1="18" y1="6" x2="6" y2="18"/>' +
    '<line x1="6" y1="6" x2="18" y2="18"/>',

  check:
    '<polyline points="20 6 9 17 4 12"/>',

  star:
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',

  clock:
    '<circle cx="12" cy="12" r="10"/>' +
    '<polyline points="12 6 12 12 16 14"/>',

  'external-link':
    '<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>' +
    '<polyline points="15 3 21 3 21 9"/>' +
    '<line x1="10" y1="14" x2="21" y2="3"/>',
};
