import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { BadgeComponent } from '../badge/badge.component';

export type MatchStatus   = 'live' | 'finished' | 'scheduled';
export type MatchScoreSize = 'compact' | 'featured';

/**
 * MatchScoreComponent — the hero display for any match context.
 *
 * Accepts primitive inputs so the design system stays dependency-free
 * (no import from shared-types). Consuming components in remotes map
 * their domain models to these inputs.
 *
 * Compact mode — used inside match cards on the Home feed:
 *   competition label · match state · two team names · score
 *
 * Featured mode — used as the top section of the Live match detail screen:
 *   larger score numerals, teams stacked vertically around the score
 *
 * Usage:
 *   <ds-match-score
 *     homeTeam="Real Madrid"
 *     awayTeam="Bayern München"
 *     [homeScore]="2"
 *     [awayScore]="1"
 *     status="live"
 *     [minute]="73"
 *     competition="⭐ UCL · QF">
 *   </ds-match-score>
 *
 * Accessibility notes:
 *   - The score section carries aria-label with full readable text
 *     so screen readers get "Real Madrid 2, Bayern München 1, 73 minutes".
 *   - Team names and live state are all in the DOM (not CSS-only).
 */
@Component({
  selector: 'ds-match-score',
  standalone: true,
  imports: [BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass' },
  templateUrl: './match-score.component.html',
  styleUrls: ['./match-score.component.scss'],
})
export class MatchScoreComponent {
  /** Home team display name. */
  @Input({ required: true }) homeTeam!: string;

  /** Away team display name. */
  @Input({ required: true }) awayTeam!: string;

  /** Home score. Null when the match has not started. */
  @Input() homeScore: number | null = null;

  /** Away score. Null when the match has not started. */
  @Input() awayScore: number | null = null;

  /** Match state — drives status badge and score visibility. */
  @Input() status: MatchStatus = 'scheduled';

  /** Current match minute (only shown when status is live). */
  @Input() minute?: number;

  /** Optional competition label, e.g. "⭐ UCL · QF". */
  @Input() competition?: string;

  /** Visual size variant. */
  @Input() size: MatchScoreSize = 'compact';

  @HostBinding('class')
  get hostClass(): string {
    return `ds-match-score ds-match-score--${this.size} ds-match-score--${this.status}`;
  }

  get showScore(): boolean {
    return this.status !== 'scheduled' &&
           this.homeScore !== null &&
           this.awayScore !== null;
  }

  get minuteLabel(): string {
    if (!this.minute) return '';
    return `${this.minute}′`;
  }

  /** Full accessible description of the current match state. */
  get scoreAriaLabel(): string {
    if (!this.showScore) {
      return `${this.homeTeam} vs ${this.awayTeam}, not yet started`;
    }
    const state = this.status === 'live'
      ? `live, ${this.minuteLabel}`
      : 'full time';
    return `${this.homeTeam} ${this.homeScore}, ${this.awayTeam} ${this.awayScore}, ${state}`;
  }
}
