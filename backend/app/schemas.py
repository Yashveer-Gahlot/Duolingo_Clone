"""
Pydantic schemas for request / response validation.

Naming convention:
  - *Base      – shared fields (used for creation)
  - *Create    – request body for POST endpoints
  - *Update    – optional fields for PATCH endpoints
  - *Response  – full model returned to the client (includes id & timestamps)
"""

from __future__ import annotations

from datetime import datetime, date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ═══════════════════════════════════════════════════════════════════════════
# User
# ═══════════════════════════════════════════════════════════════════════════
class UserBase(BaseModel):
    username: str = Field(..., min_length=2, max_length=50)
    email: str = Field(..., max_length=120)


class UserCreate(UserBase):
    """Request body when creating a new user."""
    pass


class UserUpdate(BaseModel):
    """Optional fields that can be patched on a user."""
    username: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[str] = Field(None, max_length=120)
    xp: Optional[int] = None
    streak: Optional[int] = None
    hearts: Optional[int] = Field(None, ge=0, le=5)
    last_active_date: Optional[date] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    xp: int
    streak: int
    hearts: int
    gems: int
    is_super: bool
    last_active_date: Optional[date] = None
    hearts_updated_at: Optional[datetime] = None
    created_at: datetime


# ═══════════════════════════════════════════════════════════════════════════
# Course
# ═══════════════════════════════════════════════════════════════════════════
class CourseBase(BaseModel):
    title: str = Field(..., max_length=100)
    language_code: str = Field(..., max_length=10)
    flag_icon: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class CourseWithUnitsResponse(CourseResponse):
    """Course including its nested units."""
    units: List["UnitResponse"] = []


# ═══════════════════════════════════════════════════════════════════════════
# Unit
# ═══════════════════════════════════════════════════════════════════════════
class UnitBase(BaseModel):
    course_id: int
    title: str = Field(..., max_length=150)
    description: Optional[str] = None
    order: int = 0


class UnitCreate(UnitBase):
    pass


class UnitResponse(UnitBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class UnitWithSkillsResponse(UnitResponse):
    """Unit including its nested skills."""
    skills: List["SkillResponse"] = []


# ═══════════════════════════════════════════════════════════════════════════
# Skill
# ═══════════════════════════════════════════════════════════════════════════
class SkillBase(BaseModel):
    unit_id: int
    title: str = Field(..., max_length=150)
    icon_name: Optional[str] = None
    order: int = 0
    total_lessons: int = 1


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class SkillWithLessonsResponse(SkillResponse):
    """Skill including its nested lessons."""
    lessons: List["LessonResponse"] = []


# ═══════════════════════════════════════════════════════════════════════════
# Lesson
# ═══════════════════════════════════════════════════════════════════════════
class LessonBase(BaseModel):
    skill_id: int
    title: str = Field(..., max_length=150)
    order: int = 0
    xp_reward: int = 10


class LessonCreate(LessonBase):
    pass


class LessonResponse(LessonBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class LessonWithExercisesResponse(LessonResponse):
    """Lesson including its nested exercises."""
    exercises: List["ExerciseResponse"] = []


# ═══════════════════════════════════════════════════════════════════════════
# Exercise
# ═══════════════════════════════════════════════════════════════════════════
class ExerciseBase(BaseModel):
    lesson_id: int
    type: str = Field(..., description="One of: multiple_choice, translate, match_pairs, fill_in_blank, type_answer")
    prompt: str
    correct_answer: str
    options_json: Optional[str] = None
    order: int = 0


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseResponse(ExerciseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


# ═══════════════════════════════════════════════════════════════════════════
# User Progress
# ═══════════════════════════════════════════════════════════════════════════
class UserProgressBase(BaseModel):
    user_id: int
    skill_id: int
    completed_lessons: int = 0
    is_unlocked: bool = False
    is_completed: bool = False


class UserProgressCreate(UserProgressBase):
    pass


class UserProgressUpdate(BaseModel):
    completed_lessons: Optional[int] = None
    is_unlocked: Optional[bool] = None
    is_completed: Optional[bool] = None


class UserProgressResponse(UserProgressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    updated_at: datetime


# ═══════════════════════════════════════════════════════════════════════════
# Leaderboard
# ═══════════════════════════════════════════════════════════════════════════
class LeaderboardEntryBase(BaseModel):
    user_id: int
    total_xp: int = 0
    weekly_xp: int = 0


class LeaderboardEntryCreate(LeaderboardEntryBase):
    pass


class LeaderboardEntryResponse(LeaderboardEntryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class LeaderboardEntryWithUserResponse(LeaderboardEntryResponse):
    """Leaderboard entry with embedded user info for ranking display."""
    user: UserResponse


# ═══════════════════════════════════════════════════════════════════════════
# Generic response helpers
# ═══════════════════════════════════════════════════════════════════════════
class MessageResponse(BaseModel):
    """Simple message envelope."""
    message: str


class AnswerSubmission(BaseModel):
    """Request body when a user submits an answer to an exercise."""
    exercise_id: int
    user_answer: str


class AnswerResult(BaseModel):
    """Response after checking an answer."""
    is_correct: bool
    correct_answer: str
    xp_earned: int = 0


# ═══════════════════════════════════════════════════════════════════════════
# Gameplay / Prompt-2 specific schemas
# ═══════════════════════════════════════════════════════════════════════════
class LessonCompleteRequest(BaseModel):
    """POST body for completing a lesson."""
    user_id: int
    xp_gained: int = 0
    hearts_remaining: int = 5
    accuracy: float = 0.0


class UserProfileResponse(BaseModel):
    """Rich user profile returned by GET /api/user/profile."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    xp: int
    streak: int
    hearts: int
    gems: int
    is_super: bool
    last_active_date: Optional[date] = None
    hearts_updated_at: Optional[datetime] = None
    created_at: datetime
    # computed / extra fields
    is_streak_active: bool = False
    days_until_heart_refill: int = 0
    daily_xp: int = 0
    next_heart_in_seconds: int = 0


class SkillWithProgressResponse(BaseModel):
    """Skill node with progress flags attached."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    icon_name: Optional[str] = None
    order: int
    total_lessons: int
    # progress
    completed_lessons: int = 0
    is_unlocked: bool = False
    is_completed: bool = False
    lessons: List["LessonResponse"] = []


class UnitWithSkillProgressResponse(BaseModel):
    """Unit containing skills with progress."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    order: int
    color: str = "#58cc02"
    skills: List[SkillWithProgressResponse] = []


class CourseTreeResponse(BaseModel):
    """Full course tree: Course → Units → Skills (with progress) → Lessons."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    language_code: str
    flag_icon: Optional[str] = None
    units: List[UnitWithSkillProgressResponse] = []


class UpdatedStatsResponse(BaseModel):
    """Response after completing a lesson."""
    xp: int
    streak: int
    hearts: int
    is_streak_active: bool
    xp_gained: int
    next_skill_unlocked: bool = False
    skill_completed: bool = False


# ---------------------------------------------------------------------------
# Rebuild forward-referenced models so nested schemas resolve properly
# ---------------------------------------------------------------------------
CourseWithUnitsResponse.model_rebuild()
UnitWithSkillsResponse.model_rebuild()
SkillWithLessonsResponse.model_rebuild()
LessonWithExercisesResponse.model_rebuild()
LeaderboardEntryWithUserResponse.model_rebuild()
SkillWithProgressResponse.model_rebuild()
UnitWithSkillProgressResponse.model_rebuild()
CourseTreeResponse.model_rebuild()


# ═══════════════════════════════════════════════════════════════════════════
# Achievement
# ═══════════════════════════════════════════════════════════════════════════
class AchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    name: str
    description: str
    icon: str
    color: str
    target_value: int
    category: str


class UserAchievementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    achievement_id: int
    progress: int
    is_unlocked: bool
    unlocked_at: Optional[datetime] = None
    achievement: AchievementResponse


class UserAchievementListResponse(BaseModel):
    achievements: List[UserAchievementResponse] = []


# ═══════════════════════════════════════════════════════════════════════════
# User Follow / Friends
# ═══════════════════════════════════════════════════════════════════════════
class UserFollowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    follower_id: int
    following_id: int
    created_at: datetime


class FollowingUserResponse(BaseModel):
    """User info for the following list."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    xp: int
    streak: int


class FollowingListResponse(BaseModel):
    following: List[FollowingUserResponse] = []
    followers_count: int = 0
    following_count: int = 0


# ═══════════════════════════════════════════════════════════════════════════
# League-enhanced leaderboard
# ═══════════════════════════════════════════════════════════════════════════
class LeagueLeaderboardResponse(BaseModel):
    league: str
    league_icon: str
    entries: List[LeaderboardEntryWithUserResponse] = []


# Rebuild new schemas
UserAchievementResponse.model_rebuild()
UserAchievementListResponse.model_rebuild()
LeagueLeaderboardResponse.model_rebuild()

