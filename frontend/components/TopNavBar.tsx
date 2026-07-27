"use client";

import React from "react";
import { HeartCounter, StreakCounter, XpCounter } from "@/components/ui";
import type { UserProfile } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════
   TopNavBar – Sticky bar with flag, streak, XP, gems, hearts (dark mode)
   ═══════════════════════════════════════════════════════════════════════════ */

interface TopNavBarProps {
  user: UserProfile | null;
  flagIcon?: string;
  onRefillHearts?: () => void;
}

export default function TopNavBar({
  user,
  flagIcon = "🇪🇸",
  onRefillHearts,
}: TopNavBarProps) {
  const isSuper = user?.is_super ?? false;

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 md:pl-[256px] topnav"
      style={{
        background: "var(--topnav-bg, #ffffff)",
        borderBottom: "2px solid var(--topnav-border, #e5e5e5)",
      }}
    >
      {/* Left: Flag + Language */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{flagIcon}</span>
        {/* Mobile logo */}
        <span className="md:hidden text-lg font-black" style={{ color: "#58cc02" }}>
          duo
        </span>
        {isSuper && (
          <span
            className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black"
            style={{
              background: "linear-gradient(135deg, #ce82ff, #a855f7)",
              color: "#ffffff",
            }}
          >
            SUPER
          </span>
        )}
      </div>

      {/* Right: Status badges */}
      <div className="flex items-center gap-1 md:gap-2">
        <StreakCounter
          streak={user?.streak ?? 0}
          isActive={user?.is_streak_active ?? false}
        />

        {/* Gem count – real from DB */}
        <div
          className="status-badge"
          style={{
            color: "#1cb0f6",
            backgroundColor: "rgba(28, 176, 246, 0.1)",
          }}
        >
          <span className="status-badge-icon">💎</span>
          <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
            {user?.gems ?? 0}
          </span>
        </div>

        <XpCounter xp={user?.xp ?? 0} />

        {/* Hearts – ∞ for Super users, normal counter otherwise */}
        <div className="flex items-center gap-0.5">
          {isSuper ? (
            <div
              className="status-badge"
              style={{
                color: "#ff4b4b",
                backgroundColor: "rgba(255, 75, 75, 0.1)",
              }}
            >
              <span className="status-badge-icon">❤️</span>
              <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>∞</span>
            </div>
          ) : (
            <>
              <HeartCounter hearts={user?.hearts ?? 5} />
              {(user?.hearts ?? 5) < 5 && onRefillHearts && (
                <button
                  onClick={onRefillHearts}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-transform hover:scale-110"
                  style={{
                    background: "#ff4b4b",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                  title="Refill hearts"
                >
                  +
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(.dark) .topnav {
          --topnav-bg: #131f24;
          --topnav-border: #37464f;
        }
      `}</style>
    </header>
  );
}
