"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   FeedbackBar – Slides up from bottom with correct/wrong state
   ═══════════════════════════════════════════════════════════════════════════ */

type FeedbackState = "idle" | "correct" | "wrong";

interface FeedbackBarProps {
  state: FeedbackState;
  correctAnswer?: string;
  canCheck: boolean;
  onCheck: () => void;
  onContinue: () => void;
}

export default function FeedbackBar({
  state,
  correctAnswer,
  canCheck,
  onCheck,
  onContinue,
}: FeedbackBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <AnimatePresence mode="wait">
        {/* ── Idle: CHECK button ────────────────────────────── */}
        {state === "idle" && (
          <motion.div
            key="idle"
            className="px-4 py-4 md:px-8 flex justify-between items-center"
            style={{
              background: "#ffffff",
              borderTop: "2px solid #e5e5e5",
            }}
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ duration: 0.2 }}
          >
            <Button variant="ghost" onClick={() => {}}>
              Skip
            </Button>
            <Button
              variant={canCheck ? "primary" : "ghost"}
              disabled={!canCheck}
              onClick={onCheck}
            >
              Check
            </Button>
          </motion.div>
        )}

        {/* ── Correct ──────────────────────────────────────── */}
        {state === "correct" && (
          <motion.div
            key="correct"
            className="feedback-bar feedback-correct"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex items-center gap-3">
              <motion.span
                className="text-3xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                ✅
              </motion.span>
              <div>
                <p
                  className="text-lg font-extrabold"
                  style={{ color: "#46a302" }}
                >
                  Excellent!
                </p>
              </div>
            </div>
            <Button variant="primary" onClick={onContinue}>
              Continue
            </Button>
          </motion.div>
        )}

        {/* ── Wrong ────────────────────────────────────────── */}
        {state === "wrong" && (
          <motion.div
            key="wrong"
            className="feedback-bar feedback-wrong"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex items-center gap-3">
              <motion.span
                className="text-3xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                ❌
              </motion.span>
              <div>
                <p
                  className="text-base font-extrabold"
                  style={{ color: "#ea2b2b" }}
                >
                  Correct answer:
                </p>
                <p
                  className="text-sm font-bold"
                  style={{ color: "#ea2b2b" }}
                >
                  {correctAnswer}
                </p>
              </div>
            </div>
            <Button variant="danger" onClick={onContinue}>
              Got it
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
