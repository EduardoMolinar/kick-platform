import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatBarComponent } from './stat-bar.component';

describe('StatBarComponent', () => {
  let fixture: ComponentFixture<StatBarComponent>;
  let component: StatBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatBarComponent);
    component = fixture.componentInstance;
    component.label = 'Possession';
    component.homeValue = 42;
    component.awayValue = 58;
    component.unit = '%';
    fixture.detectChanges();
  });

  it('renders the stat label', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Possession');
  });

  it('renders home and away values', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('42%');
    expect(text).toContain('58%');
  });

  it('calculates homePercent correctly', () => {
    expect(component.homePercent).toBe(42);
  });

  it('calculates awayPercent as remainder', () => {
    expect(component.awayPercent).toBe(58);
  });

  it('does not divide by zero when both values are 0', () => {
    component.homeValue = 0;
    component.awayValue = 0;
    expect(component.homePercent).toBe(0);
    expect(component.awayPercent).toBe(100);
  });

  it('builds accessible aria-label', () => {
    const label = component.rowAriaLabel;
    expect(label).toContain('Possession');
    expect(label).toContain('42%');
    expect(label).toContain('58%');
  });

  it('rounds percentages for count-based stats', () => {
    component.homeValue = 8;
    component.awayValue = 12;
    component.unit = '';
    fixture.detectChanges();
    expect(component.homePercent + component.awayPercent).toBe(100);
  });
});
