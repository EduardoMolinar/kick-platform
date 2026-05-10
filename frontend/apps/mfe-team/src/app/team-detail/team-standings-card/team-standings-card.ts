import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { TeamCompetitionStanding } from '@platform/shared-types';

@Component({
  selector: 'mfe-team-team-standings-card',
  standalone: true,
  imports: [],
  templateUrl: './team-standings-card.html',
  styleUrl: './team-standings-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamStandingsCard {
  @Input({ required: true }) entry!: TeamCompetitionStanding;
}
