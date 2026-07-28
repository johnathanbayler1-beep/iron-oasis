"use client";

import React from "react";

type Variant = "solid" | "outline";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/**
 * Hardware-feel action control. 1px hairline, luminous hover, tactile press.
 * Timings are deliberately split: hover eases out slowly, press snaps (75ms)
 * so the button reads as a physical switch rather than a fade.
 */
export default function ActionButton({
  variant = "outline",
  className = "",
  children,
  ...props
}: ActionButtonProps) {
  const base =
    "group relative w-full overflow-hidden rounded-xl py-4 font-mono text-[11px] font-bold uppercase tracking-[0.22em] " +
    "transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] " +
    "active:scale-[0.975] active:duration-75 " +
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  const skin =
    variant === "solid"
      ? "bg-white text-black border border-white shadow-[0_0_25px_-4px_rgba(255,255,255,0.45)] hover:shadow-[0_0_38px_-2px_rgba(255,255,255,0.65)]"
      : "bg-white/[0.03] text-white border border-white/15 backdrop-blur-xl hover:border-white/40 hover:bg-white/[0.07] hover:shadow-[0_0_28px_-8px_rgba(255,255,255,0.35)]";

  return (
    <button className={`${base} ${skin} ${className}`} {...props}>
      {/* specular sweep — travels across on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-[left] duration-700 ease-out group-hover:left-[150%] motion-reduce:hidden"
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
