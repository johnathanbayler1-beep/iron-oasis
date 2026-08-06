// Shared types for the V3 cinematic experience foundation.
// Kept dependency-free so every module under components/v3 can import from here
// without creating circular references between scenes/camera/timeline/assets.

/** A scene's slot in the master timeline. Weight is relative, not a fraction. */
export interface SceneDefinition {
  id: string;
  label: string;
  /** Relative share of total scroll length. Weights are normalized against their sum. */
  weight: number;
}

/**
 * Imperative lifecycle every scene exposes to the master timeline.
 * enter/exit fire once on scene boundary crossings; update fires continuously
 * while the scene is active, with progress clamped to [0, 1] local to the scene.
 */
export interface SceneHandle {
  enter: () => void;
  update: (progress: number) => void;
  exit: () => void;
}

/** Foundation state for the camera controller. Not yet wired to a renderer. */
export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}
