import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Fixture } from '@platform/shared-types';

@Component({
  selector: 'mfe-team-team-fixture-row',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './team-fixture-row.html',
  styleUrl: './team-fixture-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamFixtureRow {
  @Input({ required: true }) fixture!: Fixture;
  @Input({ required: true }) teamId!: string;
}
