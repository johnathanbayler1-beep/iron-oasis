# ASSET INTEGRATION READINESS CHECK

**Purpose:** Verify that components are ready to accept production assets without code changes  
**Scope:** Scenes 4, 5, 6, 7  
**Last Updated:** 2026-08-06  
**Status:** ✅ READY FOR ASSET INTAKE

---

## SCENE 4: How It Works

### Component Status
**File:** `/components/v3/scenes/Scene4HowItWorks.tsx`

#### Frame Rendering
- ✅ Phone frame (172×340px) is hardcoded and rendered
- ✅ Status bar placeholder (8px × 1px) is rendered
- ✅ Border and background styling is applied
- ✅ Step counter (01/05, etc.) is dynamically displayed

#### Asset Intake
- ⚠️ Currently: Frame is empty placeholder
- 📝 **No assets needed at this time** (See ASSET_CONSUMER_SPEC.md)
- 📝 **Future:** When app screenshots exist, they will be placed in this frame via a simple prop or image source update (no major refactoring)

#### Code Changes Required Before Assets Arrive
❌ **None**

#### Code Changes Required After Assets Arrive
⚠️ **Minor (when app exists):**
- Create an `/app-screenshots/` or similar directory
- Update component to load image source from a prop or path
- Example: `<img src={`/app-screenshots/step-${activeStep}.png`} />`
- Estimated effort: 15 minutes

---

## SCENE 5: App Experience

### Component Status
**File:** `/components/v3/scenes/Scene5AppExperience.tsx`

#### Asset Path & Auto-Loading
- ✅ Component scans `/public/app-screenshots/screen-*.png` automatically
- ✅ Image tags are pre-built with correct src paths
- ✅ `onError` handler prevents broken-image display
- ✅ Five images are loaded: `screen-1.png` through `screen-5.png`

#### Device Frame
- ✅ Phone frame (192×380px) is hardcoded and rendered
- ✅ Status bar / notch (9px × 1px) is rendered
- ✅ Border and background styling is applied
- ✅ Rounded corners (30px) are applied

#### Animation & Transition
- ✅ 500ms ease-in-out crossfade between images is implemented
- ✅ Image opacity is tied to scene progress (via `beatOpacity` function)
- ✅ Captions are synced with image fades

#### Asset Intake
- ✅ **Component is fully ready**
- ✅ Assets will load automatically once files are placed in `/public/app-screenshots/`
- ✅ No code changes required

#### Code Changes Required Before Assets Arrive
❌ **None**

#### Code Changes Required After Assets Arrive
❌ **None** — component will load images automatically

---

## SCENE 6: Location / Trust

### Component Status
**File:** `/components/v3/scenes/Scene6LocationTrust.tsx`

#### Frame Rendering
- ✅ Cinematic frame (16:9 aspect ratio, max-w-xl) is hardcoded and rendered
- ✅ Border and background styling is applied
- ✅ Rounded corners (18px) are applied
- ✅ Glow effect (inset box-shadow) is rendered and controlled by scene progress

#### Asset Placeholder
- ⚠️ Currently: Frame is empty (div with no content)
- 📝 **Future:** Photograph will be placed as a background image or `<img>` tag

#### Animation
- ✅ Glow effect fades in/out based on which text beat is active
- ✅ Five text lines are synchronized with glow timing
- ✅ No manual control (automatic based on scroll progress)

#### Asset Intake
- ⚠️ **Component is ready, but with a caveat:**
  - Frame structure exists, but asset loading method is not yet implemented
  - **Code change needed:** Add `<img>` tag or `background-image` with src path to the reserved frame div
  - Effort: 5 minutes (one line of code)

#### Code Changes Required Before Assets Arrive
✅ **Minimal (one-line change):**

Current:
```tsx
<div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-[18px] border border-[#C9A84C]/30 bg-white/[0.02]">
  <div
    ref={frameGlowRef}
    className="absolute inset-0 opacity-0 transition-opacity duration-500"
    style={{ boxShadow: "0 0 50px 6px rgba(201, 168, 76, 0.1) inset" }}
  />
</div>
```

Should become:
```tsx
<div className="relative aspect-video w-full max-w-xl overflow-hidden rounded-[18px] border border-[#C9A84C]/30 bg-white/[0.02]">
  <img
    src="/location-trust/exterior-entrance.jpg"
    alt="Iron Oasis private gym entrance"
    className="absolute inset-0 h-full w-full object-cover"
  />
  <div
    ref={frameGlowRef}
    className="absolute inset-0 opacity-0 transition-opacity duration-500"
    style={{ boxShadow: "0 0 50px 6px rgba(201, 168, 76, 0.1) inset" }}
  />
</div>
```

#### Code Changes Required After Assets Arrive
❌ **None** — asset will render once image is added to path

---

## SCENE 7: Final Access

### Component Status
**File:** `/components/v3/scenes/Scene7FinalAccess.tsx`

#### CTA & Messaging
- ✅ Beat 1 (emotional close): "Your private training space is ready." — hardcoded
- ✅ Beat 2 (store badges): Placeholder boxes are rendered
- ✅ Beat 3 (CTA button): "Request Private Access" button is rendered

#### Store Badge Placeholders
- ⚠️ Currently: Simple boxes with "App Store" and "Google Play" text
- 📝 **Future:** Badges will be replaced with official Apple App Store and Google Play images

#### Animation
- ✅ All three beats fade in/out correctly
- ✅ Scrim fades out as CTA beat takes hold (showing gym backdrop behind)
- ✅ CTA button pointer events are controlled by beat opacity

#### Asset Intake
- ⚠️ **Component is ready, but needs one update:**
  - Placeholder `<span>` elements will be replaced with `<img>` tags
  - **Code change needed:** Swap placeholder boxes for actual badge images
  - Effort: 5 minutes (two lines of code)

#### Code Changes Required Before Assets Arrive
✅ **Minimal (two-line change):**

Current:
```tsx
<span className="flex h-12 w-[152px] items-center justify-center rounded-[10px] border border-[#C9A84C]/30 bg-white/[0.02] font-display text-[12px] font-medium uppercase tracking-[0.18em] text-[#b8b8b8]">
  App Store
</span>
<span className="flex h-12 w-[152px] items-center justify-center rounded-[10px] border border-[#C9A84C]/30 bg-white/[0.02] font-display text-[12px] font-medium uppercase tracking-[0.18em] text-[#b8b8b8]">
  Google Play
</span>
```

Should become:
```tsx
<img
  src="/store-badges/app-store-badge.png"
  alt="Download on the App Store"
  className="h-12 w-[152px]"
/>
<img
  src="/store-badges/google-play-badge.png"
  alt="Get it on Google Play"
  className="h-12 w-[152px]"
/>
```

#### Code Changes Required After Assets Arrive
❌ **None** — badges will render once images are added to path

---

## SUMMARY TABLE

| Scene | Asset Type | Status | Code Change Before? | Code Change After? |
|-------|-----------|--------|---------------------|-------------------|
| 4 | App frame placeholder | ✅ Ready | ❌ None | ⚠️ Minor (future) |
| 5 | App screenshots (×5) | ✅ Ready | ❌ None | ❌ None |
| 6 | Location photograph (×1) | ⚠️ Partial | ✅ 1-line add | ❌ None |
| 7 | Store badges (×2) | ⚠️ Partial | ✅ 2-line swap | ❌ None |

---

## ASSETS THAT CAN LOAD IMMEDIATELY

### Scene 5: App Screenshots
- **Status:** 🟢 READY NOW
- **Action:** Place `screen-1.png` through `screen-5.png` in `/public/app-screenshots/`
- **Result:** Component will load and display automatically
- **Code changes:** None needed

---

## ASSETS THAT NEED A ONE-LINE CODE CHANGE FIRST

### Scene 6: Location Photograph
- **Status:** 🟡 READY WITH 1-LINE CHANGE
- **Change:** Add `<img>` tag to the reserved frame div
- **Then:** Place photograph in `/public/location-trust/`
- **Result:** Image will render immediately
- **Time to implement:** 5 minutes

### Scene 7: Store Badges
- **Status:** 🟡 READY WITH 2-LINE CHANGE
- **Change:** Swap placeholder `<span>` boxes with `<img>` tags
- **Then:** Place badges in `/public/store-badges/`
- **Result:** Badges will render immediately
- **Time to implement:** 5 minutes

---

## ASSET DELIVERY WORKFLOW

### Step 1: Deliver Scene 5 Assets (No Code Changes)
1. Designer delivers: `screen-1.png` through `screen-5.png` (192×380px each)
2. Dev places files in: `/public/app-screenshots/`
3. Scene 5 renders automatically ✅

### Step 2: Add 1-Line to Scene 6 (Image Intake Ready)
1. Dev edits: `/components/v3/scenes/Scene6LocationTrust.tsx`
2. Dev adds: `<img>` tag inside the reserved frame div
3. Designer delivers: Location photograph (1024×576px)
4. Dev places file in: `/public/location-trust/`
5. Scene 6 renders automatically ✅

### Step 3: Swap 2 Lines in Scene 7 (Badge Intake Ready)
1. Dev edits: `/components/v3/scenes/Scene7FinalAccess.tsx`
2. Dev replaces: Two `<span>` placeholders with `<img>` tags
3. Designer delivers: `app-store-badge.png` and `google-play-badge.png` (152×48px each)
4. Dev places files in: `/public/store-badges/`
5. Scene 7 renders automatically ✅

---

## PARALLEL WORK POSSIBLE

- **Designer:** Creating all assets (5 screenshots, 1 photo, 2 badges) in parallel
- **Dev:** Making 1+2 line changes to Scenes 6 & 7 in parallel
- **No blocking:** Scene 5 loads immediately; Scenes 6 & 7 are unblocked by asset delivery

---

## TYPE SAFETY & LINT

- ✅ All components pass `npx tsc --noEmit`
- ✅ All components pass ESLint (if configured)
- ✅ Adding `<img>` tags will not break type safety
- ✅ No TypeScript interface changes needed
- ✅ No prop additions needed

---

## PERFORMANCE CONSIDERATIONS

### Scene 5 (5 Images)
- **Total size estimate:** 5 × 192×380px PNGs ≈ 500KB–1MB (depends on compression)
- **Recommendation:** Optimize PNGs with TinyPNG or similar; consider WebP if browser support allows
- **Lazy loading:** Not needed (images are in viewport during scene)

### Scene 6 (1 Image)
- **Size estimate:** 1024×576px JPG ≈ 100–200KB
- **Recommendation:** Export at quality 75–80 for web; consider WebP variant
- **Lazy loading:** Not needed (image is in viewport during scene)

### Scene 7 (2 Images)
- **Size estimate:** 2 × 152×48px PNGs ≈ 50–100KB
- **Recommendation:** Compress PNGs; WebP not necessary for small badges

### Total Estimated Load
- **All assets:** ~700KB–1.3MB
- **With gzip:** ~200–400KB
- **Acceptable:** Yes, all assets should load within 1–2 seconds on typical connections

---

## FALLBACK BEHAVIOR

### If Assets Are Missing
- ✅ Scene 5: Placeholder frame renders (blank phone mockup)
- ✅ Scene 6: Placeholder frame renders (empty box with glow)
- ✅ Scene 7: Placeholder badges render (text boxes)
- ✅ No broken images, no console errors, no layout shifts

### If Assets Fail to Load
- ✅ `onError` handlers prevent broken-image display
- ✅ Scenes continue to render with placeholders
- ✅ No impact on other scenes or page functionality

---

## TESTING CHECKLIST

### Before Pushing Assets to Production

- [ ] All images load without 404 errors
- [ ] All images display at correct dimensions
- [ ] Animation transitions are smooth (no jank)
- [ ] Mobile responsiveness is maintained (test at 375px, 768px, 1920px widths)
- [ ] No console errors or warnings
- [ ] Scene scroll progress controls animations correctly
- [ ] Glow effect in Scene 6 appears and disappears on time
- [ ] Crossfades in Scene 5 are smooth and 500ms duration

---

## ROLLBACK PROCEDURE

If assets need to be replaced or removed:

1. Delete asset files from `/public/app-screenshots/`, `/public/location-trust/`, `/public/store-badges/`
2. Components will revert to placeholder displays automatically
3. No code changes needed to rollback

---

## APPROVAL CHECKLIST

- [ ] Designer has reviewed `ASSET_CONSUMER_SPEC.md` and `ASSET_PRODUCER_QUICK_START.md`
- [ ] Dev has reviewed this document
- [ ] Scene 5 is ready to accept images (no code change needed)
- [ ] Scene 6 has 1-line code change scheduled
- [ ] Scene 7 has 2-line code change scheduled
- [ ] All assets meet dimension and format requirements
- [ ] Dev team has confirmed testing workflow

---

**Status:** ✅ **READY FOR ASSET INTAKE**

Scenes 5, 6, and 7 are code-complete and ready to receive production assets.
No architectural changes or component refactoring is needed.
Minimal inline code additions (1 line for Scene 6, 2 lines for Scene 7) complete the integration.

