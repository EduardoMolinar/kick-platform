import { formatMinute } from './format-minute';

describe('formatMinute', () => {
  it('returns minute with prime symbol for live matches', () => {
    expect(formatMinute('live', 73)).toBe("73′");
  });

  it('returns LIVE for live matches without a minute', () => {
    expect(formatMinute('live')).toBe('LIVE');
  });

  it('returns HT for half-time', () => {
    expect(formatMinute('half-time')).toBe('HT');
  });

  it('returns FT for finished', () => {
    expect(formatMinute('finished')).toBe('FT');
  });

  it('returns empty string for scheduled', () => {
    expect(formatMinute('scheduled')).toBe('');
  });

  it('returns PPD for postponed', () => {
    expect(formatMinute('postponed')).toBe('PPD');
  });
});
