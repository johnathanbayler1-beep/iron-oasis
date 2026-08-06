// Scene registry: ordered list of scenes and their relative weight (share of
// total scroll length) in the master timeline. Adding a scene is: add here,
// add a component, register it in MasterTimeline's SCENE_COMPONENTS map.

import type { SceneDefinition } from "../types";

export const SCENE_REGISTRY: SceneDefinition[] = [
  { id: "loading", label: "Loading", weight: 0.08 },
  { id: "logo-reveal", label: "Logo Reveal", weight: 0.22 },
  { id: "hook", label: "The Hook", weight: 0.22 },
  { id: "gym-reveal", label: "First Gym Reveal", weight: 0.2 },
  { id: "private-experience", label: "The Private Experience", weight: 0.28 },
  { id: "how-it-works", label: "How It Works", weight: 0.32 },
  { id: "app-experience", label: "App Experience", weight: 0.28 },
  { id: "location-trust", label: "Location + Trust", weight: 0.28 },
  { id: "final-access", label: "Final Access", weight: 0.24 },
];
