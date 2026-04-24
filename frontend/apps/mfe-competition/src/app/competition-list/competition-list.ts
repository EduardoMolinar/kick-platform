import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DsCard, DsList, DsListItem } from '@platform/design-system';
import type { Competition } from '@platform/shared-types';

@Component({
  selector: 'mfe-competition-competition-list',
  standalone: true,
  imports: [RouterLink, DsCard, DsList, DsListItem],
  templateUrl: './competition-list.html',
  styleUrl: './competition-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompetitionList {
  protected readonly competitions: readonly Competition[] = [
    { id: 'ucl', name: 'Champions League', code: 'UCL' },
    { id: 'pl', name: 'Premier League', code: 'PL' },
    { id: 'liga', name: 'La Liga', code: 'LIGA' },
    { id: 'int', name: 'International', code: 'INT' },
  ];
}
