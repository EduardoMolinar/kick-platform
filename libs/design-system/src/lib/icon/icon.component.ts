import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { type IconName, ICONS } from './icon.registry';

export type { IconName };
export type IconSize = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_PX: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
};

/**
 * IconComponent — inline SVG icon primitive.
 *
 * Icons are drawn on a 24×24 viewBox using the Feather icon style
 * (stroke-based, round caps). Color is always `currentColor` so icons
 * inherit their color from the surrounding text context.
 *
 * Usage:
 *   <ds-icon name="home"></ds-icon>
 *   <ds-icon name="star" size="lg" aria-label="Favourite"></ds-icon>
 *   <button dsButton="icon"><ds-icon name="bell"></ds-icon></button>
 *
 * Accessibility notes:
 *   - Without `aria-label`: host gets `aria-hidden="true"` (decorative).
 *     This is the correct default when the icon is inside a labelled button.
 *   - With `aria-label`: host gets `role="img"` + the supplied label.
 *     Use this when the icon stands alone and carries meaning.
 */
@Component({
  selector: 'ds-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-hidden]': '!label ? "true" : null',
    '[attr.role]':        'label ? "img" : null',
    '[attr.aria-label]':  'label || null',
    '[class]':            '"ds-icon ds-icon--" + size',
  },
  template: `
    <svg
      [attr.width]="sizePx"
      [attr.height]="sizePx"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      [innerHTML]="svgContent">
    </svg>
  `,
  styleUrls: ['./icon.component.scss'],
})
export class IconComponent {
  /** Icon name from the registry. */
  @Input({ required: true }) name!: IconName;

  /** Visual size. Maps to fixed pixel dimensions. */
  @Input() size: IconSize = 'md';

  /**
   * Accessible label.
   * Omit when the icon is decorative (inside a labelled button, etc.).
   * Supply when the icon carries standalone meaning.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('aria-label') label?: string;

  private sanitizer = inject(DomSanitizer);

  get sizePx(): number {
    return SIZE_PX[this.size];
  }

  get svgContent(): SafeHtml {
    // SECURITY: content is sourced entirely from our own ICONS registry.
    // It never contains user-supplied data, so bypassing sanitization is safe.
    const raw = ICONS[this.name] ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }
}
