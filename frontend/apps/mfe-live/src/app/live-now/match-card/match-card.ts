import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DsBadge, DsCard } from '@platform/design-system';
import type { MatchSummary } from '@platform/shared-types';

@Component({
  selector: 'mfe-live-match-card',
  standalone: true,
  imports: [DsCard, DsBadge],
  templateUrl: './match-card.html',
  styleUrl: './match-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCard {
  @Input({ required: true }) match!: MatchSummary;
  @Input() homeFollowing = false;
  @Input() awayFollowing = false;
  @Output() readonly homeFollowToggle = new EventEmitter<void>();
  @Output() readonly awayFollowToggle = new EventEmitter<void>();

  protected get badgeVariant(): 'live' | 'neutral' | 'warning' {
    switch (this.match.status) {
      case 'live':
        return 'live';
      case 'halftime':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  protected get statusLabel(): string {
    switch (this.match.status) {
      case 'live':
        return this.match.minute != null ? `LIVE ${this.match.minute}'` : 'LIVE';
      case 'halftime':
        return 'HT';
      case 'finished':
        return 'FT';
      case 'scheduled':
        return 'SCHED';
      case 'postponed':
        return 'PPD';
    }
  }
}
