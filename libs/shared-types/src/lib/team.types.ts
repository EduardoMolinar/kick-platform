import type { TeamRef, CompetitionRef } from './common.types';

export interface TeamDetail extends TeamRef {
  founded?: number;
  venue?: string;
  competitions: CompetitionRef[];
}

export interface TeamForm {
  team: TeamRef;
  results: ('W' | 'D' | 'L')[];
}
