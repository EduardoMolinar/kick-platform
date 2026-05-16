import { Competition, Team } from './shared-types';
import { MatchEvent, MatchSummary } from './match';
import { Fixture } from './fixture';
import { Standing, StandingRow } from './standings';
import { TeamCompetitionStanding } from './team-standing';

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

  it('should accept a valid Fixture shape', () => {
    const fixture: Fixture = {
      id: 'f1',
      competition: { id: 'pl', name: 'Premier League', code: 'PL' },
      home: { id: 't1', name: 'Arsenal' },
      away: { id: 't2', name: 'Liverpool' },
      kickoffAt: '2026-04-25T15:00:00Z',
      matchday: 34,
    };
    expect(fixture.id).toBe('f1');
    expect(fixture.matchday).toBe(34);
  });

  it('should accept a valid Standing shape', () => {
    const row: StandingRow = {
      position: 1,
      team: { id: 't1', name: 'Arsenal' },
      played: 10,
      won: 8,
      drawn: 1,
      lost: 1,
      goalsFor: 24,
      goalsAgainst: 8,
      goalDifference: 16,
      points: 25,
    };
    const standing: Standing = {
      competition: { id: 'pl', name: 'Premier League', code: 'PL' },
      rows: [row],
      updatedAt: '2026-04-22T00:00:00Z',
    };
    expect(standing.rows.length).toBe(1);
    expect(standing.rows[0].points).toBe(25);
  });

  it('should accept a valid TeamCompetitionStanding shape', () => {
    const row: StandingRow = {
      position: 2,
      team: { id: 't-ars', name: 'Arsenal' },
      played: 12,
      won: 9,
      drawn: 1,
      lost: 2,
      goalsFor: 28,
      goalsAgainst: 10,
      goalDifference: 18,
      points: 28,
    };
    const entry: TeamCompetitionStanding = {
      competition: { id: 'pl', name: 'Premier League', code: 'PL' },
      row,
    };
    expect(entry.row.position).toBe(2);
    expect(entry.competition.code).toBe('PL');
  });

  it('should accept a valid MatchEvent shape', () => {
    const goal: MatchEvent = {
      minute: 23,
      type: 'goal',
      side: 'home',
      player: 'K. Mbappé',
      assist: 'J. Bellingham',
    };
    const sub: MatchEvent = {
      minute: 75,
      type: 'substitution',
      side: 'away',
      player: 'J. Doku',
      playerOut: 'P. Foden',
    };
    expect(goal.type).toBe('goal');
    expect(sub.playerOut).toBe('P. Foden');
  });
});
