"use client";

import { createContext, useMemo, type ReactNode } from "react";
import { GymSceneController } from "../three/GymSceneController";

export const GymSceneContext = createContext<GymSceneController | null>(null);

export function GymSceneProvider({ children }: { children: ReactNode }) {
  const controller = useMemo(() => new GymSceneController(), []);
  return <GymSceneContext.Provider value={controller}>{children}</GymSceneContext.Provider>;
}
