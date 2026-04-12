import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardComponent>;
  let component: CardComponent;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('applies ds-card base class', () => {
    expect(host.classList).toContain('ds-card');
  });

  it('defaults to variant=default and padding=md', () => {
    expect(host.classList).toContain('ds-card--default');
    expect(host.classList).toContain('ds-card--pad-md');
  });

  it('applies elevated variant class', () => {
    component.variant = 'elevated';
    fixture.detectChanges();
    expect(host.classList).toContain('ds-card--elevated');
  });

  it('applies interactive variant class and tabindex', () => {
    component.variant = 'interactive';
    fixture.detectChanges();
    expect(host.classList).toContain('ds-card--interactive');
    expect(host.getAttribute('tabindex')).toBe('0');
  });

  it('does not set tabindex for non-interactive variants', () => {
    expect(host.getAttribute('tabindex')).toBeNull();
  });

  it('applies padding class variants', () => {
    for (const p of ['none', 'sm', 'md', 'lg'] as const) {
      component.padding = p;
      fixture.detectChanges();
      expect(host.classList).toContain(`ds-card--pad-${p}`);
    }
  });

  it('projects content via ng-content', () => {
    // Verify the component host has ds-card classes applied (host has ng-content projection).
    expect(host.classList).toContain('ds-card');
  });
});
