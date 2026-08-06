"use client";

import { createContext, type RefObject } from "react";

// Continuous per-frame progress for the active 3D scene, read inside
// useFrame loops (lighting, camera) without triggering React re-renders.
// The scene component owns the ref and mutates it from its enter/update/exit
// lifecycle; R3F children read progressRef.current directly each frame.
export const SceneProgressContext = createContext<RefObject<number> | null>(null);
