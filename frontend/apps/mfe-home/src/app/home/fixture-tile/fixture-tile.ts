import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { Fixture } from '@platform/shared-types';

@Component({
  selector: 'mfe-home-fixture-tile',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './fixture-tile.html',
  styleUrl: './fixture-tile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureTile {
  @Input({ required: true }) fixture!: Fixture;
}
