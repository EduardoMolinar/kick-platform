import { TestBed } from '@angular/core/testing';
import type { Standing } from '@platform/shared-types';
import { StandingsTable } from './standings-table';

const sample: Standing = {
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  updatedAt: '2026-04-22T00:00:00Z',
  rows: [
    {
      position: 1,
      team: { id: 't1', name: 'Arsenal' },
      played: 10, won: 8, drawn: 1, lost: 1,
      goalsFor: 24, goalsAgainst: 8, goalDifference: 16, points: 25,
    },
    {
      position: 2,
      team: { id: 't2', name: 'Liverpool' },
      played: 10, won: 7, drawn: 2, lost: 1,
      goalsFor: 20, goalsAgainst: 9, goalDifference: 11, points: 23,
    },
    {
      position: 3,
      team: { id: 't3', name: 'Manchester City' },
      played: 10, won: 6, drawn: 2, lost: 2,
      goalsFor: 18, goalsAgainst: 10, goalDifference: 8, points: 20,
    },
  ],
};

describe('StandingsTable', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StandingsTable] }).compileComponents();
  });

  it('renders a <tr> per row in positional order', () => {
    const fixture = TestBed.createComponent(StandingsTable);
    fixture.componentRef.setInput('standing', sample);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);

    const firstCellText = Array.from(rows).map(
      (r) => (r as HTMLElement).querySelector('td')?.textContent?.trim() ?? ''
    );
    expect(firstCellText).toEqual(['1', '2', '3']);
  });
});
