"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   StreakCounter – Shows active streak days (🔥)
   ═══════════════════════════════════════════════════════════════════════════ */

interface StreakCounterProps {
  streak: number;
  isActive?: boolean;
  className?: string;
}

export default function StreakCounter({
  streak,
  isActive = true,
  className = "",
}: StreakCounterProps) {
  return (
    <div
      className={`status-badge ${className}`}
      style={{
        color: isActive ? "#ff9600" : "#afafaf",
        backgroundColor: isActive ? "rgba(255, 150, 0, 0.1)" : "transparent",
      }}
    >
      <span
        className="status-badge-icon"
        style={{
          filter: isActive ? "none" : "grayscale(1)",
        }}
      >
        🔥
      </span>
      <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
        {streak}
      </span>
    </div>
  );
}
