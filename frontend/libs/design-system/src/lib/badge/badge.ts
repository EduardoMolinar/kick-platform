import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DsBadgeVariant = 'neutral' | 'live' | 'success' | 'warning';

@Component({
  selector: 'ds-badge',
  standalone: true,
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsBadge {
  @Input() variant: DsBadgeVariant = 'neutral';
}
