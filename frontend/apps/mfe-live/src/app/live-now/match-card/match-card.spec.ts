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

  it('shows HALF TIME for a halftime match', () => {
    fixture.componentRef.setInput('match', { ...baseMatch, status: 'halftime' });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('HALF TIME');
  });

  it('shows FULL TIME for a finished match', () => {
    fixture.componentRef.setInput('match', { ...baseMatch, status: 'finished', minute: undefined });
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('FULL TIME');
  });

  it('applies the competition-keyed class', () => {
    const article = fixture.nativeElement.querySelector('article');
    expect(article.className).toContain('match-card--pl');
  });

  it('applies the featured class when [featured]=true', () => {
    fixture.componentRef.setInput('featured', true);
    fixture.detectChanges();
    const article = fixture.nativeElement.querySelector('article');
    expect(article.className).toContain('match-card--featured');
  });

  it('shows Follow buttons for both teams by default', () => {
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button.match-card__follow');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent?.trim()).toBe('Follow');
    expect(buttons[1].textContent?.trim()).toBe('Follow');
  });

  it('shows Following when homeFollowing is true', () => {
    fixture.componentRef.setInput('homeFollowing', true);
    fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button.match-card__follow');
    expect(buttons[0].textContent?.trim()).toBe('Following');
  });

  it('emits homeFollowToggle when home follow button is clicked', () => {
    const emitSpy = jest.spyOn(fixture.componentInstance.homeFollowToggle, 'emit');
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button.match-card__follow');
    buttons[0].click();
    expect(emitSpy).toHaveBeenCalled();
  });
});
