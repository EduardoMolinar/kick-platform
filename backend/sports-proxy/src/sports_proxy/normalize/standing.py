"""API-Football standings payload → our Standing + TeamCompetitionStanding DTOs."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from sports_proxy.normalize.team import team_from_provider_id
from sports_proxy.provider.id_mapping import (
    PROVIDER_TO_COMPETITION,
    competition_meta,
)
from sports_proxy.types import Standing, StandingRow, TeamCompetitionStanding


def _normalize_row(raw: dict[str, Any]) -> StandingRow | None:
    """Map a single API-Football standings row to our StandingRow.

    Returns None if the team is outside our slug namespace.
    """
    rank = raw.get("rank")
    team_raw = raw.get("team") or {}
    all_stats = raw.get("all") or {}
    goals = all_stats.get("goals") or {}
    if not isinstance(rank, int):
        return None
    team = team_from_provider_id(team_raw.get("id"), team_raw.get("name"))
    if not team:
        return None
    won = int(all_stats.get("win") or 0)
    drawn = int(all_stats.get("draw") or 0)
    lost = int(all_stats.get("lose") or 0)
    gf = int(goals.get("for") or 0)
    ga = int(goals.get("against") or 0)
    return {
        "position": rank,
        "team": team,
        "played": int(all_stats.get("played") or won + drawn + lost),
        "won": won,
        "drawn": drawn,
        "lost": lost,
        "goalsFor": gf,
        "goalsAgainst": ga,
        "goalDifference": gf - ga,
        "points": int(raw.get("points") or 0),
    }


def normalize_standing(raw: dict[str, Any]) -> Standing | None:
    """Map a /standings 'league' entry to our Standing DTO.

    API-Football returns standings nested under league.standings[0] (a single
    table for top-tier domestic leagues; UCL group stage returns multiple).
    For domestic leagues we take the single table; for UCL we flatten all
    groups into one big table sorted by points (good enough for our display).
    """
    league = raw.get("league") or {}
    league_id = league.get("id")
    if not isinstance(league_id, int):
        return None
    comp_slug = PROVIDER_TO_COMPETITION.get(league_id)
    competition = competition_meta(comp_slug) if comp_slug else None
    if not competition:
        return None

    raw_tables = league.get("standings") or []
    # `standings` is a list of lists — each inner list is a group/table.
    flat_rows: list[StandingRow] = []
    for table in raw_tables:
        if not isinstance(table, list):
            continue
        for row in table:
            if not isinstance(row, dict):
                continue
            normalized = _normalize_row(row)
            if normalized:
                flat_rows.append(normalized)

    # Re-sort and re-rank: across multiple groups (UCL), positions overlap, so
    # we sort by points desc then GD desc and re-assign 1..n.
    flat_rows.sort(key=lambda r: (-r["points"], -r["goalDifference"]))
    for i, row in enumerate(flat_rows, start=1):
        row["position"] = i

    return {
        "competition": competition,
        "rows": flat_rows,
        "updatedAt": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
    }


def normalize_team_standings(
    team_slug: str, raw_standings: list[dict[str, Any]]
) -> list[TeamCompetitionStanding]:
    """For each league entry the team appears in, emit a TeamCompetitionStanding."""
    out: list[TeamCompetitionStanding] = []
    for raw in raw_standings:
        full = normalize_standing(raw)
        if not full:
            continue
        match_row = next((row for row in full["rows"] if row["team"]["id"] == team_slug), None)
        if not match_row:
            continue
        out.append({"competition": full["competition"], "row": match_row})
    return out
