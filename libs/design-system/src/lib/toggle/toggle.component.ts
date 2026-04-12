import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  HostBinding,
  Input,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * ToggleComponent — accessible on/off switch.
 *
 * Implements ControlValueAccessor so it works transparently with both
 * template-driven and reactive Angular forms.
 *
 * Usage (standalone):
 *   <ds-toggle [checked]="notificationsOn" (checkedChange)="notificationsOn = $event" />
 *
 * Usage (reactive forms):
 *   <ds-toggle formControlName="notifications" />
 *
 * Accessibility notes:
 *   - role="switch" is the correct ARIA role for a binary on/off control.
 *   - aria-checked reflects the current state.
 *   - The inner button is the focusable element; the host is a presentational
 *     wrapper to allow correct host-class styling.
 *   - Label text should be provided by the consumer via aria-label or a
 *     visible <label> pointing to the toggle's id.
 */
@Component({
  selector: 'ds-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
  host: {
    '[class]': 'hostClass',
  },
  template: `
    <button
      type="button"
      class="ds-toggle__button"
      role="switch"
      [attr.aria-checked]="checked"
      [attr.aria-disabled]="disabled || null"
      [disabled]="disabled || null"
      (click)="onToggle()">
      <span class="ds-toggle__track">
        <span class="ds-toggle__thumb" aria-hidden="true"></span>
      </span>
    </button>
  `,
  styleUrls: ['./toggle.component.scss'],
})
export class ToggleComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  @Input() checked = false;
  @Input() disabled = false;

  @HostBinding('class')
  get hostClass(): string {
    const classes = ['ds-toggle'];
    if (this.checked)  classes.push('ds-toggle--checked');
    if (this.disabled) classes.push('ds-toggle--disabled');
    return classes.join(' ');
  }

  // ControlValueAccessor plumbing
  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  onToggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.cdr.markForCheck();
  }

  writeValue(value: boolean): void {
    this.checked = !!value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.cdr.markForCheck();
  }
}
