import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AUTH_SERVICE, type AuthSession } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import type { MatchSummary } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import {
  combineLatest,
  filter,
  firstValueFrom,
  map,
  of,
  switchMap,
  type Observable,
} from 'rxjs';
import { MatchCard } from './match-card/match-card';

interface MatchWithFollowing {
  match: MatchSummary;
  homeFollowing: boolean;
  awayFollowing: boolean;
}

interface LiveNowVm {
  user: AuthSession;
  matches: readonly MatchWithFollowing[];
}

@Component({
  selector: 'mfe-live-live-now',
  standalone: true,
  imports: [AsyncPipe, MatchCard],
  templateUrl: './live-now.html',
  styleUrl: './live-now.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveNow {
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);
  private readonly auth = inject(AUTH_SERVICE);
  // Mock auth always emits a user; real auth will gate the follow buttons.
  private readonly profile: ProfileService = inject(PROFILE_SERVICE);

  private readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null)
  );

  protected readonly vm$: Observable<LiveNowVm> = combineLatest([
    this.user$,
    this.sportsData.getLiveMatches(),
  ]).pipe(
    switchMap(([user, matches]) => {
      if (matches.length === 0) {
        return of({ user, matches: [] });
      }
      const teamIds = [...new Set(matches.flatMap((m) => [m.home.team.id, m.away.team.id]))];
      return combineLatest(
        teamIds.map((id) => this.profile.isFollowingTeam$(user.userId, id))
      ).pipe(
        map((states) => {
          const followMap = new Map(teamIds.map((id, i) => [id, states[i]]));
          return {
            user,
            matches: matches.map((m) => ({
              match: m,
              homeFollowing: followMap.get(m.home.team.id) ?? false,
              awayFollowing: followMap.get(m.away.team.id) ?? false,
            })),
          };
        })
      );
    })
  );

  protected onFollowToggle(user: AuthSession, team: { id: string; name: string }, isFollowing: boolean): void {
    const action = isFollowing
      ? this.profile.unfollowTeam(user.userId, team.id)
      : this.profile.followTeam(user.userId, { id: team.id, name: team.name });
    const verb = isFollowing ? 'unfollow' : 'follow';
    void firstValueFrom(action).catch((err) => {
      console.error(`Failed to ${verb} team ${team.id}`, err);
    });
  }
}
