"use client";

import React from "react";
import { motion } from "framer-motion";
import { tapClick } from "@/components/ui/AudioPlayer";

/* ═══════════════════════════════════════════════════════════════════════════
   MatchPairs – Two columns, select one from each to form a match
   ═══════════════════════════════════════════════════════════════════════════ */

export interface MatchPairsState {
  /** Correct pairs already matched: array of [leftIdx, rightIdx] */
  matched: [number, number][];
  /** Currently selected left column index (null if none) */
  selectedLeft: number | null;
  /** Currently selected right column index (null if none) */
  selectedRight: number | null;
  /** Brief shake state for wrong match */
  shakeWrong: boolean;
}

interface MatchPairsProps {
  prompt: string;
  leftColumn: string[];
  rightColumn: string[];
  state: MatchPairsState;
  onSelectLeft: (index: number) => void;
  onSelectRight: (index: number) => void;
}

export default function MatchPairs({
  prompt,
  leftColumn,
  rightColumn,
  state,
  onSelectLeft,
  onSelectRight,
}: MatchPairsProps) {
  const isLeftMatched = (idx: number) =>
    state.matched.some(([l]) => l === idx);
  const isRightMatched = (idx: number) =>
    state.matched.some(([, r]) => r === idx);

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <h2
        className="text-xl md:text-2xl font-extrabold leading-snug"
        style={{ color: "#3c3c3c" }}
      >
        {prompt}
      </h2>

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          {leftColumn.map((word, idx) => {
            const matched = isLeftMatched(idx);
            const isSelected = state.selectedLeft === idx;

            return (
              <motion.button
                key={`left-${idx}`}
                className="w-full py-3 px-4 rounded-2xl text-sm font-bold transition-all"
                style={{
                  border: matched
                    ? "2px solid #58cc02"
                    : isSelected
                    ? "2px solid #ffc800"
                    : "2px solid #e5e5e5",
                  borderBottom: matched
                    ? "4px solid #58cc02"
                    : isSelected
                    ? "4px solid #e5b200"
                    : "4px solid #e5e5e5",
                  background: matched
                    ? "#d7ffb8"
                    : isSelected
                    ? "#fff3cc"
                    : "#ffffff",
                  color: matched
                    ? "#46a302"
                    : isSelected
                    ? "#e5b200"
                    : "#3c3c3c",
                  cursor: matched ? "default" : "pointer",
                  opacity: matched ? 0.7 : 1,
                }}
                onClick={() => {
                  if (matched) return;
                  tapClick();
                  onSelectLeft(idx);
                }}
                animate={
                  state.shakeWrong && isSelected
                    ? { x: [0, -6, 6, -6, 6, 0] }
                    : {}
                }
                transition={{ duration: 0.3 }}
                disabled={matched}
              >
                {word}
              </motion.button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {rightColumn.map((word, idx) => {
            const matched = isRightMatched(idx);
            const isSelected = state.selectedRight === idx;

            return (
              <motion.button
                key={`right-${idx}`}
                className="w-full py-3 px-4 rounded-2xl text-sm font-bold transition-all"
                style={{
                  border: matched
                    ? "2px solid #58cc02"
                    : isSelected
                    ? "2px solid #ffc800"
                    : "2px solid #e5e5e5",
                  borderBottom: matched
                    ? "4px solid #58cc02"
                    : isSelected
                    ? "4px solid #e5b200"
                    : "4px solid #e5e5e5",
                  background: matched
                    ? "#d7ffb8"
                    : isSelected
                    ? "#fff3cc"
                    : "#ffffff",
                  color: matched
                    ? "#46a302"
                    : isSelected
                    ? "#e5b200"
                    : "#3c3c3c",
                  cursor: matched ? "default" : "pointer",
                  opacity: matched ? 0.7 : 1,
                }}
                onClick={() => {
                  if (matched) return;
                  tapClick();
                  onSelectRight(idx);
                }}
                animate={
                  state.shakeWrong && isSelected
                    ? { x: [0, -6, 6, -6, 6, 0] }
                    : {}
                }
                transition={{ duration: 0.3 }}
                disabled={matched}
              >
                {word}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
