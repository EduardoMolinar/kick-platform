import { Competition, Team } from './shared-types';

describe('shared-types', () => {
  it('should accept a valid Team shape', () => {
    const team: Team = { id: 't1', name: 'Real Madrid' };
    expect(team.id).toBe('t1');
  });

  it('should accept a valid Competition shape', () => {
    const competition: Competition = { id: 'ucl', name: 'Champions League', code: 'UCL' };
    expect(competition.code).toBe('UCL');
  });
});
