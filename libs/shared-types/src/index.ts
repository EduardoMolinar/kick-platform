// ── @kick/shared-types — public API ──────────────────────────────────────────
// All frontend-facing backend contracts live here.
// These types are provider-agnostic: the backend adapter layer handles mapping.

export type {
  TeamRef,
  CompetitionRef,
  PagedResponse,
} from './lib/common.types';

export type {
  MatchStatus,
  MatchSummary,
  MatchDetail,
  MatchEvent,
  MatchEventType,
  MatchStats,
  StatItem,
  Lineups,
  TeamLineup,
  Player,
} from './lib/match.types';

export type {
  Competition,
  Season,
  StandingsTable,
  Standing,
} from './lib/competition.types';

export type {
  TeamDetail,
  TeamForm,
} from './lib/team.types';

export type {
  UserProfile,
  UserFavorites,
} from './lib/user.types';
