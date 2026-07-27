"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { getUserProfile } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════
   Settings Page – Placeholder UI matching Duolingo's style
   ═══════════════════════════════════════════════════════════════════════════ */

function SettingsCard({ title, children, delay = 0 }: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden settings-card"
      style={{
        background: "var(--card-bg, #ffffff)",
        border: "2px solid var(--card-border, #e5e5e5)",
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div
        className="px-5 py-3 border-b-2"
        style={{ borderColor: "var(--card-border, #e5e5e5)" }}
      >
        <h3
          className="text-sm font-black uppercase"
          style={{ color: "var(--text-muted, #afafaf)", letterSpacing: "0.05em" }}
        >
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

function SettingsField({ label, value, type = "text" }: {
  label: string;
  value: string;
  type?: string;
}) {
  return (
    <div>
      <label
        className="block text-xs font-bold mb-1.5"
        style={{ color: "var(--text-muted, #afafaf)" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          readOnly
          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold outline-none settings-input"
          style={{
            background: "var(--input-bg, #f7f7f7)",
            border: "2px solid var(--card-border, #e5e5e5)",
            color: "var(--text-primary, #3c3c3c)",
            cursor: "not-allowed",
            opacity: 0.7,
          }}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#ffc800", color: "#3c3c3c" }}
        >
          SOON
        </span>
      </div>
    </div>
  );
}

function ToggleSwitch({ label, defaultChecked = false }: {
  label: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-sm font-bold"
        style={{ color: "var(--text-primary, #3c3c3c)" }}
      >
        {label}
      </span>
      <button
        className="relative w-12 h-7 rounded-full transition-colors cursor-pointer border-none"
        style={{
          background: checked ? "#58cc02" : "var(--toggle-bg, #e5e5e5)",
        }}
        onClick={() => setChecked(!checked)}
      >
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full"
          style={{
            background: "#ffffff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
          }}
          animate={{ left: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const u = await getUserProfile();
      setUser(u);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg, #f7f7f7)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ⚙️
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex settings-page" style={{ background: "var(--page-bg, #f7f7f7)" }}>
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-[240px] pb-24 md:pb-8">
        {/* Header */}
        <motion.div
          className="px-4 pt-6 pb-4 md:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1
            className="text-2xl font-black"
            style={{ color: "var(--text-primary, #3c3c3c)" }}
          >
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted, #afafaf)" }}>
            Manage your account and preferences
          </p>
        </motion.div>

        <div className="px-4 md:px-8 max-w-lg space-y-4">
          {/* ── Account ──────────────────────────────────────────── */}
          <SettingsCard title="Account" delay={0.05}>
            <SettingsField label="Username" value={user?.username ?? "learner"} />
            <SettingsField label="Email" value={user?.email ?? "learner@duolingo.local"} type="email" />
            <SettingsField label="Joined" value={
              user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : "—"
            } />
          </SettingsCard>

          {/* ── Daily Goal ───────────────────────────────────────── */}
          <SettingsCard title="Daily Goal" delay={0.1}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary, #3c3c3c)" }}>
                  XP Goal
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted, #afafaf)" }}>
                  Your daily learning target
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[10, 20, 50].map((g) => (
                  <button
                    key={g}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border-none cursor-pointer transition-colors"
                    style={{
                      background: g === 50 ? "#ddf4ff" : "var(--input-bg, #f7f7f7)",
                      color: g === 50 ? "#1cb0f6" : "var(--text-muted, #afafaf)",
                      border: g === 50 ? "2px solid #1cb0f6" : "2px solid var(--card-border, #e5e5e5)",
                    }}
                  >
                    {g} XP
                  </button>
                ))}
              </div>
            </div>
          </SettingsCard>

          {/* ── Preferences ──────────────────────────────────────── */}
          <SettingsCard title="Preferences" delay={0.15}>
            <ToggleSwitch label="Sound Effects" defaultChecked={true} />
            <ToggleSwitch label="Animations" defaultChecked={true} />
            <ToggleSwitch label="Speaking Exercises" defaultChecked={true} />
            <ToggleSwitch label="Listening Exercises" defaultChecked={true} />
          </SettingsCard>

          {/* ── Notifications ────────────────────────────────────── */}
          <SettingsCard title="Notifications" delay={0.2}>
            <ToggleSwitch label="Daily Reminders" defaultChecked={true} />
            <ToggleSwitch label="Streak Warnings" defaultChecked={true} />
            <ToggleSwitch label="Leaderboard Updates" defaultChecked={false} />
          </SettingsCard>

          {/* ── Danger Zone ──────────────────────────────────────── */}
          <SettingsCard title="Danger Zone" delay={0.25}>
            <motion.button
              className="w-full py-3 rounded-xl font-black text-base text-white cursor-pointer border-none"
              style={{
                background: "#ff4b4b",
                borderBottom: "4px solid #ea2b2b",
              }}
              whileTap={{ scale: 0.97, y: 4 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => alert("Sign Out is a placeholder – coming soon!")}
            >
              SIGN OUT
            </motion.button>
            <p
              className="text-center text-xs"
              style={{ color: "var(--text-muted, #afafaf)" }}
            >
              This is a mock sign-out button for demonstration
            </p>
          </SettingsCard>
        </div>
      </main>

      <div className="md:hidden">
        <MobileNav />
      </div>

      <style jsx>{`
        :global(.dark) .settings-page {
          --page-bg: #131f24;
          --card-bg: #202f36;
          --card-border: #37464f;
          --text-primary: #e5e5e5;
          --text-muted: #8a9ba5;
          --input-bg: #2a3d47;
          --toggle-bg: #37464f;
        }
      `}</style>
    </div>
  );
}
