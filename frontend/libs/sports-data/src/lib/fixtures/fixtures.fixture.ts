import type { Fixture } from '@platform/shared-types';

const UCL = { id: 'ucl', name: 'Champions League', code: 'UCL' } as const;
const PL = { id: 'pl', name: 'Premier League', code: 'PL' } as const;
const LIGA = { id: 'liga', name: 'La Liga', code: 'LIGA' } as const;
const INT = { id: 'int', name: 'International', code: 'INT' } as const;

const UCL_FIXTURES: readonly Fixture[] = [
  {
    id: 'f-ucl-001',
    competition: UCL,
    home: { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' },
    away: { id: 't-bay', name: 'Bayern Munich', shortName: 'BAY' },
    kickoffAt: '2026-04-28T19:00:00Z',
    matchday: 12,
  },
  {
    id: 'f-ucl-002',
    competition: UCL,
    home: { id: 't-psg', name: 'Paris Saint-Germain', shortName: 'PSG' },
    away: { id: 't-mci', name: 'Manchester City', shortName: 'MCI' },
    kickoffAt: '2026-04-29T19:00:00Z',
    matchday: 12,
  },
  {
    id: 'f-ucl-003',
    competition: UCL,
    home: { id: 't-fcb', name: 'FC Barcelona', shortName: 'FCB' },
    away: { id: 't-int', name: 'Inter Milan', shortName: 'INT' },
    kickoffAt: '2026-05-05T19:00:00Z',
    matchday: 13,
  },
];

const PL_FIXTURES: readonly Fixture[] = [
  {
    id: 'f-pl-001',
    competition: PL,
    home: { id: 't-ars', name: 'Arsenal', shortName: 'ARS' },
    away: { id: 't-che', name: 'Chelsea', shortName: 'CHE' },
    kickoffAt: '2026-04-26T14:00:00Z',
    matchday: 34,
  },
  {
    id: 'f-pl-002',
    competition: PL,
    home: { id: 't-liv', name: 'Liverpool', shortName: 'LIV' },
    away: { id: 't-tot', name: 'Tottenham', shortName: 'TOT' },
    kickoffAt: '2026-04-26T16:30:00Z',
    matchday: 34,
  },
  {
    id: 'f-pl-003',
    competition: PL,
    home: { id: 't-mun', name: 'Manchester United', shortName: 'MUN' },
    away: { id: 't-new', name: 'Newcastle', shortName: 'NEW' },
    kickoffAt: '2026-04-27T14:00:00Z',
    matchday: 34,
  },
  {
    id: 'f-pl-004',
    competition: PL,
    home: { id: 't-avl', name: 'Aston Villa', shortName: 'AVL' },
    away: { id: 't-bri', name: 'Brighton', shortName: 'BRI' },
    kickoffAt: '2026-05-03T14:00:00Z',
    matchday: 35,
  },
];

const LIGA_FIXTURES: readonly Fixture[] = [
  {
    id: 'f-liga-001',
    competition: LIGA,
    home: { id: 't-fcb', name: 'FC Barcelona', shortName: 'FCB' },
    away: { id: 't-sev', name: 'Sevilla', shortName: 'SEV' },
    kickoffAt: '2026-04-25T18:00:00Z',
    matchday: 33,
  },
  {
    id: 'f-liga-002',
    competition: LIGA,
    home: { id: 't-atl', name: 'Atlético Madrid', shortName: 'ATM' },
    away: { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' },
    kickoffAt: '2026-04-26T20:00:00Z',
    matchday: 33,
  },
  {
    id: 'f-liga-003',
    competition: LIGA,
    home: { id: 't-vil', name: 'Villarreal', shortName: 'VIL' },
    away: { id: 't-rso', name: 'Real Sociedad', shortName: 'RSO' },
    kickoffAt: '2026-05-02T18:00:00Z',
    matchday: 34,
  },
];

const INT_FIXTURES: readonly Fixture[] = [
  {
    id: 'f-int-001',
    competition: INT,
    home: { id: 't-bra', name: 'Brazil', shortName: 'BRA' },
    away: { id: 't-arg', name: 'Argentina', shortName: 'ARG' },
    kickoffAt: '2026-06-10T22:00:00Z',
  },
  {
    id: 'f-int-002',
    competition: INT,
    home: { id: 't-eng', name: 'England', shortName: 'ENG' },
    away: { id: 't-fra', name: 'France', shortName: 'FRA' },
    kickoffAt: '2026-06-12T19:00:00Z',
  },
  {
    id: 'f-int-003',
    competition: INT,
    home: { id: 't-esp', name: 'Spain', shortName: 'ESP' },
    away: { id: 't-ger', name: 'Germany', shortName: 'GER' },
    kickoffAt: '2026-06-14T19:00:00Z',
  },
];

export const FIXTURES_BY_COMPETITION: Readonly<Record<string, readonly Fixture[]>> = {
  ucl: UCL_FIXTURES,
  pl: PL_FIXTURES,
  liga: LIGA_FIXTURES,
  int: INT_FIXTURES,
};
