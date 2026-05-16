"""Slug ID ↔ API-Football numeric ID mapping.

The frontend uses readable slugs ('pl', 'ucl', 't-ars', ...). API-Football uses
numeric IDs. This module is the single place where those two namespaces meet.

Extend incrementally as new competitions/teams come into use. Unknown slugs
return None and the handler should turn that into a 404.
"""

from sports_proxy.types import Competition, CompetitionCode

COMPETITION_TO_PROVIDER: dict[str, int] = {
    "pl": 39,  # English Premier League
    "ucl": 2,  # UEFA Champions League
    "liga": 140,  # Spanish La Liga
    "int": 1,  # Placeholder — international handled specially in the live endpoint
}

PROVIDER_TO_COMPETITION: dict[int, str] = {v: k for k, v in COMPETITION_TO_PROVIDER.items()}

# Static metadata for our four competitions — used when we need to return a
# Competition DTO and only have the slug/numeric id.
COMPETITION_META: dict[str, Competition] = {
    "pl": {"id": "pl", "name": "Premier League", "code": "PL"},
    "ucl": {"id": "ucl", "name": "Champions League", "code": "UCL"},
    "liga": {"id": "liga", "name": "La Liga", "code": "LIGA"},
    "int": {"id": "int", "name": "International", "code": "INT"},
}

# Map our team slugs to API-Football numeric IDs. Only the seeded teams from
# the mock data; extend as new teams come into the product.
TEAM_TO_PROVIDER: dict[str, int] = {
    "t-ars": 42,  # Arsenal
    "t-rma": 541,  # Real Madrid
    "t-mci": 50,  # Manchester City
    "t-liv": 40,  # Liverpool
    "t-che": 49,  # Chelsea
    "t-tot": 47,  # Tottenham
    "t-fcb": 529,  # FC Barcelona
    "t-atl": 530,  # Atlético Madrid
    "t-mun": 33,  # Manchester United
    "t-new": 34,  # Newcastle
    "t-avl": 66,  # Aston Villa
    "t-bri": 51,  # Brighton
    "t-bay": 157,  # Bayern Munich
    "t-psg": 85,  # Paris Saint-Germain
    "t-int": 505,  # Inter Milan
    "t-sev": 536,  # Sevilla
    "t-vil": 533,  # Villarreal
    "t-rso": 548,  # Real Sociedad
    "t-bra": 6,  # Brazil
    "t-arg": 26,  # Argentina
    "t-eng": 10,  # England
    # NB: API-Football uses separate ID spaces per endpoint, so team id 2 ≠ league id 2.
    "t-fra": 2,  # France
    "t-esp": 9,  # Spain
    "t-ger": 25,  # Germany
}

PROVIDER_TO_TEAM: dict[int, str] = {v: k for k, v in TEAM_TO_PROVIDER.items()}


def competition_slug_to_provider(slug: str) -> int | None:
    """Return the API-Football league ID for a competition slug, or None if unknown."""
    return COMPETITION_TO_PROVIDER.get(slug)


def team_slug_to_provider(slug: str) -> int | None:
    """Return the API-Football team ID for a team slug, or None if unknown."""
    return TEAM_TO_PROVIDER.get(slug)


def competition_meta(slug: str) -> Competition | None:
    """Return our static Competition DTO for a known slug."""
    return COMPETITION_META.get(slug)


def competition_code(slug: str) -> CompetitionCode | None:
    """Return the competition code letter for a known slug."""
    meta = COMPETITION_META.get(slug)
    return meta["code"] if meta else None
