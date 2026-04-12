import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PillComponent } from './pill.component';

@Component({
  standalone: true,
  imports: [PillComponent],
  template: `
    <ds-pill [active]="active" (activated)="onActivated()">All</ds-pill>
  `,
})
class TestHost {
  active = false;
  onActivated = jest.fn();
}

describe('PillComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let pill: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    pill = fixture.debugElement.query(By.css('ds-pill')).nativeElement;
  });

  it('renders with role="tab"', () => {
    expect(pill.getAttribute('role')).toBe('tab');
  });

  it('is focusable via keyboard (tabindex=0)', () => {
    expect(pill.getAttribute('tabindex')).toBe('0');
  });

  it('sets aria-selected="false" when not active', () => {
    expect(pill.getAttribute('aria-selected')).toBe('false');
  });

  it('sets aria-selected="true" when active', () => {
    host.active = true;
    fixture.detectChanges();
    expect(pill.getAttribute('aria-selected')).toBe('true');
  });

  it('applies ds-pill--active class when active', () => {
    host.active = true;
    fixture.detectChanges();
    expect(pill.classList).toContain('ds-pill--active');
  });

  it('emits activated on click', () => {
    pill.click();
    expect(host.onActivated).toHaveBeenCalledTimes(1);
  });

  it('emits activated on Enter keydown', () => {
    pill.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(host.onActivated).toHaveBeenCalledTimes(1);
  });
});
