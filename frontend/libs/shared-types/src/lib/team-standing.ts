import type { Competition } from './shared-types';
import type { StandingRow } from './standings';

export interface TeamCompetitionStanding {
  readonly competition: Competition;
  readonly row: StandingRow;
}
