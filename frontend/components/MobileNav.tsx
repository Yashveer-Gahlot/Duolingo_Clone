"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ═══════════════════════════════════════════════════════════════════════════
   MobileNav – Bottom tab bar for mobile (dark mode aware)
   ═══════════════════════════════════════════════════════════════════════════ */

const TABS = [
  { href: "/", label: "Learn", icon: "🏠" },
  { href: "/leaderboard", label: "Ranks", icon: "🏆" },
  { href: "/shop", label: "Shop", icon: "💎" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 mobile-nav"
      style={{
        background: "var(--mobile-nav-bg, #ffffff)",
        borderTop: "2px solid var(--mobile-nav-border, #e5e5e5)",
      }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors"
            style={{
              color: isActive ? "#1cb0f6" : "var(--mobile-nav-muted, #afafaf)",
              background: isActive
                ? "var(--mobile-nav-active, #ddf4ff)"
                : "transparent",
            }}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-bold">{tab.label}</span>
          </Link>
        );
      })}

      <style jsx>{`
        :global(.dark) .mobile-nav {
          --mobile-nav-bg: #131f24;
          --mobile-nav-border: #37464f;
          --mobile-nav-muted: #8a9ba5;
          --mobile-nav-active: rgba(28, 176, 246, 0.12);
        }
      `}</style>
    </nav>
  );
}
