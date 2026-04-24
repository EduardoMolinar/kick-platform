import { Competition, Team } from './shared-types';

export interface StandingRow {
  readonly position: number;
  readonly team: Team;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
}

export interface Standing {
  readonly competition: Competition;
  readonly rows: readonly StandingRow[];
  /** When the standings snapshot was computed (ISO 8601). */
  readonly updatedAt: string;
}
