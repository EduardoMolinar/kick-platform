"""Pytest fixtures shared across tests."""

from __future__ import annotations

import json
import os
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import boto3
import pytest
from moto import mock_aws

FIXTURES_DIR = Path(__file__).parent / "fixtures"


def load_fixture(name: str) -> dict[str, Any]:
    """Load a JSON fixture from tests/fixtures/."""
    with (FIXTURES_DIR / name).open(encoding="utf-8") as fh:
        return json.load(fh)


@pytest.fixture
def cache_table() -> Iterator[Any]:
    """Set up a moto-mocked DynamoDB table named per CACHE_TABLE_NAME env."""
    with mock_aws():
        os.environ["CACHE_TABLE_NAME"] = "test-sports-cache"
        os.environ.setdefault("AWS_DEFAULT_REGION", "eu-west-1")
        ddb = boto3.resource("dynamodb")
        ddb.create_table(
            TableName="test-sports-cache",
            KeySchema=[{"AttributeName": "cacheKey", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "cacheKey", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        # Force the cache module to forget any prior client/table references so
        # the next call picks up moto's patched boto3.
        from sports_proxy import cache as cache_module

        cache_module._dynamodb = None  # type: ignore[attr-defined]
        cache_module._table = None  # type: ignore[attr-defined]
        yield ddb.Table("test-sports-cache")
        cache_module._dynamodb = None  # type: ignore[attr-defined]
        cache_module._table = None  # type: ignore[attr-defined]
