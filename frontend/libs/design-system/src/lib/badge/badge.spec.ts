import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsBadge } from './badge';

describe('DsBadge', () => {
  let component: DsBadge;
  let fixture: ComponentFixture<DsBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsBadge] }).compileComponents();
    fixture = TestBed.createComponent(DsBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to neutral variant', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.ds-badge');
    expect(el.classList.contains('ds-badge--neutral')).toBe(true);
  });

  it('applies live variant class when switched', () => {
    fixture.componentRef.setInput('variant', 'live');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector('.ds-badge');
    expect(el.classList.contains('ds-badge--live')).toBe(true);
  });
});
