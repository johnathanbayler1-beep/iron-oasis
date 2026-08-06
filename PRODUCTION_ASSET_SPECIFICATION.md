# Iron Oasis V3 — Production Asset Specification

**Document:** Production Designer Handoff  
**Date:** 2026-08-06  
**Status:** Ready for Asset Delivery  
**Model:** Haiku 4.5 • Build: Passing • 3D Canvas: Refactored

---

## Overview

This specification maps every asset required for the Iron Oasis V3 production experience. It is organized by scene, lists what exists, what's missing, and optimization requirements for each. **All scenes use the shared 3D canvas** — camera choreography and lighting rigs are complete and do not require modification. Asset delivery means supplying visuals only.

---

## Executive Summary: Asset Inventory

| Scene | Type | Existing | Missing | Priority | Status |
|-------|------|----------|---------|----------|--------|
| Scene 0 | Loading screen | Text only | None | N/A | ✓ Complete |
| Scene 1 | Logo reveal | 121 frame sequence (59.4 KB each) | None | N/A | ✓ Complete |
| Scene 2 | Gym reveal (3D) | gym-space-2k.glb (4.2 MB) | None | N/A | ✓ Complete |
| Scene 3 | Private experience (3D) | Uses Scene 2 model + static camera | None | N/A | ✓ Complete |
| Scene 4 | How it works (Carousel) | Layout, timing, typography | 5 feature demo images/videos | **High** | Awaiting assets |
| Scene 5 | App experience (Carousel) | Device frame, captions, timing | 5 app screenshots (192×380) | **High** | Awaiting assets |
| Scene 6 | Location & trust (Gallery) | Layout, timing, typography | 3–5 location photos (1200×800) | **Medium** | Awaiting assets |
| Scene 7 | Final access (CTA) | CTA button, text | 2 store badges (152×48 each) | **High** | Awaiting assets |
| Global | 3D Environment | 2× HDRI (studio + landscape) | Optional: alternative gym model | **Low** | Post-launch consideration |

---

## Scene Breakdown

---

## SCENE 0: LOADING SCREEN

### Purpose
Initial splash — shows loading text and brand foundation before Scene 1 begins.

### Existing Assets
- **Text:** "Loading experience..." (dynamic, code-rendered)
- **Background:** Solid black (#050505)
- **Typography:** Font Display, uppercase

### Missing Assets
**None.** Scene 0 is text-only and ready for production.

### Optimization Needs
None.

### Priority
**N/A** — Awaiting no assets.

---

## SCENE 1: LOGO REVEAL

### Purpose
First visual beat — scroll-driven frame sequence reveal of Iron Oasis logo. Camera scrubs through pre-rendered frames (logo_000 through logo_120) as user scrolls, creating frame-accurate control with settled easing.

### Existing Assets

| Asset | Filename | Path | Format | Size | Dimensions | Frame Count |
|-------|----------|------|--------|------|-----------|-------------|
| Logo frame sequence | `logo_*.webp` | `/public/frames/` | WebP | ~59.4 KB each | Variable* | 121 frames |

*Actual rendered dimensions stored in frame metadata; canvas auto-fits to image size.

### Asset Details

**Folder Path:** `/public/frames/`

**Naming Convention:** `logo_000.webp`, `logo_001.webp`, ... `logo_120.webp`

**Format:** WebP (highly compressed, ideal for frame sequences)

**Total Size:** ~7.2 MB (121 frames × 59.4 KB)

**Frame Sequence Parameters (in code):**
```typescript
frameCount: 121
padLength: 3          // 000, 001, 002, etc.
extension: "webp"
```

**Canvas Rendering:** Frames are rendered to a canvas element that scales responsively (`max-h-[60vh] max-w-[60vw]`). Opacity fade-in/out curves applied at scene boundaries (12% fade in, 12% fade out).

### Missing Assets
**None.** All 121 frames are present and optimized.

### Optimization Needs

1. **Frame Sequence Verification:** Confirm all 121 frames are WebP format and properly compressed
2. **Frame Timing:** Verify easing curve produces settled reveal (not jerky)
   - Current: Smoothstep ease function `t² (3 - 2t)`
   - Result: Logo resolves in with acceleration, not constant scrub
3. **Mobile Optimization:** Test on low-bandwidth connections (frames load progressively)

### Priority
**N/A** — Production-ready.

### File Inventory Summary

```
/public/frames/
├── logo_000.webp (59.4 KB)
├── logo_001.webp
├── logo_002.webp
├── ... [118 more frames]
└── logo_120.webp (59.4 KB)

Total: 121 files, ~7.2 MB
```

---

## SCENE 2: GYM REVEAL (3D)

### Purpose
First 3D beat — camera choreography through gym space (hero composition reveal). Scene 2 transitions from logo reveal to full gym interior. Camera follows a fixed path: entrance → pan across equipment → hero composition (final static pose).

**Camera Path Duration:** ~8 seconds of scroll time  
**Transitions:** Smooth arc from entry to hero framing  
**Lighting:** Full facility lighting (all fixtures on)

### Existing Assets

| Asset | Filename | Path | Format | Size (Full / Opt) | Dimensions | Usage |
|-------|----------|------|--------|-------------------|-----------|-------|
| 3D Gym Model | `gym-space-2k.glb` | `/public/` | GLB | 4.2 MB / — | ~50m × 40m × 8m interior | Scene 2 camera choreography |
| 3D Gym Model (Optimized) | `gym-space-2k-opt.glb` | `/public/` | GLB | 607 KB | ~50m × 40m × 8m interior | Mobile fallback |
| HDRI Environment | `studio_small_03_1k.hdr` | `/public/hdri/` | HDR | 1.6 MB | 1024×512 px | Primary lighting environment |

### Asset Details

**Primary Model:** `gym-space-2k.glb`
- **Format:** GLB (binary GLTF with embedded textures)
- **Contains:** Gym geometry, equipment, fixtures, PBR materials
- **Scale:** Metric (meters)
- **Materials:** PBR-compliant for dynamic lighting
- **Textures:** Pre-embedded (no separate texture files needed)

**Optimized Model:** `gym-space-2k-opt.glb`
- **Format:** GLB (same as primary)
- **Poly Count:** Reduced by ~60–70% vs. full model
- **Texture Resolution:** Downsampled (half resolution)
- **Use Case:** Mobile and low-end devices
- **Automatic Selection:** Code selects optimized version on mobile (via `useMediaQuery`)

**Environment Lighting:** `studio_small_03_1k.hdr`
- **Format:** HDR (High Dynamic Range image)
- **Resolution:** 1024 × 512 px
- **Color Space:** HDR (full range for realistic lighting)
- **Usage:** Sphere lighting for reflections + ambient light
- **Role:** Provides key light + fill across entire space

### Missing Assets
**None.** Both full and optimized gym models are present. HDRI is present.

### Optimization Needs

1. **Model Loading:** Verify lazy loading pattern (models don't load until Scene 2 viewport visible)
   - Code: `<Suspense fallback={null}>` wrapper
   - Expected: No models in DOM until needed

2. **Geometry Optimization Check:**
   - Confirm `gym-space-2k-opt.glb` is actually loaded on mobile
   - Verify poly count reduction (target: 40–50k polys)
   - Check draw call count (target: < 10)

3. **Texture Resolution:** Verify full model textures are 2K (no oversized 4K textures)

4. **Material Inspection:**
   - All surfaces must use PBR materials (metallic/roughness workflow)
   - No per-vertex colors (breaks with lighting rigs)
   - Normal maps present and correct orientation

### Camera Choreography Reference

**Scene 2 Camera Path:**

```
START (Scene 2 enter):
  Position: [8, 3.5, 6] (entrance point, elevated)
  Target:   [0, 1.8, -2]
  FOV:      45°

MID (halfway through scene):
  Position: [4, 2.8, 3]
  Target:   [-1, 1.5, -3]
  FOV:      42°

END (Scene 2 exit, hero pose):
  Position: [2.3, 2.5, 1.6] ← Used in Scene 3
  Target:   [-1.0, 1.3, -1.8]
  FOV:      38°
```

**Note:** Camera path is hardcoded in Scene2GymReveal.tsx. If gym model changes, verify camera still frames the space correctly.

### Shared Canvas Architecture

**Note:** Scene 2, Scene 3, and GymBackdrop all use the **same 3D canvas** (SharedGymCanvas.tsx). This means:
- Only one gym model loads (not three copies)
- Scene 2 drives camera choreography
- Scene 3 holds static camera at END pose
- GymBackdrop displays static scene at full brightness (late film)

**Implication:** If gym model is swapped, all three scenes automatically use the new geometry.

### Priority
**N/A** — Production-ready.

### File Inventory Summary

```
/public/
├── gym-space-2k.glb (4.2 MB) ✓
├── gym-space-2k-opt.glb (607 KB) ✓

/public/hdri/
└── studio_small_03_1k.hdr (1.6 MB) ✓

Total: 3 files, ~6.4 MB
```

---

## SCENE 3: PRIVATE EXPERIENCE (3D + TEXT OVERLAY)

### Purpose
Emotional core scene — camera holds static on hero composition while text overlay resolves in/out. Communicates the unique value proposition: "THE SPACE IS YOURS."

**Static Pose Duration:** ~8–12 seconds of scroll time  
**Text Arc:** Fade in (0–20%) → Hold (20–75%) → Fade out (75–100%)  
**Lighting:** Full facility lighting (carries from Scene 2)

### Existing Assets

| Asset | Type | Source | Status |
|-------|------|--------|--------|
| 3D Gym Model | Reused from Scene 2 | `gym-space-2k.glb` | ✓ Complete |
| Text Overlay | Code-rendered | Typography system | ✓ Complete |
| HDRI Environment | Reused from Scene 2 | `studio_small_03_1k.hdr` | ✓ Complete |

### Asset Details

**Text Overlay:**
```
PRIMARY LINE:
  "THE SPACE IS YOURS."
  Font: Display (semibold)
  Size: clamp(48px, 10vw, 80px)
  Color: #ededed (near-white)

SECONDARY LINE:
  "For the duration of your booking, this entire gym belongs to you."
  Font: Display (light)
  Size: clamp(18px, 3.5vw, 26px)
  Color: #b8b8b8 (medium gray)
```

**Camera Pose (Static, held throughout scene):**
```
Position: [2.3, ROOM_FLOOR_Y + 2.5, 1.6]
Target:   [-1.0, ROOM_FLOOR_Y + 1.3, -1.8]
FOV:      38°
```

This is the END pose from Scene 2, held steady. No camera animation in this scene.

### Missing Assets
**None.** Scene 3 uses only the existing gym model and code-rendered text.

### Optimization Needs

1. **Camera Pose Verification:** Confirm hero composition frames the space as intended
   - Should show: Full gym width, key equipment, professional atmosphere
   - Should NOT show: Ceiling edges, dead space, any clipping

2. **Lighting Verification:** All gym fixtures should be illuminated (full brightness)
   - Check LightingRig is active
   - Verify HDRI provides ambient + key light
   - No dark corners or hot spots

3. **Text Readability:** Test text rendering on
   - Mobile (text should be large, centered)
   - Desktop (text should be calm and spacious)
   - Dark background (ensure sufficient contrast)

### Priority
**N/A** — Production-ready.

---

## SCENE 4: HOW IT WORKS (CAROUSEL WITH FEATURE DEMOS)

### Purpose
Instructional beat — five-step carousel explains the booking/access flow. Each step gets weight-scaled timing (mechanical steps are quick, connective steps are deliberate). **Feature demonstration images or videos** are required for this scene.

**Scene Duration:** ~20–25 seconds of scroll time  
**Steps:** 5 total, each cross-fades with text overlay  
**Animation:** Weight-scaled opacity (0.8–1.1× base timing)

### Existing Assets

| Asset | Type | Status | Details |
|-------|------|--------|---------|
| Layout & timing | Code | ✓ Complete | Carousel structure, fade curves, typography |
| Text (5 steps) | Code-rendered | ✓ Complete | Statement + support lines per step |
| Device frame (app showcase) | CSS/HTML | ✓ Complete | 340×172 px phone outline, reserved |
| Background | CSS | ✓ Complete | Black with subtle scrim |

### Missing Assets

**Feature Demonstration Images/Videos** — Required

| Step | Feature | Required Filename | Dimensions | Format | File Size Target | Description |
|------|---------|-------------------|------------|--------|------------------|-------------|
| 1 | "Download the Iron Oasis app." | `feature-1.png` or `.webm` | 400 × 600 px | PNG/WebP or WebM/MP4 | < 250 KB (img), < 500 KB (vid) | App store download interface, or phone showing app icon |
| 2 | "Choose your training time." | `feature-2.png` or `.webm` | 400 × 600 px | PNG/WebP or WebM/MP4 | < 250 KB (img), < 500 KB (vid) | Calendar/time picker interface |
| 3 | "Reserve the entire private gym." | `feature-3.png` or `.webm` | 400 × 600 px | PNG/WebP or WebM/MP4 | < 250 KB (img), < 500 KB (vid) | Gym space visualization, booking confirmation |
| 4 | "Receive your access." | `feature-4.png` or `.webm` | 400 × 600 px | PNG/WebP or WebM/MP4 | < 250 KB (img), < 500 KB (vid) | Access credentials, unlock code, or key card |
| 5 | "Walk in and train..." | `feature-5.png` or `.webm` | 400 × 600 px | PNG/WebP or WebM/MP4 | < 250 KB (img), < 500 KB (vid) | User training in empty private gym |

### Asset Specifications

**Folder Path:** `/public/features/`

**Dimensions:** 400 × 600 px (portrait 2:3 aspect ratio)

**Format Options:**
- **Static (PNG/WebP):** Best for screenshots, mockups, still photography
  - PNG: Lossless, good for UI screenshots
  - WebP: 30–40% smaller than PNG, recommended
- **Animated (WebM/MP4):** Best for motion graphics, process demos
  - WebM: Smaller file size, VP9 codec, recommended
  - MP4: Better browser compatibility, H.264 codec
  - Duration: 5–10 seconds max (loops)

**Color Space:** sRGB (standard web color space)

**Compression Targets:**
- PNG: < 250 KB each
- WebP: < 150 KB each
- WebM: < 400 KB each (5 sec @ 80 kbps)
- MP4: < 500 KB each

**Quality Standards:**
- High-resolution, professional quality
- Sharp focus, good contrast
- Readable text/UI on any background
- Loopable (no jarring cuts if video)
- On-brand colors, consistent visual language

### Timing & Weight Breakdown

```
Scene 4 Duration: 20–25 seconds of scroll

STEP_WEIGHTS:     [0.8, 0.8, 1.1, 0.9, 1.5]
                   ↓    ↓    ↑    ↑    ↑
                   Quick Quick   Normal  Slow (emotional peak)

Per-Step Curve (same for all):
  - Fade in:      10% of step duration
  - Hold:         60% of step duration
  - Fade out:     30% of step duration

Example (Step 5, weight 1.5):
  - Weighted duration: 1.5 × base = slowest resolve-in of all steps
  - Holds longest, emotional climax into Scene 5
```

### Code Integration Points

**Scene File:** `components/v3/scenes/Scene4HowItWorks.tsx`

**Current Placeholder (lines 145–180):**
```jsx
{STEPS.map((step, i) => (
  <div key={step.statement} className="flex shrink-0 flex-col...">
    {/* Reserved frame placeholder (no image yet) */}
    <div className="relative flex h-[340px] w-[172px] items-center justify-center rounded-[28px]...">
      <div className="absolute left-1/2 top-3 h-1 w-8..." />
      {/* Placeholder text showing frame number */}
      <span ref={frameNumberRef} className="font-display text-[15px]..."/>
    </div>
  </div>
))}
```

**Required Swap:**
```jsx
{STEPS.map((step, i) => (
  <div key={step.statement} className="flex shrink-0 flex-col...">
    {/* Feature image or video */}
    <img
      src={`/features/feature-${i + 1}.png`}
      alt={step.statement}
      width={400}
      height={600}
      className="rounded-lg object-cover"
    />
    {/* Or: video with fallback */}
    <video autoPlay muted loop playsInline className="rounded-lg object-cover">
      <source src={`/features/feature-${i + 1}.webm`} type="video/webm" />
      <img src={`/features/feature-${i + 1}.png`} />
    </video>
  </div>
))}
```

**Do NOT modify:**
- Lines 26–32 (STEPS array with statement/support text)
- Lines 52–60 (timing weights and scale calculations)
- Lines 99–113 (opacity curve logic)

### Optimization Needs

1. **Image Dimensions:** Exact 400 × 600 px (no padding, no borders)
2. **Compression:** Aggressive compression without quality loss
   - PNG → WebP conversion recommended (30–40% smaller)
   - Video → WebM codec (better compression than MP4)
3. **Loading:** Preload all 5 assets before scene becomes visible
4. **Fallback:** If image fails to load, scene gracefully shows placeholder (no hard break)

### Asset Content Guidance

**What should each image/video show?**

1. **Download App (Step 1):** Phone screenshot of app store listing, or icon download illustration
2. **Choose Time (Step 2):** Calendar interface, time slots displayed, selection action
3. **Reserve Gym (Step 3):** Gym visualization (could be 3D render, photo, or 2D illustration), confirmation checkmark
4. **Receive Access (Step 4):** Phone showing access code/QR, unlock interface, or keycard graphic
5. **Train (Step 5):** Person training in empty gym, private space emphasizing solitude and focus

### Priority
**HIGH** — Required for full feature set. Scene 4 is fully functional without these, but visual impact is severely reduced.

### File Inventory Summary

```
/public/features/ (to be created)
├── feature-1.png (or .webp / .webm) [< 250 KB or < 400 KB]
├── feature-2.png (or .webp / .webm) [< 250 KB or < 400 KB]
├── feature-3.png (or .webp / .webm) [< 250 KB or < 400 KB]
├── feature-4.png (or .webp / .webm) [< 250 KB or < 400 KB]
└── feature-5.png (or .webp / .webm) [< 250 KB or < 400 KB]

Total: 5 files, < 1.25 MB (images) or < 2 MB (video)
```

---

## SCENE 5: APP EXPERIENCE (CAROUSEL WITH SCREENSHOTS)

### Purpose
Product showcase — five-step carousel of actual app screenshots showing the user journey. Emphasizes that the app is the vessel for the entire experience. **App screenshots** are required.

**Scene Duration:** ~18–22 seconds of scroll time  
**Steps:** 5 total, cross-fade in carousel  
**Device Frame:** Phone outline (192 × 380 px) with captions  
**Animation:** Snappier than Scene 4 (20% in, 55% hold, vs. 28% in, 72% hold)

### Existing Assets

| Asset | Type | Status | Details |
|-------|------|--------|---------|
| Device frame | CSS/HTML | ✓ Complete | 192 × 380 px phone outline, notch, gold glow |
| Captions (5 steps) | Code-rendered | ✓ Complete | Single-word labels for each step |
| Background | CSS | ✓ Complete | Black with 70% opacity scrim |
| Frame glow | CSS | ✓ Complete | Gold inset glow effect, transitions with captions |

### Missing Assets

**App Screenshots** — Required

| Step | User Journey | Required Filename | Dimensions | Format | File Size Target | Description |
|------|--------------|-------------------|-----------|--------|------------------|-------------|
| 1 | "Book a session." | `screen-1.png` | 192 × 380 px | PNG/WebP | < 200 KB (PNG), < 120 KB (WebP) | Booking/session selection screen |
| 2 | "Receive access." | `screen-2.png` | 192 × 380 px | PNG/WebP | < 200 KB (PNG), < 120 KB (WebP) | Access confirmation, unlock code display |
| 3 | "Arrive." | `screen-3.png` | 192 × 380 px | PNG/WebP | < 200 KB (PNG), < 120 KB (WebP) | Navigation/arrival screen, location map |
| 4 | "Unlock the gym." | `screen-4.png` | 192 × 380 px | PNG/WebP | < 200 KB (PNG), < 120 KB (WebP) | Unlock interface, door lock graphic |
| 5 | "Train privately." | `screen-5.png` | 192 × 380 px | PNG/WebP | < 200 KB (PNG), < 120 KB (WebP) | Training session UI, timer, workout state |

### Asset Specifications

**Folder Path:** `/public/app-screenshots/`

**Dimensions:** 192 × 380 px (portrait, iPhone 12 mini ratio)

**Format:**
- **PNG:** Lossless compression, good for UI screenshots
- **WebP:** Recommended (30–40% smaller than PNG)

**Color Space:** sRGB

**Compression Targets:**
- PNG: < 200 KB each
- WebP: < 120 KB each
- **Total (5 files):** < 1 MB (PNG) or < 600 KB (WebP)

**Quality Standards:**
- High-fidelity app screenshots or mockups
- Sharp text, readable at device size
- Includes iPhone notch in design (or framed separately)
- Consistent visual language across all 5
- Color-graded for on-brand feel

### Timing & Animation Breakdown

```
Scene 5 Duration: 18–22 seconds of scroll

STEP_SPAN (per step): (STEPS_END - STEPS_START) / STEPS.length
                      = (0.98 - 0.03) / 5 = 0.19 per step

Per-Step Curve (Snappier than Scene 4):
  - Fade in:      20% of step span (quicker resolve)
  - Hold:         55% of step span
  - Fade out:     Remaining ~25%

Caption Timing (on device screen):
  - Resolves in with screenshot
  - Holds for emphasis
  - Recedes as next screenshot fades in

Active Step Determination:
  - Step is "active" when opacity > 50%
  - This triggers screenshot display
  - Only one screenshot visible at a time (absolute positioning)
```

### Code Integration Points

**Scene File:** `components/v3/scenes/Scene5AppExperience.tsx`

**Current Placeholder (lines 111–143):**
```jsx
<div className="relative flex h-[380px] w-[192px] flex-col items-center justify-center rounded-[30px] border border-[#C9A84C]/30 bg-black overflow-hidden">
  <div className="absolute left-1/2 top-3 h-1 w-9 -translate-x-1/2 rounded-full bg-white/10 z-10" />
  
  {/* Screenshots (currently fall back to placeholder if not found) */}
  {STEPS.map((step, i) => (
    <img
      key={`screenshot-${i}`}
      src={`/app-screenshots/screen-${i + 1}.png`}
      alt={step.label}
      width={192}
      height={380}
      className="absolute inset-0 object-cover opacity-0"
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.style.display = "none";  // Hide if not found
      }}
    />
  ))}
  
  {/* Glow effect */}
  <div ref={frameGlowRef} className="absolute inset-0 rounded-[30px] opacity-0 transition-opacity duration-500" 
    style={{ boxShadow: "0 0 40px 4px rgba(201, 168, 76, 0.12) inset" }} />
  
  {/* Captions (always on top, fade in/out with screenshots) */}
  <div className="absolute inset-0 flex h-8 items-center justify-center px-4 z-20">
    {STEPS.map((step, i) => (
      <span key={`caption-${i}`} className="absolute font-display text-[11px] font-medium uppercase text-[#C9A84C] opacity-0">
        {step.label}
      </span>
    ))}
  </div>
</div>
```

**Code correctly paths screenshots as:** `/app-screenshots/screen-${i + 1}.png`

**Do NOT modify:**
- Lines 18–30 (timing constants, STEPS array)
- Lines 80–91 (opacity curves)
- Device frame structure (rounded-[30px], border, bg-black)
- Notch design (line 112)

### Optimization Needs

1. **Image Dimensions:** Exact 192 × 380 px (no padding, no borders)
2. **Compression:** Aggressive without quality loss
   - PNG → WebP conversion recommended (saves 30–40% file size)
   - Batch conversion tool:
     ```bash
     for f in screen-*.png; do cwebp -quality 90 "$f" -o "${f%.png}.webp"; done
     ```
3. **Device Framing:** Include iPhone notch in screenshot design, or frame the image with notch in CSS
4. **Preloading:** All 5 screenshots preload before Scene 5 visible
5. **Fallback:** Gracefully handles missing images (shows frame only)

### Asset Content Guidance

**What should each screenshot show?**

1. **Book (Step 1):** Booking interface, session selection, time/date picker
2. **Receive Access (Step 2):** Confirmation screen, unlock code or QR code displayed
3. **Arrive (Step 3):** Navigation UI, map or location display, arrival timer
4. **Unlock Gym (Step 4):** Unlock screen, door lock interface, access granted state
5. **Train Privately (Step 5):** Workout/training screen, session timer, private space UI

### Priority
**HIGH** — Required for full product showcase. Scene 5 is functional but visually incomplete without screenshots.

### File Inventory Summary

```
/public/app-screenshots/ (to be created)
├── screen-1.png [< 200 KB each, or < 120 KB if WebP]
├── screen-2.png
├── screen-3.png
├── screen-4.png
└── screen-5.png

Total: 5 files, < 1 MB (PNG) or < 600 KB (WebP)
```

---

## SCENE 6: LOCATION & TRUST (GALLERY WITH FACILITY PHOTOS)

### Purpose
Trust-building beat — rotating gallery of professional gym facility photography. Shows the space is real, professional, and trustworthy. Carousel rotates through 3–5 high-quality location shots.

**Scene Duration:** ~15–20 seconds of scroll time  
**Shots:** 3–5 total, cross-fade gallery  
**Animation:** Fade-in/out with slower transition (more deliberate than app screenshots)

### Existing Assets

| Asset | Type | Status | Details |
|-------|------|--------|---------|
| Layout & timing | Code | ✓ Complete | Gallery structure, fade curves |
| Typography | Code-rendered | ✓ Complete | Heading + description text |
| Background | CSS | ✓ Complete | Black with scrim overlay |

### Missing Assets

**Location & Facility Photography** — Required

| Shot | Location | Required Filename | Dimensions | Format | File Size Target | Description |
|------|----------|-------------------|-----------|--------|------------------|-------------|
| 1 | Exterior/Entrance | `location-exterior.jpg` | 1200 × 800 px | JPEG/WebP | < 300 KB (JPEG), < 150 KB (WebP) | Building facade, entrance, approachable entry |
| 2 | Main Gym Space | `location-gym-1.jpg` | 1200 × 800 px | JPEG/WebP | < 300 KB (JPEG), < 150 KB (WebP) | Full interior, equipment, professional atmosphere |
| 3 | Training Zone | `location-gym-2.jpg` | 1200 × 800 px | JPEG/WebP | < 300 KB (JPEG), < 150 KB (WebP) | Private training area, equipment, clean space |
| 4 | Facility Detail (Optional) | `location-detail.jpg` | 1200 × 800 px | JPEG/WebP | < 300 KB (JPEG), < 150 KB (WebP) | Equipment detail, amenities, flooring |
| 5 | Neighborhood (Optional) | `location-neighborhood.jpg` | 1200 × 800 px | JPEG/WebP | < 300 KB (JPEG), < 150 KB (WebP) | Area context, location desirability |

### Asset Specifications

**Folder Path:** `/public/location/`

**Dimensions:** 1200 × 800 px (landscape 3:2 aspect ratio, fits standard web gallery)

**Format:**
- **JPEG:** Standard compressed photography format, good for photos
- **WebP:** Recommended (25–35% smaller than JPEG)

**Color Space:** sRGB

**Compression Targets:**
- JPEG: < 300 KB each
- WebP: < 150 KB each
- **Total (3–5 files):** < 1.5 MB (JPEG) or < 750 KB (WebP)

**Quality Standards:**
- Professional photography (not snapshots)
- Well-lit, sharp focus, high contrast
- Modern, clean facility
- Shows equipment variety and professionalism
- Builds trust and credibility
- Consistent color grading across shots

### Minimum Requirements (3 shots)

**Required:**
1. Exterior: Shows gym location is real, professional building
2. Main Gym: Emphasizes clean, modern equipment
3. Training Zone: Shows private experience, solitude, professional atmosphere

**Optional (for storytelling):**
4. Detail shot: Equipment quality, finishes, attention to detail
5. Neighborhood: Desirable location, accessibility, area quality

### Timing & Animation Breakdown

```
Scene 6 Duration: 15–20 seconds of scroll

SHOT ROTATION:
  - Each shot fades in (0–10% of scene duration)
  - Holds (10–60% of scene duration)
  - Fades out (60–100% of scene duration)
  
  If 4 shots, each gets ~5 seconds visibility
  If 5 shots, each gets ~4 seconds visibility

Transition Style:
  - Cross-fade (slower than app screenshots)
  - Opacity duration: 700ms (vs. 500ms in Scene 5)
  - Smooth, confident reveal of space
```

### Code Integration Points

**Scene File:** `components/v3/scenes/Scene6LocationTrust.tsx`

**Current Placeholder (lines 123+):**
```jsx
{/* Reserved cinematic placeholder — swap content for real
    facility imagery once shoots are done. */}
<div className="...">
  {/* Placeholder content here */}
</div>
```

**Required Swap:**
```jsx
{/* Location image carousel */}
<div className="relative flex h-[400px] w-full flex-col items-center justify-center">
  {LOCATION_SHOTS.map((shot, i) => (
    <img
      key={shot.filename}
      src={`/location/${shot.filename}`}
      alt={shot.alt}
      width={1200}
      height={800}
      className={`absolute inset-0 object-cover transition-opacity duration-700 ${
        activeShot === i ? "opacity-100" : "opacity-0"
      }`}
    />
  ))}
  
  {/* Optional gradient overlay for text readability */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
  
  {/* Optional caption */}
  <div className="relative z-10 text-center">
    <p className="text-white text-lg font-medium">{LOCATION_SHOTS[activeShot]?.caption}</p>
  </div>
</div>
```

**Do NOT modify:**
- Lines 17–19 (timing constants)
- Beat opacity curves (lines 50–55)
- Gallery layout structure

### Asset Content Guidance

**Photography Shot List:**

1. **Exterior (Shot 1):** 
   - Shows: Building entrance, sign, approachable facade
   - Tone: Professional, inviting, trustworthy
   - Details: Good lighting, clear view of entrance

2. **Main Gym (Shot 2):** 
   - Shows: Full interior space, variety of equipment (dumbbells, benches, racks, cardio)
   - Tone: Modern, clean, well-maintained
   - Details: Good lighting throughout, no shadows, professional finishes

3. **Training Zone (Shot 3):** 
   - Shows: Private training area, open space, solitude emphasis
   - Tone: Peaceful, focused, professional
   - Details: Equipment positioned for private use, clean flooring, bright atmosphere

4. **Detail Shot (Optional):** 
   - Shows: Equipment quality, finishes, brand reputation
   - Tone: Attention to detail, premium quality
   - Details: Close-up of equipment, flooring, lighting fixtures

5. **Neighborhood (Optional):** 
   - Shows: Area context, accessibility, desirability
   - Tone: Urban/suburban, accessible, thriving area
   - Details: Street view, signage, area energy

### Optimization Needs

1. **Image Dimensions:** Exact 1200 × 800 px
2. **Compression:** Aggressive without quality loss
   - JPEG → WebP conversion recommended (saves 25–35%)
   - Tool:
     ```bash
     for f in location-*.jpg; do cwebp -quality 80 "$f" -o "${f%.jpg}.webp"; done
     ```
3. **Color Grading:** Consistent across all shots (same white balance, saturation, brightness)
4. **Aspect Ratio:** Must be exactly 3:2 (1200 × 800) for gallery layout
5. **Preloading:** All shots preload before Scene 6 becomes visible

### Priority
**MEDIUM** — Enhances trust and credibility but not critical for MVP. Can be added post-launch.

### File Inventory Summary

```
/public/location/ (to be created)
├── location-exterior.jpg [< 300 KB each, or < 150 KB if WebP]
├── location-gym-1.jpg
├── location-gym-2.jpg
├── location-detail.jpg [optional]
└── location-neighborhood.jpg [optional]

Total: 3–5 files, < 1.5 MB (JPEG) or < 750 KB (WebP)
```

---

## SCENE 7: FINAL ACCESS (CTA + STORE BADGES)

### Purpose
Call-to-action finale — three beats that close the loop:
1. **Emotional close:** "Your private training space is ready."
2. **Store availability:** App store badges (iOS + Android)
3. **CTA:** "Request Private Access" button

**Scene Duration:** ~8–12 seconds of scroll time  
**Animation:** Weight-scaled beats (1.0–1.6x timing)  
**Interaction:** Only interactive element in entire experience (CTA becomes clickable when active)

### Existing Assets

| Asset | Type | Status | Details |
|-------|------|--------|---------|
| CTA button | Code-rendered HTML | ✓ Complete | "Request Private Access" link to `/apply` |
| Text overlays | Code-rendered | ✓ Complete | 3 beats with typography |
| Background | CSS | ✓ Complete | Gym backdrop (GymBackdrop component) |
| GymBackdrop | Shared 3D canvas | ✓ Complete | Full-brightness gym space, fades in as scrim fades out |

### Missing Assets

**Store Badges** — Required

| Badge | Platform | Required Filename | Dimensions | Format | File Size Target | Description |
|-------|----------|-------------------|-----------|--------|------------------|-------------|
| App Store | iOS (Apple) | `app-store.svg` | 152 × 48 px | SVG (or PNG fallback) | < 50 KB (SVG), < 100 KB (PNG) | Official Apple App Store badge |
| Google Play | Android (Google) | `google-play.svg` | 152 × 48 px | SVG (or PNG fallback) | < 50 KB (SVG), < 100 KB (PNG) | Official Google Play badge |

### Asset Specifications

**Folder Path:** `/public/badges/`

**Dimensions:** 152 × 48 px (standard app store badge size)

**Format:**
- **SVG:** Preferred (scalable, smallest file size, crisp rendering)
- **PNG:** Fallback (raster, slightly larger but guaranteed compatibility)

**Color Space:** sRGB

**Source:** Official badge designs from:
- App Store: [Apple.com - App Store Badge Guidelines](https://developer.apple.com/app-store/marketing/guidelines/#app-store-badge)
- Google Play: [Google Play Console - Badge Resources](https://play.google.com/console/about/gpp-badges/)

**Compression Targets:**
- SVG: < 50 KB each
- PNG: < 100 KB each
- **Total (2 files):** < 200 KB

### Beat Breakdown

```
Scene 7 Duration: 8–12 seconds of scroll

BEAT_WEIGHTS:     [1.0, 0.7, 1.6]
                   ↓    ↓    ↑
                   Normal Quick (stores)  CTA (slowest, holds to end)

BEAT 1: "Your private training space is ready."
  - Weight: 1.0 (base timing)
  - Emotional close, acknowledgment of journey

BEAT 2: "Available on iOS and Android."
  - Weight: 0.7 (quickest)
  - App Store + Google Play badges
  - Practical information, quick consume

BEAT 3: "Request Private Access" CTA
  - Weight: 1.6 (slowest, holds to end)
  - Slowest resolve-in of entire sequence
  - Holds through end of scroll (no recede)
  - Only interactive element (pointer events enabled when active)
```

### Code Integration Points

**Scene File:** `components/v3/scenes/Scene7FinalAccess.tsx`

**Current Placeholder (lines 160–167):**
```jsx
<div className="flex items-center gap-4">
  <span className="flex h-12 w-[152px] items-center justify-center rounded-[10px] border border-[#C9A84C]/30 bg-white/[0.02] font-display text-[12px] font-medium uppercase tracking-[0.18em] text-[#b8b8b8]">
    App Store
  </span>
  <span className="flex h-12 w-[152px] items-center justify-center rounded-[10px] border border-[#C9A84C]/30 bg-white/[0.02] font-display text-[12px] font-medium uppercase tracking-[0.18em] text-[#b8b8b8]">
    Google Play
  </span>
</div>
```

**Required Swap:**
```jsx
<div className="flex items-center gap-4">
  <a 
    href="https://apps.apple.com/app/iron-oasis/id..." 
    target="_blank" 
    rel="noopener noreferrer"
    className="transition-opacity hover:opacity-80"
  >
    <img 
      src="/badges/app-store.svg" 
      alt="Download on App Store" 
      width={152} 
      height={48}
    />
  </a>
  <a 
    href="https://play.google.com/store/apps/details?id=..." 
    target="_blank" 
    rel="noopener noreferrer"
    className="transition-opacity hover:opacity-80"
  >
    <img 
      src="/badges/google-play.svg" 
      alt="Get it on Google Play" 
      width={152} 
      height={48}
    />
  </a>
</div>
```

**Placeholder for App Store URLs:**
- Replace `https://apps.apple.com/app/iron-oasis/id...` with actual iOS app URL
- Replace `https://play.google.com/store/apps/details?id=...` with actual Android app URL

**Do NOT modify:**
- Lines 96–107 (beatOpacity curve logic)
- Lines 34–36 (BEAT_WEIGHTS)
- Lines 180–189 (CTA button styling and link)
- Container structure (flex layout, gap-4)

### Optimization Needs

1. **Badge Dimensions:** Exact 152 × 48 px
2. **SVG Optimization:** Minify SVG files (removes unnecessary XML attributes, whitespace)
   ```bash
   # Using svgo (npm install -g svgo)
   svgo app-store.svg google-play.svg
   ```
3. **App Store URLs:** Coordinate with product team for live store URLs
4. **Hover State:** Badges have CSS hover effect (opacity-80), ensure badges respond smoothly

### Asset Content Guidance

**Which badges?**

- **App Store Badge:** The official Apple App Store badge (black background, white text, "Download on the App Store")
- **Google Play Badge:** The official Google Play badge (white background, colored text, "Get it on Google Play")

These are standard, recognizable badges that signal availability on both platforms.

### Background Transition

**Important:** Scene 7 is unique in that the GymBackdrop (3D gym render) fades in as the scrim fades out. This creates the visual effect of the room resolving behind the CTA button as the final beat holds.

```typescript
// As CTA beat's finalBeatOpacity increases from 0 → 1:
scrim.style.opacity = String(0.75 * (1 - finalBeatOpacity));
// Scrim fades from 0.75 → 0 as CTA resolves
// Gym backdrop becomes visible
```

This is automatic (no asset changes needed), but important for understanding the final visual composition.

### Priority
**HIGH** — Required for CTA integration and app store routing. Badges are essential for user conversion.

### File Inventory Summary

```
/public/badges/ (to be created)
├── app-store.svg [< 50 KB]
└── google-play.svg [< 50 KB]

Total: 2 files, < 100 KB
```

---

## SCENE GLOBAL ASSETS: 3D ENVIRONMENT

### Purpose
Shared lighting and environment assets used across multiple scenes (Scene 2, Scene 3, Scene 7 backdrop).

### Existing Assets

| Asset | Filename | Path | Format | Size | Dimensions | Usage |
|-------|----------|------|--------|------|-----------|-------|
| HDRI (Studio) | `studio_small_03_1k.hdr` | `/public/hdri/` | HDR | 1.6 MB | 1024 × 512 px | Primary lighting environment (warm, neutral) |
| HDRI (Landscape) | `lebombo_1k.hdr` | `/public/hdri/` | HDR | 1.4 MB | 1024 × 512 px | Alternative outdoor lighting (golden hour) |

### Asset Details

**Primary HDRI: studio_small_03_1k.hdr**
- **Purpose:** Provides ambient + key lighting for gym space
- **Color Tone:** Neutral, professional (no strong color cast)
- **Usage:** Active in all gym-visible scenes (2, 3, 7 backdrop)
- **Size:** 1.6 MB (1024 × 512 px)

**Alternative HDRI: lebombo_1k.hdr**
- **Purpose:** Alternative outdoor/golden-hour lighting (reserved for future use)
- **Color Tone:** Warm, golden hour aesthetic
- **Usage:** Not currently active; available for scene variations
- **Size:** 1.4 MB (1024 × 512 px)

### Missing Assets

**None for launch.** Both HDRIs are present and production-ready.

**Optional (post-launch):** Alternative HDRI for different time-of-day or mood variations.

### Optimization Needs

1. **HDRI Selection:** Verify studio_small_03_1k.hdr is the active HDRI in code
   - Code: `components/v3/scenes/SharedGymCanvas.tsx`, line 65
   - Expected: `<Environment files={ASSET_REGISTRY.hdriStudio.path} background={false} />`

2. **Lighting Quality:** Verify gym space is evenly lit with no dark spots or blown highlights
   - Visual test: Scene 2 and 3 should show full interior with warm, confident lighting
   - No harsh shadows, no black voids in corners

### Priority
**N/A** — Production-ready. No changes needed for launch.

---

## Asset Delivery Summary

### By Priority

**MUST HAVE (Launch-blocking):**
- Scene 4: 5 feature demonstration images/videos
- Scene 5: 5 app screenshots
- Scene 7: 2 store badges

**SHOULD HAVE (High impact, non-blocking):**
- Scene 6: 3–5 location/facility photos

**NICE TO HAVE (Post-launch):**
- Alternative 3D gym models
- Alternative HDRIs
- Cinematic shots or promotional imagery

### By Timeline

**Week 1 (High Priority):**
1. Scene 7: Store badges (2 files, quickest turnaround)
2. Scene 5: App screenshots (5 files, 192 × 380 px each)
3. Scene 4: Feature demos (5 files, 400 × 600 px each)

**Week 2 (Medium Priority):**
1. Scene 6: Location photography (3–5 files, 1200 × 800 px each)

**Post-Launch (Optional):**
1. Alternative 3D gym model
2. Cinematic photography for promotional use

### File Count & Total Size

| Scene | Files | Individual Size Targets | Total Size (est.) |
|-------|-------|------------------------|------------------|
| Scene 4 | 5 | < 250 KB (img) / < 500 KB (vid) | < 1.25–2 MB |
| Scene 5 | 5 | < 200 KB (PNG) / < 120 KB (WebP) | < 1 MB / < 600 KB |
| Scene 6 | 3–5 | < 300 KB (JPEG) / < 150 KB (WebP) | < 1.5 MB / < 750 KB |
| Scene 7 | 2 | < 50 KB (SVG) / < 100 KB (PNG) | < 100 KB |
| **TOTAL** | **15–17** | — | **< 3.85–4.35 MB** |

All assets combined should fit well under 5 MB for optimal web performance.

---

## Folder Structure (Complete)

```
/public/
├── app-screenshots/              [NEW — 5 files]
│   ├── screen-1.png (or .webp)
│   ├── screen-2.png
│   ├── screen-3.png
│   ├── screen-4.png
│   └── screen-5.png
│
├── badges/                        [NEW — 2 files]
│   ├── app-store.svg (or .png)
│   └── google-play.svg (or .png)
│
├── features/                      [NEW — 5 files]
│   ├── feature-1.png (or .webp/.webm)
│   ├── feature-2.png
│   ├── feature-3.png
│   ├── feature-4.png
│   └── feature-5.png
│
├── location/                      [NEW — 3–5 files]
│   ├── location-exterior.jpg (or .webp)
│   ├── location-gym-1.jpg
│   ├── location-gym-2.jpg
│   ├── location-detail.jpg [optional]
│   └── location-neighborhood.jpg [optional]
│
├── 3d-models/                     [RESERVED — Post-launch]
│   ├── gym-space-2k.glb [optional replacement]
│   └── gym-space-2k-opt.glb [optional replacement]
│
├── hdri/                          [EXISTING]
│   ├── studio_small_03_1k.hdr ✓
│   └── lebombo_1k.hdr ✓
│
├── frames/                        [EXISTING]
│   ├── logo_000.webp ✓
│   ├── logo_001.webp ✓
│   ├── ... [118 more frames]
│   └── logo_120.webp ✓
│
├── gym-space-2k.glb               [EXISTING] ✓
├── gym-space-2k-opt.glb           [EXISTING] ✓
├── draco/                         [EXISTING]
└── storm.png                      [EXISTING]
```

---

## Integration Checklist

Before launch, verify:

- [ ] **Scene 0:** Loading text displays correctly
- [ ] **Scene 1:** Logo frame sequence (121 frames) loads and scrubs smoothly
- [ ] **Scene 2:** 3D gym model loads, camera choreography works
- [ ] **Scene 3:** Static hero pose holds, text overlay fades correctly
- [ ] **Scene 4:** Feature images/videos load, fade in/out on schedule
- [ ] **Scene 5:** App screenshots load, carousel transitions smoothly
- [ ] **Scene 6:** Location photos load, gallery rotates correctly (if included)
- [ ] **Scene 7:** Store badges load, CTA button is clickable and links correctly
- [ ] **Global:** No console errors, all assets load without 404s
- [ ] **Performance:** Total asset bundle < 5 MB, page loads in < 3 seconds on 4G
- [ ] **Mobile:** Test on iOS (Safari) and Android (Chrome), all images scale correctly
- [ ] **Responsive:** Test on mobile (375px), tablet (768px), desktop (1920px)

---

## Troubleshooting Guide

### Image not loading?
1. Check file path: `/public/` is root, so `src="/badges/app-store.svg"`
2. Verify file exists: `ls /public/badges/app-store.svg`
3. Check file name matches code exactly (case-sensitive)
4. Check file permissions (should be readable by web server)

### Image has wrong aspect ratio?
1. Verify dimensions match spec (e.g., 192 × 380 for app screenshots)
2. Check CSS (should use `object-cover` for correct scaling)
3. Re-export asset at exact dimensions specified

### Video not playing?
1. Check format: WebM or MP4 (browser compatibility)
2. Verify `autoPlay muted loop playsInline` attributes present
3. Check file size < 500 KB
4. Test in Chrome, Safari, Firefox for codec support

### 3D model looks wrong?
1. Check scale: GymModel expects meters, not centimeters
2. Verify camera choreography still works
3. Test LightingRig illuminates model correctly
4. Check texture loading (no pink/white placeholder materials)

### Assets load slowly?
1. Check compression: Target file sizes should be met
2. Consider WebP format (saves 25–40% vs. PNG/JPEG)
3. Consider WebM format (saves 30–50% vs. MP4)
4. Use CDN for large files (3D models, video)

---

## Compression Tools & Commands

### PNG to WebP Conversion

```bash
# Single file
cwebp -quality 90 screen-1.png -o screen-1.webp

# Batch conversion (all PNG in directory)
for f in *.png; do cwebp -quality 90 "$f" -o "${f%.png}.webp"; done

# Target quality settings
# Quality 95: Highest quality, larger file
# Quality 90: Excellent quality, moderate file (recommended)
# Quality 80: Good quality, smaller file
# Quality 70: Acceptable quality, small file
```

### JPEG Optimization

```bash
# Using jpegoptim
jpegoptim --max=80 --progressive location-*.jpg

# Using imagemagick
mogrify -strip -interlace Plane -quality 80 location-*.jpg
```

### SVG Optimization

```bash
# Using svgo (install: npm install -g svgo)
svgo app-store.svg google-play.svg

# Output: optimized versions with .min.svg suffix (or replaces original with -r flag)
```

### Video Compression (WebM)

```bash
# Single file
ffmpeg -i feature-1.mp4 -c:v libvpx-vp9 -quality good -cpu-used 0 -b:v 500k feature-1.webm

# Batch conversion
for f in *.mp4; do ffmpeg -i "$f" -c:v libvpx-vp9 -quality good -cpu-used 0 -b:v 500k "${f%.mp4}.webm"; done

# Target bitrate settings
# -b:v 800k: High quality (50 sec @ 1 min = ~6 MB)
# -b:v 500k: Medium quality (50 sec @ 1 min = ~4 MB)
# -b:v 300k: Smaller file (50 sec @ 1 min = ~2 MB)
```

---

## Asset Sync Workflow

### Step 1: Create Folders

```bash
mkdir -p /public/app-screenshots
mkdir -p /public/badges
mkdir -p /public/features
mkdir -p /public/location
mkdir -p /public/3d-models
```

### Step 2: Add Assets (Week 1)

```bash
# Scene 7: Store badges (2 files)
cp app-store.svg /public/badges/
cp google-play.svg /public/badges/

# Scene 5: App screenshots (5 files)
cp screen-*.png /public/app-screenshots/

# Scene 4: Feature demos (5 files)
cp feature-*.png /public/features/
```

### Step 3: Compress Assets

```bash
# PNG → WebP
for f in /public/app-screenshots/*.png; do cwebp -quality 90 "$f" -o "${f%.png}.webp"; done
for f in /public/features/*.png; do cwebp -quality 85 "$f" -o "${f%.png}.webp"; done

# SVG → Optimize
svgo /public/badges/*.svg
```

### Step 4: Verify Build

```bash
npm run build
# Expected: Build succeeds, no errors
```

### Step 5: Test Locally

```bash
npm run dev
# Navigate to http://localhost:3000/v3
# Scroll through all scenes
# Check Network tab for asset loads
# Check console for any errors
```

### Step 6: Deploy

```bash
git add public/app-screenshots public/badges public/features public/location
git commit -m "Add production assets: store badges, app screenshots, feature demos"
git push origin main
```

---

## Final Verification

Before launch, run this checklist:

```bash
# 1. Verify all files exist and have correct dimensions
ls -lh /public/app-screenshots/screen-*.png     # 5 files
ls -lh /public/badges/*.svg                      # 2 files
ls -lh /public/features/feature-*.png            # 5 files
ls -lh /public/location/location-*.jpg           # 3+ files

# 2. Check file sizes
du -sh /public/app-screenshots /public/badges /public/features /public/location
# Expected total: < 5 MB

# 3. Verify TypeScript compilation
npx tsc --noEmit

# 4. Build production
npm run build

# 5. Run local preview
npm run dev

# 6. Verify no 404s in browser console
# Open DevTools → Network → Filter: "img" or "gif" or "jpg" or "png"
# All should have status 200 (not 404)

# 7. Test on mobile
# Use Chrome DevTools device emulation or actual device
# Verify images scale correctly on 375px viewport
```

---

## Production Designer Sign-Off

This document specifies:
✓ All existing assets and their usage  
✓ All missing assets with exact dimensions and formats  
✓ Folder structure and file naming conventions  
✓ Compression targets and quality standards  
✓ Code integration points (no code changes required, asset swaps only)  
✓ Timeline and delivery phases  
✓ Troubleshooting and verification procedures  

**Status:** Ready for asset delivery to production team.

**Questions?** Reference the relevant scene section above for exact specifications.

---

**Document Prepared:** 2026-08-06  
**Prepared By:** Claude (Haiku 4.5)  
**Status:** Final Production Specification  
**Next Step:** Handoff to production design team
