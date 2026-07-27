/* ═══════════════════════════════════════════════════════════════════════════
   TypeScript types mirroring the FastAPI Pydantic schemas.
   ═══════════════════════════════════════════════════════════════════════════ */

// ── User ──────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
  is_super: boolean;
  last_active_date: string | null;
  hearts_updated_at: string | null;
  created_at: string;
  is_streak_active: boolean;
  days_until_heart_refill: number;
  daily_xp: number;
  next_heart_in_seconds: number;
}

// ── Course tree ───────────────────────────────────────────────────────────
export interface Lesson {
  id: number;
  skill_id: number;
  title: string;
  order: number;
  xp_reward: number;
}

export interface SkillWithProgress {
  id: number;
  title: string;
  icon_name: string | null;
  order: number;
  total_lessons: number;
  completed_lessons: number;
  is_unlocked: boolean;
  is_completed: boolean;
  lessons: Lesson[];
}

export interface UnitWithSkills {
  id: number;
  title: string;
  description: string | null;
  order: number;
  color: string;
  skills: SkillWithProgress[];
}

export interface CourseTree {
  id: number;
  title: string;
  language_code: string;
  flag_icon: string | null;
  units: UnitWithSkills[];
}

// ── Exercise ──────────────────────────────────────────────────────────────
export type ExerciseType =
  | "multiple_choice"
  | "translate"
  | "match_pairs"
  | "fill_in_blank"
  | "type_answer"
  | "speak_answer";

export interface Exercise {
  id: number;
  lesson_id: number;
  type: ExerciseType;
  prompt: string;
  correct_answer: string;
  options_json: string | null;
  order: number;
}

// ── Lesson completion ─────────────────────────────────────────────────────
export interface LessonCompleteRequest {
  user_id: number;
  xp_gained: number;
  hearts_remaining: number;
  accuracy: number;
}

export interface UpdatedStats {
  xp: number;
  streak: number;
  hearts: number;
  is_streak_active: boolean;
  xp_gained: number;
  next_skill_unlocked: boolean;
  skill_completed: boolean;
}

// ── Leaderboard ───────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  id: number;
  user_id: number;
  total_xp: number;
  weekly_xp: number;
  user: {
    id: number;
    username: string;
    email: string;
    xp: number;
    streak: number;
    hearts: number;
    last_active_date: string | null;
    hearts_updated_at: string | null;
    created_at: string;
  };
}

export interface LeagueLeaderboard {
  league: string;
  league_icon: string;
  entries: LeaderboardEntry[];
}

// ── Achievement ───────────────────────────────────────────────────────────
export interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  target_value: number;
  category: string;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  progress: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
  achievement: Achievement;
}

// ── Following / Friends ───────────────────────────────────────────────────
export interface FollowingUser {
  id: number;
  username: string;
  xp: number;
  streak: number;
}

export interface FollowingList {
  following: FollowingUser[];
  followers_count: number;
  following_count: number;
}

