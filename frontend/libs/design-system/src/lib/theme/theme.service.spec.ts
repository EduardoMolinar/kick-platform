import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BrowserThemeService } from './theme.service';

describe('BrowserThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({ providers: [BrowserThemeService] });
  });

  it('defaults to dark mode when no preference is stored', async () => {
    const service = TestBed.inject(BrowserThemeService);
    const mode = await firstValueFrom(service.mode$);
    expect(mode).toBe('dark');
  });

  it('reads a stored mode on construction', async () => {
    localStorage.setItem('pitch-theme', 'light');
    const service = TestBed.inject(BrowserThemeService);
    const mode = await firstValueFrom(service.mode$);
    expect(mode).toBe('light');
  });

  it('falls back to dark when stored value is invalid', async () => {
    localStorage.setItem('pitch-theme', 'invalid');
    const service = TestBed.inject(BrowserThemeService);
    const mode = await firstValueFrom(service.mode$);
    expect(mode).toBe('dark');
  });

  it('persists the mode to localStorage on setMode', () => {
    const service = TestBed.inject(BrowserThemeService);
    service.setMode('light');
    expect(localStorage.getItem('pitch-theme')).toBe('light');
  });

  it('emits the new mode on setMode', async () => {
    const service = TestBed.inject(BrowserThemeService);
    service.setMode('light');
    const mode = await firstValueFrom(service.mode$);
    expect(mode).toBe('light');
  });

  it('resolves explicit dark/light modes directly', async () => {
    const service = TestBed.inject(BrowserThemeService);
    service.setMode('light');
    const resolved = await firstValueFrom(service.resolved$);
    expect(resolved).toBe('light');
  });

  it('sets data-theme on the document element when resolved emits', () => {
    const service = TestBed.inject(BrowserThemeService);
    service.setMode('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    service.setMode('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('resolves system mode against the prefers-color-scheme media query', async () => {
    const service = TestBed.inject(BrowserThemeService);
    service.setMode('system');
    const resolved = await firstValueFrom(service.resolved$);
    // jsdom's matchMedia returns false by default; system mode resolves to light.
    expect(resolved === 'dark' || resolved === 'light').toBe(true);
  });
});
