import type { MatchSummary } from '@platform/shared-types';

export const LIVE_MATCHES_FIXTURE: readonly MatchSummary[] = [
  {
    id: 'm-ucl-001',
    competition: { id: 'ucl', name: 'Champions League', code: 'UCL' },
    status: 'live',
    home: { team: { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' }, score: 1 },
    away: { team: { id: 't-mci', name: 'Manchester City', shortName: 'MCI' }, score: 1 },
    kickoffAt: '2026-04-22T19:00:00Z',
    minute: 67,
  },
  {
    id: 'm-pl-014',
    competition: { id: 'pl', name: 'Premier League', code: 'PL' },
    status: 'live',
    home: { team: { id: 't-ars', name: 'Arsenal', shortName: 'ARS' }, score: 2 },
    away: { team: { id: 't-liv', name: 'Liverpool', shortName: 'LIV' }, score: 0 },
    kickoffAt: '2026-04-22T18:30:00Z',
    minute: 54,
  },
  {
    id: 'm-pl-015',
    competition: { id: 'pl', name: 'Premier League', code: 'PL' },
    status: 'halftime',
    home: { team: { id: 't-che', name: 'Chelsea', shortName: 'CHE' }, score: 0 },
    away: { team: { id: 't-tot', name: 'Tottenham', shortName: 'TOT' }, score: 0 },
    kickoffAt: '2026-04-22T18:45:00Z',
    minute: 45,
  },
  {
    id: 'm-liga-007',
    competition: { id: 'liga', name: 'La Liga', code: 'LIGA' },
    status: 'live',
    home: { team: { id: 't-fcb', name: 'FC Barcelona', shortName: 'FCB' }, score: 3 },
    away: { team: { id: 't-atl', name: 'Atlético Madrid', shortName: 'ATM' }, score: 2 },
    kickoffAt: '2026-04-22T19:15:00Z',
    minute: 72,
  },
  {
    id: 'm-int-003',
    competition: { id: 'int', name: 'International', code: 'INT' },
    status: 'live',
    home: { team: { id: 't-bra', name: 'Brazil', shortName: 'BRA' }, score: 0 },
    away: { team: { id: 't-arg', name: 'Argentina', shortName: 'ARG' }, score: 1 },
    kickoffAt: '2026-04-22T20:00:00Z',
    minute: 31,
  },
];
