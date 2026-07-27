"""
Lesson endpoints – exercises and lesson completion.
"""

from datetime import date, datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    User,
    Lesson,
    Skill,
    Exercise,
    UserProgress,
    LeaderboardEntry,
    UserAchievement,
    DailyActivity,
)
from app.schemas import (
    ExerciseResponse,
    LessonCompleteRequest,
    UpdatedStatsResponse,
)

router = APIRouter(prefix="/lessons", tags=["Lessons"])


# ── GET /lessons/{lesson_id}/exercises ─────────────────────────────────────
@router.get("/{lesson_id}/exercises", response_model=List[ExerciseResponse])
def get_lesson_exercises(lesson_id: int, db: Session = Depends(get_db)):
    """Return all exercises for a given lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return (
        db.query(Exercise)
        .filter(Exercise.lesson_id == lesson_id)
        .order_by(Exercise.order)
        .all()
    )


# ── POST /lessons/{lesson_id}/complete ─────────────────────────────────────
@router.post("/{lesson_id}/complete", response_model=UpdatedStatsResponse)
def complete_lesson(lesson_id: int, payload: LessonCompleteRequest, db: Session = Depends(get_db)):
    """
    Complete a lesson:
    - Update user XP and hearts
    - Recalculate streak based on date
    - Update progress (completed_lessons)
    - Unlock next skill if current skill is completed
    - Update achievements progress
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ── XP ────────────────────────────────────────────────────────────
    user.xp += payload.xp_gained
    user.hearts = payload.hearts_remaining

    # ── Streak recalculation ──────────────────────────────────────────
    today = date.today()
    is_streak_active = True

    if user.last_active_date is None:
        user.streak = 1
    elif user.last_active_date == today:
        pass  # already counted today
    elif user.last_active_date == today - timedelta(days=1):
        user.streak += 1
    else:
        user.streak = 1  # streak broken, restart

    user.last_active_date = today

    # ── Update leaderboard XP ─────────────────────────────────────────
    lb = db.query(LeaderboardEntry).filter(LeaderboardEntry.user_id == user.id).first()
    if lb:
        lb.total_xp += payload.xp_gained
        lb.weekly_xp += payload.xp_gained

    # ── Log daily activity ────────────────────────────────────────────
    daily = (
        db.query(DailyActivity)
        .filter(DailyActivity.user_id == user.id, DailyActivity.activity_date == today)
        .first()
    )
    if daily:
        daily.xp_earned += payload.xp_gained
        daily.lessons_completed += 1
        daily.updated_at = datetime.utcnow()
    else:
        db.add(DailyActivity(
            user_id=user.id,
            activity_date=today,
            xp_earned=payload.xp_gained,
            lessons_completed=1,
        ))

    # ── Progress tracking ─────────────────────────────────────────────
    skill = lesson.skill
    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user.id, UserProgress.skill_id == skill.id)
        .first()
    )

    skill_completed = False
    next_skill_unlocked = False

    if progress:
        progress.completed_lessons += 1
        progress.updated_at = datetime.utcnow()

        # Check if skill is now complete
        if progress.completed_lessons >= skill.total_lessons:
            progress.is_completed = True
            skill_completed = True

            # Unlock next skill in the same unit
            next_skill = (
                db.query(Skill)
                .filter(Skill.unit_id == skill.unit_id, Skill.order > skill.order)
                .order_by(Skill.order)
                .first()
            )
            if next_skill:
                next_prog = (
                    db.query(UserProgress)
                    .filter(UserProgress.user_id == user.id, UserProgress.skill_id == next_skill.id)
                    .first()
                )
                if next_prog and not next_prog.is_unlocked:
                    next_prog.is_unlocked = True
                    next_skill_unlocked = True
                elif not next_prog:
                    db.add(UserProgress(
                        user_id=user.id,
                        skill_id=next_skill.id,
                        is_unlocked=True,
                    ))
                    next_skill_unlocked = True

    # ── Update achievements progress ──────────────────────────────────
    _update_achievements(db, user, payload.accuracy)

    db.commit()
    db.refresh(user)

    return UpdatedStatsResponse(
        xp=user.xp,
        streak=user.streak,
        hearts=user.hearts,
        is_streak_active=is_streak_active,
        xp_gained=payload.xp_gained,
        next_skill_unlocked=next_skill_unlocked,
        skill_completed=skill_completed,
    )


def _update_achievements(db: Session, user: User, accuracy: float = 0.0) -> None:
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
        elif ach.key == "sharpshooter" and accuracy >= 100.0:
            new_progress = 1  # binary: 0 or 1

        if new_progress > ua.progress:
            ua.progress = new_progress

        if ua.progress >= ach.target_value:
            ua.is_unlocked = True
            ua.unlocked_at = datetime.utcnow()
