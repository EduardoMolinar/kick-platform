import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * StatBarComponent — horizontal percentage bar for match statistics.
 *
 * Renders a labelled row with two opposing bars — home on the left,
 * away on the right — and the raw values on each side. The bar widths
 * are always proportional to the total so the visual balance is correct
 * regardless of whether the values are percentages or counts.
 *
 * For possession (values already sum to 100):
 *   <ds-stat-bar label="Possession" [homeValue]="42" [awayValue]="58" unit="%">
 *
 * For shot counts (bars scale to total automatically):
 *   <ds-stat-bar label="Shots on Target" [homeValue]="8" [awayValue]="12">
 *
 * Accessibility notes:
 *   - The visual bars are aria-hidden; the row carries role="row" with
 *     an aria-label describing the stat for screen readers.
 *   - Values are always in the DOM as text (not just bar width).
 */
@Component({
  selector: 'ds-stat-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'row',
    '[attr.aria-label]': 'rowAriaLabel',
    '[class]': '"ds-stat-bar"',
  },
  template: `
    <span class="ds-stat-bar__value ds-stat-bar__value--home" aria-hidden="true">
      {{ homeValue }}{{ unit }}
    </span>

    <div class="ds-stat-bar__track" aria-hidden="true">
      <div class="ds-stat-bar__bar ds-stat-bar__bar--home"
           [style.width.%]="homePercent">
      </div>
      <div class="ds-stat-bar__bar ds-stat-bar__bar--away"
           [style.width.%]="awayPercent">
      </div>
    </div>

    <span class="ds-stat-bar__label" aria-hidden="true">{{ label }}</span>

    <div class="ds-stat-bar__track ds-stat-bar__track--away" aria-hidden="true">
      <div class="ds-stat-bar__bar ds-stat-bar__bar--away-fill"
           [style.width.%]="awayPercent">
      </div>
      <div class="ds-stat-bar__bar ds-stat-bar__bar--home-fill"
           [style.width.%]="homePercent">
      </div>
    </div>

    <span class="ds-stat-bar__value ds-stat-bar__value--away" aria-hidden="true">
      {{ awayValue }}{{ unit }}
    </span>
  `,
  styleUrls: ['./stat-bar.component.scss'],
})
export class StatBarComponent {
  /** Stat label shown in the centre, e.g. "Possession", "Shots on Target". */
  @Input({ required: true }) label!: string;

  /** Home team's value. */
  @Input() homeValue = 0;

  /** Away team's value. */
  @Input() awayValue = 0;

  /** Optional unit appended to the displayed value, e.g. "%". */
  @Input() unit = '';

  get total(): number {
    return this.homeValue + this.awayValue || 1; // avoid division by zero
  }

  get homePercent(): number {
    return Math.round((this.homeValue / this.total) * 100);
  }

  get awayPercent(): number {
    return 100 - this.homePercent;
  }

  get rowAriaLabel(): string {
    return `${this.label}: home ${this.homeValue}${this.unit}, away ${this.awayValue}${this.unit}`;
  }
}
