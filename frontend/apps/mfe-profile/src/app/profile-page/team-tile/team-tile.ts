import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Team } from '@platform/shared-types';

@Component({
  selector: 'mfe-profile-team-tile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './team-tile.html',
  styleUrl: './team-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamTile {
  @Input({ required: true }) team!: Team;
  @Output() readonly unfollow = new EventEmitter<void>();
}
