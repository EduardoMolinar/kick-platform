import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { MatchEvent } from '@platform/shared-types';
import { MatchEventRow } from './match-event-row';

describe('MatchEventRow', () => {
  let fixture: ComponentFixture<MatchEventRow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MatchEventRow] }).compileComponents();
    fixture = TestBed.createComponent(MatchEventRow);
  });

  it('renders the minute and player for a goal with assist', () => {
    const event: MatchEvent = {
      minute: 23,
      type: 'goal',
      side: 'home',
      player: 'K. Mbappé',
      assist: 'J. Bellingham',
    };
    fixture.componentRef.setInput('event', event);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain("23'");
    expect(text).toContain('K. Mbappé');
    expect(text).toContain('J. Bellingham');
  });

  it('renders +addedTime for stoppage-time events', () => {
    const event: MatchEvent = {
      minute: 45,
      addedTime: 2,
      type: 'yellow-card',
      side: 'away',
      player: 'C. Romero',
    };
    fixture.componentRef.setInput('event', event);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain("45+2'");
  });

  it('shows the "on for" label for substitutions', () => {
    const event: MatchEvent = {
      minute: 64,
      type: 'substitution',
      side: 'home',
      player: 'F. Valverde',
      playerOut: 'L. Modrić',
    };
    fixture.componentRef.setInput('event', event);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('on for L. Modrić');
  });

  it('applies the side-keyed class', () => {
    const event: MatchEvent = {
      minute: 14,
      type: 'goal',
      side: 'away',
      player: 'L. Messi',
    };
    fixture.componentRef.setInput('event', event);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.event-row');
    expect(root.className).toContain('event-row--away');
    expect(root.className).toContain('event-row--goal');
  });
});
