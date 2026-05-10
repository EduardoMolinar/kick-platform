import { TestBed } from '@angular/core/testing';
import type { Competition } from '@platform/shared-types';
import { CompetitionTile } from './competition-tile';

const sample: Competition = { id: 'ucl', name: 'Champions League', code: 'UCL' };

describe('CompetitionTile', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CompetitionTile] }).compileComponents();
  });

  it('renders competition code and name', () => {
    const fixture = TestBed.createComponent(CompetitionTile);
    fixture.componentRef.setInput('competition', sample);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('UCL');
    expect(text).toContain('Champions League');
  });
});
