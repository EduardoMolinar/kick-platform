import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

// Wrapper host components make it easy to test different attribute combos.
@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<button dsButton>Primary</button>`,
})
class PrimaryHost {}

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<button dsButton="ghost" size="sm">Ghost</button>`,
})
class GhostSmHost {}

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<button dsButton [disabled]="true">Disabled</button>`,
})
class DisabledHost {}

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `<a dsButton="ghost" href="#">Link</a>`,
})
class LinkHost {}

describe('ButtonComponent', () => {
  describe('primary / default', () => {
    let fixture: ComponentFixture<PrimaryHost>;
    let button: HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [PrimaryHost] }).compileComponents();
      fixture = TestBed.createComponent(PrimaryHost);
      fixture.detectChanges();
      button = fixture.debugElement.query(By.css('button')).nativeElement;
    });

    it('renders a native button element', () => {
      expect(button.tagName).toBe('BUTTON');
    });

    it('applies ds-button and ds-button--primary classes', () => {
      expect(button.classList).toContain('ds-button');
      expect(button.classList).toContain('ds-button--primary');
    });

    it('defaults to size md', () => {
      expect(button.classList).toContain('ds-button--md');
    });

    it('is not disabled', () => {
      expect(button.disabled).toBe(false);
    });
  });

  describe('ghost sm', () => {
    let button: HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [GhostSmHost] }).compileComponents();
      const fixture = TestBed.createComponent(GhostSmHost);
      fixture.detectChanges();
      button = fixture.debugElement.query(By.css('button')).nativeElement;
    });

    it('applies ghost and sm classes', () => {
      expect(button.classList).toContain('ds-button--ghost');
      expect(button.classList).toContain('ds-button--sm');
    });
  });

  describe('disabled state', () => {
    let button: HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [DisabledHost] }).compileComponents();
      const fixture = TestBed.createComponent(DisabledHost);
      fixture.detectChanges();
      button = fixture.debugElement.query(By.css('button')).nativeElement;
    });

    it('sets native disabled attribute', () => {
      expect(button.disabled).toBe(true);
    });
  });

  describe('link variant', () => {
    let anchor: HTMLAnchorElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [LinkHost] }).compileComponents();
      const fixture = TestBed.createComponent(LinkHost);
      fixture.detectChanges();
      anchor = fixture.debugElement.query(By.css('a')).nativeElement;
    });

    it('renders an anchor element with button classes', () => {
      expect(anchor.tagName).toBe('A');
      expect(anchor.classList).toContain('ds-button');
      expect(anchor.classList).toContain('ds-button--ghost');
    });
  });
});
