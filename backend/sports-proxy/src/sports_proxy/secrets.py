"""SSM Parameter Store helpers.

Uses aws-lambda-powertools `parameters` module which caches values in-process
between Lambda invocations on the same warm container (default 5s, configurable).
We bump the TTL to 15 minutes since the API key rotates infrequently — this
keeps SSM call volume low.
"""

import os

from aws_lambda_powertools.utilities import parameters

# Cache the API key for 15 minutes between SSM calls.
_API_KEY_TTL_SECONDS = 900


def get_api_football_key() -> str:
    """Fetch the API-Football RapidAPI key from SSM Parameter Store.

    Reads SSM_KEY_NAME env var to find the parameter name. Decrypts SecureString
    values. Cached in-process; only hits SSM once per warm container per TTL.
    """
    name = os.environ.get("SSM_KEY_NAME")
    if not name:
        raise RuntimeError("SSM_KEY_NAME env var is not set")
    value = parameters.get_parameter(name, decrypt=True, max_age=_API_KEY_TTL_SECONDS)
    if not isinstance(value, str) or not value:
        raise RuntimeError(f"SSM parameter {name} returned an unexpected value")
    return value
