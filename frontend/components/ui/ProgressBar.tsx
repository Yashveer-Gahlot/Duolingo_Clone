"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ProgressBar – Animated bar with glowing tip
   ═══════════════════════════════════════════════════════════════════════════ */

interface ProgressBarProps {
  /** 0-100 percentage */
  value: number;
  /** Show the glowing tip animation */
  active?: boolean;
  /** Track height in pixels */
  height?: number;
  /** Custom colour for the fill (defaults to Duolingo green gradient) */
  color?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  active = true,
  height = 16,
  color,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`progress-bar-track ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-bar-fill"
        data-active={active && clamped > 0 ? "true" : "false"}
        style={{
          width: `${clamped}%`,
          ...(color ? { background: color } : {}),
        }}
      />
    </div>
  );
}
