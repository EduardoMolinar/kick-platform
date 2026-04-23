import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsButton } from '@platform/design-system';
import { Competition } from '@platform/shared-types';

@Component({
  selector: 'mfe-home-home',
  standalone: true,
  imports: [DsButton],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly featured: Competition = { id: 'ucl', name: 'Champions League', code: 'UCL' };
}
