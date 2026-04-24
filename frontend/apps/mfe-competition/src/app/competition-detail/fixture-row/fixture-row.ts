import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Fixture } from '@platform/shared-types';

@Component({
  selector: 'mfe-competition-fixture-row',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './fixture-row.html',
  styleUrl: './fixture-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureRow {
  @Input({ required: true }) fixture!: Fixture;
}
