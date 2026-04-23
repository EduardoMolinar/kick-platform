import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsButton } from './button';

describe('DsButton', () => {
  let component: DsButton;
  let fixture: ComponentFixture<DsButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsButton],
    }).compileComponents();

    fixture = TestBed.createComponent(DsButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to the primary variant', () => {
    expect(component.variant).toBe('primary');
  });

  it('should not be disabled by default', () => {
    expect(component.disabled).toBe(false);
  });
});
