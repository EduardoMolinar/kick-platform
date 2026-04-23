import { Competition, Team } from './shared-types';
import { MatchSummary } from './match';

describe('shared-types', () => {
  it('should accept a valid Team shape', () => {
    const team: Team = { id: 't1', name: 'Real Madrid' };
    expect(team.id).toBe('t1');
  });

  it('should accept a valid Competition shape', () => {
    const competition: Competition = { id: 'ucl', name: 'Champions League', code: 'UCL' };
    expect(competition.code).toBe('UCL');
  });

  it('should accept a valid MatchSummary shape', () => {
    const match: MatchSummary = {
      id: 'm1',
      competition: { id: 'ucl', name: 'Champions League', code: 'UCL' },
      status: 'live',
      home: { team: { id: 't1', name: 'Real Madrid' }, score: 1 },
      away: { team: { id: 't2', name: 'Manchester City' }, score: 1 },
      kickoffAt: '2026-04-22T19:00:00Z',
      minute: 67,
    };
    expect(match.status).toBe('live');
    expect(match.home.score + match.away.score).toBe(2);
  });
});
