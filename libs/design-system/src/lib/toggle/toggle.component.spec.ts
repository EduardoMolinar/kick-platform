import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ToggleComponent } from './toggle.component';

@Component({
  standalone: true,
  imports: [ToggleComponent],
  template: `
    <ds-toggle [checked]="checked" [disabled]="disabled"></ds-toggle>
  `,
})
class TestHost {
  checked = false;
  disabled = false;
}

@Component({
  standalone: true,
  imports: [ToggleComponent, ReactiveFormsModule],
  template: `<ds-toggle [formControl]="ctrl"></ds-toggle>`,
})
class ReactiveHost {
  ctrl = new FormControl(false);
}

describe('ToggleComponent', () => {
  describe('standalone (no form)', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;
    let toggleEl: HTMLElement;
    let button: HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
      fixture = TestBed.createComponent(TestHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
      toggleEl = fixture.debugElement.query(By.css('ds-toggle')).nativeElement;
      button = fixture.debugElement.query(By.css('button')).nativeElement;
    });

    it('renders a button with role="switch"', () => {
      expect(button.getAttribute('role')).toBe('switch');
    });

    it('sets aria-checked="false" when not checked', () => {
      expect(button.getAttribute('aria-checked')).toBe('false');
    });

    it('sets aria-checked="true" when checked', () => {
      host.checked = true;
      fixture.detectChanges();
      expect(button.getAttribute('aria-checked')).toBe('true');
    });

    it('applies ds-toggle--checked class when checked', () => {
      host.checked = true;
      fixture.detectChanges();
      expect(toggleEl.classList).toContain('ds-toggle--checked');
    });

    it('toggles checked state on click', () => {
      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-checked')).toBe('true');
    });

    it('does not toggle when disabled', () => {
      host.disabled = true;
      fixture.detectChanges();
      button.click();
      fixture.detectChanges();
      expect(button.getAttribute('aria-checked')).toBe('false');
    });

    it('applies ds-toggle--disabled class when disabled', () => {
      host.disabled = true;
      fixture.detectChanges();
      expect(toggleEl.classList).toContain('ds-toggle--disabled');
    });
  });

  describe('reactive form integration', () => {
    let fixture: ComponentFixture<ReactiveHost>;
    let host: ReactiveHost;
    let button: HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [ReactiveHost] }).compileComponents();
      fixture = TestBed.createComponent(ReactiveHost);
      host = fixture.componentInstance;
      fixture.detectChanges();
      button = fixture.debugElement.query(By.css('button')).nativeElement;
    });

    it('reflects initial form control value (false)', () => {
      expect(button.getAttribute('aria-checked')).toBe('false');
    });

    it('updates the form control value when clicked', () => {
      button.click();
      fixture.detectChanges();
      expect(host.ctrl.value).toBe(true);
    });

    it('reflects form control value when set programmatically', () => {
      host.ctrl.setValue(true);
      fixture.detectChanges();
      expect(button.getAttribute('aria-checked')).toBe('true');
    });

    it('disables the toggle when the form control is disabled', () => {
      host.ctrl.disable();
      fixture.detectChanges();
      expect(button.disabled).toBe(true);
    });
  });
});
