"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { type PointerEvent, type ReactNode } from "react";

type SmoothLuxCardProps = {
  children: ReactNode;
  /** Optional tracked-out uppercase eyebrow (micro-copy). */
  eyebrow?: string;
  className?: string;
  /** Max pointer-tilt in degrees. Default 6. */
  tilt?: number;
};

/**
 * Bento asset card with liquid pointer mechanics: a spotlight follows the
 * cursor and the surface tilts on a spring. Frosted obsidian glass matching
 * .io-lux-card tokens. Motion is spring-physics, not CSS transitions.
 */
export function SmoothLuxCard({
  children,
  eyebrow,
  className,
  tilt = 6,
}: SmoothLuxCardProps) {
  const px = useMotionValue(50);
  const py = useMotionValue(50);
  const rx = useSpring(useMotionValue(0), { stiffness: 300, damping: 30, mass: 0.6 });
  const ry = useSpring(useMotionValue(0), { stiffness: 300, damping: 30, mass: 0.6 });

  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${px}% ${py}%, rgba(255,255,255,0.10), transparent 60%)`;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    px.set(x * 100);
    py.set(y * 100);
    ry.set((x - 0.5) * tilt * 2);
    rx.set((0.5 - y) * tilt * 2);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-3xl [transform-style:preserve-3d] ${className ?? ""}`}
    >
      {/* obsidian base so the frosted layer reads as heavy glass, not a tint */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0b0b0b]/85 via-[#050505]/80 to-[#050505]/92"
      />
      {/* liquid spotlight */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlight }}
      />
      {/* top luminance ring */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
      />
      <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
        {eyebrow ? (
          <p className="mb-3 text-xs uppercase tracking-widest text-zinc-400">
            {eyebrow}
          </p>
        ) : null}
        {children}
      </div>
    </motion.div>
  );
}
