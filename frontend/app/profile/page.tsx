"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { ProgressBar } from "@/components/ui";
import {
  getUserProfile,
  getUserAchievements,
  getFollowing,
  followUser,
  unfollowUser,
} from "@/lib/api";
import type {
  UserProfile,
  UserAchievement,
  FollowingList,
  FollowingUser,
} from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════
   Profile Page – Stats, Achievements, Following
   ═══════════════════════════════════════════════════════════════════════════ */

const CURRENT_USER_ID = 1;

const AVATAR_COLORS = [
  "#58cc02", "#1cb0f6", "#ff4b4b", "#ffc800", "#ce82ff",
  "#ff9600", "#2b70c9", "#e5679b", "#00cd9c", "#7b61ff",
];

function getAvatarColor(idx: number) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [following, setFollowing] = useState<FollowingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"achievements" | "following">("achievements");

  const fetchData = useCallback(async () => {
    try {
      const [u, a, f] = await Promise.all([
        getUserProfile(CURRENT_USER_ID),
        getUserAchievements(CURRENT_USER_ID),
        getFollowing(CURRENT_USER_ID),
      ]);
      setUser(u);
      setAchievements(a);
      setFollowing(f);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUnfollow = async (followingId: number) => {
    await unfollowUser(CURRENT_USER_ID, followingId);
    // Refresh following list
    const f = await getFollowing(CURRENT_USER_ID);
    setFollowing(f);
  };

  const handleFollow = async (followingId: number) => {
    await followUser(CURRENT_USER_ID, followingId);
    const f = await getFollowing(CURRENT_USER_ID);
    setFollowing(f);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f7f7" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          🦉
        </motion.div>
      </div>
    );
  }

  // XP level calculation
  const xpPerLevel = 250;
  const currentLevel = Math.floor(user.xp / xpPerLevel) + 1;
  const xpIntoLevel = user.xp % xpPerLevel;
  const levelProgress = (xpIntoLevel / xpPerLevel) * 100;

  // Joined date
  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex profile-page" style={{ background: "var(--page-bg, #f7f7f7)" }}>
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-[240px] pb-24 md:pb-8">
        {/* ── Profile Header ────────────────────────────────────────── */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1cb0f6 0%, #2b70c9 100%)",
            borderRadius: "0 0 32px 32px",
            padding: "2rem 1.5rem 3rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />

          <div className="flex items-center gap-4 relative z-10">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "4px solid rgba(255,255,255,0.5)",
              }}
            >
              🦉
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">{user.username}</h1>
              <p className="text-sm text-white/70">Joined {joinedDate}</p>

              {/* Level badge */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="px-3 py-0.5 rounded-full text-xs font-black"
                  style={{ background: "#ffc800", color: "#3c3c3c" }}
                >
                  Level {currentLevel}
                </span>
                <span className="text-xs text-white/60">
                  {xpIntoLevel}/{xpPerLevel} XP to next level
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress bar */}
          <div className="mt-4 relative z-10">
            <ProgressBar value={levelProgress} height={10} />
          </div>
        </motion.div>

        {/* ── Stats Grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mx-4 -mt-6 relative z-20">
          {[
            { label: "Total XP", value: user.xp.toLocaleString(), icon: "⚡", bg: "#fff3cc", color: "#e5b200" },
            { label: "Streak", value: `${user.streak} days`, icon: "🔥", bg: "#ffe0cc", color: "#ff9600" },
            { label: "Hearts", value: `${user.hearts}/5`, icon: "❤️", bg: "#ffdde4", color: "#ff4b4b" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl p-3 text-center"
              style={{
                background: "var(--card-bg, #ffffff)",
                border: "2px solid var(--card-border, #e5e5e5)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-lg"
                style={{ background: stat.bg }}
              >
                {stat.icon}
              </div>
              <p className="text-lg font-black" style={{ color: "var(--text-primary, #3c3c3c)" }}>
                {stat.value}
              </p>
              <p className="text-xs font-semibold" style={{ color: "#afafaf" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── Social stats ──────────────────────────────────────────── */}
        <div className="flex justify-center gap-8 mt-6 px-4">
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: "#3c3c3c" }}>
              {following?.following_count ?? 0}
            </p>
            <p className="text-xs font-semibold" style={{ color: "#afafaf" }}>Following</p>
          </div>
          <div className="w-px" style={{ background: "#e5e5e5" }} />
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: "#3c3c3c" }}>
              {following?.followers_count ?? 0}
            </p>
            <p className="text-xs font-semibold" style={{ color: "#afafaf" }}>Followers</p>
          </div>
        </div>

        {/* ── Tab Switcher ──────────────────────────────────────────── */}
        <div className="flex gap-1 mx-4 mt-6 p-1 rounded-2xl" style={{ background: "#e5e5e5" }}>
          {(["achievements", "following"] as const).map((tab) => (
            <button
              key={tab}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              style={{
                background: activeTab === tab ? "#ffffff" : "transparent",
                color: activeTab === tab ? "#3c3c3c" : "#afafaf",
                boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                border: "none",
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "achievements" ? "🏆 Achievements" : "👥 Following"}
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "achievements" ? (
            <motion.div
              key="achievements"
              className="mx-4 mt-4 space-y-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {achievements.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: "#afafaf" }}>
                  No achievements yet. Start learning!
                </p>
              ) : (
                achievements.map((ua, idx) => {
                  const ach = ua.achievement;
                  const progressPct = Math.min(
                    (ua.progress / ach.target_value) * 100,
                    100
                  );

                  return (
                    <motion.div
                      key={ua.id}
                      className="rounded-2xl p-4 flex items-center gap-4"
                      style={{
                        background: ua.is_unlocked
                          ? `linear-gradient(135deg, ${ach.color}15, ${ach.color}08)`
                          : "#ffffff",
                        border: ua.is_unlocked
                          ? `2px solid ${ach.color}`
                          : "2px solid #e5e5e5",
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {/* Icon */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          background: ua.is_unlocked ? ach.color : "#f7f7f7",
                          boxShadow: ua.is_unlocked
                            ? `0 4px 12px ${ach.color}40`
                            : "none",
                          opacity: ua.is_unlocked ? 1 : 0.5,
                        }}
                      >
                        {ach.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-sm font-extrabold"
                            style={{
                              color: ua.is_unlocked ? "#3c3c3c" : "#afafaf",
                            }}
                          >
                            {ach.name}
                          </h3>
                          {ua.is_unlocked && (
                            <span className="text-xs">✅</span>
                          )}
                        </div>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#afafaf" }}
                        >
                          {ach.description}
                        </p>

                        {/* Progress bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span
                              className="font-bold"
                              style={{
                                color: ua.is_unlocked ? ach.color : "#afafaf",
                              }}
                            >
                              {ua.progress}/{ach.target_value}
                            </span>
                            <span
                              className="font-semibold"
                              style={{ color: "#afafaf" }}
                            >
                              {Math.round(progressPct)}%
                            </span>
                          </div>
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{ background: "#e5e5e5" }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                background: ua.is_unlocked
                                  ? ach.color
                                  : "#afafaf",
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="following"
              className="mx-4 mt-4 space-y-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {!following || following.following.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: "#afafaf" }}>
                  You&apos;re not following anyone yet.
                </p>
              ) : (
                following.following.map((friend: FollowingUser, idx: number) => (
                  <motion.div
                    key={friend.id}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{
                      background: "#ffffff",
                      border: "2px solid #e5e5e5",
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                      style={{ background: getAvatarColor(friend.id) }}
                    >
                      {friend.username.slice(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        style={{ color: "#3c3c3c" }}
                      >
                        {friend.username}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: "#afafaf" }}>
                          ⚡ {friend.xp} XP
                        </span>
                        {friend.streak > 0 && (
                          <span className="text-xs" style={{ color: "#afafaf" }}>
                            🔥 {friend.streak} day streak
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unfollow button */}
                    <button
                      className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      style={{
                        background: "#ffffff",
                        border: "2px solid #e5e5e5",
                        color: "#afafaf",
                      }}
                      onClick={() => handleUnfollow(friend.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#ff4b4b";
                        e.currentTarget.style.color = "#ff4b4b";
                        e.currentTarget.textContent = "Unfollow";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#e5e5e5";
                        e.currentTarget.style.color = "#afafaf";
                        e.currentTarget.textContent = "Following";
                      }}
                    >
                      Following
                    </button>
                  </motion.div>
                ))
              )}

              {/* Suggested follows (competitors not yet followed) */}
              <SuggestedFollows
                currentFollowing={following?.following || []}
                onFollow={handleFollow}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

/* ── Suggested Follows Section ──────────────────────────────────────────── */
function SuggestedFollows({
  currentFollowing,
  onFollow,
}: {
  currentFollowing: FollowingUser[];
  onFollow: (id: number) => void;
}) {
  const [suggested, setSuggested] = useState<FollowingUser[]>([]);

  useEffect(() => {
    // Fetch all leaderboard users and filter out already following
    import("@/lib/api").then(({ getLeaderboard }) => {
      getLeaderboard(20).then((entries) => {
        const followingIds = new Set(currentFollowing.map((f) => f.id));
        followingIds.add(CURRENT_USER_ID);
        const suggestions = entries
          .filter((e) => !followingIds.has(e.user_id))
          .map((e) => ({
            id: e.user_id,
            username: e.user.username,
            xp: e.user.xp,
            streak: e.user.streak,
          }));
        setSuggested(suggestions);
      });
    });
  }, [currentFollowing]);

  if (suggested.length === 0) return null;

  return (
    <div className="mt-6">
      <h3
        className="text-sm font-black uppercase px-2 mb-3"
        style={{ color: "#afafaf", letterSpacing: "0.1em" }}
      >
        Suggested
      </h3>
      {suggested.map((s, idx) => (
        <motion.div
          key={s.id}
          className="rounded-2xl p-4 flex items-center gap-3 mb-2"
          style={{
            background: "#ffffff",
            border: "2px dashed #e5e5e5",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
            style={{ background: getAvatarColor(s.id) }}
          >
            {s.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: "#3c3c3c" }}>
              {s.username}
            </p>
            <span className="text-xs" style={{ color: "#afafaf" }}>
              ⚡ {s.xp} XP
            </span>
          </div>
          <button
            className="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            style={{
              background: "#1cb0f6",
              borderBottom: "3px solid #1899d6",
              color: "#ffffff",
              border: "none",
            }}
            onClick={() => onFollow(s.id)}
          >
            Follow
          </button>
        </motion.div>
      ))}
    </div>
  );
}
