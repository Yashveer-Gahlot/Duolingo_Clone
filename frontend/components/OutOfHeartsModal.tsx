"use client";

import React, { useState } from "react";
import { Modal, Button, Mascot } from "@/components/ui";
import { refillHearts } from "@/lib/api";

/* ═══════════════════════════════════════════════════════════════════════════
   OutOfHeartsModal – Shown when hearts reach 0 during a lesson
   ═══════════════════════════════════════════════════════════════════════════ */

interface OutOfHeartsModalProps {
  isOpen: boolean;
  onGoHome: () => void;
  onHeartsRefilled: () => void;
}

export default function OutOfHeartsModal({
  isOpen,
  onGoHome,
  onHeartsRefilled,
}: OutOfHeartsModalProps) {
  const [loading, setLoading] = useState(false);

  const handleRefill = async () => {
    setLoading(true);
    try {
      await refillHearts();
      onHeartsRefilled();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} closeOnBackdrop={false}>
      <div className="text-center space-y-5">
        {/* Sad mascot */}
        <div className="flex justify-center">
          <Mascot mood="sad" size={100} />
        </div>

        {/* Broken hearts */}
        <div className="flex justify-center gap-1 text-2xl opacity-30">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>💔</span>
          ))}
        </div>

        <h3
          className="text-xl font-extrabold"
          style={{ color: "#ff4b4b" }}
        >
          You ran out of hearts!
        </h3>
        <p className="text-sm" style={{ color: "#777777" }}>
          Don&apos;t worry — refill your hearts to keep learning, or come back later.
        </p>

        <div className="space-y-2.5">
          <Button
            variant="primary"
            fullWidth
            onClick={handleRefill}
            disabled={loading}
          >
            {loading ? "Refilling..." : "Refill Hearts ❤️"}
          </Button>
          <Button variant="ghost" fullWidth onClick={onGoHome}>
            Go Home
          </Button>
        </div>
      </div>
    </Modal>
  );
}
