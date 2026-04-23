import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-list',
  standalone: true,
  templateUrl: './list.html',
  styleUrl: './list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsList {}
