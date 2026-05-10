import { InjectionToken } from '@angular/core';
import type {
  Fixture,
  MatchSummary,
  Standing,
  Team,
  TeamCompetitionStanding,
} from '@platform/shared-types';
import type { Observable } from 'rxjs';

export interface SportsDataService {
  getLiveMatches(): Observable<readonly MatchSummary[]>;
  getMatch(id: string): Observable<MatchSummary | undefined>;

  /** Upcoming fixtures for a competition, ordered by kickoffAt ascending. Empty array if unknown. */
  getFixtures(competitionId: string): Observable<readonly Fixture[]>;

  /** Current standings snapshot for a competition. Undefined if the competition does not have standings (e.g. INT). */
  getStandings(competitionId: string): Observable<Standing | undefined>;

  /** Upcoming fixtures for a team across all competitions, sorted by kickoffAt ascending. Empty array if unknown teamId. */
  getTeamFixtures(teamId: string): Observable<readonly Fixture[]>;

  /** The team's current standing row in each competition it appears in. Empty array if unknown teamId or no standings. */
  getTeamStandings(teamId: string): Observable<readonly TeamCompetitionStanding[]>;

  /** Resolve a team's identity by id. Undefined if unknown. */
  getTeam(teamId: string): Observable<Team | undefined>;
}

export const SPORTS_DATA_SERVICE = new InjectionToken<SportsDataService>(
  'SPORTS_DATA_SERVICE'
);
