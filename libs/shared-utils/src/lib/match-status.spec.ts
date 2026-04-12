import { isLive, isFinished, isScheduled, isPlayable } from './match-status';

describe('match-status helpers', () => {
  it('isLive returns true for live and half-time', () => {
    expect(isLive('live')).toBe(true);
    expect(isLive('half-time')).toBe(true);
    expect(isLive('finished')).toBe(false);
  });

  it('isFinished returns true only for finished', () => {
    expect(isFinished('finished')).toBe(true);
    expect(isFinished('live')).toBe(false);
  });

  it('isScheduled returns true only for scheduled', () => {
    expect(isScheduled('scheduled')).toBe(true);
    expect(isScheduled('live')).toBe(false);
  });

  it('isPlayable excludes postponed and cancelled', () => {
    expect(isPlayable('postponed')).toBe(false);
    expect(isPlayable('cancelled')).toBe(false);
    expect(isPlayable('live')).toBe(true);
    expect(isPlayable('finished')).toBe(true);
    expect(isPlayable('scheduled')).toBe(true);
  });
});
