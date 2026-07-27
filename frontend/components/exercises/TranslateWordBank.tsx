"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tapClick } from "@/components/ui/AudioPlayer";
import SpeakerButton from "@/components/ui/SpeakerButton";

/* ═══════════════════════════════════════════════════════════════════════════
   TranslateWordBank – Tap words to assemble a sentence with TTS
   ═══════════════════════════════════════════════════════════════════════════ */

interface TranslateWordBankProps {
  prompt: string;
  wordBank: string[];
  /** Indices of words placed in the answer zone (ordered) */
  placedIndices: number[];
  result: boolean | null;
  onPlaceWord: (index: number) => void;
  onRemoveWord: (index: number) => void;
  /** Language for TTS */
  lang?: string;
}

export default function TranslateWordBank({
  prompt,
  wordBank,
  placedIndices,
  result,
  onPlaceWord,
  onRemoveWord,
  lang = "es-ES",
}: TranslateWordBankProps) {
  const isChecked = result !== null;

  // Extract the Spanish text from the prompt for TTS
  const ttsMatch = prompt.match(/[''"](.+?)['"'"]/);
  const ttsText = ttsMatch ? ttsMatch[1] : prompt;

  return (
    <div className="space-y-6">
      {/* Speaker + Prompt */}
      <div className="flex items-start gap-3">
        <SpeakerButton text={ttsText} lang={lang} autoPlay compact />
        <h2
          className="text-xl md:text-2xl font-extrabold leading-snug flex-1"
          style={{ color: "#3c3c3c" }}
        >
          {prompt}
        </h2>
      </div>

      {/* Answer zone */}
      <div
        className="min-h-[72px] rounded-2xl p-3 flex flex-wrap gap-2 items-start"
        style={{
          background: result === true
            ? "#d7ffb8"
            : result === false
            ? "#ffdfe0"
            : "#f7f7f7",
          border: `2px ${
            result === true
              ? "solid #58cc02"
              : result === false
              ? "solid #ff4b4b"
              : "dashed #d4d4d4"
          }`,
          transition: "all 0.2s",
        }}
      >
        <AnimatePresence mode="popLayout">
          {placedIndices.map((wordIdx) => (
            <motion.button
              key={`placed-${wordIdx}`}
              className="word-chip"
              onClick={() => {
                if (isChecked) return;
                tapClick();
                onRemoveWord(wordIdx);
              }}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              disabled={isChecked}
              style={{
                borderColor: result === true
                  ? "#58cc02"
                  : result === false
                  ? "#ff4b4b"
                  : undefined,
              }}
            >
              {wordBank[wordIdx]}
            </motion.button>
          ))}
        </AnimatePresence>

        {placedIndices.length === 0 && (
          <span
            className="text-sm font-semibold py-2"
            style={{ color: "#afafaf" }}
          >
            Tap the words below...
          </span>
        )}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {wordBank.map((word, idx) => {
          const isUsed = placedIndices.includes(idx);
          return (
            <motion.button
              key={idx}
              className={`word-chip ${isUsed ? "word-chip-used" : ""}`}
              onClick={() => {
                if (isUsed || isChecked) return;
                tapClick();
                onPlaceWord(idx);
              }}
              whileTap={!isUsed && !isChecked ? { scale: 0.93 } : undefined}
              disabled={isUsed || isChecked}
              layout
            >
              {word}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
