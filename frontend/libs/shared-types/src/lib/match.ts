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

export interface MatchSummary {
  readonly id: string;
  readonly competition: Competition;
  readonly status: MatchStatus;
  readonly home: TeamSide;
  readonly away: TeamSide;
  readonly kickoffAt: string;
  readonly minute?: number;
}
