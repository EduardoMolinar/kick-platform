import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerComponent>;
  let component: SpinnerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the arc element', () => {
    const arc = fixture.nativeElement.querySelector('.ds-spinner__arc');
    expect(arc).toBeTruthy();
  });

  it('has role="status" and aria-live="polite"', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');
  });

  it('defaults aria-label to "Loading"', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-label')).toBe('Loading');
  });

  it('reflects custom label', () => {
    component.label = 'Loading fixtures';
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-label')).toBe('Loading fixtures');
  });

  it('applies size class modifier', () => {
    component.size = 'lg';
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList).toContain('ds-spinner--lg');
  });

  it('defaults to md size', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList).toContain('ds-spinner--md');
  });
});
