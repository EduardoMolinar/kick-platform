import { InjectionToken } from '@angular/core';
import type { Fixture, MatchSummary, Standing } from '@platform/shared-types';
import type { Observable } from 'rxjs';

export interface SportsDataService {
  getLiveMatches(): Observable<readonly MatchSummary[]>;
  getMatch(id: string): Observable<MatchSummary | undefined>;

  /** Upcoming fixtures for a competition, ordered by kickoffAt ascending. Empty array if unknown. */
  getFixtures(competitionId: string): Observable<readonly Fixture[]>;

  /** Current standings snapshot for a competition. Undefined if the competition does not have standings (e.g. INT). */
  getStandings(competitionId: string): Observable<Standing | undefined>;
}

export const SPORTS_DATA_SERVICE = new InjectionToken<SportsDataService>(
  'SPORTS_DATA_SERVICE'
);
