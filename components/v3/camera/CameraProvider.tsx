"use client";

import { createContext, useMemo, type ReactNode } from "react";
import { CameraController } from "./CameraController";

export const CameraContext = createContext<CameraController | null>(null);

export function CameraProvider({ children }: { children: ReactNode }) {
  const controller = useMemo(() => new CameraController(), []);
  return <CameraContext.Provider value={controller}>{children}</CameraContext.Provider>;
}
