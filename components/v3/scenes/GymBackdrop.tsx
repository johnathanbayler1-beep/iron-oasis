"use client";

import { forwardRef, useContext, useImperativeHandle } from "react";
import { CameraContext } from "../camera/CameraProvider";
import { GymSceneContext } from "./GymSceneContext";
import { SCENE_REGISTRY } from "./registry";
import { HERO_POSE } from "./Scene3PrivateExperience";

// Gym Backdrop — the room's continued presence after Scene 3 hands off to the
// text-driven scenes (How It Works / App Experience / Location + Trust /
// Final Access). Without this, the gym vanishes behind flat black for the
// back half of the film and those scenes read as ordinary website sections
// rather than a continuation of the same product shot. This reports into the
// same shared 3D canvas already used by Scene2 and Scene3 (see
// SharedGymCanvas / GymSceneController — no new 3D system, and no longer a
// Canvas of its own), holds the identical hero camera pose for continuity,
// and stays "present" (as far as the shared canvas is concerned) beneath
// those scenes' text — dimmed to a quiet presence through the middle scenes,
// then rising back to full brightness across Scene 7 so the room, not an
// app-store badge, is the last thing on screen.
//
// This is driven by raw global scroll progress (not a per-scene local
// progress), since its visible window spans four scenes. MasterTimeline
// calls update() directly with ScrollTrigger's self.progress alongside the
// existing per-scene dispatch loop — it isn't part of SCENE_REGISTRY.

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function sceneWindow(id: string) {
  const total = SCENE_REGISTRY.reduce((sum, s) => sum + s.weight, 0);
  let cursor = 0;
  for (const scene of SCENE_REGISTRY) {
    const start = cursor / total;
    cursor += scene.weight;
    const end = cursor / total;
    if (scene.id === id) return { start, end };
  }
  return { start: 0, end: 1 };
}

const HOW_IT_WORKS = sceneWindow("how-it-works");
const FINAL_ACCESS = sceneWindow("final-access");

// Backdrop is present from the moment How It Works begins (right as Scene 3
// hands off) through the end of the scroll.
const BACKDROP_START = HOW_IT_WORKS.start;
const FADE_IN_SPAN = 0.02;
const DIM_OPACITY = 0.16;
// Gym rises from dim presence to full anchor across all of Scene 7, ending
// at full opacity right as the scroll ends.
const RISE_START = FINAL_ACCESS.start;
const RISE_END = FINAL_ACCESS.end;

export interface GymBackdropHandle {
  update: (globalProgress: number) => void;
}

const GymBackdrop = forwardRef<GymBackdropHandle>(function GymBackdrop(_props, ref) {
  const camera = useContext(CameraContext);
  const gymScene = useContext(GymSceneContext);

  useImperativeHandle(ref, () => ({
    update(globalProgress) {
      if (globalProgress < BACKDROP_START) {
        gymScene?.set("backdrop", 0, globalProgress);
        return;
      }

      const fadeIn = ease(Math.min(1, (globalProgress - BACKDROP_START) / FADE_IN_SPAN));
      let level = DIM_OPACITY;
      if (globalProgress >= RISE_START) {
        const riseT = ease(Math.min(1, (globalProgress - RISE_START) / (RISE_END - RISE_START)));
        level = DIM_OPACITY + (1 - DIM_OPACITY) * riseT;
      }

      gymScene?.set("backdrop", fadeIn * level, globalProgress);

      // Static hero pose throughout — the whole point is that the camera
      // never moved, it just faded into the background and came back.
      camera?.setState(HERO_POSE);
    },
  }));

  return null;
});

export default GymBackdrop;
