"""DTO TypedDicts mirroring @platform/shared-types.

The frontend receives plain JSON shaped exactly like its TypeScript interfaces:
field names, optionality, and value types must match. These TypedDicts are
static-type aids for the proxy author only — JSON is serialized as-is.

When @platform/shared-types changes, update here in lockstep. A future phase
could codegen one side from a shared schema.
"""

from typing import Literal, NotRequired, TypedDict

MatchStatus = Literal["scheduled", "live", "halftime", "finished", "postponed"]
MatchEventType = Literal["goal", "yellow-card", "red-card", "substitution"]
MatchSide = Literal["home", "away"]
CompetitionCode = Literal["UCL", "PL", "LIGA", "INT"]


class Team(TypedDict):
    id: str
    name: str
    shortName: NotRequired[str]
    crestUrl: NotRequired[str]


class Competition(TypedDict):
    id: str
    name: str
    code: CompetitionCode


class TeamSide(TypedDict):
    team: Team
    score: int


class MatchEvent(TypedDict):
    minute: int
    addedTime: NotRequired[int]
    type: MatchEventType
    side: MatchSide
    player: str
    assist: NotRequired[str]
    playerOut: NotRequired[str]


class MatchSummary(TypedDict):
    id: str
    competition: Competition
    status: MatchStatus
    home: TeamSide
    away: TeamSide
    kickoffAt: str  # ISO 8601
    minute: NotRequired[int]
    events: NotRequired[list[MatchEvent]]


class Fixture(TypedDict):
    id: str
    competition: Competition
    home: Team
    away: Team
    kickoffAt: str  # ISO 8601
    matchday: NotRequired[int]


class StandingRow(TypedDict):
    position: int
    team: Team
    played: int
    won: int
    drawn: int
    lost: int
    goalsFor: int
    goalsAgainst: int
    goalDifference: int
    points: int


class Standing(TypedDict):
    competition: Competition
    rows: list[StandingRow]
    updatedAt: str  # ISO 8601


class TeamCompetitionStanding(TypedDict):
    competition: Competition
    row: StandingRow
