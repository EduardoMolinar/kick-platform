import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUTH_SERVICE, type AuthSession } from '@platform/auth';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import type { Competition } from '@platform/shared-types';
import { combineLatest, filter, firstValueFrom, map, switchMap, type Observable } from 'rxjs';
import { COMPETITIONS } from '../competitions.data';

interface CompetitionListVm {
  user: AuthSession;
  followMap: ReadonlyMap<string, boolean>;
}

@Component({
  selector: 'mfe-competition-competition-list',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './competition-list.html',
  styleUrl: './competition-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionList {
  private readonly auth = inject(AUTH_SERVICE);
  private readonly profile: ProfileService = inject(PROFILE_SERVICE);

  protected readonly competitions: readonly Competition[] = COMPETITIONS;

  private readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null)
  );

  protected readonly vm$: Observable<CompetitionListVm> = this.user$.pipe(
    switchMap((user) =>
      combineLatest(
        this.competitions.map((c) => this.profile.isFollowingCompetition$(user.userId, c.id))
      ).pipe(
        map((states) => ({
          user,
          followMap: new Map(this.competitions.map((c, i) => [c.id, states[i]])),
        }))
      )
    )
  );

  protected onFollowToggle(user: AuthSession, competition: Competition, isFollowing: boolean): void {
    const action = isFollowing
      ? this.profile.unfollowCompetition(user.userId, competition.id)
      : this.profile.followCompetition(user.userId, competition);
    const verb = isFollowing ? 'unfollow' : 'follow';
    void firstValueFrom(action).catch((err) => {
      console.error(`Failed to ${verb} competition ${competition.id}`, err);
    });
  }
}
