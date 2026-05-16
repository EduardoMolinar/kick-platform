import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { MatchEvent, MatchSummary } from '@platform/shared-types';
import { SPORTS_DATA_SERVICE } from '@platform/sports-data';
import { map, switchMap, type Observable } from 'rxjs';
import { MatchEventRow } from './match-event-row/match-event-row';

interface MatchDetailVm {
  readonly matchId: string;
  readonly match: MatchSummary | undefined;
  readonly events: readonly MatchEvent[];
}

@Component({
  selector: 'mfe-live-match-detail',
  standalone: true,
  imports: [AsyncPipe, RouterLink, MatchEventRow],
  templateUrl: './match-detail.html',
  styleUrl: './match-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly sportsData = inject(SPORTS_DATA_SERVICE);

  private readonly matchId$: Observable<string> = this.route.paramMap.pipe(
    map((p) => p.get('matchId') ?? '')
  );

  protected readonly vm$: Observable<MatchDetailVm> = this.matchId$.pipe(
    switchMap((matchId) =>
      this.sportsData.getMatch(matchId).pipe(
        map((match) => ({
          matchId,
          match,
          // Events sorted by minute ascending (then addedTime), for the timeline view.
          events: this.sortEvents(match?.events ?? []),
        }))
      )
    )
  );

  protected statusLabel(match: MatchSummary): string {
    switch (match.status) {
      case 'live':
        return match.minute != null ? `LIVE ${match.minute}'` : 'LIVE';
      case 'halftime':
        return 'HALF TIME';
      case 'finished':
        return 'FULL TIME';
      case 'scheduled':
        return 'SCHEDULED';
      case 'postponed':
        return 'POSTPONED';
    }
  }

  protected isLive(match: MatchSummary): boolean {
    return match.status === 'live';
  }

  protected compClass(match: MatchSummary): string {
    return `match-detail--${match.competition.code.toLowerCase()}`;
  }

  private sortEvents(events: readonly MatchEvent[]): readonly MatchEvent[] {
    return events.slice().sort((a, b) => {
      if (a.minute !== b.minute) return a.minute - b.minute;
      return (a.addedTime ?? 0) - (b.addedTime ?? 0);
    });
  }
}
