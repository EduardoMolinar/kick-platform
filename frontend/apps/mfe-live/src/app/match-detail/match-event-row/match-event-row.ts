import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { MatchEvent } from '@platform/shared-types';

@Component({
  selector: 'mfe-live-match-event-row',
  standalone: true,
  imports: [],
  templateUrl: './match-event-row.html',
  styleUrl: './match-event-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchEventRow {
  @Input({ required: true }) event!: MatchEvent;

  protected get minuteLabel(): string {
    return this.event.addedTime != null
      ? `${this.event.minute}+${this.event.addedTime}'`
      : `${this.event.minute}'`;
  }

  protected get iconLabel(): string {
    switch (this.event.type) {
      case 'goal':
        return '⚽';
      case 'yellow-card':
        return '🟨';
      case 'red-card':
        return '🟥';
      case 'substitution':
        return '↔';
    }
  }

  protected get typeLabel(): string {
    switch (this.event.type) {
      case 'goal':
        return 'Goal';
      case 'yellow-card':
        return 'Yellow card';
      case 'red-card':
        return 'Red card';
      case 'substitution':
        return 'Substitution';
    }
  }
}
