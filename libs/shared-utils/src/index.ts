// ── @kick/shared-utils — public API ──────────────────────────────────────────
// Pure functions with zero Angular imports. Safe to use in any layer.

export { formatMinute }                         from './lib/format-minute';
export { isLive, isFinished, isScheduled, isPlayable } from './lib/match-status';
export {
  groupByDate,
  toLocalDateKey,
  formatDateLabel,
  formatKickoffTime,
}                                               from './lib/date-utils';
