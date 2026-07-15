# Kinetic Architectural Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 3D fly-through glide on a continuous eased spline (killing camera jitter) and give the four card sections + hero a restrained "kinetic quiet luxury" entrance polish.

**Architecture:** Four surgical changes on the existing pipeline — (1) swap the camera's piecewise linear waypoint lerp for a `THREE.CatmullRomCurve3` sampled by a `power4.inOut`-eased progress; (2) tune scroll runway/scrub; (3) add ONE shared scroll-reveal entrance (translateY + subtle rotateX) reusing the existing `RevealObserver`; (4) tighten the hero to one H1 + one lifted CTA. No new dependencies, no pipeline rebuild.

**Tech Stack:** Next 16.2.9 (App Router, Turbopack), React 19, `@react-three/fiber` + `drei`, `three`, GSAP 3.13 (ScrollTrigger), plain CSS in `app/globals.css`.

## Global Constraints

- Framework floor: Next.js 16.2.9, App Router, Turbopack. React 19.
- No new dependencies — `gsap`, `three`, `@react-three/fiber`, `@react-three/drei` are already present; use only these.
- `GymScene`/`GymSpin` Canvas stays **permanently mounted** once triggered — never unmount the WebGL context (see `GymScene.tsx:116-118`, "Context Lost" black void). Cull via `frameloop="demand"` + opacity only.
- Keep `frameloop="demand"`, `dpr={[1,1.5]}`, `antialias:false`, `performance={{ min: 0.5 }}` on the Canvas.
- Animate **only** `transform` / `opacity`; `will-change` on animating nodes, removed after settle. No layout-triggering props in scroll handlers.
- No new drop-shadows/glows — preserve the Jul 14 quiet-luxury pass. Tilt ≤ 6deg.
- Brand vocab: allowed = Access Key, Private Space, Location, Zero Sharing, 24/7 Access, Session, Windsor, etc. **Banned** = Node, Token, Gym, Train, Workout, Membership, Tier, Partner, Network. Do not introduce banned terms.
- No test runner exists in this repo. The check cycle for every task is: `npx tsc --noEmit` clean **and** a visual confirmation (screenshot / dev-server scrub), per project protocol.

---

### Task 1: Camera path — spline + eased progress

**Files:**
- Modify: `app/components/GymScene.tsx` — `Model` (add curve build, ~lines 30-52), `CameraRig` (replace sampling, lines 74-103).

**Interfaces:**
- Consumes: existing `waypointsRef: { current: WayPoint[] }` (5 points), `progressRef: { current: number }` (0→1 from ScrollTrigger).
- Produces: no signature changes. `WayPoint` type unchanged. Adds a module-level eased-sampling on the shared `waypointsRef`; a new `curveRef: { current: THREE.CatmullRomCurve3 | null }` passed `Model → GymScene → CameraRig` alongside the existing refs.

- [ ] **Step 1: Add a shared `curveRef` and thread it through the three components**

In `GymScene` (the default export, ~line 108) add next to the other refs:

```tsx
const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null)
```

Pass it to both `<Model>` and `<CameraRig>` in the JSX (lines 231-236):

```tsx
<Model waypointsRef={waypointsRef} curveRef={curveRef} />
<CameraRig
  waypointsRef={waypointsRef}
  curveRef={curveRef}
  progressRef={progressRef}
  invalidateRef={invalidateRef}
/>
```

Update both component prop types:

```tsx
function Model({ waypointsRef, curveRef }: {
  waypointsRef: { current: WayPoint[] }
  curveRef: { current: THREE.CatmullRomCurve3 | null }
}) {
```

```tsx
function CameraRig({
  waypointsRef, curveRef, progressRef, invalidateRef,
}: {
  waypointsRef:  { current: WayPoint[] }
  curveRef:      { current: THREE.CatmullRomCurve3 | null }
  progressRef:   { current: number }
  invalidateRef: { current: () => void }
}) {
```

- [ ] **Step 2: Build the position spline once, where the waypoints are set**

In `Model`'s `useLayoutEffect`, immediately after assigning `waypointsRef.current = [...]` (after line 51), build the curve from the 5 positions. `centripetal` type avoids overshoot/cusps:

```tsx
    curveRef.current = new THREE.CatmullRomCurve3(
      waypointsRef.current.map((w) => w.pos),
      false,           // not closed
      'centripetal',
    )
```

Add `curveRef` to the effect dependency array: `}, [cloned, waypointsRef, curveRef])`.

- [ ] **Step 3: Replace linear sampling with eased spline sampling in `CameraRig`**

Add a module-level scratch vector near `_lookAt` (line 13):

```tsx
const _camPos = new THREE.Vector3()
```

Replace the sampling block in `useFrame` (lines 86-102) with an eased global parameter + spline `getPoint`. Keep the piecewise `lookAt` lerp (position spline alone removes the jitter):

```tsx
    const curve = curveRef.current
    if (!curve) return

    // power4.inOut easing on global progress → one continuous C1 glide
    const p = progressRef.current
    const eased = p < 0.5
      ? 8 * p * p * p * p
      : 1 - Math.pow(-2 * p + 2, 4) / 2

    curve.getPoint(eased, _camPos)
    camera.position.copy(_camPos)

    // lookAt still piecewise-lerped across the raw waypoint targets
    const scaled = eased * (pts.length - 1)
    const lo     = Math.floor(scaled)
    const hi     = Math.min(lo + 1, pts.length - 1)
    const t      = scaled - lo
    _lookAt.lerpVectors(pts[lo].lookAt, pts[hi].lookAt, t)

    // idle drift: heavily reduced — barely-there, never fights the frame-synced feel
    if (idle) {
      const now = Date.now()
      camera.position.x += Math.sin(now * 0.0004) * 0.0008
      camera.position.y += Math.cos(now * 0.0003) * 0.0004
    }

    camera.lookAt(_lookAt)

    if (idle || changed) invalidate()
```

Leave the `idle` / `changed` / `lastProgRef` / `lastChangeRef` logic above (lines 78-85) unchanged.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean (no errors).

- [ ] **Step 5: Visual verify**

Run dev server (`npm run dev`), scroll slowly through the GymScene section. Take a screenshot mid-scrub. Expected: camera never changes direction abruptly; no frame where it stalls then jumps; one continuous glide.

- [ ] **Step 6: Commit**

```bash
git add app/components/GymScene.tsx
git commit -m "feat(3d): spline camera path with power4.inOut eased progress"
```

---

### Task 2: Timing / dead-zone tune

**Files:**
- Modify: `app/components/GymScene.tsx` — `SCROLL_VH` (line 11), ScrollTrigger `scrub` (line 157).

**Interfaces:**
- Consumes: the eased spline from Task 1 (progress now non-linear across the track).
- Produces: no signature change — only two numeric constants.

- [ ] **Step 1: Reduce runway and tighten scrub**

Line 11 — lower the runway so the eased path fills the track with no empty tail:

```tsx
const SCROLL_VH = 140 // was 160 — eased spline reaches the end sooner; trim the dead tail
```

Line 157 — tighten scrub sync:

```tsx
      scrub:   0.5,
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Visual verify — no dead scroll, clean handoff**

Dev server: scrub from hero through GymScene into InfrastructureBridge. Expected: the camera reaches its final waypoint right as the section ends (no empty scroll tail), and the `fadeSt` handoff crossfade (lines 183-193) still fades the canvas in cleanly. If a tail remains, nudge `SCROLL_VH` down further (10 at a time); if the glide feels rushed, raise it back toward 150.

- [ ] **Step 4: Commit**

```bash
git add app/components/GymScene.tsx
git commit -m "tune(3d): trim scroll runway and tighten scrub for eased path"
```

---

### Task 3: Shared spatial card entrance (restrained)

**Files:**
- Modify: `app/globals.css` — reveal system (after line 182), and add `.io-spatial` to the existing `@media (prefers-reduced-motion)` + fallback blocks.
- Modify: `components/HowItWorks.tsx`, `components/FinalClose.tsx`, `components/GymSpin.tsx` (value stack), `components/InfrastructureBridge.tsx` — add the entrance class to each card group's container + children.
- Modify: `components/RevealObserver.tsx:12-14` — add `.io-spatial` to the observed selector.

**Interfaces:**
- Consumes: existing `RevealObserver` IntersectionObserver, which adds `io-hl-visible` to matched elements and force-shows via `io-fallback-visible` on `<body>`.
- Produces: a new opt-in reveal class `.io-spatial` (hidden → visible on `.io-hl-visible`), plus `.io-spatial-parent` (sets perspective) and a CSS `nth-child` stagger. Reused by all four card sections — no per-component JS.

- [ ] **Step 1: Add the shared `.io-spatial` entrance CSS**

In `app/globals.css`, after the reveal block (after line 182, before the ATMOSPHERE banner), add:

```css
/* ── Shared spatial entrance — restrained rise + subtle tilt.
   Opt-in: put .io-spatial-parent on the container, .io-spatial on each child.
   RevealObserver adds .io-hl-visible per element as it enters view. ── */
.io-spatial-parent {
  perspective: 1000px;
}
.io-spatial {
  opacity: 0;
  transform: translateY(30px) rotateX(6deg);
  transform-origin: center bottom;
  transition:
    opacity 0.7s ease,
    transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}
.io-spatial.io-hl-visible {
  opacity: 1;
  transform: translateY(0) rotateX(0);
}
/* stagger siblings 0.1s; drop will-change after the longest settle (~0.9s) */
.io-spatial-parent > .io-spatial:nth-child(2) { transition-delay: 0.1s; }
.io-spatial-parent > .io-spatial:nth-child(3) { transition-delay: 0.2s; }
.io-spatial-parent > .io-spatial:nth-child(4) { transition-delay: 0.3s; }
.io-spatial-parent > .io-spatial:nth-child(5) { transition-delay: 0.4s; }
.io-spatial.io-hl-visible { will-change: auto; }
```

- [ ] **Step 2: Include `.io-spatial` in the fallback + reduced-motion blocks**

Extend the fallback watchdog (lines 169-170) to also force-show spatial cards:

```css
.io-fallback-visible .io-reveal-up,
.io-fallback-visible .io-edit-heading,
.io-fallback-visible .io-spatial {
  opacity: 1 !important;
  transform: none !important;
}
```

Extend the reduced-motion block (lines 175-182):

```css
@media (prefers-reduced-motion: reduce) {
  .io-reveal-up,
  .io-edit-heading,
  .io-spatial {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 3: Observe `.io-spatial` in RevealObserver**

In `components/RevealObserver.tsx`, add `.io-spatial` to the querySelectorAll string (lines 12-14):

```tsx
    const els = document.querySelectorAll(
      '.io-reveal-up, .io-edit-heading, .io-tier, .io-stat-num, .io-body, .io-rule, .io-spatial'
    );
```

- [ ] **Step 4: Apply the class to the four card groups**

For each of `HowItWorks.tsx`, `FinalClose.tsx`, `GymSpin.tsx` (the value-stack card group only — NOT the 3D Canvas), `InfrastructureBridge.tsx`: find the container that wraps the repeated card/step elements. Add `io-spatial-parent` to that container's `className`, and `io-spatial` to each direct child card. Preserve existing classes — append, don't replace. Example shape:

```tsx
<div className="existing-grid-class io-spatial-parent">
  <div className="existing-card-class io-spatial"> … </div>
  <div className="existing-card-class io-spatial"> … </div>
  …
</div>
```

If a section renders cards via `.map(...)`, add `io-spatial` inside the mapped element's className so every card gets it. Do not add `io-spatial` to a card that already carries `io-tier` (that class self-reveals) — pick one reveal class per element.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Visual verify — cards rise + settle once, staggered**

Dev server: scroll each of the four sections into view. Screenshot mid-entrance. Expected: each card group rises from +30px with a ≤6deg tilt flattening out, staggered ~0.1s per sibling, settling once (no re-trigger on scroll-back — RevealObserver `unobserve`s). Calm, no new glows. Confirm reduced-motion (OS setting) shows everything instantly.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css components/RevealObserver.tsx components/HowItWorks.tsx components/FinalClose.tsx components/GymSpin.tsx components/InfrastructureBridge.tsx
git commit -m "feat(motion): shared restrained spatial card entrance"
```

---

### Task 4: Hero — one H1 + one lifted CTA

**Files:**
- Modify: `components/ScrollExplode.tsx` — hero H1 (lines 439-448).
- Modify: `app/globals.css` — `.io-btn:hover` (~line 88) hover-lift.

**Interfaces:**
- Consumes: existing `.io-btn` / `.io-btn--accent` classes, existing hero refs (`heroTextRef`, `primaryCtaRef`, `secondaryCtaRef`).
- Produces: no signature change — copy + one CSS hover rule.

- [ ] **Step 1: Reduce hero H1 to one headline + one supporting line**

In `components/ScrollExplode.tsx`, replace the two-clause H1 (lines 446-448) with a single headline; move the secondary clause to one calm supporting line beneath it:

```tsx
        <h1
          style={{
            fontFamily: 'var(--font-display), sans-serif', fontWeight: 900,
            fontSize: 'clamp(44px, 6.6vw, 108px)', lineHeight: 0.9,
            letterSpacing: '-0.04em', textTransform: 'uppercase', color: '#fff',
            margin: '16px 0 0',
          }}
        >
          Your private space is live.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 'clamp(15px, 1.7vw, 19px)',
            color: 'rgba(255,255,255,0.55)', margin: '18px 0 0', maxWidth: '32ch',
            marginInline: 'auto', lineHeight: 1.5,
          }}
        >
          Private autonomy, on your key.
        </p>
```

- [ ] **Step 2: Add the hover-lift to `.io-btn`**

In `app/globals.css`, in the `.io-btn:hover` rule (~line 88), add a `translateY(-2px)` lift. Keep the existing hover declarations; append the transform. If the hover block has no `transform`, add:

```css
.io-btn:hover {
  /* …existing hover declarations… */
  transform: translateY(-2px);
}
```

Confirm `.io-btn` (line 65) already transitions `transform` — it does via the base `transition`; if not, add `transform` to its `transition` list. Leave `.io-btn:active { transform: scale(0.96); }` (line 93) intact — active overrides hover on press.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Visual verify — one H1, one lifted CTA**

Dev server: screenshot the hero. Expected: a single H1 headline, one supporting line beneath, the accent "Get access" button lifting 2px on hover with the existing (unchanged) shadow system. Confirm no banned vocab in the new copy.

- [ ] **Step 5: Commit**

```bash
git add components/ScrollExplode.tsx app/globals.css
git commit -m "feat(hero): single H1 + supporting line, io-btn hover-lift"
```

---

### Task 5: Full-spec verification pass

**Files:** none — verification only.

- [ ] **Step 1: Typecheck clean**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: compiles successfully.

- [ ] **Step 3: End-to-end scrub**

Dev server, top to bottom: (a) GymScene camera glides continuously, no jitter, no dead scroll into the next section; (b) each of the four card sections animates in once, staggered, calm; (c) hero shows one H1 + one lifted CTA.

- [ ] **Step 4: Banned-vocab sweep**

Run: `grep -rniE "\bnode\b|\btoken\b|\bgym\b|\btrain\b|workout|membership|\btier\b|\bpartner\b|network" components/ app/ | grep -v node_modules`
Expected: no NEW banned terms in copy introduced by this branch (pre-existing internal identifiers like `GymScene`/`GymSpin` component names are out of scope — vocab rule governs user-facing copy).

- [ ] **Step 5: Commit any final tuning, then the branch is ready for review.**

---

## Self-Review

- **Spec coverage:** §1 Camera spline → Task 1. §2 Timing/dead-zone → Task 2. §3 Spatial entrances → Task 3. §4 Hero → Task 4. Verification plan (§tsc, scrub, cards, hero screenshot, vocab) → Task 5. All covered.
- **Non-goals respected:** no pipeline/ScrollExplode/GymSpin-internals rebuild (only copy in ScrollExplode, only card wrappers in GymSpin); no new deps; `frameloop="demand"` + `dpr=[1,1.5]` + `antialias:false` kept; no generic CSS churn (one scoped `.io-spatial` system).
- **Type consistency:** `curveRef: { current: THREE.CatmullRomCurve3 | null }` defined identically in `GymScene`, `Model`, `CameraRig`. `_camPos`/`_lookAt` module scratch vectors. `.io-spatial` / `.io-spatial-parent` / `io-hl-visible` used consistently across CSS + RevealObserver + components.
- **Reduced-motion + fallback:** `.io-spatial` added to both the `io-fallback-visible` watchdog and the `prefers-reduced-motion` block — cards can't get stuck hidden.
