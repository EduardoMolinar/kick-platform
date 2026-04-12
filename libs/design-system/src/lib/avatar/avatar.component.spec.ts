import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let component: AvatarComponent;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AvatarComponent] }).compileComponents();
    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement;
  });

  describe('initials rendering', () => {
    beforeEach(() => {
      component.initials = 'Eduardo';
      fixture.detectChanges();
    });

    it('renders with role="img"', () => {
      expect(host.getAttribute('role')).toBe('img');
    });

    it('truncates initials to 2 characters, uppercase', () => {
      const span = fixture.debugElement.query(By.css('.ds-avatar__initials'));
      expect(span.nativeElement.textContent.trim()).toBe('ED');
    });

    it('does not render img element when src is not set', () => {
      const img = fixture.debugElement.query(By.css('.ds-avatar__img'));
      expect(img).toBeNull();
    });

    it('defaults to md size', () => {
      expect(host.classList).toContain('ds-avatar--md');
    });
  });

  describe('size variants', () => {
    it('applies sm class', () => {
      component.initials = 'E';
      component.size = 'sm';
      fixture.detectChanges();
      expect(host.classList).toContain('ds-avatar--sm');
    });

    it('applies lg class', () => {
      component.initials = 'E';
      component.size = 'lg';
      fixture.detectChanges();
      expect(host.classList).toContain('ds-avatar--lg');
    });
  });

  describe('image rendering', () => {
    beforeEach(() => {
      component.initials = 'E';
      component.src = 'https://example.com/avatar.jpg';
      fixture.detectChanges();
    });

    it('renders img element when src is provided', () => {
      const img = fixture.debugElement.query(By.css('.ds-avatar__img'));
      expect(img).toBeTruthy();
    });

    it('falls back to initials on image error', () => {
      const img = fixture.debugElement.query(By.css('.ds-avatar__img'));
      img.nativeElement.dispatchEvent(new Event('error'));
      fixture.detectChanges();
      const span = fixture.debugElement.query(By.css('.ds-avatar__initials'));
      expect(span).toBeTruthy();
    });
  });
});
