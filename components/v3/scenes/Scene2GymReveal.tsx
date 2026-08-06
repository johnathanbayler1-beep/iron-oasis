"use client";

import { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";
import { CameraContext } from "../camera/CameraProvider";
import { getGymRevealPose } from "../camera/gymRevealPath";
import { GymSceneContext } from "./GymSceneContext";

// Scene 2 — First Gym Reveal. The first true 3D beat: a real gym-space.glb
// interior, camera dollying from a dark, close entrance framing, through the
// room, to an elevated hero composition of the full space — the product shot
// the rest of the film exists to earn. See
// docs/IRON_OASIS_EXPERIENCE_BIBLE.md 4.2 (camera choreography), 4.6
// (asymmetric framing / implied scale), 4.9 (motivated lighting).
//
// The 3D layer itself now lives in SharedGymCanvas (one Canvas shared with
// Scene3PrivateExperience and GymBackdrop instead of each holding its own —
// see GymSceneController for why). This component keeps its exact opacity
// and camera-pose curves and just reports them to that shared canvas each
// update() instead of driving a local Canvas/div.
// Root opacity fades in over the scene's first beat rather than snapping to
// full opacity on enter — the previous instant pop was the one scene in the
// sequence without a matching fade-in, breaking the crossfade chain from
// SceneHook's black pause into the room.
const FADE_IN = 0.08;
// Previously this scene had no fade-out at all — it held at full opacity
// until exit() snapped it to 0 the instant Scene 3 took over, a hard cut
// between two beats that are meant to read as the same room. Scene 3 already
// fades up quickly from black on entry; this mirrors that so the handoff is
// an actual crossfade instead of a cut-then-fade.
const FADE_OUT = 0.08;

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

const Scene2GymReveal = forwardRef<SceneHandle>(function Scene2GymReveal(_props, ref) {
  const camera = useContext(CameraContext);
  const gymScene = useContext(GymSceneContext);

  // CameraController's own default state (a generic [0, 1.6, 6] establishing
  // shot, unrelated to this room) otherwise sits live in the controller from
  // app mount until scroll first reaches this scene's enter() — and because
  // the Canvas stays mounted the whole time, CameraRig is damping toward that
  // stale default in the background the entire time before then. On a fast
  // scroll into the scene, enter() and the fade-in land close enough together
  // that convergence from the generic default to START hasn't finished,
  // showing as a visible camera swoop/pop right as the room becomes visible
  // instead of the shot already being composed. Setting START immediately on
  // mount — well before scroll can reach this scene — gives CameraRig the
  // entire preceding scroll distance to converge, so entry is always already
  // settled.
  useEffect(() => {
    camera?.setState(getGymRevealPose(0));
    gymScene?.set("gym-reveal", 0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  useImperativeHandle(ref, () => ({
    enter() {
      gymScene?.set("gym-reveal", 0, 0);
      camera?.setState(getGymRevealPose(0));
    },
    update(progress) {
      const inT = Math.min(1, progress / FADE_IN);
      const outT = progress > 1 - FADE_OUT ? (progress - (1 - FADE_OUT)) / FADE_OUT : 0;
      const opacity = Math.max(0, ease(inT) - ease(outT));
      gymScene?.set("gym-reveal", opacity, progress);
      camera?.setState(getGymRevealPose(progress));
    },
    exit() {
      gymScene?.set("gym-reveal", 0, 1);
    },
  }));

  return null;
});

export default Scene2GymReveal;
