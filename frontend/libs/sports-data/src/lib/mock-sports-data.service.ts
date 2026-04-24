import { Injectable } from '@angular/core';
import type { Fixture, MatchSummary, Standing } from '@platform/shared-types';
import { Observable, of } from 'rxjs';
import { FIXTURES_BY_COMPETITION } from './fixtures/fixtures.fixture';
import { LIVE_MATCHES_FIXTURE } from './fixtures/live-matches.fixture';
import { STANDINGS_BY_COMPETITION } from './fixtures/standings.fixture';
import type { SportsDataService } from './sports-data.service';

@Injectable({ providedIn: 'root' })
export class MockSportsDataService implements SportsDataService {
  getLiveMatches(): Observable<readonly MatchSummary[]> {
    return of(LIVE_MATCHES_FIXTURE);
  }

  getMatch(id: string): Observable<MatchSummary | undefined> {
    return of(LIVE_MATCHES_FIXTURE.find((m) => m.id === id));
  }

  getFixtures(competitionId: string): Observable<readonly Fixture[]> {
    return of(FIXTURES_BY_COMPETITION[competitionId] ?? []);
  }

  getStandings(competitionId: string): Observable<Standing | undefined> {
    return of(STANDINGS_BY_COMPETITION[competitionId]);
  }
}
