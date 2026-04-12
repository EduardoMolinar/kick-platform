import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

export type BadgeVariant = 'live' | 'comp' | 'result' | 'zone-cl' | 'zone-uel' | 'zone-rel';

/**
 * BadgeComponent — inline status indicator.
 *
 * Variants:
 *   live     — animated red dot + "LIVE" text. Used in match cards and the topbar.
 *   comp     — neutral dark chip for competition names ("UCL · QF").
 *   result   — neutral chip for final result state ("FT", "AET", "PSO").
 *   zone-cl  — green dot for Champions League qualification zone.
 *   zone-uel — amber dot for Europa League zone.
 *   zone-rel — red dot for relegation zone.
 *
 * Usage:
 *   <ds-badge variant="live">LIVE</ds-badge>
 *   <ds-badge variant="comp">⭐ UCL · QF</ds-badge>
 *   <ds-badge variant="result">FT</ds-badge>
 *
 * Accessibility notes:
 *   - role="status" makes screen readers announce content changes.
 *   - The pulse dot is aria-hidden because the text already conveys liveness.
 *   - Use aria-label on the host for context when badge text is very terse.
 */
@Component({
  selector: 'ds-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    '[class]': 'hostClass',
  },
  template: `
    @if (variant === 'live') {
      <span class="ds-badge__dot" aria-hidden="true"></span>
    }
    <ng-content></ng-content>
  `,
  imports: [],
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'comp';

  @HostBinding('class')
  get hostClass(): string {
    return `ds-badge ds-badge--${this.variant}`;
  }
}
