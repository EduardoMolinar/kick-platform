import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Fixture } from '@platform/shared-types';
import { TeamFixtureRow } from './team-fixture-row';

const baseFixture: Fixture = {
  id: 'f-pl-001',
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  home: { id: 't-ars', name: 'Arsenal' },
  away: { id: 't-che', name: 'Chelsea' },
  kickoffAt: '2026-04-26T14:00:00Z',
};

describe('TeamFixtureRow', () => {
  let fixture: ComponentFixture<TeamFixtureRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TeamFixtureRow] }).compileComponents();
    fixture = TestBed.createComponent(TeamFixtureRow);
  });

  it('shows opponent name and HOME when team is at home', () => {
    fixture.componentRef.setInput('fixture', baseFixture);
    fixture.componentRef.setInput('teamId', 't-ars');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Chelsea');
    expect(text).toContain('HOME');
  });

  it('shows home team name and AWAY when team is away', () => {
    fixture.componentRef.setInput('fixture', baseFixture);
    fixture.componentRef.setInput('teamId', 't-che');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Arsenal');
    expect(text).toContain('AWAY');
  });
});
