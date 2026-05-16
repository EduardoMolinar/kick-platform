"""Lambda entrypoint.

Maps API Gateway HTTP API v2 events to handlers, applies caching + normalization
+ CORS, returns API Gateway responses.

Flow:
    event → router.route() → handler function → cache.get() → on miss:
        provider call → normalize → cache.put() → response

No business logic lives here beyond HTTP shape conversion; the handlers in this
module delegate to provider/* and normalize/* modules.
"""

from __future__ import annotations

import json
import os
from typing import Any

from aws_lambda_powertools import Logger
from aws_lambda_powertools.utilities.typing import LambdaContext

from sports_proxy import cache
from sports_proxy.normalize.fixture import normalize_fixture
from sports_proxy.normalize.match import normalize_match
from sports_proxy.normalize.standing import normalize_standing, normalize_team_standings
from sports_proxy.normalize.team import normalize_team
from sports_proxy.provider import api_football
from sports_proxy.provider.id_mapping import (
    competition_meta,
    competition_slug_to_provider,
    team_slug_to_provider,
)
from sports_proxy.router import route

logger = Logger(service="sports-proxy")


# === HTTP helpers ===


def _origin_allowed(origin: str | None) -> str | None:
    """Return the origin if it's in our allowlist, else None.

    ALLOWED_ORIGINS env var is comma-separated.
    """
    if not origin:
        return None
    allowlist = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
    return origin if origin in allowlist else None


def _cors_headers(origin: str | None) -> dict[str, str]:
    allowed = _origin_allowed(origin)
    if not allowed:
        return {"Vary": "Origin"}
    return {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Vary": "Origin",
    }


def _ok(body: Any, origin: str | None) -> dict[str, Any]:
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json", **_cors_headers(origin)},
        "body": json.dumps(body, separators=(",", ":")),
    }


def _not_found(origin: str | None) -> dict[str, Any]:
    return {
        "statusCode": 404,
        "headers": {"Content-Type": "application/json", **_cors_headers(origin)},
        "body": json.dumps({"error": "not_found"}),
    }


def _rate_limited(origin: str | None) -> dict[str, Any]:
    return {
        "statusCode": 503,
        "headers": {
            "Content-Type": "application/json",
            "Retry-After": "60",
            **_cors_headers(origin),
        },
        "body": json.dumps({"error": "upstream_rate_limited"}),
    }


def _server_error(origin: str | None) -> dict[str, Any]:
    return {
        "statusCode": 500,
        "headers": {"Content-Type": "application/json", **_cors_headers(origin)},
        "body": json.dumps({"error": "server_error"}),
    }


# === Endpoint handlers ===


def _handle_live() -> Any:
    cache_key = "live"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("cache hit", extra={"cacheKey": cache_key, "cacheHit": True})
        return cached
    logger.info("cache miss", extra={"cacheKey": cache_key, "cacheHit": False})
    raw = api_football.fetch_live_fixtures()
    payload = [m for m in (normalize_match(item) for item in raw) if m]
    cache.put(cache_key, payload, ttl_seconds=cache.TTL_LIVE)
    return payload


def _handle_match(match_id: str) -> Any | None:
    # match_id format we emit is 'm-<provider_id>'.
    if not match_id.startswith("m-"):
        return None
    try:
        provider_id = int(match_id[2:])
    except ValueError:
        return None
    cache_key = f"match:{match_id}"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("cache hit", extra={"cacheKey": cache_key, "cacheHit": True})
        return cached
    logger.info("cache miss", extra={"cacheKey": cache_key, "cacheHit": False})
    raw = api_football.fetch_fixture(provider_id)
    if not raw:
        return None
    payload = normalize_match(raw)
    if payload is None:
        return None
    cache.put(cache_key, payload, ttl_seconds=cache.TTL_MATCH)
    return payload


def _handle_competition_fixtures(slug: str) -> Any | None:
    league_id = competition_slug_to_provider(slug)
    if league_id is None:
        return None
    cache_key = f"competition:{slug}:fixtures"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("cache hit", extra={"cacheKey": cache_key, "cacheHit": True})
        return cached
    logger.info("cache miss", extra={"cacheKey": cache_key, "cacheHit": False})
    raw = api_football.fetch_competition_fixtures(league_id)
    payload = [f for f in (normalize_fixture(item) for item in raw) if f]
    payload.sort(key=lambda f: f["kickoffAt"])
    cache.put(cache_key, payload, ttl_seconds=cache.TTL_FIXTURES)
    return payload


def _handle_competition_standings(slug: str) -> Any | None:
    league_id = competition_slug_to_provider(slug)
    if league_id is None or competition_meta(slug) is None:
        return None
    # API-Football has no standings for purely international competitions.
    if slug == "int":
        return None
    cache_key = f"competition:{slug}:standings"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("cache hit", extra={"cacheKey": cache_key, "cacheHit": True})
        return cached
    logger.info("cache miss", extra={"cacheKey": cache_key, "cacheHit": False})
    raw = api_football.fetch_competition_standings(league_id)
    if not raw:
        return None
    payload = normalize_standing(raw[0]) if raw else None
    if payload is None:
        return None
    cache.put(cache_key, payload, ttl_seconds=cache.TTL_STANDINGS)
    return payload


def _handle_team_fixtures(slug: str) -> Any | None:
    team_id = team_slug_to_provider(slug)
    if team_id is None:
        return None
    cache_key = f"team:{slug}:fixtures"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("cache hit", extra={"cacheKey": cache_key, "cacheHit": True})
        return cached
    logger.info("cache miss", extra={"cacheKey": cache_key, "cacheHit": False})
    raw = api_football.fetch_team_fixtures(team_id)
    payload = [f for f in (normalize_fixture(item) for item in raw) if f]
    payload.sort(key=lambda f: f["kickoffAt"])
    cache.put(cache_key, payload, ttl_seconds=cache.TTL_FIXTURES)
    return payload


def _handle_team_standings(slug: str) -> Any:
    team_id = team_slug_to_provider(slug)
    if team_id is None:
        return []
    cache_key = f"team:{slug}:standings"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("cache hit", extra={"cacheKey": cache_key, "cacheHit": True})
        return cached
    logger.info("cache miss", extra={"cacheKey": cache_key, "cacheHit": False})
    # For each competition we cover, fetch standings and pull the team's row.
    # Heavy-ish (3 SSM-free provider calls per cache miss) but rate-limit
    # protected by the 10-minute cache TTL.
    raw_standings: list[dict[str, Any]] = []
    for comp_slug in ("pl", "ucl", "liga"):
        comp_provider_id = competition_slug_to_provider(comp_slug)
        if comp_provider_id is None:
            continue
        league_response = api_football.fetch_competition_standings(comp_provider_id)
        if league_response:
            raw_standings.extend(league_response)
    payload = normalize_team_standings(slug, raw_standings)
    cache.put(cache_key, payload, ttl_seconds=cache.TTL_STANDINGS)
    return payload


def _handle_team(slug: str) -> Any | None:
    team_id = team_slug_to_provider(slug)
    if team_id is None:
        return None
    cache_key = f"team:{slug}"
    cached = cache.get(cache_key)
    if cached is not None:
        logger.info("cache hit", extra={"cacheKey": cache_key, "cacheHit": True})
        return cached
    logger.info("cache miss", extra={"cacheKey": cache_key, "cacheHit": False})
    raw = api_football.fetch_team(team_id)
    if not raw:
        return None
    payload = normalize_team(raw)
    if payload is None:
        return None
    cache.put(cache_key, payload, ttl_seconds=cache.TTL_TEAM)
    return payload


# === Dispatch ===


_HANDLERS = {
    "live": lambda params: _handle_live(),
    "match": lambda params: _handle_match(params["match_id"]),
    "competition_fixtures": lambda params: _handle_competition_fixtures(params["competition_id"]),
    "competition_standings": lambda params: _handle_competition_standings(params["competition_id"]),
    "team_fixtures": lambda params: _handle_team_fixtures(params["team_id"]),
    "team_standings": lambda params: _handle_team_standings(params["team_id"]),
    "team": lambda params: _handle_team(params["team_id"]),
}


@logger.inject_lambda_context(correlation_id_path="requestContext.requestId")
def lambda_handler(event: dict[str, Any], _context: LambdaContext) -> dict[str, Any]:
    """API Gateway HTTP API v2 entrypoint."""
    http = event.get("requestContext", {}).get("http", {}) or {}
    method = http.get("method", "GET")
    path = event.get("rawPath", "")
    origin = (event.get("headers") or {}).get("origin")

    if method == "OPTIONS":
        return {"statusCode": 204, "headers": _cors_headers(origin), "body": ""}

    match = route(method, path)
    if not match:
        return _not_found(origin)

    handler = _HANDLERS.get(match.handler)
    if not handler:
        return _not_found(origin)

    try:
        result = handler(match.params)
    except api_football.RateLimitError:
        logger.warning("upstream rate limit", extra={"path": path})
        return _rate_limited(origin)
    except api_football.ProviderError as exc:
        logger.exception("upstream error", extra={"path": path, "error": str(exc)})
        return _server_error(origin)
    except Exception as exc:
        logger.exception("unexpected error", extra={"path": path, "error": str(exc)})
        return _server_error(origin)

    if result is None:
        # Endpoints that semantically can be 'not found' (single match / team / standings)
        # return None — turn that into a 404 so the frontend's catchError falls back.
        return _not_found(origin)

    return _ok(result, origin)
