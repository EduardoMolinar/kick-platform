"""Path matcher for the proxy.

Decouples handler dispatch from the API Gateway event shape. Given a
method + path, returns a (handler_name, kwargs) tuple — or None for no match.
"""

from __future__ import annotations

import re
from typing import NamedTuple


class RouteMatch(NamedTuple):
    """Result of routing: which handler to invoke and which path params it gets."""

    handler: str
    params: dict[str, str]


# Compiled once at import. Order matters — more-specific paths first.
_ROUTES: list[tuple[str, re.Pattern[str], str]] = [
    ("GET", re.compile(r"^/v1/live/?$"), "live"),
    ("GET", re.compile(r"^/v1/matches/(?P<match_id>[^/]+)/?$"), "match"),
    ("GET", re.compile(r"^/v1/competitions/(?P<competition_id>[^/]+)/fixtures/?$"),
     "competition_fixtures"),
    ("GET", re.compile(r"^/v1/competitions/(?P<competition_id>[^/]+)/standings/?$"),
     "competition_standings"),
    ("GET", re.compile(r"^/v1/teams/(?P<team_id>[^/]+)/fixtures/?$"), "team_fixtures"),
    ("GET", re.compile(r"^/v1/teams/(?P<team_id>[^/]+)/standings/?$"), "team_standings"),
    ("GET", re.compile(r"^/v1/teams/(?P<team_id>[^/]+)/?$"), "team"),
]


def route(method: str, path: str) -> RouteMatch | None:
    """Find a handler for (method, path). Returns None on no match.

    `path` should be the path portion only (no query string).
    """
    for route_method, pattern, handler in _ROUTES:
        if route_method != method:
            continue
        m = pattern.match(path)
        if m:
            return RouteMatch(handler=handler, params=m.groupdict())
    return None
