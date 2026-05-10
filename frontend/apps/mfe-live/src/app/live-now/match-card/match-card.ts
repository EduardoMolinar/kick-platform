import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import type { MatchSummary } from '@platform/shared-types';

@Component({
  selector: 'mfe-live-match-card',
  standalone: true,
  imports: [],
  templateUrl: './match-card.html',
  styleUrl: './match-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCard {
  @Input({ required: true }) match!: MatchSummary;
  @Input() homeFollowing = false;
  @Input() awayFollowing = false;
  @Input() featured = false;
  @Output() readonly homeFollowToggle = new EventEmitter<void>();
  @Output() readonly awayFollowToggle = new EventEmitter<void>();

  protected get cardClasses(): string {
    const base = 'match-card';
    const comp = `match-card--${this.match.competition.code.toLowerCase()}`;
    const featured = this.featured ? 'match-card--featured' : '';
    return [base, comp, featured].filter(Boolean).join(' ');
  }

  protected get statusLabel(): string {
    switch (this.match.status) {
      case 'live':
        return this.match.minute != null ? `LIVE ${this.match.minute}'` : 'LIVE';
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

  protected get isLive(): boolean {
    return this.match.status === 'live';
  }
}
