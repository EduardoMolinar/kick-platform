import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DsBadge, DsCard } from '@platform/design-system';
import type { MatchSummary } from '@platform/shared-types';

@Component({
  selector: 'mfe-home-live-tile',
  standalone: true,
  imports: [DsBadge, DsCard],
  templateUrl: './live-tile.html',
  styleUrl: './live-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveTile {
  @Input({ required: true }) match!: MatchSummary;
}
