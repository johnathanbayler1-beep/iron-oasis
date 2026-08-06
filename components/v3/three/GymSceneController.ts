// Coordinates the single shared gym Canvas (see SharedGymCanvas) between the
// three scenes that previously each mounted their own independent Canvas:
// Scene2GymReveal ("gym-reveal"), Scene3PrivateExperience
// ("private-experience"), and GymBackdrop ("backdrop"). Each of those scenes
// still owns its own opacity/progress curve exactly as before; they just
// report the result here each update() instead of writing it to a local
// Canvas's own div and SceneProgressContext ref.
//
// Only one source is ever meaningfully visible at a time (the scenes are
// sequential, with brief crossfades at their shared edges), so "dominant" is
// simply whichever source currently reports the highest opacity. Lighting
// and environment-intensity rigs read the dominant source's own progress
// value, so each one behaves exactly as it did inside its own Canvas.
export type GymSceneSource = "gym-reveal" | "private-experience" | "backdrop";

interface SourceState {
  opacity: number;
  progress: number;
}

const SOURCES: GymSceneSource[] = ["gym-reveal", "private-experience", "backdrop"];

export class GymSceneController {
  private sources: Record<GymSceneSource, SourceState> = {
    "gym-reveal": { opacity: 0, progress: 0 },
    "private-experience": { opacity: 0, progress: 0 },
    backdrop: { opacity: 0, progress: 0 },
  };

  private listeners = new Set<() => void>();

  // Backdrop never provided a SceneProgressContext ref at all in the
  // pre-merge world, so LightingRig there always read the ref-absent default
  // of 0 for the whole time GymBackdrop was on screen. Mirrored here by
  // reporting progress 0 whenever backdrop is dominant, rather than its
  // actual (global, 0-1-across-four-scenes) progress value.
  readonly progressRef: { current: number } = { current: 0 };

  dominantSource: GymSceneSource = "gym-reveal";

  set(source: GymSceneSource, opacity: number, progress: number) {
    this.sources[source] = { opacity, progress };

    let best: GymSceneSource = SOURCES[0];
    let bestOpacity = -1;
    for (const s of SOURCES) {
      if (this.sources[s].opacity > bestOpacity) {
        bestOpacity = this.sources[s].opacity;
        best = s;
      }
    }
    this.dominantSource = best;
    this.progressRef.current = best === "backdrop" ? 0 : this.sources[best].progress;

    this.listeners.forEach((fn) => fn());
  }

  getCombinedOpacity(): number {
    return Math.max(
      this.sources["gym-reveal"].opacity,
      this.sources["private-experience"].opacity,
      this.sources.backdrop.opacity,
    );
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}
