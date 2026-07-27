"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSkillIcon } from "@/lib/icons";
import type { SkillWithProgress } from "@/lib/types";
import { Button, ProgressBar } from "@/components/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   SkillNode – Circular node on the learning path with popover
   ═══════════════════════════════════════════════════════════════════════════ */

interface SkillNodeProps {
  skill: SkillWithProgress;
  /** Is this the first unlocked, non-completed skill? */
  isCurrent: boolean;
  onStartLesson: (lessonId: number) => void;
  onStartLegendary?: (lessonId: number) => void;
  /** Unit theme color for active state */
  unitColor?: string;
}

export default function SkillNode({
  skill,
  isCurrent,
  onStartLesson,
  onStartLegendary,
  unitColor = "#58cc02",
}: SkillNodeProps) {
  const [showPopover, setShowPopover] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Determine state
  const isCompleted = skill.is_completed;
  const isUnlocked = skill.is_unlocked;
  const isLocked = !isUnlocked && !isCompleted;

  // Find the next lesson to start
  const nextLessonIndex = skill.completed_lessons;
  const nextLesson = skill.lessons[nextLessonIndex] ?? skill.lessons[0];
  const progressPct =
    skill.total_lessons > 0
      ? (skill.completed_lessons / skill.total_lessons) * 100
      : 0;

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    }
    if (showPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

  const handleClick = () => {
    if (isLocked) return;
    setShowPopover((prev) => !prev);
  };

  // Node styling
  let nodeClass = "skill-node ";
  if (isCompleted) nodeClass += "skill-node-completed";
  else if (isUnlocked) nodeClass += "skill-node-unlocked";
  else nodeClass += "skill-node-locked";

  return (
    <div ref={nodeRef} className="relative flex flex-col items-center">
      {/* ── Skill Circle ─────────────────────────────────────── */}
      <motion.div
        className={nodeClass}
        onClick={handleClick}
        whileHover={!isLocked ? { scale: 1.08 } : undefined}
        whileTap={!isLocked ? { scale: 0.95 } : undefined}
        style={{ position: "relative" }}
      >
        {/* Icon */}
        <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>
          {isLocked ? "🔒" : getSkillIcon(skill.icon_name)}
        </span>

        {/* Crown badge on completed */}
        {isCompleted && <span className="skill-crown">👑</span>}

        {/* Active pulse ring for current skill */}
        {isCurrent && !isCompleted && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: `3px solid ${unitColor}`,
              opacity: 0.4,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* ── Skill Label ──────────────────────────────────────── */}
      <span
        className="mt-2 text-xs font-bold text-center max-w-[100px] leading-tight"
        style={{ color: isLocked ? "#afafaf" : "#3c3c3c" }}
      >
        {skill.title}
      </span>

      {/* ── START tooltip for current skill ───────────────────── */}
      {isCurrent && !isCompleted && !showPopover && (
        <motion.div
          className="absolute -top-10 px-3 py-1 rounded-xl text-xs font-black uppercase"
          style={{
            background: "#58cc02",
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(88, 204, 2, 0.4)",
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          START
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1.5"
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #58cc02",
            }}
          />
        </motion.div>
      )}

      {/* ── Popover ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showPopover && !isLocked && (
          <motion.div
            className="absolute z-20 top-full mt-3"
            style={{
              width: 260,
              background: "#ffffff",
              borderRadius: 16,
              border: "2px solid #e5e5e5",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              padding: "1.25rem",
            }}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <h3
              className="text-base font-extrabold mb-1"
              style={{ color: "#3c3c3c" }}
            >
              {skill.title}
            </h3>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span style={{ color: "#777777" }}>
                  Lesson {skill.completed_lessons + (isCompleted ? 0 : 1)} of{" "}
                  {skill.total_lessons}
                </span>
                <span style={{ color: "#58cc02" }}>
                  {Math.round(progressPct)}%
                </span>
              </div>
              <ProgressBar value={progressPct} height={10} />
            </div>

            {/* Next lesson info */}
            {!isCompleted && nextLesson && (
              <div className="mb-3">
                <p
                  className="text-xs font-semibold"
                  style={{ color: "#afafaf" }}
                >
                  Next: {nextLesson.title}
                </p>
              </div>
            )}

            {/* Start / Continue button */}
            {!isCompleted ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  if (nextLesson) {
                    onStartLesson(nextLesson.id);
                  }
                  setShowPopover(false);
                }}
              >
                {skill.completed_lessons > 0 ? "Continue" : "Start"} +
                {nextLesson?.xp_reward ?? 10} XP
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="gold"
                  fullWidth
                  onClick={() => {
                    if (skill.lessons[0]) {
                      onStartLesson(skill.lessons[0].id);
                    }
                    setShowPopover(false);
                  }}
                >
                  Practice ⭐
                </Button>
                {onStartLegendary && (
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      if (skill.lessons[0]) {
                        onStartLegendary(skill.lessons[0].id);
                      }
                      setShowPopover(false);
                    }}
                  >
                    👑 Legendary (2x XP)
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
