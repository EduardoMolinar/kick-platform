"""Path-matcher tests."""

from sports_proxy.router import route


def test_live_route_matches() -> None:
    match = route("GET", "/v1/live")
    assert match is not None
    assert match.handler == "live"
    assert match.params == {}


def test_match_route_extracts_id() -> None:
    match = route("GET", "/v1/matches/m-12345")
    assert match is not None
    assert match.handler == "match"
    assert match.params == {"match_id": "m-12345"}


def test_competition_fixtures_route() -> None:
    match = route("GET", "/v1/competitions/pl/fixtures")
    assert match is not None
    assert match.handler == "competition_fixtures"
    assert match.params == {"competition_id": "pl"}


def test_competition_standings_route() -> None:
    match = route("GET", "/v1/competitions/ucl/standings")
    assert match is not None
    assert match.handler == "competition_standings"


def test_team_fixtures_route() -> None:
    match = route("GET", "/v1/teams/t-ars/fixtures")
    assert match is not None
    assert match.handler == "team_fixtures"
    assert match.params == {"team_id": "t-ars"}


def test_team_standings_route() -> None:
    match = route("GET", "/v1/teams/t-ars/standings")
    assert match is not None
    assert match.handler == "team_standings"


def test_team_route() -> None:
    match = route("GET", "/v1/teams/t-ars")
    assert match is not None
    assert match.handler == "team"
    assert match.params == {"team_id": "t-ars"}


def test_unknown_path_returns_none() -> None:
    assert route("GET", "/v1/nope") is None
    assert route("GET", "/v2/live") is None


def test_wrong_method_returns_none() -> None:
    assert route("POST", "/v1/live") is None


def test_team_route_with_trailing_slash() -> None:
    match = route("GET", "/v1/teams/t-ars/")
    assert match is not None
    assert match.handler == "team"
