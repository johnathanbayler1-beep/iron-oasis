// Camera controller foundation. Framework-agnostic state container that scenes
// push into as they animate; no renderer is wired to it yet. When the 3D scene
// milestone lands, a react-three-fiber camera subscribes to this same state.

import type { CameraState } from "../types";

const DEFAULT_STATE: CameraState = {
  position: [0, 1.6, 6],
  target: [0, 1.2, 0],
  fov: 50,
};

type Listener = (state: CameraState) => void;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export class CameraController {
  private state: CameraState;
  private listeners = new Set<Listener>();

  constructor(initial: Partial<CameraState> = {}) {
    this.state = { ...DEFAULT_STATE, ...initial };
  }

  getState(): CameraState {
    return this.state;
  }

  setState(partial: Partial<CameraState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  /** Lerp the current state toward a target by factor t (0-1). */
  lerpTo(target: Partial<CameraState>, t: number): void {
    const next: CameraState = { ...this.state };
    if (target.position) next.position = lerpVec3(this.state.position, target.position, t);
    if (target.target) next.target = lerpVec3(this.state.target, target.target, t);
    if (target.fov !== undefined) next.fov = lerp(this.state.fov, target.fov, t);
    this.setState(next);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
