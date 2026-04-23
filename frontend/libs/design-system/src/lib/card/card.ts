import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DsCardVariant = 'raised' | 'flat';

@Component({
  selector: 'ds-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsCard {
  @Input() variant: DsCardVariant = 'raised';
  @Input('aria-label') ariaLabel?: string;
}
