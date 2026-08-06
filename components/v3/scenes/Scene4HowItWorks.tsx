"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";

// Scene 4 — How It Works. Scene 3 sold the feeling ("the space is yours");
// this scene answers the practical question that feeling raises next: how
// does a visitor actually get in? Same locked-frame, text-driven treatment
// as SceneHook — no 3D layer — because the content here is instructional,
// not spatial, and introducing the gym model again would repeat Scene 2/3
// rather than advance the story. A reserved app-frame placeholder stands in
// for a future product screenshot without blocking on one now.
//
// Structure: one headline resolves in and recedes, then five steps replace
// each other in sequence. Each step's share of the runway and its resolve
// speed now scale with the line's weight rather than splitting the scene
// into five identical slices — the two short mechanical steps (download,
// choose a time) snap in and out quickly, the two connective steps (reserve,
// receive) get a beat more, and the closing line — which is doing the actual
// emotional handoff into Scene 5 — gets the longest hold and the slowest,
// most deliberate resolve-in of the five.
const HEADLINE = { inEnd: 0.05, holdEnd: 0.14, outEnd: 0.19 };
const STEPS_START = 0.19;
const STEPS_END = 0.98;

const STEPS = [
  { statement: "Download the Iron Oasis app.", support: "Available for iOS and Android.", weight: 0.8, quick: true },
  { statement: "Choose your training time.", support: "Pick the window that fits your schedule.", weight: 0.8, quick: true },
  { statement: "Reserve the entire private gym.", support: "Not a class. Not a shift. The whole space.", weight: 1.1, quick: false },
  { statement: "Receive your access.", support: "Your credentials, sent directly to your phone.", weight: 0.9, quick: false },
  { statement: "Walk in and train without interruptions.", support: "No crowds. No waiting. Just you.", weight: 1.5, quick: false },
] as const;

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// Resolve-in / hold / recede curve for a single beat, given scene progress
// and the four breakpoints bounding it. Shared by the headline and each step.
function beatOpacity(p: number, start: number, inEnd: number, holdEnd: number, outEnd: number): number {
  if (p <= start || p >= outEnd) return 0;
  if (p < inEnd) return ease((p - start) / (inEnd - start));
  if (p < holdEnd) return 1;
  return 1 - ease((p - holdEnd) / (outEnd - holdEnd));
}

// Divides [STEPS_START, STEPS_END] proportionally by each step's weight
// instead of into equal fifths, then shapes each span's in/hold/out split
// by whether it's a "quick" beat (fast resolve, short hold) or not (slower
// resolve, long hold).
const STEP_TOTAL_WEIGHT = STEPS.reduce((sum, s) => sum + s.weight, 0);
const STEP_SCALE = (STEPS_END - STEPS_START) / STEP_TOTAL_WEIGHT;

function stepBounds(index: number) {
  let start = STEPS_START;
  for (let i = 0; i < index; i++) start += STEPS[i].weight * STEP_SCALE;
  const span = STEPS[index].weight * STEP_SCALE;
  const quick = STEPS[index].quick;
  return {
    start,
    inEnd: start + span * (quick ? 0.2 : 0.3),
    holdEnd: start + span * (quick ? 0.55 : 0.8),
    outEnd: start + span,
  };
}

const ROOT_FADE = 0.04;

const Scene4HowItWorks = forwardRef<SceneHandle>(function Scene4HowItWorks(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const statementRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const supportRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const frameNumberRef = useRef<HTMLSpanElement>(null);

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

      const headline = headlineRef.current;
      if (headline) {
        const o = beatOpacity(progress, 0, HEADLINE.inEnd, HEADLINE.holdEnd, HEADLINE.outEnd);
        headline.style.opacity = String(o);
        headline.style.letterSpacing = `${0.24 - o * 0.06}em`;
      }

      let activeStep = -1;
      STEPS.forEach((_step, i) => {
        const bounds = stepBounds(i);
        const o = beatOpacity(progress, bounds.start, bounds.inEnd, bounds.holdEnd, bounds.outEnd);
        if (o > 0.5) activeStep = i;

        const number = numberRefs.current[i];
        const statement = statementRefs.current[i];
        const support = supportRefs.current[i];
        if (number) number.style.opacity = String(o);
        if (statement) {
          statement.style.opacity = String(o);
          statement.style.transform = `translateY(${(1 - o) * 12}px)`;
        }
        if (support) support.style.opacity = String(o * 0.85);
      });

      const frameNumber = frameNumberRef.current;
      if (frameNumber) frameNumber.textContent = activeStep >= 0 ? String(activeStep + 1).padStart(2, "0") : "";
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
      {/* Scrim over the dimmed gym backdrop (GymBackdrop, mounted at the
          MasterTimeline level) — keeps the instructional text legible while
          the room stays visible around the edges, instead of the flat black
          panel this scene used to sit on. */}
      <div className="absolute inset-0 bg-[#050505]/80" />

      <p
        ref={headlineRef}
        className="absolute px-6 text-center font-display text-[clamp(28px,5vw,52px)] font-medium uppercase text-white opacity-0"
        style={{ letterSpacing: "0.24em" }}
      >
        Private access, made simple.
      </p>

      <div className="flex w-full max-w-5xl flex-col items-center gap-14 px-8 md:flex-row md:items-center md:justify-between md:gap-16">
        <div className="relative w-full max-w-xl">
          {STEPS.map((step, i) => (
            <div key={step.statement} className="absolute inset-0 flex flex-col items-start justify-center">
              <span
                ref={(el) => {
                  numberRefs.current[i] = el;
                }}
                className="mb-3 font-display text-[13px] font-medium uppercase tracking-[0.32em] text-[#C9A84C] opacity-0"
              >
                {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
              </span>
              <p
                ref={(el) => {
                  statementRefs.current[i] = el;
                }}
                className="font-display text-[clamp(24px,4vw,40px)] font-medium leading-[1.15] text-white opacity-0"
              >
                {step.statement}
              </p>
              <p
                ref={(el) => {
                  supportRefs.current[i] = el;
                }}
                className="mt-4 max-w-md text-[clamp(14px,1.6vw,17px)] font-light text-[#b8b8b8] opacity-0"
              >
                {step.support}
              </p>
            </div>
          ))}
          {/* Reserves the block's height since each step is absolutely
              positioned for crossfade; an invisible clone of the longest
              step keeps layout from collapsing. */}
          <div className="invisible flex flex-col items-start" aria-hidden="true">
            <span className="mb-3 text-[13px] tracking-[0.32em]">00 / 00</span>
            <p className="text-[clamp(24px,4vw,40px)] font-medium leading-[1.15]">
              Walk in and train without interruptions.
            </p>
            <p className="mt-4 max-w-md text-[clamp(14px,1.6vw,17px)]">No crowds. No waiting. Just you.</p>
          </div>
        </div>

        {/* Reserved app-frame placeholder — swap the inner div for a real
            product screenshot / video when the app exists. */}
        <div className="flex shrink-0 flex-col items-center gap-6">
          <div className="relative flex h-[340px] w-[172px] items-center justify-center rounded-[28px] border border-[#C9A84C]/30 bg-white/[0.02]">
            <div className="absolute left-1/2 top-3 h-1 w-8 -translate-x-1/2 rounded-full bg-white/10" />
            <span
              ref={frameNumberRef}
              className="font-display text-[15px] font-medium tracking-[0.3em] text-[#C9A84C]/70"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Scene4HowItWorks;
