/* ═══════════════════════════════════════════════════════════════════════════
   API Client – typed fetch helpers for the FastAPI backend.
   ═══════════════════════════════════════════════════════════════════════════ */

import type {
  UserProfile,
  CourseTree,
  Exercise,
  LessonCompleteRequest,
  UpdatedStats,
  LeaderboardEntry,
  LeagueLeaderboard,
  UserAchievement,
  FollowingList,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000/api");

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (err) {
    throw new Error(
      `Cannot reach backend at ${API_BASE}${path}. Is the server running? (${err})`
    );
  }
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API ${res.status}: ${errorBody}`);
  }
  return res.json() as Promise<T>;
}

// ── User ──────────────────────────────────────────────────────────────────
export function getUserProfile(userId = 1): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/user/profile?user_id=${userId}`);
}

export function refillHearts(userId = 1): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/user/refill-hearts?user_id=${userId}`,
    { method: "POST" }
  );
}

// ── Course ────────────────────────────────────────────────────────────────
export function getCurrentCourse(userId = 1): Promise<CourseTree> {
  return apiFetch<CourseTree>(`/courses/current?user_id=${userId}`);
}

// ── Lessons ───────────────────────────────────────────────────────────────
export function getLessonExercises(lessonId: number): Promise<Exercise[]> {
  return apiFetch<Exercise[]>(`/lessons/${lessonId}/exercises`);
}

export function completeLesson(
  lessonId: number,
  body: LessonCompleteRequest
): Promise<UpdatedStats> {
  return apiFetch<UpdatedStats>(`/lessons/${lessonId}/complete`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ── Leaderboard ───────────────────────────────────────────────────────────
export function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`);
}

export function getLeagueLeaderboard(userId = 1): Promise<LeagueLeaderboard> {
  return apiFetch<LeagueLeaderboard>(`/leaderboard/league?user_id=${userId}`);
}

// ── Achievements ──────────────────────────────────────────────────────────
export function getUserAchievements(userId = 1): Promise<UserAchievement[]> {
  return apiFetch<UserAchievement[]>(`/user/achievements?user_id=${userId}`);
}

// ── Following / Friends ───────────────────────────────────────────────────
export function getFollowing(userId = 1): Promise<FollowingList> {
  return apiFetch<FollowingList>(`/user/following?user_id=${userId}`);
}

export function followUser(followerId: number, followingId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/user/follow?follower_id=${followerId}&following_id=${followingId}`,
    { method: "POST" }
  );
}

export function unfollowUser(followerId: number, followingId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/user/unfollow?follower_id=${followerId}&following_id=${followingId}`,
    { method: "DELETE" }
  );
}

// ── Shop / Super ──────────────────────────────────────────────────────────
export function purchaseSuper(userId = 1): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/user/purchase-super?user_id=${userId}`,
    { method: "POST" }
  );
}


