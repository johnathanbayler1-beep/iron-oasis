// Scroll progress mapper: converts a single global progress value (0-1, driven
// by the master timeline's scroll trigger) into per-scene local progress based
// on each scene's relative weight in the SCENE_REGISTRY.

import type { SceneDefinition } from "../types";

export interface SceneProgress {
  id: string;
  /** True while global progress falls within this scene's span. */
  active: boolean;
  /** Local progress within the scene, clamped to [0, 1]. */
  progress: number;
}

export function mapGlobalProgress(global: number, scenes: SceneDefinition[]): SceneProgress[] {
  const totalWeight = scenes.reduce((sum, scene) => sum + scene.weight, 0);
  if (totalWeight <= 0) return scenes.map((scene) => ({ id: scene.id, active: false, progress: 0 }));

  let cursor = 0;
  return scenes.map((scene, index) => {
    const start = cursor / totalWeight;
    cursor += scene.weight;
    const end = cursor / totalWeight;
    const span = end - start;
    const raw = span > 0 ? (global - start) / span : 0;
    const progress = Math.min(1, Math.max(0, raw));
    const isLast = index === scenes.length - 1;
    const active = global >= start && (isLast ? global <= 1 : global < end);
    return { id: scene.id, active, progress };
  });
}
