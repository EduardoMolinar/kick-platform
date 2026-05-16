"""DynamoDB cache tests, backed by moto."""

from __future__ import annotations

import time
from typing import Any

from sports_proxy import cache


def test_get_returns_none_on_miss(cache_table: Any) -> None:
    assert cache.get("does-not-exist") is None


def test_put_then_get_round_trips_payload(cache_table: Any) -> None:
    payload = {"foo": [1, 2, 3], "bar": "baz"}
    cache.put("k1", payload, ttl_seconds=60)
    assert cache.get("k1") == payload


def test_get_returns_none_for_expired_row(cache_table: Any) -> None:
    # Write a row with an expiresAt in the past.
    cache_table.put_item(
        Item={"cacheKey": "stale", "payload": '{"x":1}', "expiresAt": int(time.time()) - 5}
    )
    assert cache.get("stale") is None
