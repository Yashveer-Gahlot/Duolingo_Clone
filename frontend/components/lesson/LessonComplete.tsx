"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { Button, ProgressBar, Mascot } from "@/components/ui";
import { lessonComplete as fanfareSound } from "@/components/ui/AudioPlayer";

/* ═══════════════════════════════════════════════════════════════════════════
   LessonComplete – Celebratory screen with confetti & animated stats
   ═══════════════════════════════════════════════════════════════════════════ */

interface LessonCompleteProps {
  xpEarned: number;
  hearts: number;
  maxHearts: number;
  streak: number;
  isStreakActive: boolean;
  totalExercises: number;
  wrongAnswers: number;
}

export default function LessonComplete({
  xpEarned,
  hearts,
  maxHearts,
  streak,
  isStreakActive,
  totalExercises,
  wrongAnswers,
}: LessonCompleteProps) {
  const router = useRouter();
  const [showStats, setShowStats] = useState(false);
  const accuracy = Math.round(
    ((totalExercises - wrongAnswers) / Math.max(totalExercises, 1)) * 100
  );

  // Fire confetti on mount
  useEffect(() => {
    fanfareSound();

    // Initial burst
    const end = Date.now() + 2000;
    const colors = ["#58cc02", "#ffc800", "#1cb0f6", "#ff4b4b", "#ce82ff"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    // Big initial burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.5 },
      colors,
    });

    requestAnimationFrame(frame);

    // Show stats after a brief delay
    const timer = setTimeout(() => setShowStats(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      label: "Total XP Earned",
      value: `+${xpEarned}`,
      icon: "⚡",
      color: "#ffc800",
      bgColor: "#fff3cc",
    },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
      icon: accuracy === 100 ? "💯" : "🎯",
      color: "#58cc02",
      bgColor: "#d7ffb8",
    },
    {
      label: "Streak Maintained",
      value: `${streak} days`,
      icon: "🔥",
      color: isStreakActive ? "#ff9600" : "#afafaf",
      bgColor: isStreakActive ? "rgba(255,150,0,0.1)" : "#f7f7f7",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#ffffff" }}
    >
      <div className="max-w-sm w-full text-center space-y-6">
        {/* ── Trophy animation ────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
        >
          <div className="relative inline-block">
            <span className="text-8xl block">🏆</span>
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 0 40px rgba(255, 200, 0, 0.4)",
              }}
              animate={{
                boxShadow: [
                  "0 0 40px rgba(255, 200, 0, 0.4)",
                  "0 0 80px rgba(255, 200, 0, 0.6)",
                  "0 0 40px rgba(255, 200, 0, 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* ── Celebrating mascot ────────────────────────────────── */}
        <motion.div
          initial={{ scale: 0, x: 40 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ type: "spring", damping: 12, delay: 0.3 }}
        >
          <Mascot mood="celebrate" size={72} />
        </motion.div>

        {/* ── Title ───────────────────────────────────────────── */}
        <motion.h1
          className="text-3xl font-black"
          style={{ color: "#ffc800" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Lesson Complete!
        </motion.h1>

        {/* ── Hearts display ──────────────────────────────────── */}
        <motion.div
          className="flex justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {Array.from({ length: maxHearts }).map((_, i) => (
            <motion.span
              key={i}
              className="text-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              style={{
                opacity: i < hearts ? 1 : 0.2,
                filter: i < hearts ? "none" : "grayscale(1)",
              }}
            >
              ❤️
            </motion.span>
          ))}
        </motion.div>

        {/* ── Animated stat cards ─────────────────────────────── */}
        {showStats && (
          <div className="space-y-3">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="rounded-2xl p-4 flex items-center justify-between"
                style={{
                  background: stat.bgColor,
                  border: `2px solid ${stat.color}22`,
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15, type: "spring", damping: 15 }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span
                    className="font-bold text-sm"
                    style={{ color: "#4b4b4b" }}
                  >
                    {stat.label}
                  </span>
                </div>
                <motion.span
                  className="font-black text-xl"
                  style={{ color: stat.color }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: idx * 0.15 + 0.2,
                    type: "spring",
                    stiffness: 300,
                  }}
                >
                  {stat.value}
                </motion.span>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Progress bar (full) ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <ProgressBar value={100} height={12} />
        </motion.div>

        {/* ── Continue button ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => router.push("/")}
          >
            Continue
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
