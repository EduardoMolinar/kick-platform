import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Fixture } from '@platform/shared-types';
import { FixtureTile } from './fixture-tile';

const baseFixture: Fixture = {
  id: 'f-test',
  competition: { id: 'pl', name: 'Premier League', code: 'PL' },
  home: { id: 't1', name: 'Arsenal' },
  away: { id: 't2', name: 'Liverpool' },
  kickoffAt: '2026-05-01T19:45:00Z',
};

describe('FixtureTile', () => {
  let fixture: ComponentFixture<FixtureTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FixtureTile] }).compileComponents();
    fixture = TestBed.createComponent(FixtureTile);
    fixture.componentRef.setInput('fixture', baseFixture);
    fixture.detectChanges();
  });

  it('renders both team names', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Arsenal');
    expect(text).toContain('Liverpool');
  });

  it('renders competition code', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('PL');
  });
});
