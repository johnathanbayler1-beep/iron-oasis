# Gym

The physical space: the 3D scan currently standing in for it, its lighting
environment, and (eventually) real photography of the actual location.

## Live today

- **`gym-space-2k.glb`** (~4.2MB) and **`gym-space-2k-opt.glb`** (~608KB,
  Draco-compressed) — the scanned gym interior. `GymModel.tsx` loads the
  optimized variant by default (`ASSET_REGISTRY.gymSpace.optimizedPath`).
  Rendered inside `SharedGymCanvas.tsx`, the single WebGL context behind
  Scene2 (`Scene2GymReveal`), Scene3 (`Scene3PrivateExperience`), and
  `GymBackdrop` (the room's continued presence behind Scenes 4–7).
- **`hdri/studio_small_03_1k.hdr`** and **`hdri/lebombo_1k.hdr`** — environment
  lighting maps consumed via `ASSET_REGISTRY.hdriStudio` /
  `ASSET_REGISTRY.hdriLebombo`.
- Draco decoder lives separately at `public/draco/` (build tooling, not a
  visual asset — untouched by this restructure).

### This is explicitly a placeholder scan, not final geometry

`components/v3/three/roomConfig.ts` states it directly: `ROOM_FLOOR_Y` and the
room's measured bounds (floor y=-1.735, ceiling y=1.735, ~7.3m × 5.5m
footprint) are measured off *this* GLB and are load-bearing for both the
camera path (`components/v3/camera/gymRevealPath.ts`) and the fixture
placement in `components/v3/three/LightingRig.tsx`.

**When the final digital-twin scan arrives, it is not a drop-in file swap.**
It must either match this floor/origin convention (Y-up, floor at y=-1.735,
centered at the origin) or every hand-placed pose in `gymRevealPath.ts` and
every fixture position in `LightingRig.tsx` needs re-measuring against the
new export. Per the task brief, `CameraRig`, `LightingRig`, `GymModel`, and
`MasterTimeline` are out of scope for this pass — this note exists so that
constraint is visible before someone drops a new GLB into this folder
expecting it to just work.

Filename convention for the eventual replacement: keep `gym-space-2k.glb` /
`gym-space-2k-opt.glb` (source + Draco-compressed) so no path in
`registry.ts` needs to change — only the file contents and, per the above,
the coordinated re-measurement.

## Reserved, not yet produced

- **`photography/exterior-entrance.jpg`** — Scene6
  (`Scene6LocationTrust.tsx`), 16:9 aspect ratio strictly (the frame will
  distort otherwise; 1920×1080 or 1280×720). One image, not a gallery — the
  scene is deliberately built around a single reserved cinematic frame rather
  than rotating through several, so it reads as one sanctuary rather than a
  real-estate listing. No people, logos, or identifying markers. The `<img>`
  tag already has a graceful `onError` fallback, so the scene degrades to its
  reserved-frame-with-glow state if this file is absent.

Scene2GymReveal, Scene3PrivateExperience, and GymBackdrop should stay 3D —
these are camera-choreographed shots of the room itself, which is the point
of the CameraRig work; they are not candidates for becoming flat photography
or video. Scene6 is the one place actual location photography belongs.
