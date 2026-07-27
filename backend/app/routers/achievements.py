"""
Achievements endpoints – user achievement progress.
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import User, UserAchievement
from app.schemas import UserAchievementResponse

router = APIRouter(prefix="/user", tags=["Achievements"])

DEFAULT_USER_ID = 1


def _update_achievements(db: Session, user: User) -> None:
    """Recalculate achievement progress for a user."""
    user_achs = (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == user.id)
        .all()
    )

    for ua in user_achs:
        if ua.is_unlocked:
            continue

        ach = ua.achievement
        if ach is None:
            continue

        new_progress = ua.progress

        if ach.category == "streak":
            new_progress = min(user.streak, ach.target_value)
        elif ach.category == "xp":
            new_progress = min(user.xp, ach.target_value)
        # sharpshooter tracked only in lesson completion

        if new_progress > ua.progress:
            ua.progress = new_progress

        if ua.progress >= ach.target_value:
            ua.is_unlocked = True
            ua.unlocked_at = datetime.utcnow()


# ── GET /user/achievements ─────────────────────────────────────────────────
@router.get("/achievements", response_model=List[UserAchievementResponse])
def get_user_achievements(user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    """Return all achievements with user progress."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    _update_achievements(db, user)
    db.commit()

    return (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == user_id)
        .options(joinedload(UserAchievement.achievement))
        .all()
    )
