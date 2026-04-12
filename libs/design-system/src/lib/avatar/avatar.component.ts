import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { NgIf } from '@angular/common';

export type AvatarSize = 'sm' | 'md' | 'lg';

/**
 * AvatarComponent — user identity representation.
 *
 * Renders a colored circle with the user's initials. An optional `src` input
 * is reserved for when image support is added — the component will fall back
 * to initials if the image fails to load.
 *
 * Usage:
 *   <ds-avatar initials="E" size="lg"></ds-avatar>
 *   <ds-avatar initials="JD" size="md"></ds-avatar>
 *
 * Accessibility notes:
 *   - role="img" with aria-label exposes the avatar to screen readers.
 *   - The initials text is aria-hidden; the label carries the full meaning.
 *   - Consumer should set aria-label to the user's name: aria-label="Eduardo".
 */
@Component({
  selector: 'ds-avatar',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    '[attr.aria-label]': 'ariaLabel',
    '[class]': 'hostClass',
  },
  template: `
    <img
      *ngIf="src"
      class="ds-avatar__img"
      [src]="src"
      [alt]="ariaLabel"
      (error)="onImgError()" />
    <span
      *ngIf="!src"
      class="ds-avatar__initials"
      aria-hidden="true">
      {{ displayInitials }}
    </span>
  `,
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
  /** Up to 2-character initials shown when no image is available. */
  @Input() initials = '';

  /** Optional image URL. Falls back to initials on load error. */
  @Input() src?: string;

  /** Size variant. */
  @Input() size: AvatarSize = 'md';

  /**
   * Accessible label — defaults to the initials but should be overridden
   * with the user's full name via [aria-label] on the host.
   */
  @Input('aria-label') ariaLabel: string = this.initials;

  @HostBinding('class')
  get hostClass(): string {
    return `ds-avatar ds-avatar--${this.size}`;
  }

  get displayInitials(): string {
    return this.initials.slice(0, 2).toUpperCase();
  }

  onImgError(): void {
    // Remove src to fall back to initials rendering.
    this.src = undefined;
  }
}
