"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { getUserProfile, purchaseSuper } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════
   Shop / Super Duolingo Page
   ═══════════════════════════════════════════════════════════════════════════ */

const SUPER_COST = 1000;

const PERKS = [
  { icon: "❤️", title: "Unlimited Hearts", desc: "No more running out of hearts – learn without limits" },
  { icon: "🚫", title: "No Ads", desc: "Enjoy an ad-free learning experience" },
  { icon: "👑", title: "Legendary Mode", desc: "Unlock exclusive challenges and earn 2x XP" },
  { icon: "💪", title: "Unlimited Practice", desc: "Review any lesson as many times as you want" },
  { icon: "📊", title: "Progress Insights", desc: "Advanced stats about your learning journey" },
  { icon: "🎯", title: "Mastery Quizzes", desc: "Test your knowledge with special quiz rounds" },
];

export default function ShopPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handlePurchase = async () => {
    if (!user) return;
    setErrorMsg("");
    setPurchasing(true);
    try {
      await purchaseSuper(user.id);
      setShowSuccess(true);
      // Refresh user data
      const updated = await getUserProfile(user.id);
      setUser(updated);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErrorMsg(e.message.includes("Not enough") 
          ? `Not enough gems! You need ${SUPER_COST} gems.`
          : e.message);
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--page-bg, #f7f7f7)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          💎
        </motion.div>
      </div>
    );
  }

  const isSuper = user?.is_super ?? false;
  const gems = user?.gems ?? 0;
  const canAfford = gems >= SUPER_COST;

  return (
    <div className="min-h-screen flex shop-page" style={{ background: "var(--page-bg, #f7f7f7)" }}>
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-[240px] pb-24 md:pb-8">
        {/* ── Hero Section ──────────────────────────────────────────── */}
        <motion.div
          className="relative overflow-hidden mx-4 mt-6 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #7b2ff7 0%, #c471ed 40%, #f64f59 100%)",
            padding: "2.5rem 1.5rem",
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="absolute top-8 right-8 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />

          <div className="relative z-10 text-center">
            <motion.div
              className="text-6xl mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👑
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Super Duolingo
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-md mx-auto">
              Unlock the full power of your learning journey with unlimited hearts and exclusive features
            </p>

            {isSuper && (
              <motion.div
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full"
                style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <span className="text-lg">✅</span>
                <span className="text-white font-bold text-sm">You&apos;re a Super member!</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Gem balance ───────────────────────────────────────────── */}
        <div className="mx-4 mt-6">
          <motion.div
            className="rounded-2xl p-4 flex items-center justify-between shop-card"
            style={{
              background: "var(--card-bg, #ffffff)",
              border: "2px solid var(--card-border, #e5e5e5)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(28, 176, 246, 0.1)" }}
              >
                💎
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-muted, #afafaf)" }}>
                  Your Gems
                </p>
                <p className="text-2xl font-black" style={{ color: "var(--text-primary, #3c3c3c)" }}>
                  {gems.toLocaleString()}
                </p>
              </div>
            </div>
            {!isSuper && (
              <div className="text-right">
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted, #afafaf)" }}>
                  Super costs
                </p>
                <p className="text-lg font-black" style={{ color: "#ce82ff" }}>
                  {SUPER_COST.toLocaleString()} 💎
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Perks Grid ────────────────────────────────────────────── */}
        <div className="mx-4 mt-6">
          <h2
            className="text-sm font-black uppercase px-2 mb-3"
            style={{ color: "var(--text-muted, #afafaf)", letterSpacing: "0.1em" }}
          >
            Super Perks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERKS.map((perk, idx) => (
              <motion.div
                key={perk.title}
                className="rounded-2xl p-4 flex items-start gap-3 shop-card"
                style={{
                  background: "var(--card-bg, #ffffff)",
                  border: "2px solid var(--card-border, #e5e5e5)",
                }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "rgba(206, 130, 255, 0.1)" }}
                >
                  {perk.icon}
                </div>
                <div>
                  <p className="text-sm font-extrabold" style={{ color: "var(--text-primary, #3c3c3c)" }}>
                    {perk.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted, #afafaf)" }}>
                    {perk.desc}
                  </p>
                </div>
                {isSuper && (
                  <span className="ml-auto text-sm flex-shrink-0">✅</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Purchase Button ───────────────────────────────────────── */}
        {!isSuper && (
          <div className="mx-4 mt-8 mb-8">
            {errorMsg && (
              <motion.p
                className="text-center text-sm font-bold mb-3"
                style={{ color: "#ff4b4b" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errorMsg}
              </motion.p>
            )}
            <motion.button
              className="w-full py-4 rounded-2xl font-black text-lg text-white cursor-pointer border-none"
              style={{
                background: canAfford
                  ? "linear-gradient(135deg, #7b2ff7 0%, #c471ed 100%)"
                  : "#afafaf",
                borderBottom: canAfford ? "4px solid #5a1fd0" : "4px solid #999999",
                opacity: purchasing ? 0.7 : 1,
              }}
              onClick={handlePurchase}
              disabled={!canAfford || purchasing}
              whileTap={canAfford ? { scale: 0.97, y: 4 } : undefined}
              whileHover={canAfford ? { scale: 1.01 } : undefined}
            >
              {purchasing ? (
                "Processing..."
              ) : canAfford ? (
                <>GET SUPER DUOLINGO – {SUPER_COST} 💎</>
              ) : (
                <>NOT ENOUGH GEMS ({gems}/{SUPER_COST})</>
              )}
            </motion.button>
            <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted, #afafaf)" }}>
              This is a mock purchase for demonstration purposes
            </p>
          </div>
        )}

        {/* ── Already Super ─────────────────────────────────────────── */}
        {isSuper && (
          <motion.div
            className="mx-4 mt-8 mb-8 rounded-2xl p-6 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(123,47,247,0.08), rgba(196,113,237,0.08))",
              border: "2px solid #ce82ff",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-black" style={{ color: "#7b2ff7" }}>
              You&apos;re Super!
            </h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted, #afafaf)" }}>
              Enjoy unlimited hearts and all premium features.
            </p>
          </motion.div>
        )}
      </main>

      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* ── Success Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              className="modal-content text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-black mb-2" style={{ color: "#7b2ff7" }}>
                Welcome to Super!
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted, #afafaf)" }}>
                You now have unlimited hearts and all premium features unlocked.
              </p>
              <button
                className="btn-3d btn-3d-green w-full"
                onClick={() => setShowSuccess(false)}
              >
                AWESOME!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark mode CSS variables */}
      <style jsx>{`
        :global(.dark) .shop-page {
          --page-bg: #131f24;
          --card-bg: #202f36;
          --card-border: #37464f;
          --text-primary: #e5e5e5;
          --text-muted: #8a9ba5;
        }
        :global(.dark) .shop-card {
          --card-bg: #202f36;
          --card-border: #37464f;
          --text-primary: #e5e5e5;
          --text-muted: #8a9ba5;
        }
      `}</style>
    </div>
  );
}
