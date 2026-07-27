"use client";

import React, { useState } from "react";
import { Modal, Button } from "@/components/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   HeartRefillModal – Triggered when hearts < 5, allows free refill
   ═══════════════════════════════════════════════════════════════════════════ */

interface HeartRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHearts: number;
  onRefill: () => Promise<void>;
}

export default function HeartRefillModal({
  isOpen,
  onClose,
  currentHearts,
  onRefill,
}: HeartRefillModalProps) {
  const [loading, setLoading] = useState(false);

  const handleRefill = async () => {
    setLoading(true);
    try {
      await onRefill();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center space-y-5">
        {/* Hearts visual */}
        <div className="flex justify-center gap-1.5 text-3xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                opacity: i < currentHearts ? 1 : 0.2,
                filter: i < currentHearts ? "none" : "grayscale(1)",
                transition: "all 0.2s",
              }}
            >
              ❤️
            </span>
          ))}
        </div>

        <h3
          className="text-xl font-extrabold"
          style={{ color: "#3c3c3c" }}
        >
          Refill your hearts?
        </h3>

        <p className="text-sm" style={{ color: "#777777" }}>
          You have{" "}
          <strong style={{ color: "#ff4b4b" }}>{currentHearts}</strong>{" "}
          heart{currentHearts !== 1 ? "s" : ""} remaining.
          <br />
          Refill to continue practicing!
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
          <Button variant="ghost" fullWidth onClick={onClose}>
            No thanks
          </Button>
        </div>
      </div>
    </Modal>
  );
}
