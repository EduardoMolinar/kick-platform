import { Injectable } from '@angular/core';
import type { Competition, Team } from '@platform/shared-types';
import { Observable, of } from 'rxjs';
import { FAVORITES_BY_USER } from './fixtures/favorites.fixture';
import type { ProfileService } from './profile.service';

@Injectable({ providedIn: 'root' })
export class MockProfileService implements ProfileService {
  getFavoriteTeams(userId: string): Observable<readonly Team[]> {
    return of(FAVORITES_BY_USER[userId]?.teams ?? []);
  }

  getFavoriteCompetitions(userId: string): Observable<readonly Competition[]> {
    return of(FAVORITES_BY_USER[userId]?.competitions ?? []);
  }
}
