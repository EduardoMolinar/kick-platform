import { Competition, Team } from './shared-types';

export interface Fixture {
  readonly id: string;
  readonly competition: Competition;
  readonly home: Team;
  readonly away: Team;
  /** Kick-off time in ISO 8601. */
  readonly kickoffAt: string;
  /** Matchweek / round number within the competition, when applicable. */
  readonly matchday?: number;
}
