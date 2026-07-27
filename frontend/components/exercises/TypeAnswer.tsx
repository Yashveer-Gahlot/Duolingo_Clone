"use client";

import React, { useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   TypeAnswer – Free text input field with autofocus
   ═══════════════════════════════════════════════════════════════════════════ */

interface TypeAnswerProps {
  prompt: string;
  value: string;
  correctAnswer: string;
  result: boolean | null;
  onChange: (value: string) => void;
  onSubmitViaEnter: () => void;
}

export default function TypeAnswer({
  prompt,
  value,
  correctAnswer,
  result,
  onChange,
  onSubmitViaEnter,
}: TypeAnswerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isChecked = result !== null;

  useEffect(() => {
    // Autofocus with a small delay for transition
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  const borderColor = isChecked
    ? result
      ? "#58cc02"
      : "#ff4b4b"
    : value.length > 0
    ? "#1cb0f6"
    : "#e5e5e5";

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <h2
        className="text-xl md:text-2xl font-extrabold leading-snug"
        style={{ color: "#3c3c3c" }}
      >
        {prompt}
      </h2>

      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            if (isChecked) return;
            onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim().length > 0 && !isChecked) {
              onSubmitViaEnter();
            }
          }}
          placeholder="Type your answer here..."
          disabled={isChecked}
          className="w-full px-5 py-4 rounded-2xl text-lg font-semibold outline-none transition-all"
          style={{
            border: `2px solid ${borderColor}`,
            borderBottom: `4px solid ${borderColor}`,
            background: isChecked
              ? result
                ? "#d7ffb8"
                : "#ffdfe0"
              : "#ffffff",
            color: isChecked
              ? result
                ? "#46a302"
                : "#ea2b2b"
              : "#3c3c3c",
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {/* Show correct answer when wrong */}
        {isChecked && result === false && (
          <p
            className="mt-2 text-sm font-bold"
            style={{ color: "#46a302" }}
          >
            Correct answer: {correctAnswer}
          </p>
        )}
      </div>
    </div>
  );
}
