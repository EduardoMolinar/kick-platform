import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { NgIf, NgFor, NgClass, SlicePipe } from '@angular/common';

export type FormResult = 'W' | 'D' | 'L';
export type StandingsZone = 'cl' | 'uel' | 'rel';

/**
 * StandingsRowComponent — a single row in a competition standings table.
 *
 * Renders: zone indicator · rank · team name · P W D L GF GA GD Pts · form strip
 *
 * The host element should sit inside a container with role="rowgroup" so the
 * full standings list is semantically a table.
 *
 * Usage:
 *   <div role="table" aria-label="La Liga standings">
 *     <div role="rowgroup">
 *       <ds-standings-row
 *         [position]="1" teamName="Real Madrid"
 *         [played]="28" [won]="21" [drawn]="4" [lost]="3"
 *         [goalsFor]="64" [goalsAgainst]="22"
 *         [points]="67" [form]="['W','W','D','W','W']"
 *         zone="cl" [highlighted]="true">
 *       </ds-standings-row>
 *     </div>
 *   </div>
 *
 * Accessibility notes:
 *   - role="row" on host, role="cell" on each data column.
 *   - The form strip is aria-hidden; a plain-text summary is in aria-label.
 *   - highlighted adds a subtle left border (current user's team).
 */
@Component({
  selector: 'ds-standings-row',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'row',
    '[attr.aria-label]': 'rowAriaLabel',
    '[class]': 'hostClass',
  },
  template: `
    <!-- Zone indicator -->
    <span role="cell" class="ds-standings-row__zone" aria-hidden="true">
      <span
        *ngIf="zone"
        class="ds-standings-row__zone-dot"
        [ngClass]="'ds-standings-row__zone-dot--' + zone">
      </span>
    </span>

    <!-- Position -->
    <span role="cell" class="ds-standings-row__pos">{{ position }}</span>

    <!-- Team name -->
    <span role="cell" class="ds-standings-row__team">{{ teamName }}</span>

    <!-- Stats -->
    <span role="cell" class="ds-standings-row__stat">{{ played }}</span>
    <span role="cell" class="ds-standings-row__stat">{{ won }}</span>
    <span role="cell" class="ds-standings-row__stat">{{ drawn }}</span>
    <span role="cell" class="ds-standings-row__stat">{{ lost }}</span>
    <span role="cell" class="ds-standings-row__stat ds-standings-row__stat--gd">
      {{ goalDifference > 0 ? '+' : '' }}{{ goalDifference }}
    </span>
    <span role="cell" class="ds-standings-row__stat ds-standings-row__stat--pts">
      {{ points }}
    </span>

    <!-- Form strip (last 5 results) -->
    <span
      role="cell"
      class="ds-standings-row__form"
      aria-hidden="true">
      <span
        *ngFor="let r of form | slice:0:5"
        class="ds-standings-row__form-dot"
        [ngClass]="'ds-standings-row__form-dot--' + r.toLowerCase()">
      </span>
    </span>
  `,
  styleUrls: ['./standings-row.component.scss'],
})
export class StandingsRowComponent {
  @Input({ required: true }) position!: number;
  @Input({ required: true }) teamName!: string;
  @Input() played  = 0;
  @Input() won     = 0;
  @Input() drawn   = 0;
  @Input() lost    = 0;
  @Input() goalsFor = 0;
  @Input() goalsAgainst = 0;
  @Input() points  = 0;
  @Input() form: FormResult[] = [];
  @Input() zone?: StandingsZone;
  /** Highlights the user's followed team with a brand left border. */
  @Input() highlighted = false;

  @HostBinding('class')
  get hostClass(): string {
    const classes = ['ds-standings-row'];
    if (this.highlighted) classes.push('ds-standings-row--highlighted');
    if (this.zone)        classes.push(`ds-standings-row--zone-${this.zone}`);
    return classes.join(' ');
  }

  get goalDifference(): number {
    return this.goalsFor - this.goalsAgainst;
  }

  get rowAriaLabel(): string {
    const zonePart = this.zone
      ? `, ${this.zone === 'cl' ? 'Champions League zone' : this.zone === 'uel' ? 'Europa League zone' : 'Relegation zone'}`
      : '';
    return (
      `Position ${this.position}, ${this.teamName}. ` +
      `Played ${this.played}, Won ${this.won}, Drawn ${this.drawn}, Lost ${this.lost}. ` +
      `Goal difference ${this.goalDifference > 0 ? '+' : ''}${this.goalDifference}. ` +
      `Points ${this.points}${zonePart}.`
    );
  }
}
