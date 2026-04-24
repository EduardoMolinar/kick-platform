import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CompetitionList } from './competition-list';

describe('CompetitionList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionList],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders four competition links pointing to /competition/<id>', () => {
    const fixture = TestBed.createComponent(CompetitionList);
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a[href]');
    expect(links.length).toBe(4);

    const hrefs = Array.from(links).map((el) => (el as HTMLAnchorElement).getAttribute('href'));
    expect(hrefs).toEqual([
      '/competition/ucl',
      '/competition/pl',
      '/competition/liga',
      '/competition/int',
    ]);
  });
});
