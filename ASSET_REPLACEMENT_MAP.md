# Iron Oasis V3 — Asset Replacement Map

Complete audit of placeholder elements and their replacement paths. No changes needed until assets arrive.

---

## 1. Scene5AppExperience — App Screenshots

**Component:** `components/v3/scenes/Scene5AppExperience.tsx`

**Placeholder Location:** Lines 110–115

```jsx
{/* Reserved app-frame placeholder — swap the inner content for real
    product screens when they exist. The device itself is the whole
    scene; the caption is a small live label printed on its screen,
    not a separate title competing with it. */}
<div className="relative flex h-[380px] w-[192px] flex-col items-center justify-center rounded-[30px] border border-[#C9A84C]/30 bg-white/[0.02]">
  <div className="absolute left-1/2 top-3 h-1 w-9 -translate-x-1/2 rounded-full bg-white/10" />
  {/* Content goes here */}
</div>
```

**Replacement Strategy:**

- **What exists:** Empty phone-frame container (380px tall, 192px wide) with notch, glow effect, and caption overlay.
- **Expected assets:** 3 app screenshot images (one per step/beat in STEPS array).
- **Beats:** Beat 0 = "Booking", Beat 1 = "Sessions", Beat 2 = "Results"
- **Format:** PNG or WebP, 192×380px native resolution (1x), or 384×760px for 2x density.
- **Integration point:** Add `<img>` inside the frame div, opacity driven by the same `beatOpacity()` curve controlling the caption.
- **Path suggestion:** `public/screens/app-booking.webp`, `app-sessions.webp`, `app-results.webp`

**Current Behavior:**

- Scenes switch caption labels (lines 117–132) but no image content; just the empty frame.
- Caption opacity tracked via `captionRefs` array; mirror this with image opacity refs.

**Implementation Notes:**

- No React state changes needed; push image opacity to DOM refs just like captions.
- Each image can fade-in/hold/fade-out in sync with its beat via the existing `update(progress)` → `beatOpacity()` path.
- Consider if images should stack (one div inside frame) or swap visibility (map over array).

---

## 2. Scene6LocationTrust — Exterior/Entrance Footage

**Component:** `components/v3/scenes/Scene6LocationTrust.tsx`

**Placeholder Location:** Lines 127–133

```jsx
<div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-[18px] border border-[#C9A84C]/30 bg-white/[0.02]">
  <div
    ref={frameGlowRef}
    className="absolute inset-0 opacity-0 transition-opacity duration-500"
    style={{ boxShadow: "0 0 50px 6px rgba(201, 168, 76, 0.1) inset" }}
  />
</div>
```

**Replacement Strategy:**

- **What exists:** Empty 16:9 frame with golden glow on active beat.
- **Expected assets:** Still image or video, 16:9 aspect ratio (e.g., 1920×1080 or 1280×720).
- **Beats:** Single frame shown per beat (0–4), swapped via `activeStep` index computed in `update()`.
- **Options:** 
  - **Static images:** One per step. Store at `public/locations/step-{0–4}.webp`.
  - **Video:** One continuous video, scrub to timestamp per beat (more cinematic but requires video scrubbing logic).
- **Format:** WebP or MP4 (if video); static images recommended for initial parity with Scene5.
- **Path suggestion:** `public/locations/exterior.webp`, `entrance.webp`, `gym-floor.webp`, `training-area.webp`, `sanctuary.webp`

**Current Behavior:**

- Frame sits empty; glow activates when a step is "active" (opacity > 0.5 at its beat).
- `activeStep` index is already computed (line 89–93); ready to index into an array of image URLs.

**Integration Notes:**

- Swap frame's background-image or add an `<img>` with `src={LOCATION_IMAGES[activeStep]}`.
- Use `activeStep` to control which image appears; no timing math needed beyond what's already there.
- If using video, would need a `<video>` element with `currentTime` scrubbed by progress, or separate clips per beat.

---

## 3. Scene7FinalAccess — App Store / Play Store Badges

**Component:** `components/v3/scenes/Scene7FinalAccess.tsx`

**Placeholder Location:** Lines 160–168

```jsx
{/* Beat 2 — placeholder store badges. No listing exists yet; these
    are visual placeholders reserved for real App Store / Google
    Play badges once the app ships. */}
<div className="flex items-center gap-4">
  <span className="flex h-12 w-[152px] items-center justify-center rounded-[10px] border border-[#C9A84C]/30 bg-white/[0.02] font-display text-[12px] font-medium uppercase tracking-[0.18em] text-[#b8b8b8]">
    App Store
  </span>
  <span className="flex h-12 w-[152px] items-center justify-center rounded-[10px] border border-[#C9A84C]/30 bg-white/[0.02] font-display text-[12px] font-medium uppercase tracking-[0.18em] text-[#b8b8b8]">
    Google Play
  </span>
</div>
```

**Replacement Strategy:**

- **What exists:** Text-only placeholder boxes (152×48px each).
- **Expected assets:** Official App Store and Google Play badge images.
- **Format:** PNG or SVG with transparent background; Apple and Google provide official logos.
- **Link destinations:** 
  - App Store: Update `href` in the CTA button (line 181) or add here as separate link badges.
  - Google Play: Same as above.
- **Path suggestion:** `public/badges/app-store.svg`, `google-play.svg`

**Current Behavior:**

- Placeholder boxes are styled to match the UI aesthetic (gold border, dark background).
- Beat 2 opacity driven by `beatOpacity()` with weight 0.7 (quickest beat).

**Implementation Notes:**

- Replace `<span>` elements with `<a>` + `<img>` or `<a>` + `<svg>`.
- Wrap each in a link pointing to the respective store listing URL.
- Consider if badges should be downloadable from Apple/Google's brand guidelines or use official API endpoints.
- Keep aspect ratio and sizing consistent with Apple/Google requirements (typically 170×40px each).

---

## 4. Scene7FinalAccess — CTA Button

**Component:** `components/v3/scenes/Scene7FinalAccess.tsx`

**Placeholder Location:** Lines 180–185

```jsx
<a
  href="#"
  className="inline-flex items-center justify-center rounded-full border border-[#C9A84C] px-10 py-4 font-display text-[14px] font-medium uppercase tracking-[0.3em] text-[#C9A84C] transition-colors duration-300 hover:bg-[#C9A84C] hover:text-black"
>
  Request Private Access
</a>
```

**Replacement Strategy:**

- **What exists:** Placeholder button with `href="#"`.
- **Replacement target:** Replace `"#"` with real flow URL.
- **Destination options:**
  1. **Waitlist form:** e.g., `/waitlist` or external link to Notion form / Typeform.
  2. **Membership application:** Link to membership intake flow.
  3. **Calendar booking:** Link to Calendly or custom booking interface.
- **No asset needed:** This is a link href replacement, not an image.

**Current Behavior:**

- Button is the 3rd beat (heaviest weight, 1.6 of 3.3 total).
- Opacity and pointer events controlled by `beatOpacity()`.
- On-screen during the gym backdrop's full-brightness reveal.

**Integration Notes:**

- Update `href` value to the real flow URL once decided.
- Optional: Add analytics tracking (e.g., `onClick` handler) to measure CTA engagement.
- Consider button text dynamism if the flow changes (e.g., "Join Waitlist" vs. "Apply Now").

---

## 5. 3D Assets — Gym Model & HDRI

**Component:** `components/v3/assets/registry.ts` and `components/v3/three/GymModel.tsx`

**Current Assets:**

- **GLB Model:** `public/gym-space-2k.glb` and `public/gym-space-2k-opt.glb` (optimized)
- **HDRI:** `public/hdri/studio_small_03_1k.hdr` (active) + `public/hdri/lebombo_1k.hdr` (fallback)

**Replacement Strategy:**

- **What exists:** Full gym interior model with pre-baked lighting and HDRI environment maps.
- **No immediate change needed:** Scenes 2/3 rely on these; GymBackdrop reuses the same model for Scenes 4–7.
- **Future considerations:**
  - If real gym footage is captured for Scene6/7, could supplement GLB with video overlays or replace with 2D photography.
  - Current architecture keeps GLB as the anchor for CameraRig continuity; any replacement would require rethinking camera choreography.

**No Action Required:** These are in place and working. Document only for reference.

---

## 6. Global Asset Infrastructure

**Asset Directory Structure:**

```
public/
├── gym-space-2k.glb              # 3D gym model (Scenes 2/3, GymBackdrop)
├── gym-space-2k-opt.glb          # Optimized variant
├── hdri/
│   ├── studio_small_03_1k.hdr    # Active HDRI (warm studio)
│   └── lebombo_1k.hdr            # Fallback HDRI
├── frames/
│   ├── logo_*.webp               # Logo animation frames (Scenes 0/1)
│   └── ...
├── screens/                       # NEW — for Scene5 app screenshots
│   ├── app-booking.webp
│   ├── app-sessions.webp
│   └── app-results.webp
├── locations/                     # NEW — for Scene6 location imagery
│   ├── exterior.webp
│   ├── entrance.webp
│   ├── gym-floor.webp
│   ├── training-area.webp
│   └── sanctuary.webp
└── badges/                        # NEW — for Scene7 store badges
    ├── app-store.svg
    └── google-play.svg
```

**No code changes required** until assets are ready. Directories can be created on-demand.

---

## 7. Timeline — When Each Asset Path is Critical

| Phase | Asset | Component | Blocking? | Notes |
|-------|-------|-----------|-----------|-------|
| Dev | App screenshots | Scene5 | No | Empty frame is acceptable; placeholder caption works. |
| Dev | Location footage | Scene6 | No | Empty frame is acceptable; glow works independently. |
| Dev | Store badges | Scene7 | No | Placeholder text conveys intent. |
| Dev | CTA href | Scene7 | Yes | Button needs real destination for testing flows. |
| QA | All images | All | Yes | Visual/UX testing requires seeing final imagery. |
| Launch | All images + links | All | Yes | All placeholders must be swapped before public release. |

---

## 8. Integration Checklist for Each Asset

### Scene5 App Screenshots

- [ ] Acquire 3 high-fidelity screenshots (Booking, Sessions, Results).
- [ ] Export as WebP (192×380px).
- [ ] Add to `components/v3/scenes/Scene5AppExperience.tsx`:
  - [ ] Import `const APP_SCREENS = ['booking.webp', 'sessions.webp', 'results.webp'];`
  - [ ] Add `<img>` inside frame div, keyed to `activeStep`.
  - [ ] Wire opacity to existing `captionRefs` timing (no new timing logic needed).
- [ ] Test: each image fades in/holds/fades out on its beat.

### Scene6 Location Footage

- [ ] Acquire exterior/entrance/gym floor footage (5 shots or 1 video).
- [ ] Export as WebP (1920×1080 or 1280×720 for images; 1920×1080 30fps H.264 for video).
- [ ] Add to `components/v3/scenes/Scene6LocationTrust.tsx`:
  - [ ] Import `const LOCATION_IMAGES = ['exterior.webp', ...];`
  - [ ] Replace empty frame with `<img src={LOCATION_IMAGES[activeStep]} />` or `<video>`.
  - [ ] (Video option: scrub `currentTime` by progress; requires additional timing logic.)
- [ ] Test: frames/video appear when corresponding text is active.

### Scene7 Store Badges

- [ ] Download official App Store and Google Play badges from Apple/Google brand sites.
- [ ] Export as SVG or PNG with transparency (170×40px each).
- [ ] Add to `components/v3/scenes/Scene7FinalAccess.tsx`:
  - [ ] Replace `<span>` placeholder with `<a href="<app-store-url>"><img src="app-store.svg" /></a>`.
  - [ ] Repeat for Google Play.
- [ ] Test: badges appear during Beat 2, links resolve to correct stores.

### Scene7 CTA Button

- [ ] Decide membership/waitlist flow destination URL.
- [ ] Update `href="#"` → `href="<destination-url>"`.
- [ ] (Optional) Add GA4 tracking or event handler.
- [ ] Test: button resolves to the intended flow, CTA appears during Beat 3.

---

## 9. Notes for Future Asset Integration

- **No architectural changes required.** All placeholders are ready for content swap via direct prop/src updates.
- **Timing is locked in.** Opacity and visibility for Scene5/6/7 are driven by existing `beatOpacity()` curves; images inherit the timing automatically.
- **Performance consideration:** For Scene5/6 images, consider lazy-loading or pre-loading during Scenes 0–4 to avoid jank on first appearance.
- **Mobile optimization:** All image dimensions should be tested on mobile (viewport widths 375px–1440px).
- **Fallbacks:** Consider how to gracefully degrade if assets fail to load (e.g., retain placeholder text or a solid color background).

---

**Last Updated:** 2026-08-06 (Animation phase complete)  
**Next Phase:** Asset capture & integration (when real images/videos arrive)
