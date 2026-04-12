import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;
  let component: BadgeComponent;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders with role="status"', () => {
    expect(host.getAttribute('role')).toBe('status');
  });

  it('defaults to comp variant', () => {
    expect(host.classList).toContain('ds-badge--comp');
  });

  it('applies live class for live variant', () => {
    component.variant = 'live';
    fixture.detectChanges();
    expect(host.classList).toContain('ds-badge--live');
  });

  it('renders pulse dot only for live variant', () => {
    fixture.componentRef.setInput('variant', 'live');
    fixture.detectChanges();
    const dot = fixture.debugElement.query(By.css('.ds-badge__dot'));
    expect(dot).toBeTruthy();
  });

  it('does not render pulse dot for comp variant', () => {
    component.variant = 'comp';
    fixture.detectChanges();
    const dot = fixture.debugElement.query(By.css('.ds-badge__dot'));
    expect(dot).toBeNull();
  });

  it('applies result class', () => {
    component.variant = 'result';
    fixture.detectChanges();
    expect(host.classList).toContain('ds-badge--result');
  });

  it('applies zone-cl class', () => {
    component.variant = 'zone-cl';
    fixture.detectChanges();
    expect(host.classList).toContain('ds-badge--zone-cl');
  });

  it('applies zone-rel class', () => {
    component.variant = 'zone-rel';
    fixture.detectChanges();
    expect(host.classList).toContain('ds-badge--zone-rel');
  });
});
