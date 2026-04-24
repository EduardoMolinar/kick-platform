import { TestBed } from '@angular/core/testing';
import type { Fixture } from '@platform/shared-types';
import { FixtureRow } from './fixture-row';

const sample: Fixture = {
  id: 'f1',
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  home: { id: 't1', name: 'Arsenal' },
  away: { id: 't2', name: 'Chelsea' },
  kickoffAt: '2026-04-26T14:00:00Z',
  matchday: 34,
};

describe('FixtureRow', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FixtureRow] }).compileComponents();
  });

  it('renders team names and formatted kickoff', () => {
    const fixture = TestBed.createComponent(FixtureRow);
    fixture.componentRef.setInput('fixture', sample);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Arsenal');
    expect(text).toContain('Chelsea');
    expect(text).toContain('MD 34');
    const time = fixture.nativeElement.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe('2026-04-26T14:00:00Z');
  });
});
