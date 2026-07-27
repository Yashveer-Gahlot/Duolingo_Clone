"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

/* ═══════════════════════════════════════════════════════════════════════════
   Sidebar – Left navigation drawer (Duolingo-style, dark mode aware)
   ═══════════════════════════════════════════════════════════════════════════ */

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Learn", icon: "🏠" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/profile", label: "Profile", icon: "👤" },
  { href: "/shop", label: "Shop", icon: "💎" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40"
      style={{ width: 240 }}
    >
      <div
        className="flex flex-col h-full sidebar-container"
        style={{
          background: "var(--sidebar-bg, #ffffff)",
          borderRight: "2px solid var(--sidebar-border, #e5e5e5)",
        }}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2">
          <span className="text-3xl font-black" style={{ color: "#58cc02" }}>
            duo
          </span>
          <span
            className="text-3xl font-black"
            style={{ color: "var(--sidebar-text, #3c3c3c)" }}
          >
            lingo
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-base transition-all duration-150"
                style={{
                  color: isActive ? "#1cb0f6" : "var(--sidebar-muted, #777777)",
                  background: isActive
                    ? "var(--sidebar-active-bg, #ddf4ff)"
                    : "transparent",
                  border: isActive
                    ? "2px solid #1cb0f6"
                    : "2px solid transparent",
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section with theme toggle */}
        <div
          className="px-4 py-4 border-t-2 flex items-center justify-between"
          style={{ borderColor: "var(--sidebar-border, #e5e5e5)" }}
        >
          <Link
            href="/settings"
            className="flex items-center gap-3 px-2 no-underline"
            style={{ color: "var(--sidebar-muted, #afafaf)" }}
          >
            <span className="text-xl">⚙️</span>
            <span className="font-bold text-sm">Settings</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Dark mode CSS vars */}
      <style jsx>{`
        :global(.dark) .sidebar-container {
          --sidebar-bg: #131f24;
          --sidebar-border: #37464f;
          --sidebar-text: #e5e5e5;
          --sidebar-muted: #8a9ba5;
          --sidebar-active-bg: rgba(28, 176, 246, 0.12);
        }
      `}</style>
    </aside>
  );
}
