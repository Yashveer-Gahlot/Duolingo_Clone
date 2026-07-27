"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import MobileNav from "@/components/MobileNav";
import SkillNode from "@/components/SkillNode";
import HeartRefillModal from "@/components/HeartRefillModal";
import { DailyGoal, Mascot } from "@/components/ui";

import { getUserProfile, getCurrentCourse, refillHearts } from "@/lib/api";
import type { UserProfile, CourseTree, SkillWithProgress } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════
   Home Page – Duolingo Multi-Unit Skill Tree Dashboard
   ═══════════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [course, setCourse] = useState<CourseTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heartModalOpen, setHeartModalOpen] = useState(false);

  // ── Fetch data ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [userRes, courseRes] = await Promise.all([
        getUserProfile(),
        getCurrentCourse(),
      ]);
      setUser(userRes);
      setCourse(courseRes);
    } catch (e) {
      setError(
        "Could not connect to the backend. Make sure the FastAPI server is running on port 8000."
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleStartLesson = (lessonId: number) => {
    router.push(`/lesson/${lessonId}`);
  };

  const handleStartLegendary = (lessonId: number) => {
    router.push(`/lesson/${lessonId}?legendary=true`);
  };

  const handleRefillHearts = async () => {
    await refillHearts();
    await fetchData();
  };

  // ── Determine which skill is "current" (first unlocked, non-completed)
  const findCurrentSkillId = (): number | null => {
    if (!course) return null;
    for (const unit of course.units) {
      for (const skill of unit.skills) {
        if (skill.is_unlocked && !skill.is_completed) {
          return skill.id;
        }
      }
    }
    return null;
  };
  const currentSkillId = findCurrentSkillId();

  // ── Zigzag offsets for the path ─────────────────────────────────────
  const getZigzagOffset = (index: number): number => {
    const pattern = [0, 60, 90, 60, 0, -60, -90, -60];
    return pattern[index % pattern.length];
  };

  // ── Helper: darken a hex color for shadows ──────────────────────────
  const darkenColor = (hex: string, amount: number): string => {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
    const b = Math.max(0, (num & 0x0000ff) - amount);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
  };

  // ── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--duo-page-bg, #f7f7f7)" }}>
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🦉
          </motion.div>
          <p className="text-lg font-bold" style={{ color: "#afafaf" }}>
            Loading your lessons...
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--duo-page-bg, #f7f7f7)" }}>
        <div
          className="max-w-md w-full text-center p-8 rounded-2xl"
          style={{
            background: "#ffffff",
            border: "2px solid #e5e5e5",
          }}
        >
          <div className="text-5xl mb-4">😵</div>
          <h2
            className="text-xl font-extrabold mb-2"
            style={{ color: "#3c3c3c" }}
          >
            Connection Error
          </h2>
          <p className="text-sm mb-6" style={{ color: "#777777" }}>
            {error}
          </p>
          <button className="btn-3d btn-3d-blue" onClick={fetchData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen home-page" style={{ background: "var(--duo-page-bg, #f7f7f7)" }}>
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Top Nav */}
      <TopNavBar
        user={user}
        flagIcon={course?.flag_icon ?? "🇪🇸"}
        onRefillHearts={
          (user?.hearts ?? 5) < 5
            ? () => setHeartModalOpen(true)
            : undefined
        }
      />

      {/* Main + Right Sidebar layout */}
      <div className="md:ml-[240px] md:flex">
        {/* Main skill tree */}
        <main
          className="flex-1 pb-24 md:pb-10"
          style={{ minHeight: "calc(100vh - 56px)" }}
        >
          {/* Daily Goal card (mobile only) */}
          <div className="md:hidden px-4 pt-4">
            <DailyGoal dailyXp={user?.daily_xp ?? 0} />
          </div>

          {course?.units.map((unit) => {
            const unitColor = unit.color || "#58cc02";
            const unitShadow = darkenColor(unitColor, 40);

            return (
              <section key={unit.id} id={`unit-${unit.order}`} className="py-6">
                {/* ── Unit Header Banner ────────────────────────────── */}
                <motion.div
                  className="mx-auto max-w-lg px-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="rounded-2xl p-5 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${unitColor} 0%, ${unitShadow} 100%)`,
                      boxShadow: `0 4px 0 ${darkenColor(unitColor, 60)}`,
                    }}
                  >
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <p
                          className="text-xs font-bold uppercase tracking-wider mb-1"
                          style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          Unit {unit.order}
                        </p>
                        <h2 className="text-xl font-extrabold text-white">
                          {unit.title}
                        </h2>
                        {unit.description && (
                          <p
                            className="text-sm mt-1"
                            style={{ color: "rgba(255,255,255,0.85)" }}
                          >
                            {unit.description}
                          </p>
                        )}
                      </div>
                      {/* Guidebook button */}
                      <button
                        className="flex-shrink-0 mt-1 px-3 py-1.5 rounded-xl text-xs font-bold border-none cursor-pointer transition-transform hover:scale-105"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          color: "#ffffff",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        📖 Guidebook
                      </button>
                    </div>
                    {/* Decorative circles */}
                    <div
                      className="absolute -right-6 -top-6 w-28 h-28 rounded-full"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                    <div
                      className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                  </div>
                </motion.div>

                {/* ── Skill Tree Path ──────────────────────────────── */}
                <div className="relative mx-auto max-w-lg px-4">
                  {/* Curving path line (SVG behind nodes) */}
                  <svg
                    className="absolute left-1/2 top-0 h-full -translate-x-1/2 pointer-events-none"
                    style={{ width: 200 }}
                    preserveAspectRatio="none"
                  >
                    {unit.skills.map((skill, idx) => {
                      if (idx === 0) return null;
                      const prevOffset = getZigzagOffset(idx - 1);
                      const currOffset = getZigzagOffset(idx);
                      const y1 = idx * 160 - 40;
                      const y2 = idx * 160 + 80;
                      const x1 = 100 + prevOffset * 0.8;
                      const x2 = 100 + currOffset * 0.8;

                      const prevSkill = unit.skills[idx - 1];
                      const isPathActive =
                        prevSkill.is_completed || prevSkill.is_unlocked;

                      return (
                        <path
                          key={skill.id}
                          d={`M ${x1} ${y1} C ${x1} ${y1 + 60}, ${x2} ${y2 - 60}, ${x2} ${y2}`}
                          fill="none"
                          stroke={isPathActive ? unitColor : "#e5e5e5"}
                          strokeWidth={isPathActive ? 4 : 3}
                          strokeDasharray={isPathActive ? "none" : "8 8"}
                          strokeLinecap="round"
                          style={{ transition: "stroke 0.3s" }}
                        />
                      );
                    })}
                  </svg>

                  {/* Skill nodes */}
                  <div className="relative flex flex-col items-center gap-0">
                    {unit.skills.map((skill: SkillWithProgress, idx: number) => (
                      <motion.div
                        key={skill.id}
                        className="flex flex-col items-center"
                        style={{
                          marginLeft: getZigzagOffset(idx),
                          paddingTop: idx === 0 ? 0 : 80,
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: idx * 0.1,
                        }}
                      >
                        <SkillNode
                          skill={skill}
                          isCurrent={skill.id === currentSkillId}
                          onStartLesson={handleStartLesson}
                          onStartLegendary={handleStartLegendary}
                          unitColor={unitColor}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </main>

        {/* Right sidebar (desktop only) */}
        <aside className="hidden md:block w-[280px] flex-shrink-0 p-4 space-y-4 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto">
          <DailyGoal dailyXp={user?.daily_xp ?? 0} />

          {/* Unit Jump Card */}
          {course && course.units.length > 1 && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card-bg, #ffffff)",
                border: "2px solid var(--card-border, #e5e5e5)",
              }}
            >
              <h3
                className="text-xs font-black uppercase mb-3"
                style={{ color: "var(--text-muted, #afafaf)", letterSpacing: "0.05em" }}
              >
                Jump to Unit
              </h3>
              <div className="space-y-2">
                {course.units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => {
                      document
                        .getElementById(`unit-${unit.order}`)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold cursor-pointer border-none transition-all hover:scale-[1.02]"
                    style={{
                      background: `${unit.color}15`,
                      color: unit.color,
                      border: `2px solid ${unit.color}30`,
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
                      style={{ background: unit.color }}
                    >
                      {unit.order}
                    </span>
                    {unit.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <Mascot mood="happy" size={64} />
          </div>
        </aside>
      </div>

      {/* Mobile unit jump FAB */}
      {course && course.units.length > 1 && (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <div className="flex flex-col gap-2">
            {course.units.map((unit) => (
              <motion.button
                key={unit.id}
                onClick={() => {
                  document
                    .getElementById(`unit-${unit.order}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-black border-none cursor-pointer"
                style={{
                  background: unit.color,
                  boxShadow: `0 3px 0 ${darkenColor(unit.color, 40)}, 0 4px 12px rgba(0,0,0,0.15)`,
                }}
                whileTap={{ scale: 0.9, y: 3 }}
              >
                {unit.order}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Heart refill modal */}
      <HeartRefillModal
        isOpen={heartModalOpen}
        onClose={() => setHeartModalOpen(false)}
        currentHearts={user?.hearts ?? 5}
        onRefill={handleRefillHearts}
      />

      {/* Dark mode CSS variables */}
      <style jsx>{`
        :global(.dark) .home-page {
          --duo-page-bg: #131f24;
          --card-bg: #202f36;
          --card-border: #37464f;
          --text-muted: #8a9ba5;
        }
      `}</style>
    </div>
  );
}
