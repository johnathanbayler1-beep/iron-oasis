# Iron Oasis V3 — Asset Delivery Documentation Index

**Status:** Production-Ready  
**Date:** 2026-08-06  
**Build:** Passing ✓  
**3D Canvas:** Refactored ✓

---

## Quick Links

### For Production Designers
📋 **[PRODUCTION_ASSET_SPECIFICATION.md](./PRODUCTION_ASSET_SPECIFICATION.md)** — Complete handoff document
- Full specifications for every missing asset
- Folder structure and file naming conventions
- Compression targets and quality standards
- Code integration points
- Troubleshooting guide

### For Quick Reference
🎨 **[Asset Handoff Summary (Visual)](./scratchpad/asset-handoff-summary.html)** — Interactive overview
- Scene-by-scene asset inventory
- Priority levels and delivery timeline
- File specs at a glance

### For Code Integration
📁 **[ASSET_HANDOFF_GUIDE.md](./ASSET_HANDOFF_GUIDE.md)** — Integration patterns
- Asset registry architecture
- Component swap points
- Phase-based delivery plan

---

## Asset Inventory Summary

### Production-Ready (No Action Needed)
| Scene | Assets | Status |
|-------|--------|--------|
| Scene 0 | Loading text | ✓ Complete |
| Scene 1 | 121 logo frames (7.2 MB) | ✓ Complete |
| Scene 2 | Gym 3D model + HDRI (6.4 MB) | ✓ Complete |
| Scene 3 | Reuses Scene 2 assets | ✓ Complete |

### Awaiting Production Assets
| Scene | Asset Type | Qty | Target Size | Priority |
|-------|-----------|-----|-------------|----------|
| Scene 4 | Feature demo images/videos | 5 | < 1.25–2 MB | **HIGH** |
| Scene 5 | App screenshots | 5 | < 600 KB | **HIGH** |
| Scene 6 | Location/facility photos | 3–5 | < 750 KB | **MEDIUM** |
| Scene 7 | Store badges (SVG) | 2 | < 100 KB | **HIGH** |
| **TOTAL** | — | **15–17** | **< 5 MB** | — |

---

## Delivery Phases

### Phase 1: High Priority (Weeks 1–2)
**Launch-blocking assets**

1. **Scene 7 — Store Badges** (2 files, quickest)
   - App Store badge (152 × 48 px)
   - Google Play badge (152 × 48 px)
   - Format: SVG (preferred) or PNG
   - Target: < 100 KB total

2. **Scene 5 — App Screenshots** (5 files)
   - Dimensions: 192 × 380 px each
   - Format: PNG/WebP (WebP saves 40%)
   - Target: < 600 KB total

3. **Scene 4 — Feature Demos** (5 files)
   - Dimensions: 400 × 600 px (images) or video
   - Format: PNG/WebP or WebM/MP4
   - Target: < 2 MB total

### Phase 2: Medium Priority (Weeks 3–4)
**Trust-building, non-blocking**

4. **Scene 6 — Location Photography** (3–5 files)
   - Dimensions: 1200 × 800 px each
   - Format: JPEG/WebP (WebP saves 50%)
   - Target: < 750 KB total
   - Can be added post-launch

### Phase 3: Post-Launch (Optional)
**Enhancement, no timeline pressure**

5. **Alternative 3D Gym Models**
   - GLB format with embedded textures
   - Full + optimized versions
   - Only if custom model exists

6. **Cinematic Photography**
   - Promotional imagery
   - Social media assets
   - Not required for MVP

---

## Scene-by-Scene Specifications

### Scene 0: Loading
- **Asset:** Text-only (code-rendered)
- **Status:** ✓ Complete
- **Action:** None

### Scene 1: Logo Reveal
- **Asset:** 121 WebP frame sequence (logo_000.webp → logo_120.webp)
- **Status:** ✓ Complete (7.2 MB)
- **Action:** None

### Scene 2: Gym Reveal (3D)
- **Assets:** 
  - gym-space-2k.glb (4.2 MB, full quality)
  - gym-space-2k-opt.glb (607 KB, mobile)
  - studio_small_03_1k.hdr (1.6 MB, lighting)
- **Status:** ✓ Complete
- **Action:** None

### Scene 3: Private Experience (3D)
- **Assets:** Reuses Scene 2 gym model + text overlay
- **Status:** ✓ Complete
- **Action:** None

### Scene 4: How It Works (Carousel)
- **Missing:** 5 feature demonstration images/videos
- **Dimensions:** 400 × 600 px (images)
- **Formats:** PNG/WebP (static) or WebM/MP4 (animated)
- **Targets:** < 250 KB (images), < 500 KB (video per step)
- **Location:** `/public/features/`
- **Naming:** `feature-1.png`, `feature-2.png`, ..., `feature-5.png`
- **Priority:** **HIGH**

### Scene 5: App Experience (Carousel)
- **Missing:** 5 app screenshots
- **Dimensions:** 192 × 380 px (portrait, iPhone 12 mini ratio)
- **Formats:** PNG or WebP (WebP recommended, 40% smaller)
- **Targets:** < 120 KB per image (WebP), < 200 KB (PNG)
- **Location:** `/public/app-screenshots/`
- **Naming:** `screen-1.png`, `screen-2.png`, ..., `screen-5.png`
- **Priority:** **HIGH**

### Scene 6: Location & Trust (Gallery)
- **Missing:** 3–5 facility/location photographs
- **Dimensions:** 1200 × 800 px (landscape, 3:2 ratio)
- **Formats:** JPEG or WebP (WebP recommended, 50% smaller)
- **Targets:** < 150 KB per image (WebP), < 300 KB (JPEG)
- **Location:** `/public/location/`
- **Naming:** `location-exterior.jpg`, `location-gym-1.jpg`, etc.
- **Priority:** **MEDIUM** (can be added post-launch)

### Scene 7: Final Access (CTA)
- **Missing:** 2 app store badges
- **Dimensions:** 152 × 48 px each
- **Formats:** SVG (preferred, crisp rendering) or PNG
- **Targets:** < 50 KB (SVG), < 100 KB (PNG)
- **Location:** `/public/badges/`
- **Naming:** `app-store.svg`, `google-play.svg`
- **Priority:** **HIGH**

---

## File Structure

```
/public/
├── app-screenshots/        [NEW — Scene 5]
│   ├── screen-1.png
│   ├── screen-2.png
│   ├── screen-3.png
│   ├── screen-4.png
│   └── screen-5.png
│
├── badges/                 [NEW — Scene 7]
│   ├── app-store.svg
│   └── google-play.svg
│
├── features/               [NEW — Scene 4]
│   ├── feature-1.png (or .webp/.webm)
│   ├── feature-2.png
│   ├── feature-3.png
│   ├── feature-4.png
│   └── feature-5.png
│
├── location/               [NEW — Scene 6]
│   ├── location-exterior.jpg (or .webp)
│   ├── location-gym-1.jpg
│   ├── location-gym-2.jpg
│   ├── location-detail.jpg [optional]
│   └── location-neighborhood.jpg [optional]
│
├── 3d-models/              [RESERVED — Post-launch]
│
├── hdri/                   [EXISTING]
│   ├── studio_small_03_1k.hdr ✓
│   └── lebombo_1k.hdr ✓
│
├── frames/                 [EXISTING]
│   ├── logo_000.webp ✓ through logo_120.webp ✓
│
├── gym-space-2k.glb        [EXISTING] ✓
├── gym-space-2k-opt.glb    [EXISTING] ✓
└── [other files]
```

---

## Compression & Optimization

### PNG → WebP (Save 30–40%)
```bash
# Single file
cwebp -quality 90 screen-1.png -o screen-1.webp

# Batch conversion
for f in *.png; do cwebp -quality 90 "$f" -o "${f%.png}.webp"; done
```

### JPEG → WebP (Save 25–35%)
```bash
for f in *.jpg; do cwebp -quality 80 "$f" -o "${f%.jpg}.webp"; done
```

### MP4 → WebM (Save 30–50%)
```bash
ffmpeg -i feature.mp4 -c:v libvpx-vp9 -quality good -cpu-used 0 -b:v 500k feature.webm
```

### SVG Optimization
```bash
# Install: npm install -g svgo
svgo app-store.svg google-play.svg
```

---

## No Code Changes Required

⚠️ **Important:** This is an **asset-only handoff**. 
- ✓ No modifications to animation timing
- ✓ No modifications to scene choreography
- ✓ No modifications to camera paths
- ✓ No modifications to lighting rigs

All scenes are **layout-locked** and **timing-finalized**. Only the visual assets change.

---

## Verification Checklist

Before launch, confirm:

- [ ] All 15–17 asset files exist in correct folders
- [ ] File dimensions match specs exactly (no distortion)
- [ ] File sizes meet targets (< 5 MB total)
- [ ] File names match code exactly (case-sensitive)
- [ ] No console errors or 404s when loading `/v3`
- [ ] Scene 4 feature demos fade correctly
- [ ] Scene 5 app screenshots carousel smoothly
- [ ] Scene 6 location gallery rotates (if included)
- [ ] Scene 7 badges render and link correctly
- [ ] Mobile responsive on 375px viewport
- [ ] No image quality degradation
- [ ] Build passes: `npm run build`
- [ ] TypeScript validation passes: `npx tsc --noEmit`

---

## Contact & Support

**Questions about assets?** Reference the relevant scene section in [PRODUCTION_ASSET_SPECIFICATION.md](./PRODUCTION_ASSET_SPECIFICATION.md).

**Questions about integration?** Reference [ASSET_HANDOFF_GUIDE.md](./ASSET_HANDOFF_GUIDE.md).

**Need to verify existing assets?** Check `/public/` directory directly:
```bash
# Verify existing assets
ls -lh /public/gym-space-2k.glb
ls -lh /public/gym-space-2k-opt.glb
ls -lh /public/hdri/
ls -lh /public/frames/ | wc -l  # Should show 121 logo frames
```

---

## Timeline Summary

| Week | Deliverables | Status |
|------|--------------|--------|
| Week 1 | Scene 7 badges + Scene 5 screenshots | Awaited |
| Week 2 | Scene 4 feature demos | Awaited |
| Week 3+ | Scene 6 location photos (optional) | Optional |
| Post-Launch | Alternative 3D models (optional) | Optional |

**Launch Blocker:** Scenes 4, 5, 7 assets (need delivery by end of Week 2)  
**Non-Blocking:** Scene 6 assets (can be added any time)

---

## Files in This Handoff

1. **PRODUCTION_ASSET_SPECIFICATION.md** (700+ lines)
   - Comprehensive, scene-by-scene specifications
   - Integration points and swap instructions
   - Compression tools and troubleshooting
   - **For:** Production designers, dev team

2. **ASSET_HANDOFF_GUIDE.md** (existing)
   - Phase-based delivery plan
   - Integration testing procedures
   - **For:** Asset coordinators, QA

3. **ASSET_DELIVERY_INDEX.md** (this file)
   - Quick reference and file index
   - Timeline and priorities
   - **For:** Everyone involved

4. **asset-handoff-summary.html** (visual)
   - Interactive web overview
   - Scene cards with specs
   - Visual timeline
   - **For:** Non-technical stakeholders, quick reference

---

## Production Status

✓ **Build:** Passing  
✓ **3D Canvas:** Refactored and shared across scenes  
✓ **Scene Choreography:** Finalized (locked timing)  
✓ **Existing Assets:** Verified and optimized  
⏳ **Awaiting:** Production assets (Scenes 4, 5, 6, 7)

**Next Step:** Deliver assets per timeline above.

---

**Prepared:** 2026-08-06  
**For:** Production Designer Handoff  
**Status:** Ready for Asset Delivery
