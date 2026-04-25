import { Injectable } from '@angular/core';
import type { Competition, Team } from '@platform/shared-types';
import { BehaviorSubject, distinctUntilChanged, map, Observable, of } from 'rxjs';
import { FAVORITES_BY_USER } from './fixtures/favorites.fixture';
import type { ProfileService } from './profile.service';

interface UserFavorites {
  teams: Map<string, Team>;
  competitions: Map<string, Competition>;
}

type FavoritesStore = Map<string, UserFavorites>;

function seedStore(): FavoritesStore {
  const store: FavoritesStore = new Map();
  for (const [userId, data] of Object.entries(FAVORITES_BY_USER)) {
    store.set(userId, {
      teams: new Map(data.teams.map((t) => [t.id, t])),
      competitions: new Map(data.competitions.map((c) => [c.id, c])),
    });
  }
  return store;
}

function cloneStore(store: FavoritesStore): FavoritesStore {
  const next: FavoritesStore = new Map();
  for (const [userId, entry] of store) {
    next.set(userId, {
      teams: new Map(entry.teams),
      competitions: new Map(entry.competitions),
    });
  }
  return next;
}

@Injectable({ providedIn: 'root' })
export class MockProfileService implements ProfileService {
  private readonly store$ = new BehaviorSubject<FavoritesStore>(seedStore());

  getFavoriteTeams(userId: string): Observable<readonly Team[]> {
    return this.store$.pipe(map((s) => Array.from(s.get(userId)?.teams.values() ?? [])));
  }

  getFavoriteCompetitions(userId: string): Observable<readonly Competition[]> {
    return this.store$.pipe(map((s) => Array.from(s.get(userId)?.competitions.values() ?? [])));
  }

  isFollowingTeam$(userId: string, teamId: string): Observable<boolean> {
    return this.store$.pipe(
      map((s) => s.get(userId)?.teams.has(teamId) ?? false),
      distinctUntilChanged()
    );
  }

  isFollowingCompetition$(userId: string, competitionId: string): Observable<boolean> {
    return this.store$.pipe(
      map((s) => s.get(userId)?.competitions.has(competitionId) ?? false),
      distinctUntilChanged()
    );
  }

  followTeam(userId: string, team: Team): Observable<void> {
    this.mutate(userId, (entry) => entry.teams.set(team.id, team));
    return of(void 0);
  }

  unfollowTeam(userId: string, teamId: string): Observable<void> {
    this.mutate(userId, (entry) => entry.teams.delete(teamId));
    return of(void 0);
  }

  followCompetition(userId: string, competition: Competition): Observable<void> {
    this.mutate(userId, (entry) => entry.competitions.set(competition.id, competition));
    return of(void 0);
  }

  unfollowCompetition(userId: string, competitionId: string): Observable<void> {
    this.mutate(userId, (entry) => entry.competitions.delete(competitionId));
    return of(void 0);
  }

  private mutate(userId: string, fn: (entry: UserFavorites) => void): void {
    const next = cloneStore(this.store$.value);
    const entry = next.get(userId) ?? { teams: new Map(), competitions: new Map() };
    fn(entry);
    next.set(userId, entry);
    this.store$.next(next);
  }
}
