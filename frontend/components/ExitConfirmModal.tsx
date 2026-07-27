"use client";

import React from "react";
import { Modal, Button } from "@/components/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   ExitConfirmModal – "Are you sure you want to quit?"
   ═══════════════════════════════════════════════════════════════════════════ */

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: ExitConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center space-y-5">
        <div className="text-5xl">😢</div>
        <h3
          className="text-xl font-extrabold"
          style={{ color: "#3c3c3c" }}
        >
          Are you sure you want to quit?
        </h3>
        <p className="text-sm" style={{ color: "#777777" }}>
          Your progress for this lesson won&apos;t be saved.
        </p>
        <div className="space-y-2.5">
          <Button variant="primary" fullWidth onClick={onClose}>
            Keep Learning
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm}>
            Quit Lesson
          </Button>
        </div>
      </div>
    </Modal>
  );
}
