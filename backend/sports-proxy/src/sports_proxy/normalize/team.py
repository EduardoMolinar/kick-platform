"""API-Football team payload → our Team DTO."""

from __future__ import annotations

from typing import Any

from sports_proxy.provider.id_mapping import PROVIDER_TO_TEAM
from sports_proxy.types import Team


def normalize_team(raw: dict[str, Any]) -> Team | None:
    """Map an API-Football team payload to our Team DTO.

    Returns None if the provider team is not one we have a slug for —
    callers should treat as a 404.
    """
    info = raw.get("team", {})
    provider_id = info.get("id")
    if not isinstance(provider_id, int):
        return None
    slug = PROVIDER_TO_TEAM.get(provider_id)
    if not slug:
        return None
    team: Team = {
        "id": slug,
        "name": info.get("name") or slug,
    }
    code = info.get("code")
    if isinstance(code, str) and code:
        team["shortName"] = code
    logo = info.get("logo")
    if isinstance(logo, str) and logo:
        team["crestUrl"] = logo
    return team


def team_from_provider_id(provider_id: int, raw_name: str | None = None) -> Team | None:
    """Inline team-record construction when we only have the id (used inside Match/Fixture).

    Falls back to the provider's raw name if our slug map is incomplete.
    """
    slug = PROVIDER_TO_TEAM.get(provider_id)
    if not slug:
        return None
    return {
        "id": slug,
        "name": raw_name or slug,
    }
