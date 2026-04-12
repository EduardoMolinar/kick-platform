import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ShellLayoutComponent } from './shell-layout.component';

describe('ShellLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellLayoutComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ShellLayoutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render all nav items', () => {
    const fixture = TestBed.createComponent(ShellLayoutComponent);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('.sidebar__nav-link');
    expect(links.length).toBe(5);
  });

  it('should not show avatar when unauthenticated', () => {
    const fixture = TestBed.createComponent(ShellLayoutComponent);
    fixture.detectChanges();
    const avatar = fixture.nativeElement.querySelector('ds-avatar');
    expect(avatar).toBeNull();
  });
});
