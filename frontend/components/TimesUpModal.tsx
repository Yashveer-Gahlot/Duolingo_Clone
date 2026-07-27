"use client";

import React from "react";
import { Modal, Button } from "@/components/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   TimesUpModal – Shown when Legendary timer reaches 0
   ═══════════════════════════════════════════════════════════════════════════ */

interface TimesUpModalProps {
  isOpen: boolean;
  onGoHome: () => void;
  onRetry: () => void;
}

export default function TimesUpModal({
  isOpen,
  onGoHome,
  onRetry,
}: TimesUpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} closeOnBackdrop={false}>
      <div className="text-center space-y-5">
        <div className="text-6xl">⏰</div>
        <h3
          className="text-xl font-extrabold"
          style={{ color: "#ff4b4b" }}
        >
          Time&apos;s Up!
        </h3>
        <p className="text-sm" style={{ color: "#777777" }}>
          You didn&apos;t finish the legendary challenge in time.
          <br />
          Keep practicing and try again!
        </p>
        <div className="space-y-2.5">
          <Button variant="gold" fullWidth onClick={onRetry}>
            Try Again 👑
          </Button>
          <Button variant="ghost" fullWidth onClick={onGoHome}>
            Go Home
          </Button>
        </div>
      </div>
    </Modal>
  );
}
