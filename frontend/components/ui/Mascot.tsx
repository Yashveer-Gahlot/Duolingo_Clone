"use client";

import React from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   Mascot – A cheerful green owl character (pure CSS/SVG)
   
   Moods: "happy" | "sad" | "celebrate" | "thinking"
   ═══════════════════════════════════════════════════════════════════════════ */

type MascotMood = "happy" | "sad" | "celebrate" | "thinking";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

const moodConfig = {
  happy: {
    bodyColor: "#58cc02",
    bodyDark: "#46a302",
    eyeStyle: "normal" as const,
    mouthEmoji: "😊",
    animation: { rotate: [0, 3, -3, 0] },
    animDuration: 3,
  },
  sad: {
    bodyColor: "#89c4e1",
    bodyDark: "#6ba3c2",
    eyeStyle: "sad" as const,
    mouthEmoji: "😢",
    animation: { y: [0, 3, 0] },
    animDuration: 2,
  },
  celebrate: {
    bodyColor: "#58cc02",
    bodyDark: "#46a302",
    eyeStyle: "excited" as const,
    mouthEmoji: "🥳",
    animation: { y: [0, -8, 0], rotate: [0, 5, -5, 0] },
    animDuration: 0.8,
  },
  thinking: {
    bodyColor: "#58cc02",
    bodyDark: "#46a302",
    eyeStyle: "normal" as const,
    mouthEmoji: "🤔",
    animation: { rotate: [0, -5, 0] },
    animDuration: 4,
  },
};

export default function Mascot({ mood = "happy", size = 80, className = "" }: MascotProps) {
  const config = moodConfig[mood];
  const s = size;
  const bodyW = s * 0.75;
  const bodyH = s * 0.85;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: s, height: s }}
      animate={config.animation}
      transition={{
        duration: config.animDuration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Body */}
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main body ellipse */}
        <ellipse
          cx={s / 2}
          cy={s / 2 + 2}
          rx={bodyW / 2}
          ry={bodyH / 2}
          fill={config.bodyColor}
        />
        {/* Belly */}
        <ellipse
          cx={s / 2}
          cy={s / 2 + 6}
          rx={bodyW / 2.8}
          ry={bodyH / 2.8}
          fill="#d7ffb8"
          opacity={0.7}
        />
        {/* Left eye */}
        <circle
          cx={s / 2 - s * 0.12}
          cy={s / 2 - s * 0.08}
          r={s * 0.1}
          fill="white"
        />
        <circle
          cx={s / 2 - s * 0.12}
          cy={s / 2 - s * 0.08 + (config.eyeStyle === "sad" ? 1 : 0)}
          r={s * 0.05}
          fill="#3c3c3c"
        />
        {config.eyeStyle === "excited" && (
          <circle
            cx={s / 2 - s * 0.12 + s * 0.02}
            cy={s / 2 - s * 0.08 - s * 0.02}
            r={s * 0.015}
            fill="white"
          />
        )}

        {/* Right eye */}
        <circle
          cx={s / 2 + s * 0.12}
          cy={s / 2 - s * 0.08}
          r={s * 0.1}
          fill="white"
        />
        <circle
          cx={s / 2 + s * 0.12}
          cy={s / 2 - s * 0.08 + (config.eyeStyle === "sad" ? 1 : 0)}
          r={s * 0.05}
          fill="#3c3c3c"
        />
        {config.eyeStyle === "excited" && (
          <circle
            cx={s / 2 + s * 0.12 + s * 0.02}
            cy={s / 2 - s * 0.08 - s * 0.02}
            r={s * 0.015}
            fill="white"
          />
        )}

        {/* Sad eyebrows */}
        {config.eyeStyle === "sad" && (
          <>
            <line
              x1={s / 2 - s * 0.18}
              y1={s / 2 - s * 0.18}
              x2={s / 2 - s * 0.06}
              y2={s / 2 - s * 0.22}
              stroke="#3c3c3c"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <line
              x1={s / 2 + s * 0.06}
              y1={s / 2 - s * 0.22}
              x2={s / 2 + s * 0.18}
              y2={s / 2 - s * 0.18}
              stroke="#3c3c3c"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </>
        )}

        {/* Beak */}
        <ellipse
          cx={s / 2}
          cy={s / 2 + s * 0.05}
          rx={s * 0.06}
          ry={s * 0.04}
          fill="#ffc800"
        />

        {/* Left ear tuft */}
        <ellipse
          cx={s / 2 - s * 0.22}
          cy={s / 2 - s * 0.32}
          rx={s * 0.06}
          ry={s * 0.1}
          fill={config.bodyColor}
          transform={`rotate(-20 ${s / 2 - s * 0.22} ${s / 2 - s * 0.32})`}
        />
        {/* Right ear tuft */}
        <ellipse
          cx={s / 2 + s * 0.22}
          cy={s / 2 - s * 0.32}
          rx={s * 0.06}
          ry={s * 0.1}
          fill={config.bodyColor}
          transform={`rotate(20 ${s / 2 + s * 0.22} ${s / 2 - s * 0.32})`}
        />

        {/* Feet */}
        <ellipse
          cx={s / 2 - s * 0.1}
          cy={s - s * 0.06}
          rx={s * 0.08}
          ry={s * 0.03}
          fill="#ffc800"
        />
        <ellipse
          cx={s / 2 + s * 0.1}
          cy={s - s * 0.06}
          rx={s * 0.08}
          ry={s * 0.03}
          fill="#ffc800"
        />

        {/* Mouth/Smile for happy */}
        {mood === "happy" && (
          <path
            d={`M ${s / 2 - s * 0.08} ${s / 2 + s * 0.1} Q ${s / 2} ${s / 2 + s * 0.16}, ${s / 2 + s * 0.08} ${s / 2 + s * 0.1}`}
            stroke="#3c3c3c"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Sad mouth */}
        {mood === "sad" && (
          <path
            d={`M ${s / 2 - s * 0.06} ${s / 2 + s * 0.14} Q ${s / 2} ${s / 2 + s * 0.09}, ${s / 2 + s * 0.06} ${s / 2 + s * 0.14}`}
            stroke="#3c3c3c"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Celebrate open mouth */}
        {mood === "celebrate" && (
          <ellipse
            cx={s / 2}
            cy={s / 2 + s * 0.13}
            rx={s * 0.05}
            ry={s * 0.04}
            fill="#3c3c3c"
          />
        )}

        {/* Tear for sad */}
        {mood === "sad" && (
          <ellipse
            cx={s / 2 + s * 0.15}
            cy={s / 2 + s * 0.02}
            rx={s * 0.015}
            ry={s * 0.025}
            fill="#1cb0f6"
            opacity={0.8}
          />
        )}
      </svg>

      {/* Celebrate sparkles */}
      {mood === "celebrate" && (
        <>
          <motion.span
            className="absolute text-sm"
            style={{ top: -4, right: 2 }}
            animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          >
            ✨
          </motion.span>
          <motion.span
            className="absolute text-sm"
            style={{ top: 2, left: 0 }}
            animate={{ scale: [0, 1, 0], rotate: [0, -180, -360] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          >
            ⭐
          </motion.span>
        </>
      )}
    </motion.div>
  );
}
