import { InjectionToken } from '@angular/core';
import type { Competition, Team } from '@platform/shared-types';
import type { Observable } from 'rxjs';

export interface ProfileService {
  /** Teams this user follows. Empty array if none. */
  getFavoriteTeams(userId: string): Observable<readonly Team[]>;

  /** Competitions this user follows. Empty array if none. */
  getFavoriteCompetitions(userId: string): Observable<readonly Competition[]>;

  /** Emits true when teamId is in the user's favorites; re-emits on every follow/unfollow. */
  isFollowingTeam$(userId: string, teamId: string): Observable<boolean>;

  /** Emits true when competitionId is in the user's favorites; re-emits on every follow/unfollow. */
  isFollowingCompetition$(userId: string, competitionId: string): Observable<boolean>;

  /** Add a team to the user's favorites. Completes immediately. */
  followTeam(userId: string, team: Team): Observable<void>;

  /** Remove a team from the user's favorites. Completes immediately. */
  unfollowTeam(userId: string, teamId: string): Observable<void>;

  /** Add a competition to the user's favorites. Completes immediately. */
  followCompetition(userId: string, competition: Competition): Observable<void>;

  /** Remove a competition from the user's favorites. Completes immediately. */
  unfollowCompetition(userId: string, competitionId: string): Observable<void>;
}

export const PROFILE_SERVICE = new InjectionToken<ProfileService>('PROFILE_SERVICE');
