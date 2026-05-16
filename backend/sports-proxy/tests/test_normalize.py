"""Normalize-layer tests: API-Football payloads → our DTOs."""

from tests.conftest import load_fixture

from sports_proxy.normalize.fixture import normalize_fixture
from sports_proxy.normalize.match import normalize_match
from sports_proxy.normalize.standing import normalize_standing
from sports_proxy.normalize.team import normalize_team

# === Match ===


def test_normalize_match_returns_full_summary() -> None:
    raw = load_fixture("api_football_live_fixture.json")
    summary = normalize_match(raw)
    assert summary is not None
    assert summary["id"] == "m-12345"
    assert summary["competition"]["code"] == "UCL"
    assert summary["status"] == "live"
    assert summary["home"]["team"]["id"] == "t-rma"
    assert summary["home"]["score"] == 1
    assert summary["away"]["team"]["id"] == "t-mci"
    assert summary["away"]["score"] == 1
    assert summary["minute"] == 67


def test_normalize_match_includes_events_with_assists() -> None:
    raw = load_fixture("api_football_live_fixture.json")
    summary = normalize_match(raw)
    assert summary is not None
    events = summary.get("events") or []
    assert len(events) == 4
    goal = next(e for e in events if e["type"] == "goal" and e["side"] == "home")
    assert goal["player"] == "K. Mbappé"
    assert goal["assist"] == "J. Bellingham"


def test_normalize_match_substitution_swaps_player_and_player_out() -> None:
    raw = load_fixture("api_football_live_fixture.json")
    summary = normalize_match(raw)
    assert summary is not None
    events = summary.get("events") or []
    sub = next(e for e in events if e["type"] == "substitution")
    # API-Football: player = goes off, assist = comes on
    # Our shape:    player = comes on, playerOut = goes off
    assert sub["player"] == "F. Valverde"
    assert sub["playerOut"] == "L. Modrić"


def test_normalize_match_returns_none_for_unknown_competition() -> None:
    raw = load_fixture("api_football_live_fixture.json")
    raw["league"]["id"] = 999999
    assert normalize_match(raw) is None


# === Fixture ===


def test_normalize_fixture_returns_upcoming_shape() -> None:
    raw = load_fixture("api_football_upcoming_fixture.json")
    fx = normalize_fixture(raw)
    assert fx is not None
    assert fx["id"] == "f-67890"
    assert fx["competition"]["code"] == "PL"
    assert fx["home"]["id"] == "t-ars"
    assert fx["away"]["id"] == "t-che"
    assert fx["kickoffAt"] == "2026-05-01T18:30:00+00:00"
    assert fx.get("matchday") == 35


def test_normalize_fixture_drops_unknown_team() -> None:
    raw = load_fixture("api_football_upcoming_fixture.json")
    raw["teams"]["away"]["id"] = 999999
    assert normalize_fixture(raw) is None


# === Standing ===


def test_normalize_standing_returns_ordered_rows() -> None:
    raw = load_fixture("api_football_standings.json")
    standing = normalize_standing(raw)
    assert standing is not None
    assert standing["competition"]["code"] == "PL"
    rows = standing["rows"]
    assert len(rows) == 3
    # Sorted by points desc and re-ranked 1..n.
    assert rows[0]["position"] == 1
    assert rows[0]["team"]["id"] == "t-ars"
    assert rows[0]["points"] == 78
    assert rows[0]["goalDifference"] == 47
    assert rows[1]["position"] == 2
    assert rows[1]["team"]["id"] == "t-liv"


def test_normalize_standing_returns_iso_updated_at() -> None:
    raw = load_fixture("api_football_standings.json")
    standing = normalize_standing(raw)
    assert standing is not None
    # ISO 8601 with trailing Z.
    assert standing["updatedAt"].endswith("Z")


# === Team ===


def test_normalize_team_with_logo_and_code() -> None:
    raw = load_fixture("api_football_team.json")
    team = normalize_team(raw)
    assert team is not None
    assert team["id"] == "t-ars"
    assert team["name"] == "Arsenal"
    assert team["shortName"] == "ARS"
    assert team["crestUrl"] == "https://media.api-sports.io/football/teams/42.png"


def test_normalize_team_unknown_id_returns_none() -> None:
    raw = load_fixture("api_football_team.json")
    raw["team"]["id"] = 999999
    assert normalize_team(raw) is None
