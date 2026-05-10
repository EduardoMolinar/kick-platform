import type { Competition } from '@platform/shared-types';

export const COMPETITIONS: readonly Competition[] = [
  { id: 'ucl', name: 'Champions League', code: 'UCL' },
  { id: 'pl', name: 'Premier League', code: 'PL' },
  { id: 'liga', name: 'La Liga', code: 'LIGA' },
  { id: 'int', name: 'International', code: 'INT' },
];

export const COMPETITION_BY_ID: Readonly<Record<string, Competition>> = Object.fromEntries(
  COMPETITIONS.map((c) => [c.id, c])
);
