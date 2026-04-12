import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;
  let component: IconComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    component.name = 'home';
    fixture.detectChanges();
  });

  it('renders an svg element', () => {
    const svg = fixture.debugElement.query(By.css('svg'));
    expect(svg).toBeTruthy();
  });

  it('applies the correct size attribute to the svg', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const svg = fixture.debugElement.query(By.css('svg')).nativeElement as SVGElement;
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });

  it('defaults to md size (20px)', () => {
    const svg = fixture.debugElement.query(By.css('svg')).nativeElement as SVGElement;
    expect(svg.getAttribute('width')).toBe('20');
  });

  it('is aria-hidden when no label is provided', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();
  });

  it('gets role=img and aria-label when label is provided', () => {
    component.label = 'Home';
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.getAttribute('aria-hidden')).toBeNull();
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Home');
  });

  it('applies ds-icon host class with size modifier', () => {
    component.size = 'sm';
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList).toContain('ds-icon');
    expect(host.classList).toContain('ds-icon--sm');
  });
});
