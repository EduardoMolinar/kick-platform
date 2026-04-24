import { TestBed } from '@angular/core/testing';
import type { Team } from '@platform/shared-types';
import { TeamTile } from './team-tile';

const sample: Team = { id: 't-ars', name: 'Arsenal', shortName: 'ARS' };

describe('TeamTile', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TeamTile] }).compileComponents();
  });

  it('renders team name and short name', () => {
    const fixture = TestBed.createComponent(TeamTile);
    fixture.componentRef.setInput('team', sample);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Arsenal');
    expect(text).toContain('ARS');
  });
});
