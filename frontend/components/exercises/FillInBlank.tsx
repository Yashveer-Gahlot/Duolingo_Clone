"use client";

import React from "react";
import { motion } from "framer-motion";
import { tapClick } from "@/components/ui/AudioPlayer";
import SpeakerButton from "@/components/ui/SpeakerButton";

/* ═══════════════════════════════════════════════════════════════════════════
   FillInBlank – Sentence with a blank slot, option pills, and TTS
   ═══════════════════════════════════════════════════════════════════════════ */

interface FillInBlankProps {
  prompt: string;
  options: string[];
  selected: string | null;
  correctAnswer: string;
  result: boolean | null;
  onSelect: (option: string) => void;
  /** Language for TTS */
  lang?: string;
}

export default function FillInBlank({
  prompt,
  options,
  selected,
  correctAnswer,
  result,
  onSelect,
  lang = "es-ES",
}: FillInBlankProps) {
  const isChecked = result !== null;

  // Split prompt on ___ to show the blank inline
  const parts = prompt.split(/_{2,}/);

  // For TTS, replace the blank with the correct answer
  const ttsText = prompt.replace(/_{2,}/, correctAnswer);

  return (
    <div className="space-y-6">
      {/* Speaker button */}
      <div className="flex items-center gap-3">
        <SpeakerButton text={ttsText} lang={lang} autoPlay compact />
        <span className="text-sm font-bold" style={{ color: "#afafaf" }}>
          Complete the sentence
        </span>
      </div>

      {/* Sentence with blank */}
      <div
        className="text-xl md:text-2xl font-extrabold leading-relaxed"
        style={{ color: "#3c3c3c" }}
      >
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            <span>{part}</span>
            {idx < parts.length - 1 && (
              <span
                className="inline-block min-w-[80px] mx-1 px-3 py-1 rounded-xl text-center align-middle"
                style={{
                  borderBottom: "3px solid",
                  borderColor: selected
                    ? result === true
                      ? "#58cc02"
                      : result === false
                      ? "#ff4b4b"
                      : "#1cb0f6"
                    : "#d4d4d4",
                  background: selected
                    ? result === true
                      ? "#d7ffb8"
                      : result === false
                      ? "#ffdfe0"
                      : "#ddf4ff"
                    : "#f7f7f7",
                  color: selected
                    ? result === true
                      ? "#46a302"
                      : result === false
                      ? "#ea2b2b"
                      : "#1899d6"
                    : "#afafaf",
                  transition: "all 0.2s",
                }}
              >
                {selected || "___"}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Option pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {options.map((option, idx) => {
          const isSelected = option === selected;
          let pillStyle: React.CSSProperties = {
            border: "2px solid #e5e5e5",
            borderBottom: "4px solid #e5e5e5",
            background: "#ffffff",
            color: "#3c3c3c",
          };

          if (isSelected && result === null) {
            pillStyle = {
              border: "2px solid #1cb0f6",
              borderBottom: "4px solid #1899d6",
              background: "#ddf4ff",
              color: "#1899d6",
            };
          } else if (isChecked && option === correctAnswer) {
            pillStyle = {
              border: "2px solid #58cc02",
              borderBottom: "4px solid #46a302",
              background: "#d7ffb8",
              color: "#46a302",
            };
          } else if (isChecked && isSelected && result === false) {
            pillStyle = {
              border: "2px solid #ff4b4b",
              borderBottom: "4px solid #ea2b2b",
              background: "#ffdfe0",
              color: "#ea2b2b",
            };
          }

          return (
            <motion.button
              key={idx}
              className="px-5 py-2.5 rounded-2xl font-bold text-sm cursor-pointer transition-all"
              style={pillStyle}
              onClick={() => {
                if (isChecked) return;
                tapClick();
                onSelect(option);
              }}
              whileTap={!isChecked ? { scale: 0.95 } : undefined}
              disabled={isChecked}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
