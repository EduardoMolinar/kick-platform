import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type DsButtonVariant = 'primary' | 'secondary' | 'ghost';

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsButton {
  @Input() variant: DsButtonVariant = 'primary';
  @Input() disabled = false;
}
