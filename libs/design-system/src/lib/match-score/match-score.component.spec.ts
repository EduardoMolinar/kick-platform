import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatchScoreComponent } from './match-score.component';

describe('MatchScoreComponent', () => {
  let fixture: ComponentFixture<MatchScoreComponent>;
  let component: MatchScoreComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchScoreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchScoreComponent);
    component = fixture.componentInstance;
    component.homeTeam = 'Real Madrid';
    component.awayTeam = 'Bayern München';
    fixture.detectChanges();
  });

  it('renders both team names', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Real Madrid');
    expect(text).toContain('Bayern München');
  });

  it('shows vs for scheduled matches', () => {
    component.status = 'scheduled';
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('vs');
  });

  it('shows score when status is live', () => {
    fixture.componentRef.setInput('status', 'live');
    fixture.componentRef.setInput('homeScore', 2);
    fixture.componentRef.setInput('awayScore', 1);
    fixture.componentRef.setInput('minute', 73);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('2');
    expect(text).toContain('1');
  });

  it('shows LIVE badge when status is live', () => {
    fixture.componentRef.setInput('status', 'live');
    fixture.componentRef.setInput('homeScore', 0);
    fixture.componentRef.setInput('awayScore', 0);
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('ds-badge'));
    expect(badge).toBeTruthy();
  });

  it('shows FT label when match is finished', () => {
    fixture.componentRef.setInput('status', 'finished');
    fixture.componentRef.setInput('homeScore', 2);
    fixture.componentRef.setInput('awayScore', 1);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('FT');
  });

  it('applies featured size class', () => {
    component.size = 'featured';
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList).toContain('ds-match-score--featured');
  });

  it('builds accessible aria-label for live match', () => {
    component.status = 'live';
    component.homeScore = 2;
    component.awayScore = 1;
    component.minute = 73;
    fixture.detectChanges();
    const label = component.scoreAriaLabel;
    expect(label).toContain('Real Madrid 2');
    expect(label).toContain('Bayern München 1');
    expect(label).toContain('live');
    expect(label).toContain('73′');
  });
});
