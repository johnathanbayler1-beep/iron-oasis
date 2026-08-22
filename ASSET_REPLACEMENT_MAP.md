# Iron Oasis V3 — Asset Replacement Map

Current as of this pass. Supersedes `ASSET_HANDOFF_GUIDE.md`,
`ASSET_PIPELINE_STATUS.md`, and the `docs/ASSET_*.md` set — those documents
described an earlier `/public/frames/`, `/public/app-screenshots/`,
`/public/badges/`, `/public/store-badges/`, `/public/location/`,
`/public/location-trust/`, `/public/features/`, `/public/3d-models/` layout
that no longer exists and, in several cases, never matched what the code
actually loaded. Scope: the v3 experience (`app/v3/page.tsx` →
`components/v3/timeline/MasterTimeline.tsx`) plus the two live references the
legacy homepage (`components/ScrollExperience.tsx`) shares with it. `CameraRig`,
`LightingRig`, `GymModel`, `MasterTimeline`, and scene order were not changed.

## Folder structure

```
/public/
  hero/    — social/SEO imagery (og-image, future poster/video-fallback stills)
  gym/     — 3D model, HDRI, future location photography
  app/     — app screenshots, feature-walkthrough demos, store badges
  logo/    — animated logo frame sequence, future favicon/apple-icon
  video/   — reserved; empty until filmed footage exists
```

Each folder has its own `README.md` with exact filenames, dimensions, and
formats. This document is the cross-reference between those and the scenes
that consume them.

## Live assets (real, working, not placeholders)

| Asset | Path | Consumed by |
|---|---|---|
| Logo frame sequence (121 WebP) | `/logo/logo_000.webp` .. `logo_120.webp` | `Scene1LogoReveal.tsx` (via `registry.ts`), `ScrollExperience.tsx` (legacy homepage) |
| Gym scan | `/gym/gym-space-2k.glb`, `/gym/gym-space-2k-opt.glb` | `GymModel.tsx` (via `registry.ts`), `ScrollExperience.tsx` |
| HDRI environment | `/gym/hdri/studio_small_03_1k.hdr`, `/gym/hdri/lebombo_1k.hdr` | `SharedGymCanvas.tsx` (via `registry.ts`), `ScrollExperience.tsx` |

`components/v3/assets/registry.ts` is the single source of truth for the v3
side of these three; `ScrollExperience.tsx` hardcodes its own copies of the
same paths because it's a separate, pre-v3 pipeline that happens to share the
same physical files under `/public`.

## Wired placeholders (code already expects a file at this path; degrades gracefully via `onError` if absent)

| Scene | Path | Dimensions | Status |
|---|---|---|---|
| Scene5 — App Experience | `/app/screenshots/screen-{1-5}.png` | 192×380px | `<img>` + `onError` in place |
| Scene6 — Location + Trust | `/gym/photography/exterior-entrance.jpg` | 16:9 (1920×1080 or 1280×720) | `<img>` + `onError` in place |
| Scene7 — Final Access | `/app/badges/app-store-badge.png`, `google-play-badge.png` | 152×48px | `<img>` + `onError` in place |

## Unwired placeholder (no `<img>` yet — currently an empty styled div)

| Scene | Reserved slot | Dimensions | Expected path once wired |
|---|---|---|---|
| Scene4 — How It Works | `frameNumberRef` frame in `Scene4HowItWorks.tsx` | 400×600px | `/app/features/feature-{1-5}.png` (or video) |

## Not a placeholder — currently missing entirely (breaks today, not just pre-launch)

| Asset | Referenced from | Status |
|---|---|---|
| `og-image.png` | `app/layout.tsx` (`openGraph.images`, `twitter.images`) | File does not exist anywhere in the repo. Every social/link-preview share is 404ing today. |
| `favicon.ico`, `apple-icon.png` | `app/layout.tsx` (`icons`) | Same — referenced, not present, not a Next.js `app/icon.*` convention file either. |

These aren't "future filming assets" — they're a live gap independent of the
3D pipeline and worth closing before the other four.

## What stays 3D vs. becomes real footage

- **Stays 3D:** Scene2 (`Scene2GymReveal`), Scene3 (`Scene3PrivateExperience`),
  and `GymBackdrop`'s continued presence behind Scenes 4–7. These are
  camera-choreographed shots of the room via `CameraRig` — the point of the
  scene is the camera move, which flat photography or video cannot
  reproduce. See `public/gym/README.md` for the constraint that the eventual
  digital-twin scan replacing `gym-space-2k.glb` must preserve
  `ROOM_FLOOR_Y` and the room's measured bounds, or `CameraRig`'s poses and
  `LightingRig`'s fixture placement need re-measuring — not this pass's
  scope, but a dependency the next one inherits.
- **Becomes real footage/photography:** Scene6's exterior/entrance frame
  (photography or short video), Scene4's feature-walkthrough frame, and
  Scene5's app screenshots. All three are flat, static content already built
  around a fixed-aspect reserved frame — no camera involved, no reason to
  stay synthetic once real material exists.
- **Orphaned, no action:** `lib/cinematic-assets.ts` defines a third,
  unrelated asset-path scheme (`/assets/product/*.webm`, `/assets/gem/*`)
  that nothing imports — dead code predating this structure, left alone
  since removing source files (vs. asset paths) is outside this pass's
  scope. Flagged for a future cleanup pass.

## Replacement workflow

1. Drop the file into the folder with the exact name from that folder's
   `README.md`.
2. For the three "wired placeholder" rows above: nothing else to do — the
   `<img>` and its `onError` fallback are already live.
3. For Scene4 (unwired): add an `<img>` (or `<video>`, see
   `public/video/README.md`) inside the existing reserved frame, keyed to the
   same per-step index already driving the caption/statement text, with an
   `onError`-hide handler matching Scene5/6/7's pattern.
4. For `og-image.png` / `favicon.ico` / `apple-icon.png`: drop into
   `public/hero/` and `public/logo/` respectively, then update the two
   `/og-image.png` URLs and two icon paths in `app/layout.tsx` to their new
   `/hero/` and `/logo/` locations.
5. Run `npx tsc --noEmit` and `npm run build` after any code change (not
   needed for a pure file drop into an already-wired slot).

## Next phase recommendation

1. **Close the `og-image`/`favicon`/`apple-icon` gap first** — it's live-broken
   today, cheapest to fix, and unrelated to filming schedule.
2. **Scene7 store badges and Scene5 screenshots next** — both are fully wired;
   dropping files in is the entire task.
3. **Scene6 photography** — schedule once the space is available to shoot;
   code is ready.
4. **Scene4 feature demos** — lowest priority of the four wired/near-wired
   slots since it also needs the `<img>` wiring itself, not just files.
5. **Digital-twin gym scan** — treat as its own project, not a file swap: it
   requires re-measuring `ROOM_FLOOR_Y` and re-validating `CameraRig` /
   `LightingRig` against the new geometry before it can replace
   `gym-space-2k.glb`.
6. Separately from asset delivery: prune the now-superseded
   `ASSET_HANDOFF_GUIDE.md`, `ASSET_PIPELINE_STATUS.md`, and `docs/ASSET_*.md`
   files, and consider deleting the orphaned `lib/cinematic-assets.ts`.
