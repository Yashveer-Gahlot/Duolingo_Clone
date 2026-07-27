"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { speak } from "@/lib/tts";
import { similarity } from "@/lib/levenshtein";
import SpeakerButton from "@/components/ui/SpeakerButton";

/* ═══════════════════════════════════════════════════════════════════════════
   SpeakAnswer – Pronunciation exercise using Web Speech Recognition
   ═══════════════════════════════════════════════════════════════════════════ */

interface SpeakAnswerProps {
  prompt: string;
  correctAnswer: string;
  result: boolean | null;
  onResult: (spoken: string, isCorrect: boolean) => void;
  lang?: string;
}

/** Minimum similarity threshold to accept pronunciation */
const SIMILARITY_THRESHOLD = 0.65;

/** Get the SpeechRecognition constructor (cross-browser) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognitionCtor(): (new () => any) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function SpeakAnswer({
  prompt,
  correctAnswer,
  result,
  onResult,
  lang = "es-ES",
}: SpeakAnswerProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    if (!getSpeechRecognitionCtor()) {
      setSupported(false);
    }
  }, []);

  // Auto-play TTS when exercise loads
  useEffect(() => {
    const timer = setTimeout(() => {
      speak(correctAnswer, lang);
    }, 400);
    return () => clearTimeout(timer);
  }, [correctAnswer, lang]);

  const startListening = useCallback(() => {
    const SRCtor = getSpeechRecognitionCtor();
    if (!SRCtor) return;

    const recognition = new SRCtor();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // Check all alternatives for best match
      let bestScore = 0;
      let bestTranscript = "";

      for (let i = 0; i < event.results[0].length; i++) {
        const alt = event.results[0][i].transcript;
        const score = similarity(alt, correctAnswer);
        if (score > bestScore) {
          bestScore = score;
          bestTranscript = alt;
        }
      }

      setTranscript(bestTranscript);
      setSimilarityScore(bestScore);
      setListening(false);

      const isCorrect = bestScore >= SIMILARITY_THRESHOLD;
      onResult(bestTranscript, isCorrect);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setTranscript("");
    setSimilarityScore(null);
  }, [lang, correctAnswer, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }, []);

  // Fallback for unsupported browsers
  if (!supported) {
    return (
      <div className="space-y-6 text-center">
        <h2
          className="text-xl md:text-2xl font-extrabold leading-snug"
          style={{ color: "#3c3c3c" }}
        >
          {prompt}
        </h2>
        <div
          className="rounded-2xl p-6"
          style={{ background: "#fff3cc", border: "2px solid #ffc800" }}
        >
          <p className="text-sm font-bold" style={{ color: "#e5b200" }}>
            ⚠️ Speech recognition is not supported in your browser.
          </p>
          <p className="text-xs mt-1" style={{ color: "#777777" }}>
            Try using Chrome or Edge for voice exercises.
          </p>
        </div>
        {/* Auto-pass for unsupported browsers */}
        <button
          className="btn-3d btn-3d-green"
          onClick={() => onResult(correctAnswer, true)}
        >
          Skip this exercise
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <h2
        className="text-xl md:text-2xl font-extrabold leading-snug"
        style={{ color: "#3c3c3c" }}
      >
        {prompt}
      </h2>

      {/* Target phrase with speaker */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: "#f7f7f7",
          border: "2px solid #e5e5e5",
        }}
      >
        <SpeakerButton text={correctAnswer} lang={lang} />
        <p
          className="text-lg font-extrabold mt-3"
          style={{ color: "#3c3c3c" }}
        >
          &ldquo;{correctAnswer}&rdquo;
        </p>
      </div>

      {/* Microphone button */}
      <div className="flex justify-center">
        <motion.button
          className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer border-none outline-none"
          style={{
            background: listening ? "#ff4b4b" : result !== null ? "#e5e5e5" : "#1cb0f6",
            borderBottom: listening ? "4px solid #ea2b2b" : result !== null ? "4px solid #d4d4d4" : "4px solid #1899d6",
            color: "#ffffff",
          }}
          onClick={listening ? stopListening : startListening}
          disabled={result !== null}
          whileTap={result === null ? { scale: 0.9 } : undefined}
          animate={
            listening
              ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(255, 75, 75, 0.4)",
                    "0 0 0 20px rgba(255, 75, 75, 0)",
                    "0 0 0 0 rgba(255, 75, 75, 0.4)",
                  ],
                }
              : {}
          }
          transition={listening ? { duration: 1.5, repeat: Infinity } : {}}
        >
          <span className="text-3xl">{listening ? "⏹️" : "🎤"}</span>
        </motion.button>
      </div>

      <p
        className="text-center text-sm font-bold"
        style={{ color: listening ? "#ff4b4b" : "#afafaf" }}
      >
        {listening
          ? "Listening..."
          : result !== null
          ? ""
          : "Tap the microphone and speak"}
      </p>

      {/* Transcript display */}
      {transcript && (
        <motion.div
          className="rounded-2xl p-4 text-center"
          style={{
            background: result === true ? "#d7ffb8" : result === false ? "#ffdfe0" : "#f7f7f7",
            border: `2px solid ${
              result === true ? "#58cc02" : result === false ? "#ff4b4b" : "#e5e5e5"
            }`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs font-bold mb-1" style={{ color: "#afafaf" }}>
            You said:
          </p>
          <p
            className="text-base font-extrabold"
            style={{
              color: result === true ? "#46a302" : result === false ? "#ea2b2b" : "#3c3c3c",
            }}
          >
            &ldquo;{transcript}&rdquo;
          </p>
          {similarityScore !== null && (
            <p className="text-xs font-semibold mt-1" style={{ color: "#afafaf" }}>
              Similarity: {Math.round(similarityScore * 100)}%
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
