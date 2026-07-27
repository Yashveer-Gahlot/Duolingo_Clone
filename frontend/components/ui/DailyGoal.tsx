"use client";

import React from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   DailyGoal – Circular progress ring showing daily XP toward a goal
   ═══════════════════════════════════════════════════════════════════════════ */

interface DailyGoalProps {
  dailyXp: number;
  goal?: number;
}

const GOAL_DEFAULT = 50;

export default function DailyGoal({ dailyXp, goal = GOAL_DEFAULT }: DailyGoalProps) {
  const progress = Math.min(dailyXp / goal, 1);
  const isComplete = progress >= 1;

  // SVG circle params
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Color based on progress
  const progressColor = isComplete ? "#58cc02" : progress >= 0.5 ? "#ffc800" : "#1cb0f6";

  return (
    <div
      className="rounded-2xl p-4 daily-goal-card"
      style={{
        background: "var(--card-bg, #ffffff)",
        border: "2px solid var(--card-border, #e5e5e5)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-black uppercase"
          style={{ color: "var(--text-muted, #afafaf)", letterSpacing: "0.05em" }}
        >
          Daily Goal
        </h3>
        {isComplete && (
          <motion.span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#d7ffb8", color: "#46a302" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            ✅ Done!
          </motion.span>
        )}
      </div>

      {/* Ring + Center */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--ring-track, #e5e5e5)"
              strokeWidth={strokeWidth}
            />
            {/* Progress arc */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className="text-2xl"
              animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
              transition={isComplete ? { duration: 1, repeat: Infinity } : {}}
            >
              {isComplete ? "🎁" : "🎯"}
            </motion.span>
          </div>
        </div>

        {/* Text */}
        <div>
          <p
            className="text-2xl font-black"
            style={{ color: progressColor }}
          >
            {dailyXp}
            <span className="text-sm font-bold" style={{ color: "var(--text-muted, #afafaf)" }}>
              /{goal} XP
            </span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted, #afafaf)" }}>
            {isComplete
              ? "Goal reached! Great job! 🎉"
              : `${goal - dailyXp} XP to go`}
          </p>
        </div>
      </div>
    </div>
  );
}
