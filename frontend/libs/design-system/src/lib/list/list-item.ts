import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-list-item',
  standalone: true,
  templateUrl: './list-item.html',
  styleUrl: './list-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsListItem {}
