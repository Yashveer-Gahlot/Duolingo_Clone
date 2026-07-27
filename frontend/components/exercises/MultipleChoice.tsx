"use client";

import React from "react";
import { motion } from "framer-motion";
import { tapClick } from "@/components/ui/AudioPlayer";
import SpeakerButton from "@/components/ui/SpeakerButton";

/* ═══════════════════════════════════════════════════════════════════════════
   MultipleChoice – Grid of selectable option cards with TTS
   ═══════════════════════════════════════════════════════════════════════════ */

interface MultipleChoiceProps {
  prompt: string;
  options: string[];
  selected: string | null;
  correctAnswer: string;
  /** null = not checked, true = correct, false = wrong */
  result: boolean | null;
  onSelect: (option: string) => void;
  /** Language for TTS (default: es-ES) */
  lang?: string;
}

export default function MultipleChoice({
  prompt,
  options,
  selected,
  correctAnswer,
  result,
  onSelect,
  lang = "es-ES",
}: MultipleChoiceProps) {
  const getCardClass = (option: string) => {
    let base = "option-card";
    if (result !== null) {
      if (option === correctAnswer) return `${base} option-card-correct`;
      if (option === selected && result === false)
        return `${base} option-card-wrong`;
      return base;
    }
    if (option === selected) return `${base} option-card-selected`;
    return base;
  };

  // Determine the TTS text (use prompt for Spanish prompts)
  const ttsText = prompt.replace(/^(Select|Choose|Pick)\s+/i, "").replace(/['"]/g, "");

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

      {/* Options grid */}
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => (
          <motion.button
            key={idx}
            className={getCardClass(option)}
            onClick={() => {
              if (result !== null) return;
              tapClick();
              onSelect(option);
            }}
            whileTap={result === null ? { scale: 0.97 } : undefined}
            disabled={result !== null}
            style={{
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              width: "100%",
            }}
          >
            {/* Number badge */}
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                border: "2px solid currentColor",
                opacity: 0.6,
              }}
            >
              {idx + 1}
            </span>
            <span>{option}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
