import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Team } from '@platform/shared-types';
import { TeamTile } from './team-tile';

const sample: Team = { id: 't-ars', name: 'Arsenal', shortName: 'ARS' };

describe('TeamTile', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamTile],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders team name and short name', () => {
    const fixture = TestBed.createComponent(TeamTile);
    fixture.componentRef.setInput('team', sample);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Arsenal');
    expect(text).toContain('ARS');
  });

  it('links team name to the team detail page', () => {
    const fixture = TestBed.createComponent(TeamTile);
    fixture.componentRef.setInput('team', sample);
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.team-tile__link');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/team/t-ars');
  });
});
