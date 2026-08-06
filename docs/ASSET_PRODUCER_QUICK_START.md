# ASSET PRODUCER QUICK START

**For:** Designers creating production assets  
**Read time:** 5 minutes  
**Full spec:** See `ASSET_CONSUMER_SPEC.md`

---

## DELIVERABLES AT A GLANCE

| Scene | Asset | Dimensions | Qty | Path |
|-------|-------|-----------|-----|------|
| 4 | None (placeholder) | — | — | — |
| 5 | App screenshots (PNG) | 192×380px each | 5 | `/public/app-screenshots/screen-1-5.png` |
| 6 | Location photo (JPG/WebP) | 1024×576px (2x) | 1 | `/public/location-trust/` |
| 7 | Store badges (PNG) | 152×48px each | 2 | `/public/store-badges/` |

---

## SCENE 5: App Screenshots (CRITICAL)

### The Ask
Five screens showing the app booking-to-training journey. Each screen is one moment.

### Exact Specs
- **Size:** 192px wide × 380px tall (no padding, no frame)
- **File:** PNG 32-bit
- **Names:** `screen-1.png`, `screen-2.png`, `screen-3.png`, `screen-4.png`, `screen-5.png`
- **Path:** `/public/app-screenshots/`

### What Goes in Each Screen
1. **screen-1:** Booking interface — reserve a session
2. **screen-2:** Confirmation screen — access granted
3. **screen-3:** Navigation or arrival info — getting there
4. **screen-4:** Entry point — unlock gym door
5. **screen-5:** Training UI — in the gym, training view

### Critical Rules
- ✅ DO: Create five distinct, coherent screens
- ✅ DO: Use consistent app design language across all five
- ❌ DON'T: Include the phone bezel or frame (component renders it)
- ❌ DON'T: Make images larger than 192×380px (will be cropped)
- ❌ DON'T: Use animated GIFs or video

### Designer's Perspective
Think: What five moments tell the story of "booking private gym time" from a user's point of view? Each screen should feel like a real app screen, not a mockup.

---

## SCENE 6: Location Photography (CRITICAL)

### The Ask
One photograph of the gym exterior or entrance. It stays visible for the entire scene and supports five different text messages.

### Exact Specs
- **Aspect ratio:** 16:9 (1.77:1) — strict
- **Size (2x):** 1024×576px
- **File:** JPG or WebP
- **Path:** `/public/location-trust/` (filename TBD)
- **Qty:** 1 (not 5 — this is NOT a carousel)

### What the Photo Should Show
- Exterior facade, entrance, or neighborhood
- Clean, well-lit, confident presentation
- Should NOT look like a commercial gym or shared studio
- Should NOT include people, logos, or identifying markers
- Should feel like a private, detached sanctuary

### Critical Rules
- ✅ DO: Shoot one photograph that stands alone
- ✅ DO: Maintain exactly 16:9 aspect ratio
- ✅ DO: Keep it bright and clear
- ❌ DON'T: Create five different photos (only one displays)
- ❌ DON'T: Use art filters or extreme color grading
- ❌ DON'T: Include recognizable landmarks or street addresses
- ❌ DON'T: Shoot in dark, shadowy, or moody lighting

### Designer's Perspective
Think: One architectural shot that says "this place is real, private, and somewhere you'd want to train" without being defensive about it.

---

## SCENE 4: How It Works (NO ASSETS NEEDED YET)

### Current State
- Frame is a placeholder
- Shows only a gold-bordered phone mockup
- Step counter displays (01/05, 02/05, etc.)

### No Action Needed
- Component is ready
- Frame styling is done
- Will accept future screenshots without code changes

---

## SCENE 7: Store Badges (OFFICIAL ONLY)

### The Ask
Two official app store badges. Current display is placeholder boxes; will swap to real badges.

### Exact Specs
- **Size:** 152px wide × 48px tall (both badges)
- **File:** PNG 32-bit (transparency required)
- **Path:** `/public/store-badges/`
- **Qty:** 2 (App Store + Google Play)

### Where to Get Them
- **App Store badge:** https://developer.apple.com/app-store/marketing/guidelines/
- **Google Play badge:** https://play.google.com/intl/en_us/badges/

### Critical Rules
- ✅ DO: Use official badges from Apple and Google only
- ✅ DO: Scale both to exactly 152×48px
- ❌ DON'T: Create custom badge designs
- ❌ DON'T: Use outdated badge versions
- ❌ DON'T: Add shadows or effects to badges

---

## MOST COMMON MISTAKES (& How to Avoid Them)

### Mistake 1: Wrong Dimensions
**What happens:** Asset gets cropped or distorted  
**Scene 5 example:** If you deliver 200×380px, it will be cropped to 192×380px, cutting off content  
**Prevention:** Use your design tool's constraint feature to lock dimensions; export at exact size

### Mistake 2: Including the Frame in the Asset
**What happens:** Double frame (one in asset, one rendered by component)  
**Scene 5 & 4 example:** If you include the iPhone bezel in your 192×380px image, the bezel gets squished  
**Prevention:** Export ONLY the screen content; component adds the bezel

### Mistake 3: Wrong Aspect Ratio on Location Photo
**What happens:** Image distorts or letterboxes  
**Scene 6 example:** If you shoot 4:3 instead of 16:9, it will look squeezed  
**Prevention:** Set your camera/export tool to 16:9 before shooting; verify after export with a dimension checker

### Mistake 4: Multiple Photos for Scene 6
**What happens:** Component will render only one photo, so others are wasted  
**Scene 6 example:** You create 5 "location mood" photos, but component displays only one  
**Prevention:** Read the spec first; Scene 6 explicitly says "one frame, not a carousel"

### Mistake 5: Wrong Color Space or Compression
**What happens:** Colors look wrong in browser, or file doesn't load  
**All scenes example:** JPG with CMYK color space won't render correctly on web  
**Prevention:** Verify color space is sRGB; use web-standard compression (gzip for PNG, WebP for efficiency)

### Mistake 6: App Screens That Don't Feel Cohesive
**What happens:** Screens look like they're from different apps  
**Scene 5 example:** Screen 1 is iOS-style, Screen 2 is Android-style, Screen 3 is material design  
**Prevention:** Design a unified app design language first; apply it consistently across all five screens

### Mistake 7: Location Photo Includes People or Branding
**What happens:** Photo reads as a real-estate listing instead of a sanctuary  
**Scene 6 example:** You shoot the gym entrance with staff visible or a big "Iron Oasis Gym" sign  
**Prevention:** Shoot at times when space is empty; crop out identifying markers

---

## EXPORT CHECKLIST

Before uploading each asset, verify:

- [ ] Correct dimensions (exact pixel count, not approximate)
- [ ] Correct aspect ratio (especially Scene 6: 16:9)
- [ ] PNG or JPG format (as specified)
- [ ] Color space is sRGB
- [ ] Transparency/alpha channel working (if PNG)
- [ ] File is under 500KB (reasonable web size)
- [ ] No embedded color profiles
- [ ] Filename matches spec exactly (case-sensitive)
- [ ] Opened successfully in browser (test before delivery)

---

## DELIVERY STRUCTURE

```
Create this folder structure in /public/:

public/
├── app-screenshots/
│   ├── screen-1.png
│   ├── screen-2.png
│   ├── screen-3.png
│   ├── screen-4.png
│   └── screen-5.png
├── location-trust/
│   └── [location-photo].jpg
└── store-badges/
    ├── app-store-badge.png
    └── google-play-badge.png
```

---

## QUESTIONS TO ASK YOURSELF

**Before Scene 5 (App Screenshots):**
- Does each screen represent a real app interaction?
- Are all five screens the same 192×380px size?
- Would someone recognize this as a unified app across all five screens?

**Before Scene 6 (Location Photo):**
- Is this exactly 16:9 aspect ratio?
- Does this photo stand alone without context?
- Would someone call this place "private" and "calm" after seeing it?
- Are there any people, logos, or addresses visible?

**Before Scene 7 (Store Badges):**
- Are both badges the same 152×48px size?
- Did I download them from official Apple/Google sources?
- Do they look crisp at 152px width?

---

## CONTACT & CLARIFICATION

If any specification is unclear:
1. Check `ASSET_CONSUMER_SPEC.md` for full details
2. Look at the component code in `/components/v3/scenes/`
3. Review the animation and interaction sections in the full spec

**Dimensions are not negotiable.** They are locked to the component layout.

---

**Ready to create assets?** Start with the checklist above, then dive into the full spec.
