import type { MatchStatus } from '@kick/shared-types';

/**
 * Formats a match minute for display.
 *
 * Rules:
 *   - live + minute     → "73′"
 *   - live, no minute   → "LIVE"
 *   - half-time         → "HT"
 *   - finished          → "FT"
 *   - scheduled         → "" (empty — caller shows kick-off time)
 *   - postponed         → "PPD"
 */
export function formatMinute(
  status: MatchStatus,
  minute?: number,
): string {
  switch (status) {
    case 'live':      return minute != null ? `${minute}′` : 'LIVE';
    case 'half-time': return 'HT';
    case 'finished':  return 'FT';
    case 'postponed': return 'PPD';
    case 'cancelled': return 'CAN';
    default:          return '';
  }
}
