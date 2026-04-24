import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DsList, DsListItem } from '@platform/design-system';
import type { Fixture, Standing } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import { map, switchMap, type Observable } from 'rxjs';
import { FixtureRow } from './fixture-row/fixture-row';
import { StandingsTable } from './standings-table/standings-table';

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

  protected readonly competitionId$: Observable<string> = this.route.paramMap.pipe(
    map((p) => p.get('competitionId') ?? '')
  );

  protected readonly fixtures$: Observable<readonly Fixture[]> = this.competitionId$.pipe(
    switchMap((id) => this.sportsData.getFixtures(id))
  );

  protected readonly standings$: Observable<Standing | undefined> = this.competitionId$.pipe(
    switchMap((id) => this.sportsData.getStandings(id))
  );
}
