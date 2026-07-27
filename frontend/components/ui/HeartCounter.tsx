"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   HeartCounter – Shows remaining hearts in the top bar
   ═══════════════════════════════════════════════════════════════════════════ */

interface HeartCounterProps {
  hearts: number;
  maxHearts?: number;
  className?: string;
}

export default function HeartCounter({
  hearts,
  maxHearts = 5,
  className = "",
}: HeartCounterProps) {
  const isLow = hearts <= 1;

  return (
    <div
      className={`status-badge ${className}`}
      style={{
        color: isLow ? "#ff4b4b" : "#ff4b4b",
        backgroundColor: isLow ? "#ffdfe0" : "transparent",
      }}
    >
      <span
        className={`status-badge-icon ${isLow ? "animate-heartbeat" : ""}`}
      >
        ❤️
      </span>
      <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
        {hearts}
      </span>
    </div>
  );
}
