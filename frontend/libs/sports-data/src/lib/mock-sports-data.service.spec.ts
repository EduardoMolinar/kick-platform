import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MockSportsDataService } from './mock-sports-data.service';

describe('MockSportsDataService', () => {
  let service: MockSportsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockSportsDataService] });
    service = TestBed.inject(MockSportsDataService);
  });

  it('emits the live-matches fixture', async () => {
    const matches = await firstValueFrom(service.getLiveMatches());
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((m) => m.id.length > 0)).toBe(true);
  });

  it('emits a known match by id', async () => {
    const match = await firstValueFrom(service.getMatch('m-ucl-001'));
    expect(match?.competition.code).toBe('UCL');
  });

  it('emits undefined for unknown id', async () => {
    const match = await firstValueFrom(service.getMatch('does-not-exist'));
    expect(match).toBeUndefined();
  });
});
