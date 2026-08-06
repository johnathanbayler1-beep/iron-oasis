"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";

// Scene 1 — The Hook. The visitor doesn't know what Iron Oasis is yet; this
// scene withholds that and builds curiosity before Scene 2 answers it.
// Locked frame, no camera movement, per the brief's Apple-style restraint.
//
// Two title cards, not one static sentence, separated by a true black pause:
// NOT A PUBLIC GYM. <hold> <black> THE SPACE IS YOURS. <hold> <recede>
// The pause is the point — it's the only beat in the opening with nothing
// on screen, which is what makes a scroll-driven statement read as directed
// pacing rather than a caption that happened to be there.
const ROOT_FADE = 0.04;

const LINE_1 = { inEnd: 0.12, holdEnd: 0.28, outEnd: 0.38 };
const LINE_2 = { inStart: 0.52, inEnd: 0.64, holdEnd: 0.82, outEnd: 0.94 };

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// Resolve-in / hold / recede curve for a single title card, given the scene
// progress and the four breakpoints bounding its beat.
function cardOpacity(p: number, start: number, inEnd: number, holdEnd: number, outEnd: number): number {
  if (p <= start || p >= outEnd) return 0;
  if (p < inEnd) return ease((p - start) / (inEnd - start));
  if (p < holdEnd) return 1;
  return 1 - ease((p - holdEnd) / (outEnd - holdEnd));
}

const SceneHook = forwardRef<SceneHandle>(function SceneHook(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);

  useImperativeHandle(ref, () => ({
    enter() {
      const el = rootRef.current;
      if (el) el.style.opacity = "1";
    },
    update(progress) {
      const el = rootRef.current;
      const l1 = line1Ref.current;
      const l2 = line2Ref.current;
      if (!el || !l1 || !l2) return;

      const inT = Math.min(1, progress / ROOT_FADE);
      const outT = progress > 1 - ROOT_FADE ? (progress - (1 - ROOT_FADE)) / ROOT_FADE : 0;
      el.style.opacity = String(Math.max(0, ease(inT) - ease(outT)));

      const o1 = cardOpacity(progress, 0, LINE_1.inEnd, LINE_1.holdEnd, LINE_1.outEnd);
      l1.style.opacity = String(o1);
      l1.style.letterSpacing = `${0.28 - o1 * 0.08}em`;

      const o2 = cardOpacity(progress, LINE_2.inStart, LINE_2.inEnd, LINE_2.holdEnd, LINE_2.outEnd);
      l2.style.opacity = String(o2);
      l2.style.letterSpacing = `${0.28 - o2 * 0.08}em`;
    },
    exit() {
      const el = rootRef.current;
      if (el) el.style.opacity = "0";
    },
  }));

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[15] flex items-center justify-center bg-[#050505] opacity-0"
    >
      <p
        ref={line1Ref}
        className="absolute font-display text-[clamp(28px,5vw,56px)] font-medium uppercase text-white opacity-0"
        style={{ letterSpacing: "0.28em" }}
      >
        Not a public gym.
      </p>
      <p
        ref={line2Ref}
        className="absolute font-display text-[clamp(28px,5vw,56px)] font-medium uppercase text-[#C9A84C] opacity-0"
        style={{ letterSpacing: "0.28em" }}
      >
        The space is yours.
      </p>
    </div>
  );
});

export default SceneHook;
