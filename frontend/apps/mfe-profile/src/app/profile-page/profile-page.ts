import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AUTH_SERVICE, type AuthSession } from '@platform/auth';
import { DsList, DsListItem } from '@platform/design-system';
import { PROFILE_SERVICE } from '@platform/profile';
import type { Competition, Team } from '@platform/shared-types';
import { filter, shareReplay, switchMap, type Observable } from 'rxjs';
import { CompetitionTile } from './competition-tile/competition-tile';
import { TeamTile } from './team-tile/team-tile';

@Component({
  selector: 'mfe-profile-profile-page',
  standalone: true,
  imports: [AsyncPipe, DsList, DsListItem, TeamTile, CompetitionTile],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly auth = inject(AUTH_SERVICE);
  private readonly profile = inject(PROFILE_SERVICE);

  protected readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected readonly favoriteTeams$: Observable<readonly Team[]> = this.user$.pipe(
    switchMap((u) => this.profile.getFavoriteTeams(u.userId))
  );

  protected readonly favoriteCompetitions$: Observable<readonly Competition[]> = this.user$.pipe(
    switchMap((u) => this.profile.getFavoriteCompetitions(u.userId))
  );
}
