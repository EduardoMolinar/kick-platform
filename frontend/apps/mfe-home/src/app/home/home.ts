import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUTH_SERVICE, type AuthSession } from '@platform/auth';
import { DsCard, DsList, DsListItem } from '@platform/design-system';
import { PROFILE_SERVICE } from '@platform/profile';
import type { Competition, Fixture, MatchSummary, Team } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import { combineLatest, filter, map, of, shareReplay, switchMap, type Observable } from 'rxjs';
import { FixtureTile } from './fixture-tile/fixture-tile';
import { LiveTile } from './live-tile/live-tile';

interface HomeVm {
  readonly user: AuthSession;
  readonly liveFromFavorites: readonly MatchSummary[];
  readonly upcomingFromFavorites: readonly Fixture[];
  readonly hasAnyFavorites: boolean;
}

@Component({
  selector: 'mfe-home-home',
  standalone: true,
  imports: [AsyncPipe, RouterLink, DsCard, DsList, DsListItem, LiveTile, FixtureTile],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly auth = inject(AUTH_SERVICE);
  private readonly profile = inject(PROFILE_SERVICE);
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);

  private readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected readonly vm$: Observable<HomeVm> = this.user$.pipe(
    switchMap((user) =>
      combineLatest([
        this.profile.getFavoriteTeams(user.userId),
        this.profile.getFavoriteCompetitions(user.userId),
      ]).pipe(
        switchMap(([teams, competitions]) =>
          combineLatest([
            this.liveFromFavorites$(teams, competitions),
            this.upcomingFromFavorites$(competitions),
          ]).pipe(
            map(([live, upcoming]) => ({
              user,
              liveFromFavorites: live,
              upcomingFromFavorites: upcoming,
              hasAnyFavorites: teams.length > 0 || competitions.length > 0,
            }))
          )
        )
      )
    )
  );

  private liveFromFavorites$(
    teams: readonly Team[],
    competitions: readonly Competition[]
  ): Observable<readonly MatchSummary[]> {
    const teamIds = new Set(teams.map((t) => t.id));
    const competitionIds = new Set(competitions.map((c) => c.id));
    return this.sportsData.getLiveMatches().pipe(
      map((matches) =>
        matches.filter(
          (m) =>
            teamIds.has(m.home.team.id) ||
            teamIds.has(m.away.team.id) ||
            competitionIds.has(m.competition.id)
        )
      )
    );
  }

  private upcomingFromFavorites$(
    competitions: readonly Competition[]
  ): Observable<readonly Fixture[]> {
    if (competitions.length === 0) return of([]);
    return combineLatest(competitions.map((c) => this.sportsData.getFixtures(c.id))).pipe(
      map((groups) =>
        groups
          .flat()
          .slice()
          .sort((a, b) => a.kickoffAt.localeCompare(b.kickoffAt))
          .slice(0, 3)
      )
    );
  }
}
