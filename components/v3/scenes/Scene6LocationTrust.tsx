"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";

// Scene 6 — Location + Trust. By now the visitor wants the space and knows
// how to book it; the one doubt left unaddressed is where it actually is —
// is this a shared studio, a corner of a public gym, something they'd have
// to explain away to themselves. This scene answers that with confidence
// rather than defense: no map, no address, no reassurance-by-explanation —
// just the fact of a detached, private sanctuary stated plainly.
//
// Same locked-frame, text-driven treatment as Scene4/Scene5: no 3D layer,
// one message at a time. The visual anchor is a single reserved cinematic
// frame (16:9, not the Scene5 phone aspect) — this is the slot for future
// exterior, entrance, and neighborhood footage. It stays one frame rather
// than three placeholder tiles because rotating through distinct shots
// would read as a location gallery; a gallery is exactly the generic
// real-estate presentation this scene is meant to avoid. When that footage
// exists, swap the frame's content per beat using the same activeStep index
// already computed below.
const ROOT_FADE = 0.04;
const STEPS_START = 0.03;
const STEPS_END = 0.98;

// The two short denial lines ("No employees.", "No crowds.") are built to
// land as a quick back-to-back staccato pair — brief spans, fast resolve —
// before the closing line lands slow and holds the longest of the five,
// same idea as Scene4's closer. Equal fifths made every line, punchy or not,
// take the same beat; this gives the scene an actual rhythm instead of one
// flat cadence for five different kinds of statement.
const STEPS = [
  { label: "A quiet private location.", weight: 1.0, quick: false },
  { label: "A dedicated gym space.", weight: 0.9, quick: false },
  { label: "No employees.", weight: 0.55, quick: true },
  { label: "No crowds.", weight: 0.55, quick: true },
  { label: "Your session is yours.", weight: 1.5, quick: false },
] as const;

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// Resolve-in / hold / recede curve for a single beat, given scene progress
// and the four breakpoints bounding it. Same shape used across every scene
// in this sequence (SceneHook, Scene4HowItWorks, Scene5AppExperience).
function beatOpacity(p: number, start: number, inEnd: number, holdEnd: number, outEnd: number): number {
  if (p <= start || p >= outEnd) return 0;
  if (p < inEnd) return ease((p - start) / (inEnd - start));
  if (p < holdEnd) return 1;
  return 1 - ease((p - holdEnd) / (outEnd - holdEnd));
}

const STEP_TOTAL_WEIGHT = STEPS.reduce((sum, s) => sum + s.weight, 0);
const STEP_SCALE = (STEPS_END - STEPS_START) / STEP_TOTAL_WEIGHT;

function stepBounds(index: number) {
  let start = STEPS_START;
  for (let i = 0; i < index; i++) start += STEPS[i].weight * STEP_SCALE;
  const span = STEPS[index].weight * STEP_SCALE;
  const quick = STEPS[index].quick;
  return {
    start,
    inEnd: start + span * (quick ? 0.18 : 0.28),
    holdEnd: start + span * (quick ? 0.5 : 0.78),
    outEnd: start + span,
  };
}

const Scene6LocationTrust = forwardRef<SceneHandle>(function Scene6LocationTrust(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const frameGlowRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    enter() {
      const el = rootRef.current;
      if (el) el.style.opacity = "1";
    },
    update(progress) {
      const el = rootRef.current;
      if (!el) return;

      const inT = Math.min(1, progress / ROOT_FADE);
      const outT = progress > 1 - ROOT_FADE ? (progress - (1 - ROOT_FADE)) / ROOT_FADE : 0;
      el.style.opacity = String(Math.max(0, ease(inT) - ease(outT)));

      let activeStep = -1;
      STEPS.forEach((_step, i) => {
        const bounds = stepBounds(i);
        const o = beatOpacity(progress, bounds.start, bounds.inEnd, bounds.holdEnd, bounds.outEnd);
        if (o > 0.5) activeStep = i;

        const label = labelRefs.current[i];
        if (label) {
          label.style.opacity = String(o);
          label.style.transform = `translateY(${(1 - o) * 10}px)`;
        }
      });

      const glow = frameGlowRef.current;
      if (glow) glow.style.opacity = activeStep >= 0 ? "1" : "0";
    },
    exit() {
      const el = rootRef.current;
      if (el) el.style.opacity = "0";
    },
  }));

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center opacity-0"
    >
      {/* Scrim over the dimmed gym backdrop. Kept dark — this scene is meant
          to feel like a cinematic statement, not a UI panel, so nothing
          beyond the reserved frame and the single line of copy competes for
          attention. */}
      <div className="absolute inset-0 bg-[#050505]/85" />

      <div className="relative flex w-full max-w-3xl flex-col items-center gap-10 px-8">
        {/* Reserved cinematic placeholder — future exterior / entrance /
            neighborhood footage lives here. One frame, not a gallery, to
            keep the location feeling like a single sanctuary rather than a
            set of real-estate listing photos. */}
        <div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-[18px] border border-[#C9A84C]/30 bg-white/[0.02]">
          <img
            src="/location-trust/exterior-entrance.jpg"
            alt="Iron Oasis private gym entrance"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            ref={frameGlowRef}
            className="absolute inset-0 opacity-0 transition-opacity duration-500"
            style={{ boxShadow: "0 0 50px 6px rgba(201, 168, 76, 0.1) inset" }}
          />
        </div>

        <div className="relative flex h-16 w-full items-center justify-center px-6">
          {STEPS.map((step, i) => (
            <p
              key={step.label}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute font-display text-[clamp(22px,3.6vw,34px)] font-medium uppercase text-white opacity-0"
              style={{ letterSpacing: "0.1em" }}
            >
              {step.label}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Scene6LocationTrust;
