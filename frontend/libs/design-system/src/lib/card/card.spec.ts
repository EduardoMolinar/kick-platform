import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsCard } from './card';

describe('DsCard', () => {
  let component: DsCard;
  let fixture: ComponentFixture<DsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DsCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to raised variant', () => {
    expect(component.variant).toBe('raised');
    const root = fixture.nativeElement.querySelector('.ds-card');
    expect(root.classList.contains('ds-card--raised')).toBe(true);
  });

  it('should switch to flat variant', () => {
    fixture.componentRef.setInput('variant', 'flat');
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.ds-card');
    expect(root.classList.contains('ds-card--flat')).toBe(true);
  });
});
