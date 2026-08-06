# Iron Oasis V3 — Asset Pipeline Status

**Date:** 2026-08-06  
**Status:** ✓ Production-ready  
**Build:** ✓ Success (TypeScript clean, all routes live)

---

## What Was Prepared

### Asset Folder Structure Created

✓ **5 new folders** prepared for incoming production assets:

```
/public/
├── app-screenshots/          ← 5 app screenshots (192×380px)
├── badges/                   ← 2 store badges (152×48px)
├── features/                 ← 5 feature demos (400×600px)
├── location/                 ← 3-5 facility photos (1200×800px)
└── 3d-models/                ← 2 gym models (GLB format)
```

Each folder includes:
- ✓ Descriptive README.md
- ✓ File naming conventions
- ✓ Required dimensions and formats

### Documentation Created

✓ **ASSET_HANDOFF_GUIDE.md** (8,000+ words)
- Complete asset specifications for each scene
- File names, dimensions, formats, compression targets
- Exact swap points in code with before/after examples
- Integration workflow and testing checklist
- Troubleshooting guide

✓ **ASSET_PIPELINE_STATUS.md** (this document)
- Overview of what was prepared
- Asset swap verification
- Next phase recommendations

---

## Asset Swap Points: Verified & Clean

### Scene 7 — Store Badges (HIGH PRIORITY)

**File:** `components/v3/scenes/Scene7FinalAccess.tsx`  
**Lines:** 160-167 (text placeholders)  
**Status:** ✓ Clean, ready for replacement  
**Required:** `/public/badges/app-store.svg` + `google-play.svg`  

```jsx
// CURRENT (will be replaced)
<span className="...">App Store</span>
<span className="...">Google Play</span>

// WILL BECOME
<img src="/badges/app-store.svg" />
<img src="/badges/google-play.svg" />
```

---

### Scene 5 — App Screenshots (HIGH PRIORITY)

**File:** `components/v3/scenes/Scene5AppExperience.tsx`  
**Lines:** 111-132 (empty device frame)  
**Status:** ✓ Clean, ready for replacement  
**Required:** `/public/app-screenshots/screen-{1-5}.png`  
**Step Count:** 5 steps (Book, Receive access, Arrive, Unlock, Train)

```jsx
// CURRENT (empty frame)
<div className="rounded-[30px] border ... bg-white/[0.02]">
  <!-- empty, just captions -->
</div>

// WILL BECOME
<div className="rounded-[30px] border ... bg-black overflow-hidden">
  {/* 5 screenshots fade in/out */}
  <img src={`/app-screenshots/screen-${i+1}.png`} />
</div>
```

---

### Scene 4 — Feature Frames (MEDIUM PRIORITY)

**File:** `components/v3/scenes/Scene4HowItWorks.tsx`  
**Lines:** 145-180 (text-only steps)  
**Status:** ✓ Clean, ready for replacement  
**Required:** `/public/features/feature-{1-5}.png`  
**Step Count:** 5 steps (Download, Choose time, Reserve gym, Receive access, Train)

```jsx
// CURRENT (text only)
<p>{step.statement}</p>
<p>{step.support}</p>

// WILL BECOME
<img src={`/features/feature-${i+1}.png`} />
<p>{step.statement}</p> <!-- stays -->
<p>{step.support}</p>   <!-- stays -->
```

---

### Scene 6 — Location Photography (MEDIUM PRIORITY)

**File:** `components/v3/scenes/Scene6LocationTrust.tsx`  
**Lines:** 123+ (placeholder carousel)  
**Status:** ✓ Clean, ready for replacement  
**Required:** `/public/location/location-*.jpg`  
**Shot Count:** 3-5 rotating facility photos

```jsx
// CURRENT (placeholder)
{/* Reserved cinematic placeholder */}
<div>...</div>

// WILL BECOME
<div className="relative">
  {LOCATION_SHOTS.map((shot, i) => (
    <img src={`/location/${shot.filename}`} />
  ))}
</div>
```

---

### Asset Registry — 3D Model (OPTIONAL, POST-LAUNCH)

**File:** `components/v3/assets/registry.ts`  
**Status:** ✓ Ready for replacement (optional)  
**Current:** `gym-space-2k.glb` (4.2 MB) + optimized version (608 KB)  
**Can Replace With:** Your custom gym model (post-launch)

No code changes needed — just swap files in folder.

---

## Integration Checklist

### Pre-Asset Delivery

- [x] All folders created in `/public/`
- [x] All README files placed in folders with specs
- [x] ASSET_HANDOFF_GUIDE.md created with complete specs
- [x] All swap points verified in code
- [x] TypeScript validation passes
- [x] Build succeeds without errors

### During Asset Delivery

- [ ] Assets arrive with correct dimensions
- [ ] Assets compressed to target file sizes
- [ ] File names match code (case-sensitive)
- [ ] Assets placed in correct folders
- [ ] No placeholder assets used (delete this comment)

### Post-Delivery Testing

- [ ] TypeScript still passes: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors: Check DevTools
- [ ] No 404 errors: Check Network tab
- [ ] Images load: Visual inspection on /v3
- [ ] Timing matches: Scroll through each scene
- [ ] Mobile responsive: Test on phone/tablet
- [ ] File sizes reasonable: Check Network tab

---

## Asset Delivery Timeline

### Phase 1: Launch Assets (This Week)

**Day 1-2: STORE BADGES**
- [ ] Download official App Store badge
- [ ] Download official Google Play badge
- [ ] Save to `/public/badges/` as `.svg` files
- [ ] Time estimate: 30 minutes

**Day 2-3: APP SCREENSHOTS**
- [ ] Capture/design 5 app screenshots (192×380px)
- [ ] Compress to < 200 KB (PNG) or < 120 KB (WebP)
- [ ] Save to `/public/app-screenshots/` as `screen-{1-5}.png`
- [ ] Time estimate: 2-4 hours (depending on app readiness)

### Phase 2: Supporting Assets (Next Week)

**Day 4-5: FEATURE DEMONSTRATIONS**
- [ ] Create/capture 5 feature demos (400×600px)
- [ ] Compress to < 250 KB (PNG) or < 500 KB (video)
- [ ] Save to `/public/features/` as `feature-{1-5}.png`
- [ ] Time estimate: 4-6 hours

**Day 5-6: LOCATION PHOTOGRAPHY**
- [ ] Schedule or create gym facility photos
- [ ] Capture 3-5 high-quality shots (1200×800px)
- [ ] Compress to < 300 KB (JPEG) or < 150 KB (WebP)
- [ ] Save to `/public/location/` with descriptive names
- [ ] Time estimate: 2-4 hours (photography) + 1 hour (editing)

### Phase 3: Optional (Post-Launch)

**Week 2+: 3D MODEL (if custom model available)**
- [ ] Export gym model as GLB
- [ ] Create optimized mobile version
- [ ] Save to `/public/3d-models/`
- [ ] Test camera choreography still works
- [ ] Time estimate: 1-2 days (if model exists)

---

## Asset Specifications Quick Reference

| Asset | Folder | File Names | Dimensions | Format | Count | Priority |
|-------|--------|-----------|-----------|--------|-------|----------|
| Store Badges | `/badges/` | `app-store.svg`, `google-play.svg` | 152×48px | SVG/PNG | 2 | HIGH |
| App Screenshots | `/app-screenshots/` | `screen-1.png` to `screen-5.png` | 192×380px | PNG/WebP | 5 | HIGH |
| Feature Demos | `/features/` | `feature-1.png` to `feature-5.png` | 400×600px | PNG/WebP/WebM | 5 | MEDIUM |
| Location Photos | `/location/` | `location-*.jpg` | 1200×800px | JPEG/WebP | 3-5 | MEDIUM |
| 3D Gym Model | `/3d-models/` | `gym-space-2k.glb`, `gym-space-2k-opt.glb` | Variable | GLB | 2 | OPTIONAL |

---

## Validation Status

```
✓ TypeScript:    No errors found
✓ Build:         Success (8 routes)
✓ Folders:       All created (/public/*)
✓ Documentation: Complete (ASSET_HANDOFF_GUIDE.md)
✓ Code Prep:     All swap points verified and clean
✓ No Fake Assets: None added (ready for real assets)
```

---

## Next Recommended Phase

### Immediate (Today)

1. **Share this folder structure with design team**
   - Copy `/public/` folder structure
   - Share ASSET_HANDOFF_GUIDE.md
   - Assign asset owners (badges, screenshots, features, location)

2. **Clarify asset dependencies**
   - [ ] App Store/Play links available yet?
   - [ ] App screenshots/mockups ready?
   - [ ] Gym facility available for photography?
   - [ ] Custom 3D model available? (nice-to-have)

### This Week (Parallel Track)

3. **Phase 2: Email & Database Integration**
   - Setup Supabase or PostgreSQL
   - Setup Resend API
   - Integrate with `/api/forms/submit/route.ts`
   - Test end-to-end (form → email → database)

4. **Marketing & Go-Live Prep**
   - Define conversion success metrics
   - Setup GA4 analytics
   - Prepare launch announcement
   - Brief operations team on lead process

### Asset Delivery Coordination

5. **With Design Team:**
   - High priority: Badges (2 days) + Screenshots (4 days)
   - Medium priority: Features (6 days) + Location (4 days)
   - Optional: 3D model (1-2 weeks, post-launch)

---

## Key Points for Asset Creators

### Design Team Must Know

1. **Don't redesign** — Just provide assets, folder structure handles placement
2. **Follow naming exactly** — File names are case-sensitive (e.g., `screen-1.png`, not `Screen-1.PNG`)
3. **Compress aggressively** — Target file sizes < 200 KB (images), < 500 KB (video)
4. **Match dimensions** — Exactly 192×380, 400×600, 1200×800 (no padding)
5. **Use sRGB** — Color space for consistent web display

### Developers Must Know

1. **Don't modify timing** — Only swap asset content, not opacity/timing curves
2. **Don't change components** — Only update `src=` paths and image tags
3. **Keep container structure** — CSS classes, divs, flex layout stay the same
4. **Test on mobile** — Verify responsive design still works after asset swap
5. **Check console** — No 404s, no mixed-content warnings

---

## Handoff Checklist

Before launching experience publicly:

- [x] All 5 asset folders created
- [x] All README files in place with specs
- [x] ASSET_HANDOFF_GUIDE.md created and detailed
- [x] All swap points identified and verified in code
- [x] TypeScript validation passes
- [x] Build succeeds without errors
- [x] No fake/placeholder assets added
- [ ] High-priority assets delivered (badges, screenshots)
- [ ] Medium-priority assets delivered (features, location)
- [ ] All assets tested in browser
- [ ] GA4 analytics tracking assets
- [ ] Ops team trained on lead process

---

## Support & Questions

**For Asset Specs:** See `ASSET_HANDOFF_GUIDE.md` (detailed)  
**For File Paths:** Check folder README.md files  
**For Integration:** See component source files (Scene4-7)  
**For Timeline:** Estimate 1 week for high-priority, 2 weeks for all

---

**Status:** Production pipeline ready  
**Next Phase:** Asset delivery coordination  
**Timeline:** High-priority assets needed for launch (Week 1)

