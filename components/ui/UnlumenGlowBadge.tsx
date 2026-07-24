"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

export type GlowTone = "neutral" | "live" | "warn" | "muted";

type UnlumenGlowBadgeProps = {
  children: ReactNode;
  tone?: GlowTone;
  /** Show the pulsing signal dot. Default true. */
  pulse?: boolean;
  className?: string;
};

const TONE: Record<GlowTone, { ring: string; glow: string; dot: string }> = {
  neutral: { ring: "rgba(255,255,255,0.18)", glow: "rgba(255,255,255,0.22)", dot: "#ffffff" },
  live: { ring: "rgba(63,224,138,0.35)", glow: "rgba(63,224,138,0.30)", dot: "#3fe08a" },
  warn: { ring: "rgba(245,196,81,0.35)", glow: "rgba(245,196,81,0.30)", dot: "#f5c451" },
  muted: { ring: "rgba(255,255,255,0.08)", glow: "rgba(255,255,255,0.06)", dot: "#7a7a7a" },
};

/**
 * Status badge with ambient light bleed — a soft glow halo breathes behind a
 * frosted pill. Tracked-out uppercase micro-copy. Breathing + dot pulse are
 * spring/keyframe framer-motion, not CSS transitions.
 */
export function UnlumenGlowBadge({
  children,
  tone = "neutral",
  pulse = true,
  className,
}: UnlumenGlowBadgeProps) {
  const t = TONE[tone];

  return (
    <span className={`relative inline-flex ${className ?? ""}`}>
      {/* ambient light bleed */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-full blur-lg"
        style={{ background: `radial-gradient(circle, ${t.glow}, transparent 70%)` }}
        animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <span
        className="relative inline-flex items-center gap-2 rounded-full border bg-white/[0.03] px-3 py-1 text-[0.7rem] uppercase tracking-widest text-zinc-200 backdrop-blur-md"
        style={{ borderColor: t.ring }}
      >
        {pulse ? (
          <span className="relative flex h-1.5 w-1.5">
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{ backgroundColor: t.dot }}
              animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <span
              className="relative inline-flex h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: t.dot, boxShadow: `0 0 8px ${t.dot}` }}
            />
          </span>
        ) : null}
        {children}
      </span>
    </span>
  );
}
