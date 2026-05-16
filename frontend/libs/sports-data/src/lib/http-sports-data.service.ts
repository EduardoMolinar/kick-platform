import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import type {
  Fixture,
  MatchSummary,
  Standing,
  Team,
  TeamCompetitionStanding,
} from '@platform/shared-types';
import { Observable, catchError, of } from 'rxjs';
import type { SportsDataService } from './sports-data.service';

/**
 * Base URL for the sports-proxy backend (e.g. an API Gateway HTTP endpoint).
 *
 * Bound in the shell's app.config.ts from `environment.sportsApiBaseUrl`. When
 * unset (empty string / not provided), remotes' `useFactory` falls back to
 * `MockSportsDataService` so local dev and tests never hit the network.
 */
export const SPORTS_DATA_API_BASE_URL = new InjectionToken<string>('SPORTS_DATA_API_BASE_URL');

/**
 * HTTP implementation of SportsDataService that calls the sports-proxy backend.
 *
 * Every method follows the same pattern: GET → typed response → on error
 * return the "empty" value (undefined / empty array). The UI is therefore
 * resilient to backend outages and rate-limit responses; users see empty
 * sections instead of an error.
 */
@Injectable({ providedIn: 'root' })
export class HttpSportsDataService implements SportsDataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(SPORTS_DATA_API_BASE_URL);

  getLiveMatches(): Observable<readonly MatchSummary[]> {
    return this.http
      .get<readonly MatchSummary[]>(`${this.baseUrl}/v1/live`)
      .pipe(catchError(() => of<readonly MatchSummary[]>([])));
  }

  getMatch(id: string): Observable<MatchSummary | undefined> {
    return this.http
      .get<MatchSummary>(`${this.baseUrl}/v1/matches/${encodeURIComponent(id)}`)
      .pipe(catchError(() => of<MatchSummary | undefined>(undefined)));
  }

  getFixtures(competitionId: string): Observable<readonly Fixture[]> {
    return this.http
      .get<readonly Fixture[]>(
        `${this.baseUrl}/v1/competitions/${encodeURIComponent(competitionId)}/fixtures`
      )
      .pipe(catchError(() => of<readonly Fixture[]>([])));
  }

  getStandings(competitionId: string): Observable<Standing | undefined> {
    return this.http
      .get<Standing>(
        `${this.baseUrl}/v1/competitions/${encodeURIComponent(competitionId)}/standings`
      )
      .pipe(catchError(() => of<Standing | undefined>(undefined)));
  }

  getTeamFixtures(teamId: string): Observable<readonly Fixture[]> {
    return this.http
      .get<readonly Fixture[]>(
        `${this.baseUrl}/v1/teams/${encodeURIComponent(teamId)}/fixtures`
      )
      .pipe(catchError(() => of<readonly Fixture[]>([])));
  }

  getTeamStandings(teamId: string): Observable<readonly TeamCompetitionStanding[]> {
    return this.http
      .get<readonly TeamCompetitionStanding[]>(
        `${this.baseUrl}/v1/teams/${encodeURIComponent(teamId)}/standings`
      )
      .pipe(catchError(() => of<readonly TeamCompetitionStanding[]>([])));
  }

  getTeam(teamId: string): Observable<Team | undefined> {
    return this.http
      .get<Team>(`${this.baseUrl}/v1/teams/${encodeURIComponent(teamId)}`)
      .pipe(catchError(() => of<Team | undefined>(undefined)));
  }
}
