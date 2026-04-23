import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsTopNav } from './top-nav';

describe('DsTopNav', () => {
  let component: DsTopNav;
  let fixture: ComponentFixture<DsTopNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DsTopNav],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DsTopNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to an empty items list', () => {
    expect(component.items.length).toBe(0);
  });
});
