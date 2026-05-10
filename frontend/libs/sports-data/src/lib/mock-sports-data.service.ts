import { Injectable } from '@angular/core';
import type {
  Fixture,
  MatchSummary,
  Standing,
  Team,
  TeamCompetitionStanding,
} from '@platform/shared-types';
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

  getTeamFixtures(teamId: string): Observable<readonly Fixture[]> {
    const all = Object.values(FIXTURES_BY_COMPETITION).flat();
    return of(
      all
        .filter((f) => f.home.id === teamId || f.away.id === teamId)
        .slice()
        .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt))
    );
  }

  getTeamStandings(teamId: string): Observable<readonly TeamCompetitionStanding[]> {
    const results: TeamCompetitionStanding[] = [];
    for (const standing of Object.values(STANDINGS_BY_COMPETITION)) {
      const row = standing.rows.find((r) => r.team.id === teamId);
      if (row) results.push({ competition: standing.competition, row });
    }
    return of(results);
  }

  getTeam(teamId: string): Observable<Team | undefined> {
    // Resolve from any team appearing in fixtures or standings or live matches.
    // First standings (richest source — includes shortName).
    for (const standing of Object.values(STANDINGS_BY_COMPETITION)) {
      const row = standing.rows.find((r) => r.team.id === teamId);
      if (row) return of(row.team);
    }
    // Then fixtures (Fixture.home / Fixture.away are Team objects).
    for (const fixtures of Object.values(FIXTURES_BY_COMPETITION)) {
      const f = fixtures.find((x) => x.home.id === teamId || x.away.id === teamId);
      if (f) return of(f.home.id === teamId ? f.home : f.away);
    }
    // Then live matches (MatchSummary.home.team / .away.team).
    const m = LIVE_MATCHES_FIXTURE.find(
      (x) => x.home.team.id === teamId || x.away.team.id === teamId
    );
    if (m) return of(m.home.team.id === teamId ? m.home.team : m.away.team);
    return of(undefined);
  }
}
