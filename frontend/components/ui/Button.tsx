"use client";

import React from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   Button – Duolingo 3D button with variants
   ═══════════════════════════════════════════════════════════════════════════ */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "gold";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary: "btn-3d-green",
  secondary: "btn-3d-blue",
  danger: "btn-3d-red",
  ghost: "btn-3d-gray",
  gold: "btn-3d-gold",
};

const sizeClassMap: Record<string, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-6 py-3",
  lg: "text-base px-8 py-4",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn-3d ${variantClassMap[variant]} ${sizeClassMap[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
