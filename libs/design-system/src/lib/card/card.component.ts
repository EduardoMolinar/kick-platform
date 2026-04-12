import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

export type CardVariant = 'default' | 'elevated' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * CardComponent — surface container composite.
 *
 * The foundational layout block for match cards, standings rows, team panels,
 * and the profile page. It owns surface color, border, radius, shadow, and
 * padding — consumers own the content layout inside.
 *
 * Variants:
 *   default     — bg-surface; standard match/standings card.
 *   elevated    — bg-elevated; nested panels, sidebar sections.
 *   interactive — bg-surface + hover border highlight + cursor:pointer.
 *                 Use for clickable match cards, team cards, etc.
 *
 * Usage:
 *   <ds-card>
 *     <p>Match content</p>
 *   </ds-card>
 *
 *   <ds-card variant="interactive" padding="sm" (click)="openMatch()">
 *     …
 *   </ds-card>
 *
 *   <ds-card variant="elevated" padding="none">
 *     <img …/>
 *   </ds-card>
 *
 * Accessibility notes:
 *   - No implicit ARIA role — consumers apply semantic context with an
 *     element tag or role attribute: <ds-card role="article">, <article>,
 *     or <section> wrapping the card.
 *   - The interactive variant adds tabindex="0" and a :focus-visible ring
 *     so it is reachable and operable via keyboard.
 *   - When used as a clickable card, add (keydown.enter) and (keydown.space)
 *     handlers alongside the (click) handler.
 */
@Component({
  selector: 'ds-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  /** Surface color and hover behaviour. */
  @Input() variant: CardVariant = 'default';

  /** Internal padding. */
  @Input() padding: CardPadding = 'md';

  @HostBinding('class')
  get hostClass(): string {
    return `ds-card ds-card--${this.variant} ds-card--pad-${this.padding}`;
  }

  /** Interactive cards are keyboard-reachable via tabindex. */
  @HostBinding('attr.tabindex')
  get tabindex(): string | null {
    return this.variant === 'interactive' ? '0' : null;
  }
}
