"""
Leaderboard endpoints – rankings and league assignment.

League is determined by the user's **rank position** on the weekly
leaderboard — matching how Duolingo actually works — not by fixed
XP thresholds.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import User, LeaderboardEntry
from app.schemas import (
    LeaderboardEntryWithUserResponse,
    LeagueLeaderboardResponse,
)

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

DEFAULT_USER_ID = 1

# League tiers ordered from best to worst.
# Assignments are based on rank position among total players.
LEAGUES = [
    {"name": "Diamond",  "icon": "💎", "cutoff": 0.10},  # top 10 %
    {"name": "Gold",     "icon": "🥇", "cutoff": 0.30},  # top 30 %
    {"name": "Silver",   "icon": "🥈", "cutoff": 0.60},  # top 60 %
    {"name": "Bronze",   "icon": "🥉", "cutoff": 1.00},  # everyone else
]


def _get_league_by_rank(rank: int, total: int) -> tuple[str, str]:
    """Return (league_name, league_icon) based on the user's rank position.

    rank: 1-based position (1 = highest XP)
    total: total number of players on the leaderboard
    """
    if total == 0:
        return "Bronze", "🥉"

    percentile = rank / total  # 1/6 = 0.166 → top 16%

    for league in LEAGUES:
        if percentile <= league["cutoff"]:
            return league["name"], league["icon"]

    return "Bronze", "🥉"


# ── GET /leaderboard ──────────────────────────────────────────────────────
@router.get("", response_model=List[LeaderboardEntryWithUserResponse])
def get_leaderboard(limit: int = 20, db: Session = Depends(get_db)):
    """Return leaderboard ranking sorted by total XP descending."""
    return (
        db.query(LeaderboardEntry)
        .options(joinedload(LeaderboardEntry.user))
        .order_by(LeaderboardEntry.total_xp.desc())
        .limit(limit)
        .all()
    )


# ── GET /leaderboard/league ───────────────────────────────────────────────
@router.get("/league", response_model=LeagueLeaderboardResponse)
def get_league_leaderboard(user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    """Return leaderboard with league determined by the user's rank position."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all entries sorted by total XP descending
    entries = (
        db.query(LeaderboardEntry)
        .options(joinedload(LeaderboardEntry.user))
        .order_by(LeaderboardEntry.total_xp.desc())
        .all()
    )

    total = len(entries)

    # Find the current user's rank (1-based)
    user_rank = total  # default to last
    for idx, entry in enumerate(entries):
        if entry.user_id == user_id:
            user_rank = idx + 1
            break

    league_name, league_icon = _get_league_by_rank(user_rank, total)

    return LeagueLeaderboardResponse(
        league=league_name,
        league_icon=league_icon,
        entries=entries,
    )
