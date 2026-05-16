import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { MatchSummary } from '@platform/shared-types';

@Component({
  selector: 'mfe-home-live-tile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './live-tile.html',
  styleUrl: './live-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveTile {
  @Input({ required: true }) match!: MatchSummary;
  @Input() featured = false;

  protected get tileClasses(): string {
    const base = 'live-tile';
    const comp = `live-tile--${this.match.competition.code.toLowerCase()}`;
    const featured = this.featured ? 'live-tile--featured' : '';
    return [base, comp, featured].filter(Boolean).join(' ');
  }
}
