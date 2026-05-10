import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Fixture, Team, TeamCompetitionStanding } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import { combineLatest, map, switchMap, type Observable } from 'rxjs';
import { TeamFixtureRow } from './team-fixture-row/team-fixture-row';
import { TeamStandingsCard } from './team-standings-card/team-standings-card';

interface TeamDetailVm {
  readonly teamId: string;
  readonly team: Team | undefined;
  readonly fixtures: readonly Fixture[];
  readonly standings: readonly TeamCompetitionStanding[];
}

@Component({
  selector: 'mfe-team-team-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, TeamFixtureRow, TeamStandingsCard],
  templateUrl: './team-detail.html',
  styleUrl: './team-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);

  private readonly teamId$: Observable<string> = this.route.paramMap.pipe(
    map((p) => p.get('teamId') ?? '')
  );

  protected readonly vm$: Observable<TeamDetailVm> = this.teamId$.pipe(
    switchMap((teamId) =>
      combineLatest([
        this.sportsData.getTeam(teamId),
        this.sportsData.getTeamFixtures(teamId),
        this.sportsData.getTeamStandings(teamId),
      ]).pipe(
        map(([team, fixtures, standings]) => ({
          teamId,
          team,
          fixtures,
          standings,
        }))
      )
    )
  );
}
