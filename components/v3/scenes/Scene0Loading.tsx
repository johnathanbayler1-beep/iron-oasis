"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";

// Scene 0 — Loading. Monospace, timestamp-style, deliberately quiet per the
// experience bible's opening beat (locked frame, no camera movement). Holds
// briefly, then recedes on the same eased curve every other scene uses —
// the previous raw linear fade was the one un-eased transition in the whole
// film, a small mismatch right at the opening. Hold trimmed from 60% to 45%
// of the scene's short window; the bumper had nothing left to say once the
// point (this is loading) had already landed.
const HOLD_END = 0.45;

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

const Scene0Loading = forwardRef<SceneHandle>(function Scene0Loading(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    enter() {
      const el = rootRef.current;
      if (el) el.style.opacity = "1";
    },
    update(progress) {
      const el = rootRef.current;
      if (!el) return;
      const opacity = progress < HOLD_END ? 1 : 1 - ease((progress - HOLD_END) / (1 - HOLD_END));
      el.style.opacity = String(Math.max(0, opacity));
    },
    exit() {
      const el = rootRef.current;
      if (el) el.style.opacity = "0";
    },
  }));

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-[#050505] opacity-0"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="font-mono text-[10px] tracking-[0.4em] text-white/40">IRON OASIS</span>
        <span className="font-mono text-xs tracking-[0.3em] text-[#C9A84C]/80">LOADING</span>
      </div>
    </div>
  );
});

export default Scene0Loading;
