"""
User endpoints – profile (with heart regen + daily XP), hearts, and Super purchase.
"""

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, DailyActivity
from app.schemas import UserProfileResponse, MessageResponse

router = APIRouter(prefix="/user", tags=["User"])

DEFAULT_USER_ID = 1
SUPER_COST_GEMS = 1000
HEART_REGEN_SECONDS = 4 * 3600  # 4 hours per heart
MAX_HEARTS = 5


def _regenerate_hearts(user: User, now: datetime) -> int:
    """Regenerate hearts based on time since last update.

    Returns the number of seconds until the next heart regeneration
    (0 if hearts are full).
    """
    if user.is_super or user.hearts >= MAX_HEARTS:
        return 0

    if user.hearts_updated_at is None:
        user.hearts_updated_at = now
        return HEART_REGEN_SECONDS

    elapsed = (now - user.hearts_updated_at).total_seconds()
    hearts_to_add = int(elapsed // HEART_REGEN_SECONDS)

    if hearts_to_add > 0:
        user.hearts = min(user.hearts + hearts_to_add, MAX_HEARTS)
        # Advance the timestamp by the consumed regen periods
        consumed_seconds = hearts_to_add * HEART_REGEN_SECONDS
        user.hearts_updated_at = user.hearts_updated_at.replace(
            second=user.hearts_updated_at.second
        ) + __import__("datetime").timedelta(seconds=consumed_seconds)

    if user.hearts >= MAX_HEARTS:
        user.hearts_updated_at = now
        return 0

    # Time remaining until next heart
    time_since_last = (now - user.hearts_updated_at).total_seconds()
    return max(0, int(HEART_REGEN_SECONDS - time_since_last))


def _get_daily_xp(db: Session, user_id: int, today: date) -> int:
    """Sum XP earned today from the daily_activities table."""
    result = (
        db.query(func.coalesce(func.sum(DailyActivity.xp_earned), 0))
        .filter(DailyActivity.user_id == user_id, DailyActivity.activity_date == today)
        .scalar()
    )
    return int(result)


# ── GET /user/profile ──────────────────────────────────────────────────────
@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    """Return user data with heart regeneration and daily XP."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    now = datetime.utcnow()
    today = date.today()

    # Heart regeneration
    next_heart_secs = _regenerate_hearts(user, now)

    # Streak check
    is_streak_active = (
        user.last_active_date is not None
        and (today - user.last_active_date).days <= 1
    )

    # Daily XP
    daily_xp = _get_daily_xp(db, user.id, today)

    # Persist any heart regen changes
    db.commit()

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        xp=user.xp,
        streak=user.streak,
        hearts=user.hearts,
        gems=user.gems,
        is_super=user.is_super,
        last_active_date=user.last_active_date,
        hearts_updated_at=user.hearts_updated_at,
        created_at=user.created_at,
        is_streak_active=is_streak_active,
        days_until_heart_refill=0 if user.hearts >= MAX_HEARTS else 1,
        daily_xp=daily_xp,
        next_heart_in_seconds=next_heart_secs,
    )


# ── POST /user/refill-hearts ──────────────────────────────────────────────
@router.post("/refill-hearts", response_model=MessageResponse)
def refill_hearts(user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    """Restore the user's hearts back to 5."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hearts = MAX_HEARTS
    user.hearts_updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Hearts refilled to 5"}


# ── POST /user/purchase-super ─────────────────────────────────────────────
@router.post("/purchase-super", response_model=MessageResponse)
def purchase_super(user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    """Purchase Super Duolingo for 1000 gems → unlimited hearts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_super:
        return {"message": "Already a Super user"}

    if user.gems < SUPER_COST_GEMS:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough gems. Need {SUPER_COST_GEMS}, have {user.gems}",
        )

    user.gems -= SUPER_COST_GEMS
    user.is_super = True
    user.hearts = MAX_HEARTS
    db.commit()
    return {"message": "Super Duolingo activated! Enjoy unlimited hearts."}
