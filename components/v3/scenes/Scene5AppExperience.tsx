"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";

// Scene 5 — App Experience. Scene 4 explained the mechanics of getting in;
// this scene shows the app is the thing that carries the visitor through
// each of those moments, from booking to training. Deliberately the most
// restrained scene in the sequence: a device showcase, not a text list —
// large title copy and a five-beat carousel read as a website feature
// section, so the only moving part here is a small caption printed on the
// device screen itself. The frame is the subject; everything else recedes.
//
// No app assets exist yet (see ASSET_REGISTRY) so the frame stays a clean
// placeholder — swap its inner content for real screenshots later without
// touching the timing or layout around it.
const ROOT_FADE = 0.04;
const STEPS_START = 0.03;
const STEPS_END = 0.98;

const STEPS = [
  { label: "Book a session." },
  { label: "Receive access." },
  { label: "Arrive." },
  { label: "Unlock the gym." },
  { label: "Train privately." },
] as const;

const STEP_SPAN = (STEPS_END - STEPS_START) / STEPS.length;

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// Resolve-in / hold / recede curve for a single beat, given scene progress
// and the four breakpoints bounding it. Same shape used across every scene
// in this sequence (SceneHook, Scene4HowItWorks).
function beatOpacity(p: number, start: number, inEnd: number, holdEnd: number, outEnd: number): number {
  if (p <= start || p >= outEnd) return 0;
  if (p < inEnd) return ease((p - start) / (inEnd - start));
  if (p < holdEnd) return 1;
  return 1 - ease((p - holdEnd) / (outEnd - holdEnd));
}

// Snappier in/hold/out split than Scene4's (0.2/0.55 vs 0.28/0.72) — these
// captions are single words or short phrases printed on the device screen,
// not sentences to read, and the contrast in cadence against the more
// deliberate How It Works pacing is what keeps this scene from feeling like
// a repeat of it.
function stepBounds(index: number) {
  const start = STEPS_START + index * STEP_SPAN;
  return {
    start,
    inEnd: start + STEP_SPAN * 0.2,
    holdEnd: start + STEP_SPAN * 0.55,
    outEnd: start + STEP_SPAN,
  };
}

const Scene5AppExperience = forwardRef<SceneHandle>(function Scene5AppExperience(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const frameGlowRef = useRef<HTMLDivElement>(null);
  const screenshotRefs = useRef<(HTMLImageElement | null)[]>([]);
  const activeStepRef = useRef<number>(-1);

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

        const caption = captionRefs.current[i];
        if (caption) caption.style.opacity = String(o);

        // Update screenshot opacity (will transition when real images are loaded)
        const screenshot = screenshotRefs.current[i];
        if (screenshot) {
          screenshot.style.opacity = activeStep === i ? "1" : "0";
          screenshot.style.transition = "opacity 500ms ease-in-out";
        }
      });

      activeStepRef.current = activeStep;

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
      {/* Scrim over the (by now brighter) dimmed gym backdrop — kept lighter
          than Scene4's since this scene has almost no competing text. */}
      <div className="absolute inset-0 bg-[#050505]/70" />

      {/* App experience device frame — carousel of screenshots with captions.
          When real screenshots are available (/public/app-screenshots/screen-*.png),
          they will load automatically and fade in/out with the captions. The frame
          and timing remain unchanged; only the inner image content swaps. */}
      <div className="relative flex h-[380px] w-[192px] flex-col items-center justify-center rounded-[30px] border border-[#C9A84C]/30 bg-black overflow-hidden">
        {/* Device notch / status bar */}
        <div className="absolute left-1/2 top-3 h-1 w-9 -translate-x-1/2 rounded-full bg-white/10 z-10" />

        {/* Screenshot carousel — images fade in/out based on scroll progress */}
        {STEPS.map((step, i) => (
          <img
            key={`screenshot-${i}`}
            ref={(el) => {
              screenshotRefs.current[i] = el;
            }}
            src={`/app-screenshots/screen-${i + 1}.png`}
            alt={step.label}
            width={192}
            height={380}
            className="absolute inset-0 object-cover opacity-0"
            onError={(e) => {
              // Graceful fallback if image doesn't exist yet (placeholder text shown)
              const img = e.target as HTMLImageElement;
              img.style.display = "none";
            }}
          />
        ))}

        {/* Gold inset glow (appears when caption is active) */}
        <div
          ref={frameGlowRef}
          className="absolute inset-0 rounded-[30px] opacity-0 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: "0 0 40px 4px rgba(201, 168, 76, 0.12) inset" }}
        />

        {/* Captions printed on device screen (always on top) */}
        <div className="absolute inset-0 flex h-8 items-center justify-center px-4 z-20">
          {STEPS.map((step, i) => (
            <span
              key={`caption-${i}`}
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              className="absolute font-display text-[11px] font-medium uppercase text-[#C9A84C] opacity-0"
              style={{ letterSpacing: "0.22em" }}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Scene5AppExperience;
