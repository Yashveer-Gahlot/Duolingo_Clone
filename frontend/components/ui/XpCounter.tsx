"use client";

import React, { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   XpCounter – Shows current XP with pop animation on change
   ═══════════════════════════════════════════════════════════════════════════ */

interface XpCounterProps {
  xp: number;
  className?: string;
}

export default function XpCounter({ xp, className = "" }: XpCounterProps) {
  const [pop, setPop] = useState(false);
  const [prevXp, setPrevXp] = useState(xp);

  useEffect(() => {
    if (xp !== prevXp) {
      setPop(true);
      setPrevXp(xp);
      const timer = setTimeout(() => setPop(false), 400);
      return () => clearTimeout(timer);
    }
  }, [xp, prevXp]);

  return (
    <div
      className={`status-badge ${pop ? "animate-xp-pop" : ""} ${className}`}
      style={{
        color: "#ffc800",
        backgroundColor: "rgba(255, 200, 0, 0.1)",
      }}
    >
      <span className="status-badge-icon">⚡</span>
      <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{xp}</span>
    </div>
  );
}
