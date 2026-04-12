import type { MatchSummary } from '@kick/shared-types';

/**
 * Groups an array of matches by their local kick-off date string (YYYY-MM-DD).
 * Results are sorted chronologically within each group.
 *
 * @param matches - flat array of MatchSummary
 * @param locale  - BCP 47 locale for date formatting (defaults to 'en-GB')
 * @returns Map from ISO date string → array of matches for that date
 */
export function groupByDate(
  matches: MatchSummary[],
  locale = 'en-GB',
): Map<string, MatchSummary[]> {
  const groups = new Map<string, MatchSummary[]>();

  const sorted = [...matches].sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  );

  for (const match of sorted) {
    const dateKey = toLocalDateKey(match.kickoff, locale);
    const existing = groups.get(dateKey) ?? [];
    existing.push(match);
    groups.set(dateKey, existing);
  }

  return groups;
}

/**
 * Converts an ISO 8601 datetime string to a "YYYY-MM-DD" key in local time.
 */
export function toLocalDateKey(iso: string, locale = 'en-GB'): string {
  const date = new Date(iso);
  // Use Intl to get local YYYY-MM-DD without timezone shifting manually
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map['year']}-${map['month']}-${map['day']}`;
}

/**
 * Formats a date key for display.
 * e.g. "2025-04-11" → "Today", "Tomorrow", or "Fri 11 Apr"
 */
export function formatDateLabel(dateKey: string, locale = 'en-GB'): string {
  const target = new Date(`${dateKey}T00:00:00`);
  const today  = startOfToday();
  const diff   = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';

  return new Intl.DateTimeFormat(locale, {
    weekday: 'short', day: 'numeric', month: 'short',
  }).format(target);
}

/** Formats a kick-off ISO string as a local time (e.g. "20:45"). */
export function formatKickoffTime(iso: string, locale = 'en-GB'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso));
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
