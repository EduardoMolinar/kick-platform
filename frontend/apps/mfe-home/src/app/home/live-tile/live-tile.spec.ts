import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { MatchSummary } from '@platform/shared-types';
import { LiveTile } from './live-tile';

const baseMatch: MatchSummary = {
  id: 'm-test',
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  status: 'live',
  home: { team: { id: 't1', name: 'Arsenal', shortName: 'ARS' }, score: 2 },
  away: { team: { id: 't2', name: 'Liverpool', shortName: 'LIV' }, score: 0 },
  kickoffAt: '2026-04-22T18:30:00Z',
  minute: 67,
};

describe('LiveTile', () => {
  let fixture: ComponentFixture<LiveTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LiveTile] }).compileComponents();
    fixture = TestBed.createComponent(LiveTile);
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

  it("shows LIVE 67' for a live match", () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain("LIVE 67'");
  });

  it('shows HALF TIME for a halftime match', () => {
    fixture.componentRef.setInput('match', { ...baseMatch, status: 'halftime' });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('HALF TIME');
  });

  it('applies the competition-keyed class', () => {
    const article = fixture.nativeElement.querySelector('article');
    expect(article.className).toContain('live-tile--pl');
  });

  it('applies the featured class when [featured]=true', () => {
    fixture.componentRef.setInput('featured', true);
    fixture.detectChanges();
    const article = fixture.nativeElement.querySelector('article');
    expect(article.className).toContain('live-tile--featured');
  });

  it('renders the hero layout (team-name elements) when featured', () => {
    fixture.componentRef.setInput('featured', true);
    fixture.detectChanges();
    const heroNames = fixture.nativeElement.querySelectorAll('.live-tile__team-name');
    expect(heroNames.length).toBe(2);
  });
});
