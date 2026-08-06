"use client";

import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";
import { CameraContext } from "../camera/CameraProvider";
import { GymSceneContext } from "./GymSceneContext";
import { ROOM_FLOOR_Y } from "../three/roomConfig";

// Scene 3 — The Private Experience. The emotional core of the entire film.
// Camera holds on the hero composition (same framing as Scene 2's END pose),
// allowing the visitor to absorb the premise: this entire space, for this entire
// booking window, belongs to you alone.
//
// Layout: the 3D gym dominates; minimal text overlay centered, large, held long.
// Lighting: the warmest, most complete state — all fixtures on, full confidence.
// Typography: a single primary line ("THE SPACE IS YOURS.") and a secondary thesis
// sentence beneath it, neither of which compete visually with the room itself.
//
// The 3D layer now lives in SharedGymCanvas (shared with Scene2GymReveal and
// GymBackdrop — see GymSceneController), reusing the same gym geometry as
// Scene 2 exactly as before. Camera is still static (no choreography, no
// dolly motion). Text overlay still handles the emotional arc on its own
// timeline: fade in (0–20%), hold (20–75%), fade out (75–100%).

// Ease function for opacity transitions
function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

// Static camera pose: the hero composition of the full gym space.
// Sourced from the END pose of Scene 2's gym reveal path, held throughout
// this scene for maximum visual impact and viewer absorption.
export const HERO_POSE = {
  position: [2.3, ROOM_FLOOR_Y + 2.5, 1.6] as [number, number, number],
  target: [-1.0, ROOM_FLOOR_Y + 1.3, -1.8] as [number, number, number],
  fov: 38,
};

// Text overlay timing constants
const TEXT_FADE_IN_END = 0.2;
const TEXT_HOLD_END = 0.75;

// Root fade-out: the whole-scene container previously held at full opacity
// for its entire back half and only snapped to 0 in exit() when Scene 4 took
// over — a hard cut between two beats meant to read as a continuous handoff.
// This fades the room out over the last stretch, timed to land after the
// text overlay has already receded (TEXT_HOLD_END) so the fade reads as the
// room dimming after its statement, not the statement getting cut off.
const SCENE_FADE_OUT_START = 0.86;

const Scene3PrivateExperience = forwardRef<SceneHandle>(function Scene3PrivateExperience(
  _props,
  ref,
) {
  const textOverlayRef = useRef<HTMLDivElement>(null);
  const camera = useContext(CameraContext);
  const gymScene = useContext(GymSceneContext);

  // Prime the camera controller to the hero pose on mount, giving the
  // CameraRig's damping effect time to settle before this scene becomes visible.
  useEffect(() => {
    camera?.setState(HERO_POSE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  useImperativeHandle(ref, () => ({
    enter() {
      gymScene?.set("private-experience", 0, 0);
      camera?.setState(HERO_POSE);
    },
    update(progress) {
      // Fade in quickly (over first 8% of scene), stay visible, then fade out.
      const sceneOpacity = Math.min(1, Math.max(0, progress));
      const fadeIn = ease(Math.min(1, sceneOpacity * 1.2)); // Quick fade-in
      const fadeOut =
        progress > SCENE_FADE_OUT_START
          ? ease((progress - SCENE_FADE_OUT_START) / (1 - SCENE_FADE_OUT_START))
          : 0;
      gymScene?.set("private-experience", Math.max(0, fadeIn - fadeOut), progress);

      // Drive text overlay opacity: fade in 0–20%, hold 20–75%, fade out 75–100%.
      const textOverlay = textOverlayRef.current;
      if (textOverlay) {
        let textOpacity = 0;
        if (progress < TEXT_FADE_IN_END) {
          textOpacity = ease(progress / TEXT_FADE_IN_END);
        } else if (progress < TEXT_HOLD_END) {
          textOpacity = 1;
        } else {
          textOpacity = ease(1 - (progress - TEXT_HOLD_END) / (1 - TEXT_HOLD_END));
        }
        textOverlay.style.opacity = String(textOpacity);
      }

      // Camera remains static at hero pose throughout; no update needed.
      camera?.setState(HERO_POSE);
    },
    exit() {
      gymScene?.set("private-experience", 0, 1);
    },
  }));

  return (
    <div
      ref={textOverlayRef}
      className="pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center opacity-0"
    >
      <div className="text-center max-w-2xl px-6">
        {/* Primary line: large, confident, serif-inspired feel via font weight */}
        <h1 className="text-[clamp(48px,10vw,80px)] leading-tight font-semibold tracking-tight text-[#ededed] mb-8">
          THE SPACE IS YOURS.
        </h1>

        {/* Secondary line: thesis sentence, slightly smaller, supporting copy */}
        <p className="text-[clamp(18px,3.5vw,26px)] leading-relaxed font-light text-[#b8b8b8]">
          For the duration of your booking,
          <br />
          this entire gym belongs to you.
        </p>
      </div>
    </div>
  );
});

export default Scene3PrivateExperience;
