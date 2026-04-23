import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DsList, DsListItem } from '@platform/design-system';
import type { MatchSummary } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import type { Observable } from 'rxjs';
import { MatchCard } from './match-card/match-card';

@Component({
  selector: 'mfe-live-live-now',
  standalone: true,
  imports: [AsyncPipe, DsList, DsListItem, MatchCard],
  templateUrl: './live-now.html',
  styleUrl: './live-now.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveNow {
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);
  protected readonly matches$: Observable<readonly MatchSummary[]> =
    this.sportsData.getLiveMatches();
}
