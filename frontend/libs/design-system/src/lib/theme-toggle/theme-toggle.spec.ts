import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsThemeToggle } from './theme-toggle';

describe('DsThemeToggle', () => {
  let fixture: ComponentFixture<DsThemeToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsThemeToggle],
    }).compileComponents();
    fixture = TestBed.createComponent(DsThemeToggle);
  });

  it('renders three mode buttons', () => {
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll(
      'button.ds-theme-toggle__btn'
    );
    expect(buttons.length).toBe(3);
  });

  it('marks the active mode with aria-pressed and the active class', () => {
    fixture.componentRef.setInput('mode', 'light');
    fixture.detectChanges();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button.ds-theme-toggle__btn')
    );
    // Order in template: light, system, dark
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[2].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[0].classList).toContain('ds-theme-toggle__btn--active');
  });

  it('emits modeChange when a different mode is clicked', () => {
    fixture.componentRef.setInput('mode', 'dark');
    fixture.detectChanges();
    const emitSpy = jest.spyOn(fixture.componentInstance.modeChange, 'emit');
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button.ds-theme-toggle__btn')
    );
    buttons[0].click(); // light
    expect(emitSpy).toHaveBeenCalledWith('light');
  });

  it('does not emit when the active mode is clicked again', () => {
    fixture.componentRef.setInput('mode', 'dark');
    fixture.detectChanges();
    const emitSpy = jest.spyOn(fixture.componentInstance.modeChange, 'emit');
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button.ds-theme-toggle__btn')
    );
    buttons[2].click(); // dark = current
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
