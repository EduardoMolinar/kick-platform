import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * SpinnerComponent — CSS-only loading indicator.
 *
 * Used for async states in live-data views (fixtures loading, match stats
 * refreshing, etc.). The animation is a rotating arc in the brand color.
 *
 * Usage:
 *   <ds-spinner></ds-spinner>
 *   <ds-spinner size="lg" label="Loading fixtures"></ds-spinner>
 *
 * Accessibility notes:
 *   - role="status" + aria-live="polite" announces the loading state to
 *     screen readers without interrupting the current announcement.
 *   - aria-label is bound to the `label` input so consumers can provide
 *     context ("Loading live scores", "Loading match stats").
 *   - `prefers-reduced-motion`: the spin animation is replaced by a subtle
 *     opacity pulse so the component remains visible without triggering
 *     vestibular issues.
 */
@Component({
  selector: 'ds-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-label]': 'label',
    '[class]': '"ds-spinner ds-spinner--" + size',
  },
  template: `<span class="ds-spinner__arc" aria-hidden="true"></span>`,
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  /** Visual size. sm=16px, md=24px, lg=36px. */
  @Input() size: SpinnerSize = 'md';

  /** Accessible label announced to screen readers. */
  @Input() label = 'Loading';
}
