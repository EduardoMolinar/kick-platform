import { InjectionToken } from '@angular/core';
import type { Competition, Team } from '@platform/shared-types';
import type { Observable } from 'rxjs';

export interface ProfileService {
  /** Teams this user follows. Empty array if none. */
  getFavoriteTeams(userId: string): Observable<readonly Team[]>;

  /** Competitions this user follows. Empty array if none. */
  getFavoriteCompetitions(userId: string): Observable<readonly Competition[]>;
}

export const PROFILE_SERVICE = new InjectionToken<ProfileService>('PROFILE_SERVICE');
