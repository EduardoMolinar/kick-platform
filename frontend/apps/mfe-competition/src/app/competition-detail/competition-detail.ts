import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AUTH_SERVICE, type AuthSession } from '@platform/auth';
import { DsList, DsListItem } from '@platform/design-system';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import type { Competition, Fixture, Standing } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import { combineLatest, filter, firstValueFrom, map, switchMap, type Observable } from 'rxjs';
import { COMPETITION_BY_ID } from '../competitions.data';
import { FixtureRow } from './fixture-row/fixture-row';
import { StandingsTable } from './standings-table/standings-table';

interface CompetitionDetailVm {
  user: AuthSession;
  competitionId: string;
  following: boolean;
}

@Component({
  selector: 'mfe-competition-competition-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    UpperCasePipe,
    RouterLink,
    DsList,
    DsListItem,
    FixtureRow,
    StandingsTable,
  ],
  templateUrl: './competition-detail.html',
  styleUrl: './competition-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);
  private readonly auth = inject(AUTH_SERVICE);
  private readonly profile: ProfileService = inject(PROFILE_SERVICE);

  private readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null)
  );

  protected readonly competitionId$: Observable<string> = this.route.paramMap.pipe(
    map((p) => p.get('competitionId') ?? '')
  );

  protected readonly fixtures$: Observable<readonly Fixture[]> = this.competitionId$.pipe(
    switchMap((id) => this.sportsData.getFixtures(id))
  );

  protected readonly standings$: Observable<Standing | undefined> = this.competitionId$.pipe(
    switchMap((id) => this.sportsData.getStandings(id))
  );

  protected readonly followVm$: Observable<CompetitionDetailVm> = combineLatest([
    this.user$,
    this.competitionId$,
  ]).pipe(
    switchMap(([user, compId]) =>
      this.profile.isFollowingCompetition$(user.userId, compId).pipe(
        map((following) => ({ user, competitionId: compId, following }))
      )
    )
  );

  protected onFollowToggle(vm: CompetitionDetailVm): void {
    const competition: Competition | undefined = COMPETITION_BY_ID[vm.competitionId];
    if (!competition) return;
    const action = vm.following
      ? this.profile.unfollowCompetition(vm.user.userId, vm.competitionId)
      : this.profile.followCompetition(vm.user.userId, competition);
    firstValueFrom(action);
  }
}
