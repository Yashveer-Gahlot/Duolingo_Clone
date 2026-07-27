"""
Course endpoints – course tree with skill progress.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Course, Unit, Skill, UserProgress
from app.schemas import (
    CourseTreeResponse,
    UnitWithSkillProgressResponse,
    SkillWithProgressResponse,
    LessonResponse,
)

router = APIRouter(prefix="/courses", tags=["Courses"])

DEFAULT_USER_ID = 1


# ── GET /courses/current ──────────────────────────────────────────────────
@router.get("/current", response_model=CourseTreeResponse)
def get_current_course(user_id: int = DEFAULT_USER_ID, db: Session = Depends(get_db)):
    """Return full tree of Units → Skills → Lessons with progress flags."""
    course = (
        db.query(Course)
        .options(
            joinedload(Course.units)
            .joinedload(Unit.skills)
            .joinedload(Skill.lessons)
        )
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="No course found")

    # Fetch all progress rows for this user in one query
    progress_rows = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user_id)
        .all()
    )
    progress_map = {p.skill_id: p for p in progress_rows}

    # Build response tree
    units_out: list[UnitWithSkillProgressResponse] = []
    for unit in sorted(course.units, key=lambda u: u.order):
        skills_out: list[SkillWithProgressResponse] = []
        for skill in sorted(unit.skills, key=lambda s: s.order):
            prog = progress_map.get(skill.id)
            lessons_out = [
                LessonResponse(
                    id=les.id,
                    skill_id=les.skill_id,
                    title=les.title,
                    order=les.order,
                    xp_reward=les.xp_reward,
                )
                for les in sorted(skill.lessons, key=lambda l: l.order)
            ]
            skills_out.append(SkillWithProgressResponse(
                id=skill.id,
                title=skill.title,
                icon_name=skill.icon_name,
                order=skill.order,
                total_lessons=skill.total_lessons,
                completed_lessons=prog.completed_lessons if prog else 0,
                is_unlocked=prog.is_unlocked if prog else False,
                is_completed=prog.is_completed if prog else False,
                lessons=lessons_out,
            ))
        units_out.append(UnitWithSkillProgressResponse(
            id=unit.id,
            title=unit.title,
            description=unit.description,
            order=unit.order,
            color=unit.color,
            skills=skills_out,
        ))

    return CourseTreeResponse(
        id=course.id,
        title=course.title,
        language_code=course.language_code,
        flag_icon=course.flag_icon,
        units=units_out,
    )
