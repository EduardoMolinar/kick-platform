import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';

/**
 * PillComponent — filter tab pill.
 *
 * Used in horizontal filter rows to select a competition, date, or category.
 * Manages its own visual active state; the parent controls the logical state.
 *
 * Usage:
 *   <ds-pill [active]="selected === 'ucl'" (activated)="selected = 'ucl'">
 *     ⭐ UCL
 *   </ds-pill>
 *
 * Accessibility notes:
 *   - role="tab" with aria-selected communicates filter state to screen readers.
 *   - Keyboard activation handled via HostListener on Enter and Space.
 *   - Use a role="tablist" wrapper on the containing row for full ARIA compliance.
 */
@Component({
  selector: 'ds-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tab',
    tabindex: '0',
    '[attr.aria-selected]': 'active',
    '[class]': 'hostClass',
  },
  template: `<ng-content></ng-content>`,
  styleUrls: ['./pill.component.scss'],
})
export class PillComponent {
  /** Whether this pill is the currently selected filter. */
  @Input() active = false;

  /** Emitted when the user activates this pill (click or keyboard). */
  @Output() activated = new EventEmitter<void>();

  @HostBinding('class')
  get hostClass(): string {
    return `ds-pill${this.active ? ' ds-pill--active' : ''}`;
  }

  @HostListener('click')
  @HostListener('keydown.enter')
  @HostListener('keydown.space', ['$event'])
  onActivate(event?: KeyboardEvent): void {
    if (event) event.preventDefault(); // prevent page scroll on Space
    this.activated.emit();
  }
}
