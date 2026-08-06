# Iron Oasis V3 — Production Asset Handoff Guide

**Prepared:** 2026-08-06  
**Asset Pipeline:** Ready for incoming production assets  
**Status:** All folders created, all swap points verified  

---

## Overview

This guide specifies exactly what assets are needed, where they go, and how they connect to the codebase. **No modifications to animation or timing are needed** — only asset swaps in designated folders.

---

## Asset Folder Structure

```
/public/
├── app-screenshots/          ← NEW (App carousel screenshots)
├── badges/                   ← NEW (Store badges)
├── features/                 ← NEW (Feature demo images/video)
├── location/                 ← NEW (Gym facility photography)
├── 3d-models/                ← NEW (Alternative 3D gym models)
├── hdri/                      ← EXISTING (Lighting environments)
├── frames/                    ← EXISTING (Logo frames)
├── draco/                     ← EXISTING (3D compression)
├── gym-space-2k.glb          ← EXISTING (Current 3D model)
├── gym-space-2k-opt.glb      ← EXISTING (Optimized 3D model)
└── storm.png                 ← EXISTING
```

---

## Asset Requirements by Scene

---

## 1. SCENE 7 — STORE BADGES (High Priority)

**Location in Code:** `components/v3/scenes/Scene7FinalAccess.tsx` (lines 160-167)  
**Scene Position:** Beat 2 (Middle section, after emotional close, before CTA)  
**Visibility:** ~5-10 seconds of scroll time  
**Animation:** Fade-in with 0.7x weight scaling (slower than Beats 1 & 3)

### Required Assets

#### Badge 1: App Store Badge
- **File name:** `app-store.svg`
- **Folder:** `/public/badges/`
- **Dimensions:** 152 × 48 px
- **Format:** SVG (preferred) or PNG (fallback)
- **Source:** Official Apple App Store badge
- **Asset Link:** Download from [Apple.com - App Store Badge](https://developer.apple.com/app-store/marketing/guidelines/#app-store-badge)

#### Badge 2: Google Play Badge
- **File name:** `google-play.svg`
- **Folder:** `/public/badges/`
- **Dimensions:** 152 × 48 px
- **Format:** SVG (preferred) or PNG (fallback)
- **Source:** Official Google Play badge
- **Asset Link:** Download from [Google Play Console - Marketing Resources](https://play.google.com/console/about/gpp-badges/)

### Swap Instructions

**Current placeholder (lines 160-167):**
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

**Replace with:**
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

### Timing & Constraints

- ✓ Do NOT modify: lines 96-107 (beatOpacity curve), lines 34-36 (BEAT_WEIGHTS)
- ✓ Keep container: `<div className="flex items-center gap-4">`
- ✓ Keep spacing: gap-4 (16px)
- ✓ Dimensions: 152 × 48 px (h-12 w-[152px])

### Delivery Checklist

- [ ] App Store badge (152 × 48px, SVG or PNG)
- [ ] Google Play badge (152 × 48px, SVG or PNG)
- [ ] App store URLs (for href attributes)
- [ ] File location: `/public/badges/app-store.svg` and `/public/badges/google-play.svg`

---

## 2. SCENE 5 — APP SCREENSHOTS (High Priority)

**Location in Code:** `components/v3/scenes/Scene5AppExperience.tsx` (lines 111-132)  
**Scene Position:** Carousel showing app features  
**Visibility:** ~15-20 seconds (5 steps × 3-4 seconds each)  
**Animation:** Cross-fade between screenshots, captions remain fixed

### Required Assets

#### Screenshots (5 total)
Each screenshot matches one of these app features:

| Step | Feature | File Name | Dimensions | Description |
|------|---------|-----------|------------|-------------|
| 1 | "Book a session." | `screen-1.png` | 192 × 380 px | Booking/scheduling interface |
| 2 | "Receive access." | `screen-2.png` | 192 × 380 px | Access confirmation screen |
| 3 | "Arrive." | `screen-3.png` | 192 × 380 px | Arrival/navigation screen |
| 4 | "Unlock the gym." | `screen-4.png` | 192 × 380 px | Unlock interface/door |
| 5 | "Train privately." | `screen-5.png` | 192 × 380 px | Training session screen |

### Asset Specs

- **Folder:** `/public/app-screenshots/`
- **Dimensions:** 192 × 380 px (portrait, iPhone 12 mini ratio)
- **Format:** PNG or WebP (WebP preferred for 30-40% smaller file size)
- **Color Space:** sRGB
- **File Size Target:** < 200 KB each (compress aggressively)
- **Source:** Actual app screenshots or high-fidelity mockups
- **Device Frame:** Include iPhone notch in the design (or frame separately)

### Swap Instructions

**Current placeholder (lines 111-132):**
```jsx
<div className="relative flex h-[380px] w-[192px] flex-col items-center justify-center rounded-[30px] border border-[#C9A84C]/30 bg-white/[0.02]">
  <div className="absolute left-1/2 top-3 h-1 w-9 -translate-x-1/2 rounded-full bg-white/10" />
  <div ref={frameGlowRef} className="..." />
  <!-- CAPTIONS HERE (keep as-is) -->
</div>
```

**Replace inner content with:**
```jsx
<div className="relative flex h-[380px] w-[192px] flex-col items-center justify-center rounded-[30px] border border-[#C9A84C]/30 bg-black overflow-hidden">
  <div className="absolute left-1/2 top-3 h-1 w-9 -translate-x-1/2 rounded-full bg-white/10" />
  
  {/* Screenshot carousel */}
  {STEPS.map((step, i) => (
    <img
      key={step.label}
      src={`/app-screenshots/screen-${i + 1}.png`}
      alt={step.label}
      width={192}
      height={380}
      className={`absolute inset-0 object-cover transition-opacity duration-500 ${
        activeStep === i ? "opacity-100" : "opacity-0"
      }`}
    />
  ))}
  
  <div ref={frameGlowRef} className="absolute inset-0 rounded-[30px] opacity-0 transition-opacity duration-500" style={{ boxShadow: "0 0 40px 4px rgba(201, 168, 76, 0.12) inset" }} />
  
  <!-- CAPTIONS (lines 118-130, keep as-is) -->
  <div className="relative flex h-8 items-center justify-center px-4">
    {STEPS.map((step, i) => (
      <span
        key={step.label}
        ref={(el) => {
          captionRefs.current[i] = el;
        }}
        className="absolute font-display text-[11px] font-medium uppercase text-[#C9A84C] opacity-0"
        style={{ letterSpacing: "0.22em" }}
      >
        {step.label}
      </span>
    ))}
  </div>
</div>
```

### Timing & Constraints

- ✓ Do NOT modify: lines 18-30 (timing/weights), lines 80-91 (opacity curves), STEPS array
- ✓ Keep container: `rounded-[30px] border border-[#C9A84C]/30` (phone frame)
- ✓ Keep captions: Lines 118-130 (labels fade in/out with screenshot)
- ✓ Keep glow: Line 115 (gold inset glow effect)
- ✓ Keep notch: Line 112 (top bar of iPhone)

### Compression Recommendations

```bash
# For PNG screenshots (lossless, use for UI)
pngquant --speed 1 --quality 85-95 screen-*.png

# For PNG to WebP conversion (30-40% smaller)
cwebp -quality 90 screen-1.png -o screen-1.webp

# Batch WebP conversion
for f in screen-*.png; do cwebp -quality 90 "$f" -o "${f%.png}.webp"; done

# File size targets:
# PNG: < 200 KB each
# WebP: < 120 KB each
```

### Delivery Checklist

- [ ] 5 app screenshots (192 × 380 px each)
- [ ] PNG or WebP format (WebP preferred)
- [ ] < 200 KB per file (< 120 KB for WebP)
- [ ] File names: `screen-1.png` through `screen-5.png`
- [ ] File location: `/public/app-screenshots/`
- [ ] Includes iPhone notch/frame in design
- [ ] Color accurate, high contrast (readable on dark backgrounds)

---

## 3. SCENE 4 — FEATURE FRAMES (Medium Priority)

**Location in Code:** `components/v3/scenes/Scene4HowItWorks.tsx` (lines 145-180)  
**Scene Position:** Feature explanation carousel  
**Visibility:** ~20-25 seconds (5 steps, weight-scaled timing)  
**Animation:** Fade-in/out with weight-scaled speed

### Required Assets

#### Feature Demonstrations (5 total)

| Step | Feature | File Name | Dimensions | Description |
|------|---------|-----------|------------|-------------|
| 1 | "Download the Iron Oasis app." | `feature-1.png` or `.webm` | 400 × 600 px | App download/store screen |
| 2 | "Choose your training time." | `feature-2.png` or `.webm` | 400 × 600 px | Time selection/calendar |
| 3 | "Reserve the entire private gym." | `feature-3.png` or `.webm` | 400 × 600 px | Gym space visualization |
| 4 | "Receive your access." | `feature-4.png` or `.webm` | 400 × 600 px | Access credentials/unlock |
| 5 | "Walk in and train..." | `feature-5.png` or `.webm` | 400 × 600 px | User training in gym |

### Asset Specs

- **Folder:** `/public/features/`
- **Dimensions:** 400 × 600 px (portrait 2:3 aspect ratio)
- **Format:** PNG/WebP (static) or WebM/MP4 (animated)
- **Color Space:** sRGB
- **File Size Target (PNG/WebP):** < 250 KB each
- **File Size Target (Video):** < 500 KB each (5-10 sec clip)
- **Source:** App screenshots, mockups, or short demo videos
- **Note:** Can be static images or short 3-5 second animations

### Swap Instructions

**Current placeholder (lines 145-180):**
```jsx
{STEPS.map((step, i) => (
  <div key={step.statement} className="...">
    <div className="...">
      <!-- TEXT PLACEHOLDER HERE -->
      <p className="...">{step.statement}</p>
      <p className="...">{step.support}</p>
    </div>
  </div>
))}
```

**Replace with (static images):**
```jsx
{STEPS.map((step, i) => (
  <div key={step.statement} className="...">
    {/* Feature image/video */}
    <img
      src={`/features/feature-${i + 1}.png`}
      alt={step.statement}
      width={400}
      height={600}
      className="absolute inset-0 object-cover rounded-lg"
    />
    
    {/* Text overlay */}
    <div className="...">
      <p className="...">{step.statement}</p>
      <p className="...">{step.support}</p>
    </div>
  </div>
))}
```

**Or (with video fallback):**
```jsx
{STEPS.map((step, i) => (
  <div key={step.statement} className="...">
    {/* Try video first, fallback to image */}
    <video
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 object-cover rounded-lg"
    >
      <source src={`/features/feature-${i + 1}.webm`} type="video/webm" />
      <img src={`/features/feature-${i + 1}.png`} alt={step.statement} />
    </video>
    
    {/* Text overlay */}
    <div className="...">
      <p className="...">{step.statement}</p>
      <p className="...">{step.support}</p>
    </div>
  </div>
))}
```

### Timing & Constraints

- ✓ Do NOT modify: lines 26-32 (STEPS array), lines 52-60 (timing/weights), lines 99-113 (opacity curves)
- ✓ Keep text: Lines 158-165 (statement and support text remain)
- ✓ Dimensions: 400 × 600 px (portrait ratio)
- ✓ Keep flex layout: Container structure unchanged

### Compression Recommendations

```bash
# For PNG feature images
pngquant --speed 1 --quality 80-90 feature-*.png

# Convert to WebP
cwebp -quality 85 feature-1.png -o feature-1.webp

# For video (WebM format, recommended)
ffmpeg -i feature-demo.mp4 -c:v libvpx-vp9 -quality good -cpu-used 0 -b:v 500k feature-1.webm

# Video size target: 5-10 sec @ 500-700 kbps = 30-70 KB per second
```

### Delivery Checklist

- [ ] 5 feature images/videos (400 × 600 px)
- [ ] PNG/WebP or WebM/MP4 format
- [ ] < 250 KB (images) or < 500 KB (video)
- [ ] File names: `feature-1.png/webm` through `feature-5.png/webm`
- [ ] File location: `/public/features/`
- [ ] High quality, readable text/UI
- [ ] On-brand colors and styling

---

## 4. SCENE 6 — LOCATION IMAGERY (Medium Priority)

**Location in Code:** `components/v3/scenes/Scene6LocationTrust.tsx` (lines 123+)  
**Scene Position:** "Location & Trust" section (rotating facility photos)  
**Visibility:** ~15-20 seconds (3-4 shots, rotation)  
**Animation:** Fade-in/out between location shots

### Required Assets

#### Location Photos (3-5 total)

| Shot | Location | File Name | Dimensions | Description |
|------|----------|-----------|------------|-------------|
| 1 | Exterior/Entrance | `location-exterior.jpg` | 1200 × 800 px | Building facade, entrance |
| 2 | Main Gym Space | `location-gym-1.jpg` | 1200 × 800 px | Full gym interior, equipment |
| 3 | Training Zone | `location-gym-2.jpg` | 1200 × 800 px | Private training area |
| 4 | Facility Detail | `location-detail.jpg` | 1200 × 800 px | Equipment, amenities |
| 5 (Optional) | Neighborhood | `location-neighborhood.jpg` | 1200 × 800 px | Area around gym |

### Asset Specs

- **Folder:** `/public/location/`
- **Dimensions:** 1200 × 800 px (landscape 3:2 ratio)
- **Format:** JPEG (compressed) or WebP (smaller)
- **Color Space:** sRGB
- **File Size Target (JPEG):** < 300 KB each
- **File Size Target (WebP):** < 150 KB each
- **Quality:** High-resolution, professional photography
- **Source:** Actual facility photos or high-quality rendering
- **Requirements:**
  - Well-lit, professional quality
  - Shows cleanliness, modern equipment, professional atmosphere
  - Builds trust and credibility

### Swap Instructions

**Current placeholder (lines 123+):**
```jsx
{/* Reserved cinematic placeholder — swap content for real
    facility imagery once shoots are done. */}
<div className="...">
  <!-- PLACEHOLDER CONTENT -->
</div>
```

**Replace with (image carousel):**
```jsx
<div className="relative flex h-[400px] w-full flex-col items-center justify-center">
  {/* Location image carousel */}
  {LOCATION_SHOTS.map((shot, i) => (
    <img
      key={shot.alt}
      src={`/location/${shot.filename}`}
      alt={shot.alt}
      width={1200}
      height={800}
      className={`absolute inset-0 object-cover transition-opacity duration-700 ${
        activeShot === i ? "opacity-100" : "opacity-0"
      }`}
    />
  ))}
  
  {/* Optional text overlay */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
  <div className="relative z-10 text-center">
    <p className="text-white text-lg font-medium">{LOCATION_SHOTS[activeShot]?.caption}</p>
  </div>
</div>
```

### Timing & Constraints

- ✓ Do NOT modify: Line 17-19 (timing), beat opacity curves
- ✓ Keep container: Flex layout, dimensions
- ✓ Keep text: Captions remain, positioned correctly
- ✓ Rotate every: 3-5 seconds (adjust in code as needed)

### Compression Recommendations

```bash
# For JPEG photos
jpegoptim --max=80 --progressive location-*.jpg

# Convert to WebP (better compression)
cwebp -quality 80 location-exterior.jpg -o location-exterior.webp

# Batch conversion
for f in location-*.jpg; do cwebp -quality 80 "$f" -o "${f%.jpg}.webp"; done

# File size targets:
# JPEG: < 300 KB each
# WebP: < 150 KB each
```

### Delivery Checklist

- [ ] 3-5 location photos (1200 × 800 px each)
- [ ] JPEG or WebP format (WebP preferred for web)
- [ ] < 300 KB (JPEG) or < 150 KB (WebP) per file
- [ ] Professional quality, well-lit
- [ ] File names: `location-exterior.jpg`, `location-gym-1.jpg`, etc.
- [ ] File location: `/public/location/`
- [ ] Captions/alt text for each image
- [ ] Represents gym atmosphere and credibility

---

## 5. ASSET REGISTRY — 3D GYM MODEL (Optional, Post-Launch)

**Location in Code:** `components/v3/assets/registry.ts`  
**Used by:** Scene2GymReveal, Scene3PrivateExperience, Scene7FinalAccess (backdrop)  
**Current Model:** `gym-space-2k.glb` (4.2 MB), `gym-space-2k-opt.glb` (607 KB)  
**Animation:** No changes — only model swap

### Asset Specs

- **Folder:** `/public/3d-models/`
- **Format:** GLB (binary GLTF with embedded textures)
- **Quality Levels:**
  - Full: `gym-space-2k.glb` (4-8 MB, desktop high-end)
  - Optimized: `gym-space-2k-opt.glb` (500 KB - 1 MB, mobile)
- **Requirements:**
  - Must match camera choreography (Scene2-3 camera paths)
  - Interior gym space, professional lighting
  - Rigged for dynamic lighting (LightingRig compatible)
  - Support for HDRI environment lighting
  - No animations needed (camera handles motion)

### How to Replace

1. **Export from Blender/C4D:**
   - Export as GLB format
   - Embed all textures
   - Ensure materials support PBR lighting

2. **Create optimized version:**
   ```bash
   # Using gltf-transform (npm install -g @gltf-transform/cli)
   gltf-transform optimize gym-space-2k.glb gym-space-2k-opt.glb
   ```

3. **Upload to `/public/3d-models/`:**
   ```
   gym-space-2k.glb       # Full quality
   gym-space-2k-opt.glb   # Mobile optimized
   ```

4. **Update asset registry** (if needed):
   ```typescript
   // In components/v3/assets/registry.ts
   const MODEL_PATHS = {
     gymSpace: "/3d-models/gym-space-2k.glb",
     gymSpaceOpt: "/3d-models/gym-space-2k-opt.glb",
   };
   ```

### Delivery Checklist (Post-Launch)

- [ ] Full-quality 3D gym model (GLB format)
- [ ] Optimized mobile version (< 1 MB)
- [ ] Interior gym space with realistic scale
- [ ] PBR materials for dynamic lighting
- [ ] Camera-ready framing (matches current choreography)
- [ ] File location: `/public/3d-models/`

---

## Asset Delivery & Integration Workflow

### Phase 1: High Priority (This Week)

**Day 1-2: Store Badges**
1. Download official App Store + Google Play badges
2. Save to `/public/badges/` as `.svg` files
3. Coordinate app store URLs with product team
4. Update Scene7 CTA links

**Day 2-3: App Screenshots**
1. Take 5 app screenshots (or create high-fidelity mockups)
2. Each screenshot: 192 × 380 px
3. Compress to < 200 KB (PNG) or < 120 KB (WebP)
4. Save to `/public/app-screenshots/` as `screen-1.png` through `screen-5.png`
5. Update Scene5 component with image paths

### Phase 2: Medium Priority (Next Week)

**Day 4-5: Feature Demonstrations**
1. Create or capture 5 feature demo images/videos
2. Dimensions: 400 × 600 px (images)
3. Compress to < 250 KB (images) or < 500 KB (video)
4. Save to `/public/features/` as `feature-1.png` through `feature-5.png`
5. Update Scene4 component with image paths

**Day 5-6: Location Photography**
1. Schedule gym facility photo shoot (or create renderings)
2. Capture 3-5 high-quality location shots
3. Dimensions: 1200 × 800 px
4. Compress to < 300 KB (JPEG) or < 150 KB (WebP)
5. Save to `/public/location/` with descriptive names
6. Update Scene6 component with image paths

### Phase 3: Post-Launch (Optional)

**Week 2+: 3D Model Replacement**
1. If you have custom gym model: optimize for web
2. Export as GLB (full + optimized versions)
3. Save to `/public/3d-models/`
4. Update asset registry if paths change
5. Test on mobile and desktop

---

## File Naming Convention

**Consistency across all assets:**

```
/public/
├── app-screenshots/
│   ├── screen-1.png          # Step 1
│   ├── screen-2.png          # Step 2
│   ├── screen-3.png          # Step 3
│   ├── screen-4.png          # Step 4
│   └── screen-5.png          # Step 5
│
├── badges/
│   ├── app-store.svg         # App Store
│   └── google-play.svg       # Google Play
│
├── features/
│   ├── feature-1.png         # Feature 1
│   ├── feature-2.png         # Feature 2
│   ├── feature-3.png         # Feature 3
│   ├── feature-4.png         # Feature 4
│   └── feature-5.png         # Feature 5
│
├── location/
│   ├── location-exterior.jpg       # Exterior/entrance
│   ├── location-gym-1.jpg          # Main gym space
│   ├── location-gym-2.jpg          # Training zone
│   ├── location-detail.jpg         # Equipment detail
│   └── location-neighborhood.jpg   # Optional: area context
│
└── 3d-models/
    ├── gym-space-2k.glb       # Full quality
    └── gym-space-2k-opt.glb   # Mobile optimized
```

---

## Quality Checklist

### Before Delivering Assets

**All Formats:**
- [ ] File dimensions match spec exactly
- [ ] File size < target (see compression targets)
- [ ] Color space is sRGB
- [ ] Aspect ratio correct (no distortion)
- [ ] File format correct (PNG/SVG/JPEG/WebP/GLB)
- [ ] File name follows convention (dash-separated, lowercase)

**Images:**
- [ ] No watermarks or logos (unless approved)
- [ ] High contrast, readable on dark backgrounds
- [ ] Professional quality, sharp focus
- [ ] Properly compressed (no artifacts, no excessive blur)

**Videos:**
- [ ] 5-10 seconds max duration
- [ ] No audio (muted playback)
- [ ] WebM format recommended (VP9 codec)
- [ ] Loopable (no abrupt cut at end)

**3D Models:**
- [ ] GLB format with embedded textures
- [ ] PBR materials (not per-vertex colors)
- [ ] Realistic scale (meters, not cm)
- [ ] Optimized for web (< 5 MB full, < 1 MB mobile)

---

## Integration Testing

Once assets are delivered:

```bash
# 1. Verify TypeScript still passes
npx tsc --noEmit

# 2. Verify build succeeds
npm run build

# 3. Test locally
npm run dev

# 4. Navigate to each scene:
# - /v3 > scroll to Scene7 (badges)
# - /v3 > scroll to Scene5 (app screenshots)
# - /v3 > scroll to Scene4 (features)
# - /v3 > scroll to Scene6 (location)

# 5. Check:
# - [ ] Images load (no 404s)
# - [ ] Timing matches animations
# - [ ] Mobile responsive (test on phone)
# - [ ] File sizes reasonable (check Network tab)
```

---

## Troubleshooting

### Image not loading?
1. Check file path: `/public/` is root, so `src="/badges/app-store.svg"`
2. Check file exists: `ls /public/badges/app-store.svg`
3. Check file name matches code exactly (case-sensitive)

### Image has wrong aspect ratio?
1. Check dimensions in code match asset (192×380, not 192×300)
2. Verify `object-cover` or `object-fit: cover` in CSS
3. Re-export asset at exact dimensions

### Video not playing?
1. Check format: WebM or MP4, not AVI or MOV
2. Verify `autoPlay muted loop playsInline` attributes
3. Check file size < 500 KB

### 3D model looks wrong?
1. Check scale: GymModel expects meters, not cm
2. Verify camera choreography still works (check CameraRig)
3. Test LightingRig fixtures (should illuminate model)

---

## Asset Sync Checklist

**Before Launch:**

- [ ] All folders created: `/public/app-screenshots/`, `/public/badges/`, `/public/features/`, `/public/location/`, `/public/3d-models/`
- [ ] All assets delivered with correct dimensions and formats
- [ ] All file names match component code
- [ ] All assets compressed to target file sizes
- [ ] TypeScript validation passes
- [ ] Build succeeds without errors
- [ ] Mobile testing completed
- [ ] GA4 analytics verify asset loads
- [ ] No console errors on /v3 page

---

## Contact & Support

**Asset Questions?** Reference this guide for exact specs.  
**Implementation Questions?** Reference component source files (Scene4-7).  
**Timeline Issues?** Phase 1 assets (badges, screenshots) needed for launch; others can follow.

---

**Prepared:** 2026-08-06  
**Status:** Ready for asset delivery  
**Pipeline:** Production-ready
