import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DsCard } from '@platform/design-system';
import type { Competition } from '@platform/shared-types';

@Component({
  selector: 'mfe-profile-competition-tile',
  standalone: true,
  imports: [DsCard],
  templateUrl: './competition-tile.html',
  styleUrl: './competition-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionTile {
  @Input({ required: true }) competition!: Competition;
  @Output() readonly unfollow = new EventEmitter<void>();
}
