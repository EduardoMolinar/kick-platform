import type { MatchStatus } from '@kick/shared-types';

export const isLive      = (s: MatchStatus) => s === 'live' || s === 'half-time';
export const isFinished  = (s: MatchStatus) => s === 'finished';
export const isScheduled = (s: MatchStatus) => s === 'scheduled';
export const isPlayable  = (s: MatchStatus) => s !== 'postponed' && s !== 'cancelled';
