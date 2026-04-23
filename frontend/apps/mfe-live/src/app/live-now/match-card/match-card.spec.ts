import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { MatchSummary } from '@platform/shared-types';
import { MatchCard } from './match-card';

const baseMatch: MatchSummary = {
  id: 'm-test',
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  status: 'live',
  home: { team: { id: 't1', name: 'Arsenal' }, score: 2 },
  away: { team: { id: 't2', name: 'Liverpool' }, score: 0 },
  kickoffAt: '2026-04-22T18:30:00Z',
  minute: 54,
};

describe('MatchCard', () => {
  let fixture: ComponentFixture<MatchCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MatchCard] }).compileComponents();
    fixture = TestBed.createComponent(MatchCard);
    fixture.componentRef.setInput('match', baseMatch);
    fixture.detectChanges();
  });

  it('renders both team names and scores', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Arsenal');
    expect(text).toContain('Liverpool');
    expect(text).toContain('2');
    expect(text).toContain('0');
  });

  it("shows LIVE <minute> for a live match", () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain("LIVE 54'");
  });

  it('shows HT for a halftime match', () => {
    fixture.componentRef.setInput('match', { ...baseMatch, status: 'halftime' });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('HT');
  });

  it('shows FT for a finished match', () => {
    fixture.componentRef.setInput('match', { ...baseMatch, status: 'finished', minute: undefined });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('FT');
  });
});
