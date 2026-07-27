"use client";

import React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   ThemeToggle – Sun/Moon toggle button for dark mode
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none"
      style={{
        background: isDark ? "#202f36" : "#f7f7f7",
        border: isDark ? "2px solid #3a4f5a" : "2px solid #e5e5e5",
      }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.span
        className="text-lg"
        key={isDark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? "🌙" : "☀️"}
      </motion.span>
    </motion.button>
  );
}
