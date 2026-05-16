import { Competition, Team } from './shared-types';

export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed';

export interface Score {
  readonly home: number;
  readonly away: number;
}

export interface TeamSide {
  readonly team: Team;
  readonly score: number;
}

export type MatchEventType = 'goal' | 'yellow-card' | 'red-card' | 'substitution';
export type MatchSide = 'home' | 'away';

export interface MatchEvent {
  /** Minute of regular play (1..90). For added time, see `addedTime`. */
  readonly minute: number;
  /** Stoppage time minute on top of `minute` (e.g. 45+2 → minute: 45, addedTime: 2). */
  readonly addedTime?: number;
  readonly type: MatchEventType;
  readonly side: MatchSide;
  /** Player most associated with the event (goalscorer, booked player, player coming on). */
  readonly player: string;
  /** Assisting player, when applicable (typically goals). */
  readonly assist?: string;
  /** For substitutions: the player going off. `player` is the player coming on. */
  readonly playerOut?: string;
}

export interface MatchSummary {
  readonly id: string;
  readonly competition: Competition;
  readonly status: MatchStatus;
  readonly home: TeamSide;
  readonly away: TeamSide;
  readonly kickoffAt: string;
  readonly minute?: number;
  /** Match events (goals, cards, subs) in chronological order. Optional — summary
   * callers can ignore; the match detail view consumes them. */
  readonly events?: readonly MatchEvent[];
}
