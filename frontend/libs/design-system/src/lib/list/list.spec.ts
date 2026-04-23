import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsList } from './list';

describe('DsList', () => {
  let component: DsList;
  let fixture: ComponentFixture<DsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsList] }).compileComponents();
    fixture = TestBed.createComponent(DsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a <ul> with role="list"', () => {
    const ul = fixture.nativeElement.querySelector('ul.ds-list');
    expect(ul).toBeTruthy();
    expect(ul.getAttribute('role')).toBe('list');
  });
});
