import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AUTH_SERVICE, type AuthSession } from '@platform/auth';
import {
  DsThemeToggle,
  THEME_SERVICE,
  type ThemeMode,
} from '@platform/design-system';
import { PROFILE_SERVICE, type ProfileService } from '@platform/profile';
import type { Competition, Team } from '@platform/shared-types';
import { filter, firstValueFrom, shareReplay, switchMap, type Observable } from 'rxjs';
import { CompetitionTile } from './competition-tile/competition-tile';
import { TeamTile } from './team-tile/team-tile';

@Component({
  selector: 'mfe-profile-profile-page',
  standalone: true,
  imports: [AsyncPipe, DsThemeToggle, TeamTile, CompetitionTile],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  private readonly auth = inject(AUTH_SERVICE);
  private readonly profile: ProfileService = inject(PROFILE_SERVICE);
  private readonly theme = inject(THEME_SERVICE);

  protected readonly user$: Observable<AuthSession> = this.auth.currentUser$.pipe(
    filter((u): u is AuthSession => u !== null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected readonly favoriteTeams$: Observable<readonly Team[]> = this.user$.pipe(
    switchMap((u) => this.profile.getFavoriteTeams(u.userId))
  );

  protected readonly favoriteCompetitions$: Observable<readonly Competition[]> = this.user$.pipe(
    switchMap((u) => this.profile.getFavoriteCompetitions(u.userId))
  );

  protected readonly themeMode$: Observable<ThemeMode> = this.theme.mode$;

  protected onUnfollowTeam(userId: string, teamId: string): void {
    void firstValueFrom(this.profile.unfollowTeam(userId, teamId)).catch((err) => {
      console.error(`Failed to unfollow team ${teamId}`, err);
    });
  }

  protected onUnfollowCompetition(userId: string, competitionId: string): void {
    void firstValueFrom(this.profile.unfollowCompetition(userId, competitionId)).catch((err) => {
      console.error(`Failed to unfollow competition ${competitionId}`, err);
    });
  }

  protected onThemeChange(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }

  protected initials(displayName: string): string {
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .join('');
  }
}
