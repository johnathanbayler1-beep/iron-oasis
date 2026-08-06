// Camera path for Scene 2 — First Gym Reveal.
//
// Room bounds measured from public/gym-space-2k.glb's POSITION accessors
// (Y-up, no parent transform on either mesh node): floor at y=-1.735,
// ceiling at y=1.735 (3.47m clear height), footprint ~7.3m (x) by 5.5m (z),
// centered on the origin. Poses below are hand-placed against those bounds.
//
// Three keyframes, two eased segments: a dark, close entrance framing that
// pulls back and rises into an elevated hero composition of the full room —
// dolly-in, travel-through, product shot. Per docs/IRON_OASIS_EXPERIENCE_BIBLE.md
// 4.2 (camera choreography) and 4.6 (asymmetric framing with implied scale).

import type { CameraState } from "../types";
import { ROOM_FLOOR_Y } from "../three/roomConfig";

type Vec3 = [number, number, number];
type Pose = CameraState;

const FLOOR_Y = ROOM_FLOOR_Y;

// All three poses look toward the same focal cluster — the rack and brand
// mark on the back wall — so the camera reads as one continuous move toward
// (and then around) a fixed subject, never a scan that reconsiders where to
// look. Position sweeps a single smooth arc (rightward, upward); FOV holds
// to an 8-degree range rather than swinging like a zoom lens.
const START: Pose = {
  position: [-0.3, FLOOR_Y + 1.0, 2.6],
  target: [-0.5, FLOOR_Y + 1.1, -1.5],
  fov: 30,
};

const MID: Pose = {
  position: [0.6, FLOOR_Y + 1.7, 0.4],
  target: [-0.8, FLOOR_Y + 1.2, -1.8],
  fov: 34,
};

const END: Pose = {
  position: [2.3, FLOOR_Y + 2.5, 1.6],
  target: [-1.0, FLOOR_Y + 1.3, -1.8],
  fov: 38,
};

// The camera used to start dollying the instant the scene became active,
// with no beat of stillness first, and then glided START→MID→END as one
// continuous ease — a single unbroken glide with nothing to punctuate it
// reads as a fly-through, not a place someone is walking into and looking
// around. Four beats instead: a held static entrance, then a deliberate
// travel to the rack (the equipment), a second held beat there — the
// "discovery" pause where the visitor is meant to actually look — and only
// then the final pull-back into the elevated hero composition.
const SETTLE = 0.12; // static entrance frame, camera hasn't moved yet
const MOVE_END = 0.5; // eased travel from START to MID completes here
const HOLD_END = 0.62; // held at MID — the equipment/training-space beat

function smootherstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// Expects an already-eased t (see smootherstep above at each call site) so
// motion isn't smoothed twice.
function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    position: lerpVec3(a.position, b.position, t),
    target: lerpVec3(a.target, b.target, t),
    fov: a.fov + (b.fov - a.fov) * t,
  };
}

export function getGymRevealPose(progress: number): CameraState {
  const p = Math.min(1, Math.max(0, progress));
  if (p <= SETTLE) return START;
  if (p <= MOVE_END) {
    return lerpPose(START, MID, smootherstep((p - SETTLE) / (MOVE_END - SETTLE)));
  }
  if (p <= HOLD_END) return MID;
  return lerpPose(MID, END, smootherstep((p - HOLD_END) / (1 - HOLD_END)));
}
