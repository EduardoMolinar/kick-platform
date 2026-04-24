import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Standing } from '@platform/shared-types';

@Component({
  selector: 'mfe-competition-standings-table',
  standalone: true,
  imports: [],
  templateUrl: './standings-table.html',
  styleUrl: './standings-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StandingsTable {
  @Input({ required: true }) standing!: Standing;
}
