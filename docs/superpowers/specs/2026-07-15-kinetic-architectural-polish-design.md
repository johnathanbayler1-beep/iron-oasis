# Kinetic Architectural Polish — Design Spec

**Date:** 2026-07-15
**Branch:** rebuild-from-scratch
**Status:** Approved scope, pending spec review

## Context

The "SYSTEM DIRECTIVE: KINETIC ARCHITECTURAL UPGRADE" asked to transform a
"stale 2D" site into a cinematic pinned-3D scroll experience. Investigation of
the two reference clips (`IMG_6722.mov`, `IMG_6797.mov`) and the repo proved the
premise wrong:

- **IMG_6722** (netlify `iron-oasis-gym`) = flat 2D scroll site, correct brand
  vocab. The "stale" one.
- **IMG_6797** (vercel `iron-oasis-next`) = cinematic pinned 3D room fly-through
  with monospace section indices and floating pricing — but **old banned vocab**
  ("MICRO-GYM NETWORK", "MEMBERSHIP", tier pricing).
- **The repo (this branch)** is already the cinematic lineage: `GymScene.tsx`
  renders `gym-space-2k.glb`, pinned via `position:sticky`, camera fly-through
  over 5 waypoints, GSAP `ScrollTrigger` scrub, text beats — **with corrected
  vocab** ("ONE KEY / ZERO SHARING / PURE PRIVACY").

So the pinned-scrubbed-3D pipeline the directive asked to "implement" **already
exists and works.** This is a polish pass, not a rebuild. Target = 6797's motion
smoothness + the repo's already-correct brand language.

## Root cause of the "jitter"

`GymScene.tsx` `CameraRig` (lines 86–92) maps scroll progress across waypoints
with **linear** interpolation:

```
const scaled = prog * (pts.length - 1)
const lo = Math.floor(scaled); const hi = min(lo+1, ...)
const t = scaled - lo
camera.position.lerpVectors(pts[lo].pos, pts[hi].pos, t)
```

This is C0-continuous only: velocity direction snaps at each waypoint boundary,
producing the "jittery starts/stops" the directive complains about. The
reference video is one continuous eased glide.

## Approved scope

Camera easing + card entrances + hero. Rejected: banned vocab, gaudy
tilt/shadow "spatial UI" maximalism (would reverse the Jul 14 quiet-luxury
work), and literal `pin:true` swap (sticky already pins; swapping risks the
documented "Context Lost" black-void — see GymScene.tsx:116-118).

## Changes

### 1. Camera path: spline + eased progress (highest impact)

In `GymScene.tsx`:
- Build a `THREE.CatmullRomCurve3` from the 5 waypoint positions once (in
  `Model`/rig, when waypoints are set). Do the same for `lookAt` targets, OR
  keep the piecewise lookAt lerp — position spline alone removes most jitter.
- Replace linear `t` sampling with a global eased parameter: shape
  `progressRef.current` through a `power4.inOut` curve, then sample
  `curve.getPoint(easedProgress)`. This gives one continuous C1 glide matching
  the reference.
- Keep `frameloop="demand"` + `invalidate()` — do not switch to continuous
  render; it's a deliberate perf choice.
- Remove or reduce the idle sine/cos drift (lines 96-97) — it fights the
  "frame-synced, immediate" feel. Keep a much smaller amplitude or gate it off.

**Verify:** scrub slowly through the section; camera never changes direction
abruptly; no frame where it stalls then jumps.

### 2. Timing / dead-zone

- `SCROLL_VH` (currently 160) and `scrub: 0.8`: tune so the eased path fills the
  track and the exit into the next section has no empty scroll tail. Likely
  reduce `SCROLL_VH` slightly and/or lower scrub toward 0.5 for tighter sync.
- Confirm the handoff `fadeSt` (lines 183-193) still crossfades cleanly with the
  new easing.

### 3. Spatial card entrances (restrained)

Four card sections: `HowItWorks`, `FinalClose`, `GymSpin` value stack,
`InfrastructureBridge`. Add a **shared** scroll-triggered entrance rather than
per-component bespoke code:

- Reuse the existing `RevealObserver` / `IOReveal` pattern if it already does
  IntersectionObserver reveals (confirm during implementation — do NOT add a new
  mechanism if one exists). Otherwise a single small helper/hook.
- Entrance: `translateY(30px)` → `0`, opacity `0` → `1`, subtle `rotateX(6deg)`
  → `0`. Stagger `0.1s` between siblings. Parent gets `perspective: 1000px`.
- `will-change: transform, opacity` on animating elements; remove after settle.
- Keep surfaces calm — no new drop-shadows/glows. Tilt is subtle (≤6deg), not
  the directive's literal maximalism.

**Verify:** cards rise + settle once on entry, staggered; no jank; respects
existing quiet-luxury look.

### 4. Hero

- One H1 headline. Reduce secondary text density in the hero (ScrollExplode /
  first section) to a single supporting line.
- CTA: one high-contrast button with a hover-lift (`translateY(-2px)` +
  slightly stronger shadow on hover) via the existing `.io-btn` system — extend
  it, don't fork a new button style.

## Non-goals

- No rebuild of the 3D pipeline, ScrollExplode, or GymSpin internals.
- No new dependencies (GSAP 3.13, three, r3f already present).
- No vocab changes toward banned terms.
- No generic CSS-transition churn on unrelated elements.

## Performance guardrails

- GPU-accelerated transforms only (`transform`/`opacity`), `will-change` on
  animating nodes, cleaned up after.
- Keep `frameloop="demand"`, `dpr=[1,1.5]`, `antialias:false`.
- No layout-triggering properties in scroll handlers.

## Verification plan

1. `npx tsc --noEmit` clean.
2. Run dev server; scrub the GymScene section slowly — confirm continuous eased
   glide, no jitter, no dead scroll into the next section.
3. Confirm each card section animates in once, staggered, calm.
4. Screenshot hero: one H1 + one lifted CTA.
5. Confirm no banned vocab introduced.
