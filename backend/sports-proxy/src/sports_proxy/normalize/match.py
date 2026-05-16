"""API-Football fixture payload → our MatchSummary DTO."""

from __future__ import annotations

from typing import Any

from sports_proxy.normalize.team import team_from_provider_id
from sports_proxy.provider.id_mapping import PROVIDER_TO_COMPETITION, competition_meta
from sports_proxy.types import MatchEvent, MatchStatus, MatchSummary

# API-Football short status codes → our MatchStatus literals.
# https://www.api-football.com/documentation-v3#section/Authentication/Status
_STATUS_MAP: dict[str, MatchStatus] = {
    "NS": "scheduled",  # Not Started
    "TBD": "scheduled",
    "1H": "live",
    "HT": "halftime",
    "2H": "live",
    "ET": "live",
    "BT": "live",
    "P": "live",  # Penalties
    "LIVE": "live",
    "FT": "finished",
    "AET": "finished",
    "PEN": "finished",
    "PST": "postponed",
    "CANC": "postponed",
    "ABD": "postponed",
    "AWD": "finished",
    "WO": "finished",
}


def _map_event_type(raw_type: str | None, detail: str | None) -> str | None:
    """API-Football event types are 'Goal', 'Card', 'subst', 'Var'. We map a subset."""
    if raw_type == "Goal":
        return "goal"
    if raw_type == "Card":
        if detail and "Red" in detail:
            return "red-card"
        return "yellow-card"
    if raw_type == "subst":
        return "substitution"
    return None  # Drop unknown event types (Var, etc.) for now.


def _normalize_events(
    raw_events: list[dict[str, Any]] | None, home_team_id: int
) -> list[MatchEvent]:
    if not raw_events:
        return []
    out: list[MatchEvent] = []
    for ev in raw_events:
        time_obj = ev.get("time") or {}
        minute = time_obj.get("elapsed")
        if not isinstance(minute, int):
            continue
        event_type = _map_event_type(ev.get("type"), ev.get("detail"))
        if event_type is None:
            continue
        team_id = (ev.get("team") or {}).get("id")
        side = "home" if team_id == home_team_id else "away"
        player_name = (ev.get("player") or {}).get("name") or "Unknown"
        normalized: MatchEvent = {
            "minute": minute,
            "type": event_type,  # type: ignore[typeddict-item]
            "side": side,  # type: ignore[typeddict-item]
            "player": player_name,
        }
        added = time_obj.get("extra")
        if isinstance(added, int) and added > 0:
            normalized["addedTime"] = added
        assist_obj = ev.get("assist") or {}
        assist_name = assist_obj.get("name") if isinstance(assist_obj, dict) else None
        if event_type == "goal" and isinstance(assist_name, str) and assist_name:
            normalized["assist"] = assist_name
        if event_type == "substitution":
            # API-Football: 'player' is the player going OFF; 'assist' is the player coming ON.
            # Our schema: 'player' is the player coming ON; 'playerOut' is the one going off.
            on_name = assist_name if isinstance(assist_name, str) else None
            normalized["player"] = on_name or player_name
            normalized["playerOut"] = player_name
        out.append(normalized)
    return out


def normalize_match(raw: dict[str, Any]) -> MatchSummary | None:
    """Map an API-Football fixture payload to our MatchSummary DTO.

    Returns None if we can't resolve the competition or one of the teams to
    our slug namespace.
    """
    fixture = raw.get("fixture") or {}
    league = raw.get("league") or {}
    teams = raw.get("teams") or {}
    goals = raw.get("goals") or {}

    provider_match_id = fixture.get("id")
    league_id = league.get("id")
    if not isinstance(provider_match_id, int) or not isinstance(league_id, int):
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

    status_code = ((fixture.get("status") or {}).get("short")) or "NS"
    status = _STATUS_MAP.get(status_code, "scheduled")

    summary: MatchSummary = {
        "id": f"m-{provider_match_id}",
        "competition": competition,
        "status": status,
        "home": {"team": home_team, "score": int(goals.get("home") or 0)},
        "away": {"team": away_team, "score": int(goals.get("away") or 0)},
        "kickoffAt": fixture.get("date") or "",
    }

    elapsed = (fixture.get("status") or {}).get("elapsed")
    if isinstance(elapsed, int) and elapsed > 0:
        summary["minute"] = elapsed

    events = _normalize_events(raw.get("events"), home_raw.get("id"))
    if events:
        summary["events"] = events

    return summary
