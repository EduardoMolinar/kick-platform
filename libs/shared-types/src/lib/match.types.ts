/**
 * Match domain types.
 *
 * These are the frontend-facing contracts for match data.
 * Backend normalises provider responses into these shapes before sending.
 * Frontend never depends on provider-specific fields.
 */

import type { TeamRef, CompetitionRef } from './common.types';

export type MatchStatus =
  | 'scheduled'   // not yet started
  | 'live'        // in progress (includes half-time)
  | 'half-time'   // at half-time pause
  | 'finished'    // full time
  | 'postponed'   // postponed before kick-off
  | 'cancelled';  // cancelled

/** Minimal match representation used in lists and cards. */
export interface MatchSummary {
  id: string;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  competition: CompetitionRef;
  status: MatchStatus;
  /** Current match minute (only present when status is 'live'). */
  minute?: number;
  score: {
    home: number | null;
    away: number | null;
  };
  /** ISO 8601 kick-off time. */
  kickoff: string;
  /** Optional matchday number for competition context. */
  matchday?: number;
}

/** Full match detail including events and statistics. */
export interface MatchDetail extends MatchSummary {
  events: MatchEvent[];
  stats: MatchStats;
  /** Present after the team sheets are released, typically 1h before kick-off. */
  lineups?: Lineups;
}

export interface MatchEvent {
  id: string;
  minute: number;
  extraMinute?: number;
  type: MatchEventType;
  team: 'home' | 'away';
  playerName: string;
  assistName?: string;     // for goals
  replacedBy?: string;     // for substitutions
}

export type MatchEventType =
  | 'goal'
  | 'own-goal'
  | 'penalty'
  | 'yellow-card'
  | 'red-card'
  | 'second-yellow'
  | 'substitution';

export interface MatchStats {
  possession:       StatItem;
  shots:            StatItem;
  shotsOnTarget:    StatItem;
  corners:          StatItem;
  fouls:            StatItem;
  yellowCards:      StatItem;
  redCards:         StatItem;
  passes:           StatItem;
  passAccuracy:     StatItem;  // percentage
  offsides:         StatItem;
  saves:            StatItem;
}

/** A single stat — home and away values. */
export interface StatItem {
  home: number;
  away: number;
}

export interface Lineups {
  home: TeamLineup;
  away: TeamLineup;
}

export interface TeamLineup {
  formation: string;      // e.g. "4-3-3"
  startingXI: Player[];
  substitutes: Player[];
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
}
