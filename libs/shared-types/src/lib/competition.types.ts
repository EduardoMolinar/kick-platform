import type { CompetitionRef, TeamRef } from './common.types';

export interface Competition extends CompetitionRef {
  country: string;
  currentSeason: Season;
}

export interface Season {
  id: string;
  startDate: string;   // ISO 8601
  endDate: string;
  currentMatchday?: number;
}

export interface StandingsTable {
  competition: CompetitionRef;
  season: Season;
  stage: string;       // e.g. "REGULAR_SEASON", "GROUP_STAGE"
  group?: string;      // e.g. "Group A"
  table: Standing[];
}

export interface Standing {
  position: number;
  team: TeamRef;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  zone?: 'cl' | 'uel' | 'rel';
}
