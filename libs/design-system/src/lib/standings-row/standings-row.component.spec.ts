import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StandingsRowComponent } from './standings-row.component';

describe('StandingsRowComponent', () => {
  let fixture: ComponentFixture<StandingsRowComponent>;
  let component: StandingsRowComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandingsRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StandingsRowComponent);
    component = fixture.componentInstance;
    component.position = 1;
    component.teamName = 'Real Madrid';
    component.played = 28;
    component.won = 21;
    component.drawn = 4;
    component.lost = 3;
    component.goalsFor = 64;
    component.goalsAgainst = 22;
    component.points = 67;
    component.form = ['W', 'W', 'D', 'W', 'L'];
    fixture.detectChanges();
  });

  it('renders the team name', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Real Madrid');
  });

  it('renders points', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('67');
  });

  it('calculates goal difference correctly', () => {
    expect(component.goalDifference).toBe(42);
  });

  it('shows + prefix for positive goal difference', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('+42');
  });

  it('applies highlighted class', () => {
    component.highlighted = true;
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList).toContain('ds-standings-row--highlighted');
  });

  it('applies zone class', () => {
    component.zone = 'cl';
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList).toContain('ds-standings-row--zone-cl');
  });

  it('builds aria-label with full context', () => {
    const label = component.rowAriaLabel;
    expect(label).toContain('Position 1');
    expect(label).toContain('Real Madrid');
    expect(label).toContain('Points 67');
  });

  it('includes zone in aria-label', () => {
    component.zone = 'cl';
    fixture.detectChanges();
    const label = component.rowAriaLabel;
    expect(label).toContain('Champions League zone');
  });

  it('shows only up to 5 form results', () => {
    component.form = ['W', 'W', 'D', 'W', 'L', 'W', 'W'];
    fixture.detectChanges();
    const dots = fixture.nativeElement.querySelectorAll('.ds-standings-row__form-dot');
    expect(dots.length).toBe(5);
  });
});
