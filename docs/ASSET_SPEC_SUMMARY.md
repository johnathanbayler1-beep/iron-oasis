# IRON OASIS V3 — ASSET SPEC SUMMARY

**One-page reference** | Full specs: `ASSET_CONSUMER_SPEC.md`

---

## WHAT NEEDS TO BE PRODUCED

### Scene 5: App Screenshots ⭐ CRITICAL
Five 192×380px PNG screenshots showing booking → training journey
- **Exact dimensions:** 192×380px (no padding, no frame)
- **Files:** `screen-1.png` through `screen-5.png`
- **Path:** `/public/app-screenshots/`
- **Status:** Component ready to load NOW (no code changes needed)

**Captions (hardcoded in component):**
1. "Book a session."
2. "Receive access."
3. "Arrive."
4. "Unlock the gym."
5. "Train privately."

### Scene 6: Location Photo ⭐ CRITICAL
One photograph showing gym exterior/entrance
- **Exact dimensions:** 1024×576px (2x) or 512×288px (1x), strictly 16:9 aspect ratio
- **File:** JPG or WebP
- **Path:** `/public/location-trust/`
- **Status:** Needs 1-line code change first (add `<img>` tag)

**What the photo should convey:**
- Private, peaceful, detached sanctuary
- Well-lit, confident presentation
- No people, logos, or identifying markers
- Feels like "yours," not a commercial gym

### Scene 7: Store Badges
App Store badge (152×48px PNG) + Google Play badge (152×48px PNG)
- **Source:** Official badges from Apple & Google developer sites only
- **Path:** `/public/store-badges/`
- **Status:** Needs 2-line code change first (swap placeholder `<span>` for `<img>`)

### Scene 4: How It Works
**NO ASSETS NEEDED** (frame is placeholder; ready for future app screenshots)

---

## CRITICAL DIMENSIONS (DO NOT VARY)

| Scene | Element | Dimension | Notes |
|-------|---------|-----------|-------|
| 5 | Phone frame | 192×380px | Exact; no padding |
| 5 | Screenshots | 192×380px | PNG 32-bit; 5 files |
| 6 | Photo frame | 16:9 aspect | Strict ratio; no distortion |
| 6 | Photo (2x) | 1024×576px | Recommended export size |
| 7 | Badges | 152×48px each | Both badges same size |

---

## MOST IMPORTANT RULES

### Scene 5
- ✅ Five distinct, cohesive app screens
- ✅ Each 192×380px exactly
- ❌ Don't include phone bezel (component renders it)
- ❌ Don't make all screens look the same

### Scene 6
- ✅ Exactly 16:9 aspect ratio (will distort if wrong)
- ✅ One photograph (not a carousel)
- ✅ Bright, confident, well-lit
- ❌ Don't include people or logos
- ❌ Don't create five different versions

### Scene 7
- ✅ Official badges only (Apple & Google)
- ✅ Both badges 152×48px
- ❌ Don't redesign badges
- ❌ Don't use outdated versions

---

## COMMON MISTAKES & FIXES

| Mistake | Why It's Wrong | Fix |
|---------|---|---|
| Scene 5 screenshots are 200×380px | Will be cropped | Export at exactly 192×380px |
| Scene 5 includes iPhone bezel | Double-frame effect | Export screen content only |
| Scene 6 photo is 4:3 aspect | Will look squeezed | Shoot/export in 16:9 |
| Scene 6 has 5 different photos | Only 1 displays | Create one strong photo |
| Scene 7 badges are different sizes | Layout breaks | Scale both to 152×48px |
| Scene 7 custom badge design | Violates guidelines | Use official Apple/Google badges |

---

## DELIVERY CHECKLIST

### Before Uploading
- [ ] All dimensions are exact (use pixel-perfect export settings)
- [ ] Scene 5: PNG 32-bit, no bezel, 5 files
- [ ] Scene 6: JPG/WebP, 16:9 aspect verified, 1 file
- [ ] Scene 7: PNG transparent, official badges, 2 files
- [ ] File names match spec (case-sensitive on Linux)
- [ ] All images open in browser without errors
- [ ] Color space is sRGB
- [ ] File sizes are reasonable (<500KB per file)

### After Uploading
- [ ] Dev makes 1-line change to Scene 6 (add `<img>` tag)
- [ ] Dev makes 2-line change to Scene 7 (swap placeholders)
- [ ] Run `npm run build` to verify no errors
- [ ] Test scroll experience in browser
- [ ] Confirm all images load and animate correctly

---

## FILE STRUCTURE

```
/public/
├── app-screenshots/
│   ├── screen-1.png (192×380px)
│   ├── screen-2.png (192×380px)
│   ├── screen-3.png (192×380px)
│   ├── screen-4.png (192×380px)
│   └── screen-5.png (192×380px)
├── location-trust/
│   └── [location-photo].jpg (1024×576px, 16:9)
└── store-badges/
    ├── app-store-badge.png (152×48px)
    └── google-play-badge.png (152×48px)
```

---

## TIMELINE & WORKFLOW

### No Blocking — All Parallel

| Task | Owner | Duration | Dependency |
|------|-------|----------|---|
| Scene 5 screenshots | Designer | — | None (component ready) |
| Scene 6 location photo | Designer | — | None |
| Scene 7 store badges | Designer | — | None (official sources) |
| Scene 6 code change | Dev | 5 min | Ready to go |
| Scene 7 code change | Dev | 5 min | Ready to go |
| Integrate Scene 5 | Dev | 2 min | Assets arrive |
| Integrate Scene 6 | Dev | 2 min | Code change + assets |
| Integrate Scene 7 | Dev | 2 min | Code change + assets |

**Total dev time:** ~15 minutes. **Designer time:** Depends on asset creation quality.

---

## COMPONENT READINESS

✅ **Scene 5:** Fully ready to load images automatically (no code change)  
⚠️ **Scene 6:** Ready with 1-line code addition  
⚠️ **Scene 7:** Ready with 2-line code swap  
✅ **Scene 4:** Placeholder complete (no assets needed yet)

---

## FALLBACK BEHAVIOR

If any asset fails to load, the scene renders with the placeholder (no broken images, no console errors).

---

## NEXT STEP

**Designer:** Read `ASSET_PRODUCER_QUICK_START.md` for exact specifications  
**Dev:** Read `ASSET_INTEGRATION_READINESS.md` for code changes needed

---

**Questions?** See the full spec: `ASSET_CONSUMER_SPEC.md`
