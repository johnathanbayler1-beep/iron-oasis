"use client";

import type { Annotation } from "./types";

interface AnnotationLayerProps {
  annotations: Annotation[];
  activeSceneId: string | null;
  sceneProgress: number;
}

// Placeholder overlay. No scene registers annotations yet in this milestone;
// this establishes the contract scenes and MasterTimeline will drive later.
export default function AnnotationLayer({ annotations, activeSceneId, sceneProgress }: AnnotationLayerProps) {
  const visible = annotations.filter(
    (a) => a.sceneId === activeSceneId && sceneProgress >= a.at[0] && sceneProgress <= a.at[1]
  );

  if (visible.length === 0) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 flex items-end justify-center pb-20">
      {visible.map((a) => (
        <p key={a.id} className="font-mono text-xs uppercase tracking-[0.3em] text-white/60">
          {a.content}
        </p>
      ))}
    </div>
  );
}
