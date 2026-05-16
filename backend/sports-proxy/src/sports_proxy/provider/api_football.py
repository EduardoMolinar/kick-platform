"""API-Football v3 (RapidAPI) HTTP client.

Single class with one method per backend endpoint. Each call:
- Sets the X-RapidAPI-* headers (key from SSM).
- Uses a module-scoped httpx.Client so warm containers reuse the connection pool.
- Raises RateLimitError on 429 so the handler can return 503 to the frontend.
- Returns the raw JSON 'response' array (the API-Football payload shape) for the
  normalize/* layer to consume.
"""

from __future__ import annotations

import os
from typing import Any

import httpx

from sports_proxy import secrets

_BASE_URL = "https://api-football-v1.p.rapidapi.com/v3"
_HOST = "api-football-v1.p.rapidapi.com"
_TIMEOUT_S = 5.0

# Module-level client reused across warm-container invocations.
_client = httpx.Client(timeout=_TIMEOUT_S)


class ProviderError(Exception):
    """Base error for upstream provider failures."""


class RateLimitError(ProviderError):
    """API-Football returned 429."""


def _current_season() -> int:
    raw = os.environ.get("CURRENT_SEASON")
    if not raw:
        raise RuntimeError("CURRENT_SEASON env var is not set")
    try:
        return int(raw)
    except ValueError as exc:
        raise RuntimeError(f"CURRENT_SEASON is not an integer: {raw!r}") from exc


def _headers() -> dict[str, str]:
    return {
        "X-RapidAPI-Key": secrets.get_api_football_key(),
        "X-RapidAPI-Host": _HOST,
    }


def _get(path: str, params: dict[str, Any]) -> list[dict[str, Any]]:
    """Issue a GET to API-Football and return the `response` array."""
    url = f"{_BASE_URL}{path}"
    r = _client.get(url, headers=_headers(), params=params)
    if r.status_code == 429:
        raise RateLimitError("API-Football rate limit hit")
    if r.status_code >= 400:
        raise ProviderError(f"API-Football {r.status_code} for {path}: {r.text[:200]}")
    body = r.json()
    response = body.get("response")
    if not isinstance(response, list):
        raise ProviderError(f"API-Football {path} returned non-list response")
    return response


# === Public methods, one per /v1 endpoint ===


def fetch_live_fixtures() -> list[dict[str, Any]]:
    """All currently live fixtures across the four competitions we track."""
    return _get("/fixtures", {"live": "all"})


def fetch_fixture(provider_id: int) -> dict[str, Any] | None:
    """Single fixture by API-Football fixture id."""
    items = _get("/fixtures", {"id": provider_id})
    return items[0] if items else None


def fetch_competition_fixtures(
    league_id: int, *, status_filter: str = "NS"
) -> list[dict[str, Any]]:
    """Upcoming fixtures (`status=NS` = Not Started) for a competition/season."""
    return _get(
        "/fixtures",
        {"league": league_id, "season": _current_season(), "status": status_filter},
    )


def fetch_competition_standings(league_id: int) -> list[dict[str, Any]]:
    """Standings table for a competition/season."""
    return _get("/standings", {"league": league_id, "season": _current_season()})


def fetch_team_fixtures(team_id: int, *, status_filter: str = "NS") -> list[dict[str, Any]]:
    """Upcoming fixtures for a team across all competitions in the season."""
    return _get(
        "/fixtures",
        {"team": team_id, "season": _current_season(), "status": status_filter},
    )


def fetch_team(team_id: int) -> dict[str, Any] | None:
    """Team identity record."""
    items = _get("/teams", {"id": team_id})
    return items[0] if items else None
