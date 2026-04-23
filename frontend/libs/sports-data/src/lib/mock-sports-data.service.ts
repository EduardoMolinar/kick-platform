import { Injectable } from '@angular/core';
import type { MatchSummary } from '@platform/shared-types';
import { Observable, of } from 'rxjs';
import { LIVE_MATCHES_FIXTURE } from './fixtures/live-matches.fixture';
import type { SportsDataService } from './sports-data.service';

@Injectable({ providedIn: 'root' })
export class MockSportsDataService implements SportsDataService {
  getLiveMatches(): Observable<readonly MatchSummary[]> {
    return of(LIVE_MATCHES_FIXTURE);
  }

  getMatch(id: string): Observable<MatchSummary | undefined> {
    return of(LIVE_MATCHES_FIXTURE.find((m) => m.id === id));
  }
}
