import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsButton } from '@platform/design-system';

@Component({
  selector: 'mfe-profile-landing',
  standalone: true,
  imports: [DsButton],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {
  protected readonly remoteName = 'mfe-profile';
}
