"""API-Football fixture payload → our Fixture DTO (upcoming-only shape)."""

from __future__ import annotations

from typing import Any

from sports_proxy.normalize.team import team_from_provider_id
from sports_proxy.provider.id_mapping import PROVIDER_TO_COMPETITION, competition_meta
from sports_proxy.types import Fixture


def normalize_fixture(raw: dict[str, Any]) -> Fixture | None:
    """Map an API-Football fixture row to our (upcoming) Fixture DTO.

    Unlike MatchSummary, Fixture has no score/status/events — it represents
    a scheduled game. Returns None if the competition or either team is
    outside our slug namespace.
    """
    fixture_obj = raw.get("fixture") or {}
    league = raw.get("league") or {}
    teams = raw.get("teams") or {}

    provider_id = fixture_obj.get("id")
    league_id = league.get("id")
    if not isinstance(provider_id, int) or not isinstance(league_id, int):
        return None

    comp_slug = PROVIDER_TO_COMPETITION.get(league_id)
    competition = competition_meta(comp_slug) if comp_slug else None
    if not competition:
        return None

    home_raw = teams.get("home") or {}
    away_raw = teams.get("away") or {}
    home_team = team_from_provider_id(home_raw.get("id"), home_raw.get("name"))
    away_team = team_from_provider_id(away_raw.get("id"), away_raw.get("name"))
    if not home_team or not away_team:
        return None

    out: Fixture = {
        "id": f"f-{provider_id}",
        "competition": competition,
        "home": home_team,
        "away": away_team,
        "kickoffAt": fixture_obj.get("date") or "",
    }
    matchday = league.get("round")
    if isinstance(matchday, str):
        # API-Football round looks like 'Regular Season - 12'. Extract the trailing number.
        trailing = matchday.rsplit("-", 1)[-1].strip()
        if trailing.isdigit():
            out["matchday"] = int(trailing)
    elif isinstance(matchday, int):
        out["matchday"] = matchday
    return out
