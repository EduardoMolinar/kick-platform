import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { TeamCompetitionStanding } from '@platform/shared-types';
import { TeamStandingsCard } from './team-standings-card';

const entry: TeamCompetitionStanding = {
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  row: {
    position: 1,
    team: { id: 't-ars', name: 'Arsenal' },
    played: 33,
    won: 24,
    drawn: 6,
    lost: 3,
    goalsFor: 75,
    goalsAgainst: 28,
    goalDifference: 47,
    points: 78,
  },
};

describe('TeamStandingsCard', () => {
  let fixture: ComponentFixture<TeamStandingsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TeamStandingsCard] }).compileComponents();
    fixture = TestBed.createComponent(TeamStandingsCard);
    fixture.componentRef.setInput('entry', entry);
    fixture.detectChanges();
  });

  it('renders competition name, position, and points', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Premier League');
    expect(text).toContain('1');
    expect(text).toContain('Pts');
    expect(text).toContain('78');
  });

  it('applies the competition-keyed class', () => {
    const article = fixture.nativeElement.querySelector('article');
    expect(article.className).toContain('team-standings-card--pl');
  });

  it('renders +47 for positive goal difference', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('+47');
  });
});
