import type { Competition, Team } from '@platform/shared-types';

export interface SeededFavorites {
  readonly teams: readonly Team[];
  readonly competitions: readonly Competition[];
}

export const FAVORITES_BY_USER: Readonly<Record<string, SeededFavorites>> = {
  'u-demo-001': {
    teams: [
      { id: 't-ars', name: 'Arsenal', shortName: 'ARS' },
      { id: 't-rma', name: 'Real Madrid', shortName: 'RMA' },
    ],
    competitions: [
      { id: 'ucl', name: 'Champions League', code: 'UCL' },
    ],
  },
};
