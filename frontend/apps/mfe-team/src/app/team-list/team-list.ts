import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUTH_SERVICE, type AuthSession } from '@platform/auth';
import { DsCard, DsList, DsListItem } from '@platform/design-system';
import { PROFILE_SERVICE } from '@platform/profile';
import type { Team } from '@platform/shared-types';
import { filter, map, shareReplay, switchMap, type Observable } from 'rxjs';

interface TeamListVm {
  readonly user: AuthSession;
  readonly teams: readonly Team[];
}

@Component({
  selector: 'mfe-team-team-list',
  standalone: true,
  imports: [AsyncPipe, RouterLink, DsCard, DsList, DsListItem],
  templateUrl: './team-list.html',
  styleUrl: './team-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamList {
  private readonly auth = inject(AUTH_SERVICE);
  private readonly profile = inject(PROFILE_SERVICE);

  private readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected readonly vm$: Observable<TeamListVm> = this.user$.pipe(
    switchMap((user) =>
      this.profile.getFavoriteTeams(user.userId).pipe(
        map((teams) => ({ user, teams }))
      )
    )
  );
}
