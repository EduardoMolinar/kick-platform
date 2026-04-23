import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface DsTopNavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'ds-top-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsTopNav {
  @Input() items: readonly DsTopNavItem[] = [];
}
