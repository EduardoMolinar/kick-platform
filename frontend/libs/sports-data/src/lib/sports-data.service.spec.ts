import { SPORTS_DATA_SERVICE } from './sports-data.service';

describe('SportsDataService contract', () => {
  it('exports a DI token', () => {
    expect(SPORTS_DATA_SERVICE.toString()).toContain('SPORTS_DATA_SERVICE');
  });
});
