"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";

// Scene 7 — Final Access. The story has answered every question a visitor
// could have (what it is, how it works, where it is); this scene closes the
// loop with the one thing left to give them: a way in. No 3D layer of its
// own, but unlike Scene4/5/6 it isn't sitting on flat black either — the
// GymBackdrop mounted at the MasterTimeline level ramps from its dimmed
// mid-film presence back to full brightness across this entire scene, so
// the room is what the visitor actually sees resolve behind the text. This
// is also the first scene where an element needs to be clickable, so the
// CTA block opts back into pointer events for the brief window it's on
// screen.
//
// Three beats, not five: the final scene should feel like a resolution, not
// another list. 1) the emotional close, 2) how you'll actually get the app
// (placeholder store badges — no store listing exists yet), 3) the CTA
// itself, wired to "#" as a placeholder anchor for the future membership /
// waitlist integration point. The scrim over the gym fades out through this
// last beat so the closing image is the room itself, not an app-store panel.
//
// Beats are weight-scaled, not equal thirds: the practical store-badge beat
// is quick, the emotional open gets a beat more, and the CTA — the actual
// point of the entire film — gets the heaviest share, the slowest resolve-in
// of any beat in the sequence, and holds all the way to the end of scroll
// with no recede. This is the last thing the visitor sees; it should land
// like a held final frame, not another list item.
const ROOT_FADE = 0.04;
const BEATS_START = 0.04;
const BEATS_END = 1;

const BEAT_WEIGHTS = [1.0, 0.7, 1.6];
const BEAT_TOTAL_WEIGHT = BEAT_WEIGHTS.reduce((sum, w) => sum + w, 0);
const BEAT_SCALE = (BEATS_END - BEATS_START) / BEAT_TOTAL_WEIGHT;

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// Resolve-in / hold / recede curve for a single beat, given scene progress
// and the four breakpoints bounding it. Same shape used across the sequence,
// with one addition: the closing beat sets holdEnd === outEnd (no recede
// segment at all) so it can hold through the literal end of scroll — the
// boundaries below use strict inequalities and an explicit holdEnd >= outEnd
// guard so that edge case resolves to a held 1 instead of a 0/0 division at
// the final tick.
function beatOpacity(p: number, start: number, inEnd: number, holdEnd: number, outEnd: number): number {
  if (p < start || p > outEnd) return 0;
  if (p < inEnd) return ease((p - start) / (inEnd - start));
  if (p < holdEnd || holdEnd >= outEnd) return 1;
  return 1 - ease((p - holdEnd) / (outEnd - holdEnd));
}

function beatBounds(index: number, isLast: boolean) {
  let start = BEATS_START;
  for (let i = 0; i < index; i++) start += BEAT_WEIGHTS[i] * BEAT_SCALE;
  const span = BEAT_WEIGHTS[index] * BEAT_SCALE;
  // The closing beat holds through the true end of scroll rather than
  // receding — the last thing a visitor sees should be the CTA resting over
  // the fully-revealed gym, not a fade to black before the experience ends.
  const outEnd = start + span;
  return {
    start,
    inEnd: start + span * (isLast ? 0.4 : 0.28),
    holdEnd: isLast ? outEnd : start + span * 0.72,
    outEnd,
  };
}

const Scene7FinalAccess = forwardRef<SceneHandle>(function Scene7FinalAccess(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrimRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    enter() {
      const el = rootRef.current;
      if (el) el.style.opacity = "1";
    },
    update(progress) {
      const el = rootRef.current;
      if (!el) return;

      // No fade-out term here, unlike every other scene's root opacity — this
      // is the last scene in the film, nothing follows it, so it should hold
      // at full opacity through the end of scroll instead of fading to
      // black right as the CTA resolves. That fade-to-blank on the actual
      // last frame was undercutting the whole point of a "final" scene.
      const inT = Math.min(1, progress / ROOT_FADE);
      el.style.opacity = String(ease(inT));

      let finalBeatOpacity = 0;
      for (let i = 0; i < 3; i++) {
        const bounds = beatBounds(i, i === 2);
        const o = beatOpacity(progress, bounds.start, bounds.inEnd, bounds.holdEnd, bounds.outEnd);
        if (i === 2) finalBeatOpacity = o;

        const block = blockRefs.current[i];
        if (block) {
          block.style.opacity = String(o);
          block.style.transform = `translateY(${(1 - o) * 12}px)`;
          block.style.pointerEvents = o > 0.5 ? "auto" : "none";
        }
      }

      // As the CTA beat takes hold, fade the scrim down so the now-brightened
      // gym backdrop resolves behind it — the closing image is the room, not
      // a dark panel with a button on it.
      const scrim = scrimRef.current;
      if (scrim) scrim.style.opacity = String(0.75 * (1 - finalBeatOpacity));
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
      <div ref={scrimRef} className="absolute inset-0 bg-[#050505]" style={{ opacity: 0.75 }} />

      <div className="relative flex w-full max-w-2xl flex-col items-center px-8">
        <div className="relative flex h-[220px] w-full items-center justify-center">
          {/* Beat 1 — the emotional close. */}
          <div
            ref={(el) => {
              blockRefs.current[0] = el;
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0"
          >
            <p
              className="text-center font-display text-[clamp(30px,5.4vw,56px)] font-medium uppercase leading-[1.15] text-white"
              style={{ letterSpacing: "0.06em" }}
            >
              Your private training space is ready.
            </p>
          </div>

          {/* Beat 2 — placeholder store badges. No listing exists yet; these
              are visual placeholders reserved for real App Store / Google
              Play badges once the app ships. */}
          <div
            ref={(el) => {
              blockRefs.current[1] = el;
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 opacity-0"
          >
            <p
              className="text-center font-display text-[clamp(15px,1.8vw,19px)] font-medium uppercase text-[#b8b8b8]"
              style={{ letterSpacing: "0.24em" }}
            >
              Available on iOS and Android.
            </p>
            <div className="flex items-center gap-4">
              <img
                src="/store-badges/app-store-badge.png"
                alt="Download on the App Store"
                className="h-12 w-[152px]"
              />
              <img
                src="/store-badges/google-play-badge.png"
                alt="Get it on Google Play"
                className="h-12 w-[152px]"
              />
            </div>
          </div>

          {/* Beat 3 — the CTA. href is a placeholder; wire to the real
              membership / waitlist flow once it exists. This is the only
              interactive element in the entire scroll experience, so it
              re-enables pointer events on itself while active. */}
          <div
            ref={(el) => {
              blockRefs.current[2] = el;
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 opacity-0"
          >
            <a
              href="/apply"
              className="inline-flex items-center justify-center rounded-full border border-[#C9A84C] px-10 py-4 font-display text-[14px] font-medium uppercase tracking-[0.3em] text-[#C9A84C] transition-colors duration-300 hover:bg-[#C9A84C] hover:text-black"
            >
              Request Private Access
            </a>
            <p className="text-center text-[13px] font-light uppercase tracking-[0.2em] text-[#b8b8b8]/70">
              Membership by application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Scene7FinalAccess;
