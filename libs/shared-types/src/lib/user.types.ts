import type { TeamRef, CompetitionRef } from './common.types';

export interface UserProfile {
  id: string;
  displayName: string;
  /** Relative path — backend resolves to CDN URL. */
  avatarPath?: string;
  createdAt: string;   // ISO 8601
}

export interface UserFavorites {
  teams: TeamRef[];
  competitions: CompetitionRef[];
}
