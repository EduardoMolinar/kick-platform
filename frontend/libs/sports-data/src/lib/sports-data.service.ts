import { InjectionToken } from '@angular/core';
import type { MatchSummary } from '@platform/shared-types';
import type { Observable } from 'rxjs';

export interface SportsDataService {
  getLiveMatches(): Observable<readonly MatchSummary[]>;
  getMatch(id: string): Observable<MatchSummary | undefined>;
}

export const SPORTS_DATA_SERVICE = new InjectionToken<SportsDataService>(
  'SPORTS_DATA_SERVICE'
);
