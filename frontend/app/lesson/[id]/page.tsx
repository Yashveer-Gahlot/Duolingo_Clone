"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { ProgressBar } from "@/components/ui";
import { HeartCounter } from "@/components/ui";
import FeedbackBar from "@/components/FeedbackBar";
import ExitConfirmModal from "@/components/ExitConfirmModal";
import OutOfHeartsModal from "@/components/OutOfHeartsModal";
import LessonComplete from "@/components/lesson/LessonComplete";
import TimesUpModal from "@/components/TimesUpModal";

import {
  MultipleChoice,
  TranslateWordBank,
  MatchPairs,
  FillInBlank,
  TypeAnswer,
  SpeakAnswer,
} from "@/components/exercises";
import type { MatchPairsState } from "@/components/exercises";

import { getLessonExercises, completeLesson, getUserProfile } from "@/lib/api";
import { correctPing, wrongBuzz } from "@/components/ui/AudioPlayer";
import type { Exercise, UserProfile } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════════════════════
   Lesson Player Page – /lesson/[id]
   ═══════════════════════════════════════════════════════════════════════════ */

type FeedbackState = "idle" | "correct" | "wrong";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const lessonId = parseInt(id, 10);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLegendary = searchParams.get("legendary") === "true";
  const LEGENDARY_TIME = 120; // 2 minutes in seconds

  // ── Core state ──────────────────────────────────────────────────────
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hearts, setHearts] = useState(5);
  const [loading, setLoading] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [updatedStreak, setUpdatedStreak] = useState(0);
  const [updatedStreakActive, setUpdatedStreakActive] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [outOfHeartsOpen, setOutOfHeartsOpen] = useState(false);
  const [heartWobble, setHeartWobble] = useState(false);
  const [lessonDone, setLessonDone] = useState(false);

  // ── Exercise-specific state ─────────────────────────────────────────
  const [mcSelected, setMcSelected] = useState<string | null>(null);
  const [mcResult, setMcResult] = useState<boolean | null>(null);

  const [wbPlaced, setWbPlaced] = useState<number[]>([]);
  const [wbResult, setWbResult] = useState<boolean | null>(null);

  const [fibSelected, setFibSelected] = useState<string | null>(null);
  const [fibResult, setFibResult] = useState<boolean | null>(null);

  const [typeValue, setTypeValue] = useState("");
  const [typeResult, setTypeResult] = useState<boolean | null>(null);

  const [matchState, setMatchState] = useState<MatchPairsState>({
    matched: [],
    selectedLeft: null,
    selectedRight: null,
    shakeWrong: false,
  });
  const [matchComplete, setMatchComplete] = useState(false);

  // ── SpeakAnswer state ───────────────────────────────────────────────
  const [speakResult, setSpeakResult] = useState<boolean | null>(null);
  const [speakTranscript, setSpeakTranscript] = useState("");

  // ── Legendary timer state ───────────────────────────────────────────
  const [timeRemaining, setTimeRemaining] = useState(LEGENDARY_TIME);
  const [timesUpOpen, setTimesUpOpen] = useState(false);

  // ── Derived ─────────────────────────────────────────────────────────
  const exercise = exercises[currentIdx] ?? null;
  const total = exercises.length;
  const progress = total > 0 ? ((currentIdx) / total) * 100 : 0;

  // ── Fetch on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [exData, userData] = await Promise.all([
          getLessonExercises(lessonId),
          getUserProfile(),
        ]);
        setExercises(exData);
        setUser(userData);
        setHearts(userData.hearts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId]);

  // ── Legendary countdown timer ──────────────────────────────────────
  useEffect(() => {
    if (!isLegendary || loading || lessonDone || timesUpOpen) return;
    if (timeRemaining <= 0) {
      setTimesUpOpen(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setTimesUpOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLegendary, loading, lessonDone, timesUpOpen, timeRemaining]);

  // ── Reset exercise state when moving to next exercise ───────────────
  const resetExerciseState = useCallback(() => {
    setMcSelected(null);
    setMcResult(null);
    setWbPlaced([]);
    setWbResult(null);
    setFibSelected(null);
    setFibResult(null);
    setTypeValue("");
    setTypeResult(null);
    setMatchState({
      matched: [],
      selectedLeft: null,
      selectedRight: null,
      shakeWrong: false,
    });
    setMatchComplete(false);
    setSpeakResult(null);
    setSpeakTranscript("");
    setFeedback("idle");
  }, []);

  // ── Parse exercise options ──────────────────────────────────────────
  const parseOptions = (ex: Exercise): string[] => {
    if (!ex.options_json) return [];
    try {
      const parsed = JSON.parse(ex.options_json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const parseMatchOptions = (
    ex: Exercise
  ): { left: string[]; right: string[] } => {
    if (!ex.options_json) return { left: [], right: [] };
    try {
      const parsed = JSON.parse(ex.options_json);
      return {
        left: parsed.english || parsed.spanish || [],
        right: parsed.spanish || parsed.english || [],
      };
    } catch {
      return { left: [], right: [] };
    }
  };

  const parseMatchCorrect = (
    ex: Exercise
  ): Record<string, string> => {
    try {
      return JSON.parse(ex.correct_answer);
    } catch {
      return {};
    }
  };

  // ── Can check? ──────────────────────────────────────────────────────
  const canCheck = (() => {
    if (!exercise || feedback !== "idle") return false;
    switch (exercise.type) {
      case "multiple_choice":
        return mcSelected !== null;
      case "translate":
        return wbPlaced.length > 0;
      case "fill_in_blank":
        return fibSelected !== null;
      case "type_answer":
        return typeValue.trim().length > 0;
      case "match_pairs":
        return matchComplete;
      case "speak_answer":
        return speakResult !== null;
      default:
        return false;
    }
  })();

  // ── Check answer ────────────────────────────────────────────────────
  const handleCheck = useCallback(() => {
    if (!exercise) return;

    let isCorrect = false;

    switch (exercise.type) {
      case "multiple_choice": {
        isCorrect =
          mcSelected?.toLowerCase().trim() ===
          exercise.correct_answer.toLowerCase().trim();
        setMcResult(isCorrect);
        break;
      }
      case "translate": {
        const options = parseOptions(exercise);
        const assembled = wbPlaced.map((i) => options[i]).join(" ");
        isCorrect =
          assembled.toLowerCase().trim() ===
          exercise.correct_answer.toLowerCase().trim();
        setWbResult(isCorrect);
        break;
      }
      case "fill_in_blank": {
        isCorrect =
          fibSelected?.toLowerCase().trim() ===
          exercise.correct_answer.toLowerCase().trim();
        setFibResult(isCorrect);
        break;
      }
      case "type_answer": {
        isCorrect =
          typeValue.toLowerCase().trim() ===
          exercise.correct_answer.toLowerCase().trim();
        setTypeResult(isCorrect);
        break;
      }
      case "match_pairs": {
        // Already fully matched by interaction
        isCorrect = true;
        break;
      }
      case "speak_answer": {
        // Already determined by SpeakAnswer component
        isCorrect = speakResult === true;
        break;
      }
    }

    if (isCorrect) {
      correctPing();
      setFeedback("correct");
      const reward = exercises[0]?.lesson_id ? 10 : 10;
      setXpEarned((prev) => prev + Math.round(reward / total));
    } else {
      wrongBuzz();
      setFeedback("wrong");
      setWrongAnswers((prev) => prev + 1);
      setHearts((prev) => {
        const newHearts = Math.max(0, prev - 1);
        if (newHearts === 0) {
          setTimeout(() => setOutOfHeartsOpen(true), 600);
        }
        return newHearts;
      });
      // Heart wobble
      setHeartWobble(true);
      setTimeout(() => setHeartWobble(false), 500);
    }
  }, [exercise, mcSelected, wbPlaced, fibSelected, typeValue, exercises, total]);

  // ── Continue to next exercise ───────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (currentIdx + 1 >= total) {
      // Lesson complete!
      setLessonDone(true);
      // Call API and capture updated stats
      completeLesson(lessonId, {
        user_id: user?.id ?? 1,
        xp_gained: isLegendary ? xpEarned * 2 : xpEarned,
        hearts_remaining: hearts,
        accuracy: Math.round(((total - wrongAnswers) / Math.max(total, 1)) * 100),
      })
        .then((stats) => {
          setUpdatedStreak(stats.streak);
          setUpdatedStreakActive(stats.is_streak_active);
        })
        .catch(console.error);
    } else {
      setCurrentIdx((prev) => prev + 1);
      resetExerciseState();
    }
  }, [currentIdx, total, lessonId, user, xpEarned, hearts, resetExerciseState]);

  // ── Match pairs logic ───────────────────────────────────────────────
  const handleMatchSelect = useCallback(
    (side: "left" | "right", idx: number) => {
      if (!exercise) return;
      const opts = parseMatchOptions(exercise);
      const correctMap = parseMatchCorrect(exercise);

      setMatchState((prev) => {
        const next = { ...prev, shakeWrong: false };
        if (side === "left") {
          next.selectedLeft = idx;
        } else {
          next.selectedRight = idx;
        }

        const leftIdx = side === "left" ? idx : prev.selectedLeft;
        const rightIdx = side === "right" ? idx : prev.selectedRight;

        if (leftIdx !== null && rightIdx !== null) {
          const leftWord = opts.left[leftIdx];
          const rightWord = opts.right[rightIdx];

          // Check if it's a correct pair
          const isMatch =
            correctMap[leftWord] === rightWord ||
            correctMap[rightWord] === leftWord;

          if (isMatch) {
            correctPing();
            const newMatched: [number, number][] = [
              ...prev.matched,
              [leftIdx, rightIdx],
            ];
            next.matched = newMatched;
            next.selectedLeft = null;
            next.selectedRight = null;

            // Check if all matched
            if (newMatched.length === opts.left.length) {
              setMatchComplete(true);
            }
          } else {
            wrongBuzz();
            next.shakeWrong = true;
            // Reset selections after shake
            setTimeout(() => {
              setMatchState((p) => ({
                ...p,
                selectedLeft: null,
                selectedRight: null,
                shakeWrong: false,
              }));
            }, 400);
          }
        }

        return next;
      });
    },
    [exercise]
  );

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center lesson-page"
        style={{ background: "var(--lesson-bg, #ffffff)" }}
      >
        <motion.div
          className="text-5xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🦉
        </motion.div>
      </div>
    );
  }

  // ── Lesson complete screen ──────────────────────────────────────────
  if (lessonDone) {
    return (
      <LessonComplete
        xpEarned={xpEarned}
        hearts={hearts}
        maxHearts={user?.hearts ?? 5}
        streak={updatedStreak || user?.streak || 0}
        isStreakActive={updatedStreakActive || user?.is_streak_active || false}
        totalExercises={total}
        wrongAnswers={wrongAnswers}
      />
    );
  }

  // ── Render current exercise ─────────────────────────────────────────
  const renderExercise = () => {
    if (!exercise) return null;

    switch (exercise.type) {
      case "multiple_choice": {
        const options = parseOptions(exercise);
        return (
          <MultipleChoice
            prompt={exercise.prompt}
            options={options}
            selected={mcSelected}
            correctAnswer={exercise.correct_answer}
            result={mcResult}
            onSelect={setMcSelected}
          />
        );
      }

      case "translate": {
        const options = parseOptions(exercise);
        return (
          <TranslateWordBank
            prompt={exercise.prompt}
            wordBank={options}
            placedIndices={wbPlaced}
            result={wbResult}
            onPlaceWord={(idx) => setWbPlaced((prev) => [...prev, idx])}
            onRemoveWord={(idx) =>
              setWbPlaced((prev) => prev.filter((i) => i !== idx))
            }
          />
        );
      }

      case "match_pairs": {
        const opts = parseMatchOptions(exercise);
        return (
          <MatchPairs
            prompt={exercise.prompt}
            leftColumn={opts.left}
            rightColumn={opts.right}
            state={matchState}
            onSelectLeft={(idx) => handleMatchSelect("left", idx)}
            onSelectRight={(idx) => handleMatchSelect("right", idx)}
          />
        );
      }

      case "fill_in_blank": {
        const options = parseOptions(exercise);
        return (
          <FillInBlank
            prompt={exercise.prompt}
            options={options}
            selected={fibSelected}
            correctAnswer={exercise.correct_answer}
            result={fibResult}
            onSelect={setFibSelected}
          />
        );
      }

      case "type_answer":
        return (
          <TypeAnswer
            prompt={exercise.prompt}
            value={typeValue}
            correctAnswer={exercise.correct_answer}
            result={typeResult}
            onChange={setTypeValue}
            onSubmitViaEnter={handleCheck}
          />
        );

      case "speak_answer":
        return (
          <SpeakAnswer
            prompt={exercise.prompt}
            correctAnswer={exercise.correct_answer}
            result={speakResult}
            onResult={(transcript, isCorrect) => {
              setSpeakTranscript(transcript);
              setSpeakResult(isCorrect);
            }}
          />
        );

      default:
        return (
          <p className="text-center" style={{ color: "#afafaf" }}>
            Unknown exercise type
          </p>
        );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lesson-page"
      style={{ background: "var(--lesson-bg, #ffffff)" }}
    >
      {/* ── Header Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-4"
        style={{ background: "var(--lesson-bg, #ffffff)" }}
      >
        {/* Exit button */}
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
          style={{
            color: "#afafaf",
            border: "2px solid #e5e5e5",
            background: "transparent",
            cursor: "pointer",
          }}
          onClick={() => setExitModalOpen(true)}
        >
          ✕
        </button>

        {/* Progress bar */}
        <div className="flex-1">
          <ProgressBar value={progress} height={14} />
        </div>

        {/* Legendary timer */}
        {isLegendary && (
          <motion.div
            className="flex items-center gap-1 px-2 py-1 rounded-xl font-black text-sm"
            style={{
              background: timeRemaining <= 30 ? "#ffdfe0" : "#fff3cc",
              color: timeRemaining <= 30 ? "#ea2b2b" : "#e5b200",
              border: `2px solid ${timeRemaining <= 30 ? "#ff4b4b" : "#ffc800"}`,
            }}
            animate={
              timeRemaining <= 10
                ? { scale: [1, 1.1, 1] }
                : {}
            }
            transition={
              timeRemaining <= 10
                ? { duration: 0.5, repeat: Infinity }
                : {}
            }
          >
            <span>👑</span>
            <span>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60)
                .toString()
                .padStart(2, "0")}
            </span>
          </motion.div>
        )}

        {/* Hearts */}
        <motion.div
          animate={heartWobble ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          <HeartCounter hearts={hearts} />
        </motion.div>
      </header>

      {/* ── Exercise Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-4 pb-32 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {renderExercise()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Feedback Bar ─────────────────────────────────────── */}
      <FeedbackBar
        state={feedback}
        correctAnswer={exercise?.correct_answer}
        canCheck={canCheck}
        onCheck={handleCheck}
        onContinue={handleContinue}
      />

      {/* ── Modals ───────────────────────────────────────────── */}
      <ExitConfirmModal
        isOpen={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        onConfirm={() => router.push("/")}
      />

      <OutOfHeartsModal
        isOpen={outOfHeartsOpen}
        onGoHome={() => router.push("/")}
        onHeartsRefilled={() => {
          setHearts(5);
          setOutOfHeartsOpen(false);
        }}
      />

      <TimesUpModal
        isOpen={timesUpOpen}
        onGoHome={() => router.push("/")}
        onRetry={() => {
          setTimesUpOpen(false);
          setTimeRemaining(LEGENDARY_TIME);
          setCurrentIdx(0);
          setXpEarned(0);
          setWrongAnswers(0);
          resetExerciseState();
        }}
      />
    </div>
  );
}
