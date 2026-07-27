"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { speak, speakSlow, isSpeaking } from "@/lib/tts";

/* ═══════════════════════════════════════════════════════════════════════════
   SpeakerButton – Blue speaker icon with normal/slow TTS playback
   ═══════════════════════════════════════════════════════════════════════════ */

interface SpeakerButtonProps {
  text: string;
  lang?: string;
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Compact mode (smaller button) */
  compact?: boolean;
  className?: string;
}

export default function SpeakerButton({
  text,
  lang = "es-ES",
  autoPlay = false,
  compact = false,
  className = "",
}: SpeakerButtonProps) {
  const [playing, setPlaying] = useState(false);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay && text) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  // Poll speaking state
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      if (!isSpeaking()) {
        setPlaying(false);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [playing]);

  const handlePlay = () => {
    speak(text, lang);
    setPlaying(true);
  };

  const handlePlaySlow = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakSlow(text, lang);
    setPlaying(true);
  };

  const size = compact ? "w-10 h-10" : "w-14 h-14";
  const iconSize = compact ? "text-lg" : "text-2xl";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Main speaker button */}
      <motion.button
        className={`${size} rounded-2xl flex items-center justify-center cursor-pointer border-none outline-none`}
        style={{
          background: "#1cb0f6",
          borderBottom: "4px solid #1899d6",
          color: "#ffffff",
        }}
        onClick={handlePlay}
        whileTap={{ scale: 0.9 }}
        animate={playing ? { scale: [1, 1.05, 1] } : {}}
        transition={playing ? { duration: 0.6, repeat: Infinity } : {}}
        title="Play audio"
      >
        <span className={iconSize}>{playing ? "🔊" : "🔈"}</span>
      </motion.button>

      {/* Slow (turtle) button */}
      <motion.button
        className={`${compact ? "w-8 h-8" : "w-10 h-10"} rounded-xl flex items-center justify-center cursor-pointer border-none outline-none`}
        style={{
          background: "#ffffff",
          border: "2px solid #1cb0f6",
          borderBottom: "3px solid #1899d6",
          color: "#1cb0f6",
        }}
        onClick={handlePlaySlow}
        whileTap={{ scale: 0.9 }}
        title="Play slow"
      >
        <span className={compact ? "text-sm" : "text-base"}>🐢</span>
      </motion.button>
    </div>
  );
}
