"""DynamoDB-backed response cache.

Schema:
    PK: cacheKey   (str) — e.g. 'live', 'match:m-ucl-001', 'competition:pl:fixtures'
    payload        (str) — JSON-encoded response body
    expiresAt      (int) — epoch seconds; DynamoDB TTL attribute, drops expired
                           items in the background (best-effort within ~48h).

TTLs are short (60s for live; 600s for fixtures/standings). The DynamoDB TTL
is a lazy sweep; we double-check expiresAt > now() at read time and treat a
stale row as a miss.
"""

from __future__ import annotations

import json
import os
import time
from typing import Any

import boto3

# Lazily-instantiated handles, reused across warm-container invocations.
# Lazy init ensures tests can swap in moto's patched boto3 before first use.
_dynamodb: Any = None
_table: Any = None


def _get_table() -> Any:
    """Lazy table handle; the table name is supplied by env at runtime."""
    global _dynamodb, _table
    if _table is None:
        name = os.environ.get("CACHE_TABLE_NAME")
        if not name:
            raise RuntimeError("CACHE_TABLE_NAME env var is not set")
        if _dynamodb is None:
            _dynamodb = boto3.resource("dynamodb")
        _table = _dynamodb.Table(name)
    return _table


def get(cache_key: str) -> Any | None:
    """Return cached JSON-decoded payload, or None on miss / expired."""
    table = _get_table()
    response = table.get_item(Key={"cacheKey": cache_key})
    item = response.get("Item")
    if not item:
        return None
    expires_at = int(item.get("expiresAt", 0))
    if expires_at < int(time.time()):
        return None  # Stale; DynamoDB TTL will eventually evict.
    payload = item.get("payload")
    if not isinstance(payload, str):
        return None
    return json.loads(payload)


def put(cache_key: str, value: Any, ttl_seconds: int) -> None:
    """Write a payload with TTL. value is JSON-encoded internally."""
    table = _get_table()
    expires_at = int(time.time()) + ttl_seconds
    table.put_item(
        Item={
            "cacheKey": cache_key,
            "payload": json.dumps(value, separators=(",", ":")),
            "expiresAt": expires_at,
        }
    )


# TTL recipes — keep in one place so callers don't pick magic numbers.
TTL_LIVE = 60
TTL_MATCH = 60
TTL_FIXTURES = 600
TTL_STANDINGS = 600
TTL_TEAM = 600
