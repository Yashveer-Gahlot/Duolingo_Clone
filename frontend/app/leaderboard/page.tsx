"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { getLeagueLeaderboard } from "@/lib/api";
import type { LeagueLeaderboard, LeaderboardEntry } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════
   Leaderboard Page – Leagues UI with real data
   ═══════════════════════════════════════════════════════════════════════════ */

const LEAGUE_SHIELDS: Record<string, { bg: string; border: string; text: string }> = {
  Bronze:   { bg: "linear-gradient(135deg, #cd7f32 0%, #a0522d 100%)", border: "#8b4513", text: "#fff" },
  Silver:   { bg: "linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)", border: "#808080", text: "#fff" },
  Gold:     { bg: "linear-gradient(135deg, #ffd700 0%, #ffb300 100%)", border: "#e5a100", text: "#3c3c3c" },
  Obsidian: { bg: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)", border: "#000000", text: "#fff" },
  Diamond:  { bg: "linear-gradient(135deg, #b9f2ff 0%, #1cb0f6 100%)", border: "#1899d6", text: "#fff" },
};

const AVATAR_COLORS = [
  "#58cc02", "#1cb0f6", "#ff4b4b", "#ffc800", "#ce82ff",
  "#ff9600", "#2b70c9", "#e5679b", "#00cd9c", "#7b61ff",
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

const CURRENT_USER_ID = 1;

export default function LeaderboardPage() {
  const [data, setData] = useState<LeagueLeaderboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeagueLeaderboard(CURRENT_USER_ID)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg, #f7f7f7)" }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block text-4xl mb-4"
          >
            🏆
          </motion.div>
          <p className="font-bold" style={{ color: "#afafaf" }}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const shield = LEAGUE_SHIELDS[data.league] || LEAGUE_SHIELDS.Bronze;
  const top3 = data.entries.slice(0, 3);
  const rest = data.entries.slice(3, 10);

  // Reorder top 3 for podium: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = ["120px", "160px", "100px"];
  const podiumColors = ["#c0c0c0", "#ffd700", "#cd7f32"];
  const podiumEmoji = ["🥈", "🥇", "🥉"];

  return (
    <div className="min-h-screen flex lb-page" style={{ background: "var(--page-bg, #f7f7f7)" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-[240px] pb-24 md:pb-8">
        {/* League shield header */}
        <motion.div
          className="mx-4 mt-6 rounded-2xl p-6 text-center relative overflow-hidden"
          style={{
            background: shield.bg,
            border: `3px solid ${shield.border}`,
            color: shield.text,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-5xl mb-2">{data.league_icon}</div>
          <h1 className="text-2xl font-black">{data.league} League</h1>
          <p className="text-sm opacity-80 mt-1">Weekly Ranking</p>

          {/* League progression dots */}
          <div className="flex justify-center gap-2 mt-4">
            {["Bronze", "Silver", "Gold", "Obsidian", "Diamond"].map((league) => (
              <div
                key={league}
                className="w-3 h-3 rounded-full"
                style={{
                  background: league === data.league ? "#ffffff" : "rgba(255,255,255,0.3)",
                  boxShadow: league === data.league ? "0 0 8px rgba(255,255,255,0.6)" : "none",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Podium (top 3) */}
        {top3.length >= 3 && (
          <div className="flex justify-center items-end gap-3 mt-8 px-4">
            {podiumOrder.map((entry, idx) => {
              const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
              const isCurrentUser = entry.user_id === CURRENT_USER_ID;
              return (
                <motion.div
                  key={entry.id}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  {/* Avatar */}
                  <div className="relative mb-2">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg"
                      style={{
                        background: getAvatarColor(entry.user_id),
                        border: isCurrentUser ? "3px solid #58cc02" : "3px solid #e5e5e5",
                        boxShadow: isCurrentUser ? "0 0 12px rgba(88, 204, 2, 0.4)" : "none",
                      }}
                    >
                      {getInitials(entry.user.username)}
                    </div>
                    <div className="absolute -top-1 -right-1 text-lg">{podiumEmoji[idx]}</div>
                  </div>

                  <p
                    className="text-xs font-bold truncate max-w-[80px] text-center"
                    style={{ color: isCurrentUser ? "#58cc02" : "#3c3c3c" }}
                  >
                    {entry.user.username}
                    {isCurrentUser && " (You)"}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "#afafaf" }}>
                    {entry.total_xp} XP
                  </p>

                  {/* Podium block */}
                  <div
                    className="w-20 rounded-t-xl mt-2 flex items-end justify-center pb-2"
                    style={{
                      height: podiumHeights[idx],
                      background: podiumColors[idx],
                      boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.15)",
                    }}
                  >
                    <span className="text-2xl font-black text-white">#{rank}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Full ranking list */}
        <div className="mx-4 mt-6 space-y-2">
          <h2
            className="text-sm font-black uppercase px-2 mb-3"
            style={{ color: "#afafaf", letterSpacing: "0.1em" }}
          >
            Full Ranking
          </h2>

          {data.entries.map((entry: LeaderboardEntry, idx: number) => {
            const rank = idx + 1;
            const isCurrentUser = entry.user_id === CURRENT_USER_ID;

            return (
              <motion.div
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{
                  background: isCurrentUser ? "var(--lb-highlight, #d7ffb8)" : "var(--lb-card, #ffffff)",
                  border: isCurrentUser ? "2px solid #58cc02" : "2px solid var(--lb-border, #e5e5e5)",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Rank */}
                <span
                  className="w-8 text-center font-black text-sm"
                  style={{
                    color: rank <= 3
                      ? ["#ffd700", "#c0c0c0", "#cd7f32"][rank - 1]
                      : "#afafaf",
                  }}
                >
                  {rank}
                </span>

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: getAvatarColor(entry.user_id) }}
                >
                  {getInitials(entry.user.username)}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: isCurrentUser ? "#46a302" : "var(--lb-text, #3c3c3c)" }}
                  >
                    {entry.user.username}
                    {isCurrentUser && (
                      <span className="ml-1 text-xs font-semibold">(You)</span>
                    )}
                  </p>
                  {entry.user.streak > 0 && (
                    <p className="text-xs" style={{ color: "#afafaf" }}>
                      🔥 {entry.user.streak} day streak
                    </p>
                  )}
                </div>

                {/* XP */}
                <div className="text-right">
                  <p
                    className="text-sm font-black"
                    style={{ color: isCurrentUser ? "#46a302" : "var(--lb-text, #3c3c3c)" }}
                  >
                    {entry.total_xp} XP
                  </p>
                  <p className="text-xs" style={{ color: "#afafaf" }}>
                    +{entry.weekly_xp} this week
                  </p>
                </div>
              </motion.div>
            );
          })}

          {rest.length === 0 && data.entries.length <= 3 && (
            <p className="text-center text-sm py-8" style={{ color: "#afafaf" }}>
              More learners will appear as the community grows!
            </p>
          )}
        </div>

      </main>

      {/* Mobile nav */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

/* Dark mode styling injected via JSX would require "use client" already present,
   but we use globals.css instead for simplicity. */
