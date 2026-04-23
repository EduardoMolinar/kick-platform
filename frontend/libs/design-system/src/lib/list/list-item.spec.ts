import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsListItem } from './list-item';

describe('DsListItem', () => {
  let component: DsListItem;
  let fixture: ComponentFixture<DsListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DsListItem] }).compileComponents();
    fixture = TestBed.createComponent(DsListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
