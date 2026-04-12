import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'ghost' | 'icon';
export type ButtonSize    = 'sm' | 'md';

/**
 * ButtonComponent — low-level button primitive.
 *
 * Applied as an attribute on a native <button> or <a> element so the host
 * is always a real interactive element — no role="button" faking.
 *
 * Usage:
 *   <button dsButton>Save</button>
 *   <button dsButton="ghost" size="sm">Cancel</button>
 *   <a dsButton="ghost" href="/home">Back</a>
 *
 * Accessibility notes:
 *   - Host is always <button> or <a>, so keyboard and screen-reader support
 *     is native.
 *   - Focus ring is rendered via :focus-visible (no :focus rule, avoids
 *     showing ring on mouse click).
 *   - disabled state is reflected via the native `disabled` attribute AND
 *     aria-disabled so <a> elements are also covered.
 */
@Component({
  // Attribute selector on native elements — the host IS the interactive control.
  selector: 'button[dsButton], a[dsButton]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  /** Visual variant. Pass as the attribute value: dsButton="ghost". */
  @Input('dsButton') variant: ButtonVariant | '' = 'primary';

  /** Size of the button. */
  @Input() size: ButtonSize = 'md';

  /** Disabled state — forwarded to the native element and aria-disabled. */
  @Input() disabled = false;

  @HostBinding('class')
  get hostClass(): string {
    const v = this.variant || 'primary';
    return `ds-button ds-button--${v} ds-button--${this.size}`;
  }

  @HostBinding('disabled')
  get nativeDisabled(): boolean | null {
    return this.disabled || null;
  }

  @HostBinding('attr.aria-disabled')
  get ariaDisabled(): boolean | null {
    // Only set for <a> elements where `disabled` attribute has no native effect.
    return this.disabled ? true : null;
  }

  @HostBinding('attr.tabindex')
  get tabindex(): string | null {
    // Prevent <a dsButton> from receiving focus when logically disabled.
    return this.disabled ? '-1' : null;
  }
}
