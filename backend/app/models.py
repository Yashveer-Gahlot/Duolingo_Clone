"""
SQLAlchemy ORM models for the Duolingo Clone.

Tables
------
- User             – learner profile, XP, streak, hearts
- Course           – language course (e.g. Spanish)
- Unit             – thematic unit within a course
- Skill            – individual skill node on the learning path
- Lesson           – single lesson inside a skill
- Exercise         – one question / task inside a lesson
- UserProgress     – per-user per-skill progress tracker
- LeaderboardEntry – weekly & total XP rankings
"""

from datetime import datetime, date
from typing import List

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from app.database import Base


# ---------------------------------------------------------------------------
# Exercise type enum
# ---------------------------------------------------------------------------
import enum


class ExerciseType(str, enum.Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRANSLATE = "translate"
    MATCH_PAIRS = "match_pairs"
    FILL_IN_BLANK = "fill_in_blank"
    TYPE_ANSWER = "type_answer"


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    streak: Mapped[int] = mapped_column(Integer, default=0)
    hearts: Mapped[int] = mapped_column(Integer, default=5)
    gems: Mapped[int] = mapped_column(Integer, default=500)
    is_super: Mapped[bool] = mapped_column(Boolean, default=False)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    hearts_updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    progress: Mapped[List["UserProgress"]] = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")
    leaderboard_entry: Mapped["LeaderboardEntry | None"] = relationship("LeaderboardEntry", back_populates="user", uselist=False, cascade="all, delete-orphan")
    user_achievements: Mapped[List["UserAchievement"]] = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    daily_activities: Mapped[List["DailyActivity"]] = relationship("DailyActivity", back_populates="user", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Course
# ---------------------------------------------------------------------------
class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    language_code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    flag_icon: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    units: Mapped[List["Unit"]] = relationship("Unit", back_populates="course", cascade="all, delete-orphan", order_by="Unit.order")


# ---------------------------------------------------------------------------
# Unit
# ---------------------------------------------------------------------------
class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    course_id: Mapped[int] = mapped_column(Integer, ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    color: Mapped[str] = mapped_column(String(20), default="#58cc02")

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="units")
    skills: Mapped[List["Skill"]] = relationship("Skill", back_populates="unit", cascade="all, delete-orphan", order_by="Skill.order")


# ---------------------------------------------------------------------------
# Skill
# ---------------------------------------------------------------------------
class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    unit_id: Mapped[int] = mapped_column(Integer, ForeignKey("units.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    icon_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    total_lessons: Mapped[int] = mapped_column(Integer, default=1)

    # Relationships
    unit: Mapped["Unit"] = relationship("Unit", back_populates="skills")
    lessons: Mapped[List["Lesson"]] = relationship("Lesson", back_populates="skill", cascade="all, delete-orphan", order_by="Lesson.order")
    user_progress: Mapped[List["UserProgress"]] = relationship("UserProgress", back_populates="skill", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Lesson
# ---------------------------------------------------------------------------
class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    order: Mapped[int] = mapped_column(Integer, default=0)
    xp_reward: Mapped[int] = mapped_column(Integer, default=10)

    # Relationships
    skill: Mapped["Skill"] = relationship("Skill", back_populates="lessons")
    exercises: Mapped[List["Exercise"]] = relationship("Exercise", back_populates="lesson", cascade="all, delete-orphan", order_by="Exercise.order")


# ---------------------------------------------------------------------------
# Exercise
# ---------------------------------------------------------------------------
class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lesson_id: Mapped[int] = mapped_column(Integer, ForeignKey("lessons.id"), nullable=False)
    type: Mapped[str] = mapped_column(
        SAEnum(ExerciseType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    options_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string / array
    order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="exercises")


# ---------------------------------------------------------------------------
# UserProgress
# ---------------------------------------------------------------------------
class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id: Mapped[int] = mapped_column(Integer, ForeignKey("skills.id"), nullable=False)
    completed_lessons: Mapped[int] = mapped_column(Integer, default=0)
    is_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="progress")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="user_progress")


# ---------------------------------------------------------------------------
# LeaderboardEntry
# ---------------------------------------------------------------------------
class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    weekly_xp: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="leaderboard_entry")


# ---------------------------------------------------------------------------
# Achievement
# ---------------------------------------------------------------------------
class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String(10), default="🏆")
    color: Mapped[str] = mapped_column(String(20), default="#ffc800")
    target_value: Mapped[int] = mapped_column(Integer, default=1)
    category: Mapped[str] = mapped_column(String(50), default="general")

    # Relationships
    user_achievements: Mapped[List["UserAchievement"]] = relationship(
        "UserAchievement", back_populates="achievement", cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# UserAchievement (link table)
# ---------------------------------------------------------------------------
class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id: Mapped[int] = mapped_column(Integer, ForeignKey("achievements.id"), nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    is_unlocked: Mapped[bool] = mapped_column(Boolean, default=False)
    unlocked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="user_achievements")
    achievement: Mapped["Achievement"] = relationship("Achievement", back_populates="user_achievements")


# ---------------------------------------------------------------------------
# UserFollow (friends graph)
# ---------------------------------------------------------------------------
class UserFollow(Base):
    __tablename__ = "user_follows"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    follower_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    following_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# DailyActivity (XP earned per day)
# ---------------------------------------------------------------------------
class DailyActivity(Base):
    __tablename__ = "daily_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    activity_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    lessons_completed: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="daily_activities")

