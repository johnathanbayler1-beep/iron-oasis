# IRON OASIS V3 — FINAL ASSET CONSUMER SPEC

**Purpose:** Exact specification for designers/asset producers. No guessing, no iteration on dimensions, no code changes required after assets arrive.

**Last Updated:** 2026-08-06  
**Status:** Ready for production asset intake

---

## SCENE 4: How It Works

**Role in narrative:** Explains the five steps to booking and training at Iron Oasis.

### Visual Placement & Dimensions

**App Frame (Phone Portrait)**
- **Location:** Right side of screen, below headline
- **Dimensions:** 172px wide × 340px tall (exact)
- **Border radius:** 28px (cornered edges)
- **Border:** 1px solid, color `#C9A84C` at 30% opacity
- **Background fill:** `white` at 2% opacity
- **Status bar / Notch:** 
  - 8px wide × 1px tall
  - Positioned 3px from the top, horizontally centered
  - Color: `white` at 10% opacity
  - Border radius: 4px (slightly rounded)

### Animation & Interaction

- **Frame stays static** — same position, same appearance throughout the scene
- **Content inside frame:** Currently empty placeholder
- **Step counter indicator:** Appears above the frame, shows "01/05", "02/05", etc. as steps progress
  - Only the counter changes; the frame itself does not
- **Timing:** No individual frame duration; counter updates on scene progress

### Designer Instructions

1. **DO NOT:** Create five separate phone mockups or screenshots for this scene
2. **DO:** Produce one 2× high-res mockup (344px × 680px) for export as reference
3. **Asset needed:** None at this time (frame is placeholder)
4. **Fallback content:** Keep the frame empty with the subtle gold border visible
5. **Future swap:** When app screenshots exist, they will be placed inside this exact frame with no design changes

### Common Mistakes to Avoid

- ❌ Creating rounded corners > 28px (will overflow the frame)
- ❌ Adding shadows or glows (they're not in the spec and will compete with Scene 6's glow)
- ❌ Using padding inside the frame (assets will size 172×340 to fill it exactly)
- ❌ Animating the frame itself (only the counter animates)

### Code Status

✅ No code changes needed before assets arrive  
✅ Frame is already built and styled  
✅ Frame will accept inner content without modifications

---

## SCENE 5: App Experience

**Role in narrative:** Shows the app in action through five distinct screens, each tied to a booking/training moment.

### Visual Placement & Dimensions

**App Device Frame (Phone Portrait)**
- **Location:** Center of screen
- **Dimensions:** 192px wide × 380px tall (exact)
- **Border radius:** 30px (cornered edges)
- **Border:** 1px solid, color `#C9A84C` at 30% opacity
- **Background fill:** Pure black (`#000000`)
- **Status bar / Notch:**
  - 9px wide × 1px tall
  - Positioned 3px from the top, horizontally centered
  - Color: `white` at 10% opacity
  - Border radius: 4px (slightly rounded)

### Asset Files & Naming

**Delivery path:** `/public/app-screenshots/`

| Screen # | Filename | Display Moment | Caption |
|----------|----------|---|---|
| 1 | `screen-1.png` | First booking screen | "Book a session." |
| 2 | `screen-2.png` | Access confirmation | "Receive access." |
| 3 | `screen-3.png` | Arrival/navigation | "Arrive." |
| 4 | `screen-4.png` | Door/gym unlock | "Unlock the gym." |
| 5 | `screen-5.png` | In-gym training UI | "Train privately." |

### Asset Specifications

**File Format:** PNG (32-bit with alpha channel preferred, but opaque PNG acceptable)

**Dimensions:** 192px wide × 380px tall (must be exact)
- No padding or letterboxing
- Content should fill the frame completely
- 2× export for web: 384px × 760px (optional, for sharper displays)

**Content Requirements:**
- Each screen should show a distinct moment in the booking/training journey
- Screens should suggest progression and confidence-building
- Avoid generic UI mockups; content should feel like a real, cohesive app

**Pixel Density:**
- 1x: 192×380px (standard display)
- 2x: 384×760px (Retina/high-DPI—optional but recommended)

### Animation & Interaction

- **Timing:** Each screen holds for ~1–2 seconds, then fades to the next
- **Transition:** 500ms ease-in-out crossfade (CSS handles this)
- **Caption timing:** Caption and image fade in/out together
- **No manual control:** Screens auto-advance with scene scroll progress

### Designer Instructions

1. **Sequence:** Create five distinct app screens in logical order (booking → arrival → training)
2. **Consistency:** All five screens should use the same app design language, color palette, and typography
3. **Device bezel:** Do NOT include the phone frame or status bar in the image files
   - The frame is rendered by the component
   - Deliver only the screen content (192×380px inner area)
4. **Safe area:** Assume 3px safe margins on all sides due to frame bezel
5. **Status bar area:** If your design includes a status bar, place it 3px from the top of your 192px canvas
6. **Export:** Save each as `screen-1.png` through `screen-5.png` with no version numbers or suffixes

### Common Mistakes to Avoid

- ❌ Including the phone bezel in the image (frame is already drawn by the component)
- ❌ Creating images larger than 192×380px (will be cropped or distorted)
- ❌ Adding subtle blur or shadow effects (will read as dirt on export)
- ❌ Using animated GIFs or video (component expects static PNG)
- ❌ Inconsistent aspect ratio between screens (all must be exactly 192×380px)
- ❌ Placing critical content in the top 3px (reserved for status bar rendering)

### Code Status

✅ No code changes needed before assets arrive  
✅ Component already scans `/public/app-screenshots/` and loads images automatically  
✅ `onError` handler prevents broken-image display if files are missing  
✅ Timing and transitions are locked in and will not change

---

## SCENE 6: Location / Trust

**Role in narrative:** Establishes the space as a detached, private sanctuary (not a shared studio corner).

### Visual Placement & Dimensions

**Cinematic Photograph Frame (16:9 Widescreen)**
- **Location:** Center of screen, above text
- **Aspect ratio:** 16:9 (widescreen cinema)
- **Max width:** 512px (`max-w-xl`)
- **Responsive height:** Scales proportionally to width (512px wide = 288px tall at 100% scale)
- **Border radius:** 18px (cornered edges)
- **Border:** 1px solid, color `#C9A84C` at 30% opacity
- **Background fill:** `white` at 2% opacity
- **Glow effect (inset):** `0 0 50px 6px rgba(201, 168, 76, 0.1)` (inset box-shadow)
  - Glow appears/disappears based on which text beat is active
  - Glow fades to invisible when no text is dominant

### Asset Files & Naming

**Delivery path:** `/public/location-trust/`

**Content:** One single photograph that stays constant (not a carousel)
- **Suggested filename:** `exterior-entrance.jpg` or `location-hero.jpg` (component does not prescribe the name yet)
- **Duration:** Photograph remains visible for the entire 1-minute scene duration
- **Rotation:** Does NOT rotate between different location photos
  - Single frame emphasizes "this one sanctuary" narrative
  - Avoids real-estate-listing aesthetic

### Asset Specifications

**File Format:** JPG or WebP (JPG is standard for photography; WebP preferred for web performance)

**Dimensions:** Minimum 512px wide, 16:9 aspect ratio
- Recommended export size: 1024px × 576px (2x for crisp display)
- Deliver both if possible:
  - **1x:** 512px × 288px (web)
  - **2x:** 1024px × 576px (Retina)

**Content Requirements:**
- **Scope:** Exterior facade, entrance, immediate neighborhood, or combination
- **Tone:** Confident, not defensive
  - Should NOT look like a gym or fitness facility (that's Scene 2)
  - Should NOT look like shared commercial space (no signage suggesting multiplicity)
  - Should feel like a private, detached property
- **Lighting:** Natural or balanced; should feel inviting and clear
- **Season/time:** Bright, well-lit (suggest daytime or golden hour)
- **Composition:** Rule of thirds preferred; architectural lines should feel clean

**Quality requirements:**
- Sharp, in-focus photography
- No motion blur or intentional artistic blur
- Color grading optional (should match the overall site tone—refined, minimal, subtle)
- No text, logos, or identifying markers (generic location feel is the goal)

### Animation & Interaction

- **Visibility:** Glow effect intensifies and fades with each text beat
  - Appears when a text step is dominant (opacity > 0.5)
  - Fades when text recedes
- **No manual interactivity:** Glow is automatic based on scene scroll progress
- **Five text beats:** Each text line has its own glow timing
  - 1. "A quiet private location."
  - 2. "A dedicated gym space."
  - 3. "No employees."
  - 4. "No crowds."
  - 5. "Your session is yours."

### Designer Instructions

1. **Single frame:** Deliver ONE photograph, not five variants
   - Photograph should stand alone and support all five text statements
2. **Composition:** Frame the shot so key architectural or landscape elements fill the frame
3. **Aspect ratio:** Ensure precisely 16:9 (1.77:1)
4. **Safe area:** Assume 18px corner radius on all edges; avoid placing critical detail at sharp corners
5. **Export name:** Pending component architecture decision (to be confirmed)
6. **Delivery:** Provide both 1x and 2x versions if possible for crisp web display

### Common Mistakes to Avoid

- ❌ Delivering five different photographs (component only displays one)
- ❌ Aspect ratio not exactly 16:9 (will distort or letterbox)
- ❌ Overly stylized or filtered photography (should feel like documentary capture)
- ❌ Including recognizable landmarks or names (kills the "any peaceful location" feeling)
- ❌ Shooting in poor light or with shadows obscuring the space
- ❌ Including people in the photograph (should emphasize privacy/emptiness)
- ❌ Adding text, watermarks, or graphics (component frame provides borders)

### Code Status

✅ No code changes needed before assets arrive  
✅ Component has reserved space and styling ready  
✅ Once asset path is determined, only filename needs to be swapped  
✅ Timing and glow effects are locked and will not change

---

## SCENE 7: Final Access

**Role in narrative:** CTA beat; directs visitor to membership application.

### Visual Placement & Dimensions

**Beat 2: Store Badges (App Store & Google Play)**

**Location:** Center of screen, in vertical flex layout below "Available on iOS and Android." text

**Placeholder Badge Dimensions (current state):**
- **Width:** 152px per badge
- **Height:** 48px
- **Border radius:** 10px
- **Border:** 1px solid `#C9A84C` at 30% opacity
- **Background:** `white` at 2% opacity
- **Gap between badges:** 16px (flex-gap: 4)

**Current display:** Placeholder boxes with text labels "App Store" and "Google Play"

### Asset Files & Naming

**Delivery path:** `/public/store-badges/`

**Badges needed:**
1. **App Store badge** — official Apple App Store badge
2. **Google Play badge** — official Google Play badge

**File format:** PNG with transparency (24-bit or 32-bit)

**Dimensions:** 152px wide × 48px tall per badge (exact)
- Both badges must be the same size for symmetric layout
- If official badges are different aspect ratios, scale them to fit the 152×48px box while maintaining aspect ratio (with padding if needed)

### Asset Specifications

**Content:**
- **App Store:** Official Apple "Download on the App Store" badge
  - Current official version: Black badge with white text
  - Ensure it's the current year's official badge (Apple updates these periodically)
- **Google Play:** Official Google "Get it on Google Play" badge
  - Current official version: Black badge with white text
  - Ensure it's the current year's official badge

**Quality:**
- Badges should be official downloads from Apple and Google developer sites
- No custom redesigns or modifications
- Should be optimized for web (PNG, no excessive file size)

**Accessibility:**
- Badges should include alt text indicating the store (component to add)
- Badges should link to the appropriate app store listing (pending app launch)

### Animation & Interaction

- **Visibility:** Badges fade in and out on Beat 2 timing
- **Duration:** Holds for ~2 seconds
- **Transition:** 500ms fade in/out (automatic)
- **Interactivity:** Not clickable until app is live
  - Current placeholders are non-interactive
  - Will become clickable links once app store listings exist

### Designer Instructions

1. **Source:** Download official badges directly from:
   - Apple: https://developer.apple.com/app-store/marketing/guidelines/
   - Google: https://play.google.com/intl/en_us/badges/
2. **Sizing:** Scale both badges to fit 152×48px boxes exactly
   - Use center-crop or padding to preserve aspect ratio
   - Both should appear the same height visually
3. **Testing:** Verify badges are legible at 152px width on typical screens
4. **Export:** Save as `app-store-badge.png` and `google-play-badge.png` (names TBD)

### Common Mistakes to Avoid

- ❌ Creating custom badge designs (official badges only)
- ❌ Using outdated or deprecated badge versions
- ❌ Scaling badges to different sizes (both must be 152×48px)
- ❌ Adding drop shadows or glows to badges
- ❌ Converting to other formats (PNG preferred for web)
- ❌ Forgetting transparency (component needs to render against dark scrim)

### Code Status

✅ No code changes needed before assets arrive  
✅ Component is ready to accept image files  
✅ Placeholder boxes will be swapped for real badges with minimal code change  
✅ Links will be wired during app launch phase

---

## CROSS-SCENE DESIGN SYSTEM

### Color Palette

All scenes use a consistent gold accent color for borders and glows:
- **Primary accent:** `#C9A84C` (warm gold)
- **Used at:** 30% opacity for borders, 10% for glows
- **Typography:** All text is light on dark background (`#050505` background, `#ededed` text)

### Typography

- **Headlines:** Font-display (custom system font), uppercase, medium weight
- **Body text:** System font, light weight
- **Captions (Scene 5):** 11px, uppercase, gold color, letter-spacing `0.22em`

### Shared Styling

- **Border style:** All frames use 1px solid borders with `#C9A84C` at 30%
- **Border radius:** Varies per scene (28px/30px for phones, 18px for widescreen frame)
- **Background fill:** Consistent `white` at 2% opacity (subtle depth)
- **Rounded corners:** CSS handles—do not include in asset files

### Animation Principles

- **Crossfade timing:** 500ms ease-in-out (standard across app)
- **Beat timing:** Scene progress controls all animations (no manual user control)
- **Easing curve:** Custom cubic bezier ease-in-out applied to all transitions

---

## ASSET CHECKLIST

### Scene 4: How It Works
- [ ] NO assets needed (frame is placeholder)
- [ ] Mockup for reference (optional)

### Scene 5: App Experience
- [ ] `screen-1.png` (192×380px) — "Book a session."
- [ ] `screen-2.png` (192×380px) — "Receive access."
- [ ] `screen-3.png` (192×380px) — "Arrive."
- [ ] `screen-4.png` (192×380px) — "Unlock the gym."
- [ ] `screen-5.png` (192×380px) — "Train privately."
- [ ] Optional: 2x versions (384×760px) for Retina displays

### Scene 6: Location / Trust
- [ ] Location photograph (1024×576px, 16:9)
- [ ] Optional: 1x version (512×288px) if 2x is primary
- [ ] Verify 16:9 aspect ratio
- [ ] Verify no recognizable landmarks

### Scene 7: Final Access
- [ ] App Store badge (152×48px PNG)
- [ ] Google Play badge (152×48px PNG)

---

## ASSET DELIVERY CHECKLIST

### File Organization

```
/public/
├── app-screenshots/
│   ├── screen-1.png
│   ├── screen-2.png
│   ├── screen-3.png
│   ├── screen-4.png
│   └── screen-5.png
├── location-trust/
│   └── [TBD: exterior-entrance.jpg or location-hero.jpg]
└── store-badges/
    ├── app-store-badge.png
    └── google-play-badge.png
```

### QA Before Delivery

- [ ] All PNG files are 32-bit with transparency
- [ ] All dimensions are exact (no rounding or approximation)
- [ ] No images have oversized file sizes (gzip/WebP compression applied)
- [ ] All images open without errors in web browsers
- [ ] Color spaces are sRGB (standard for web)
- [ ] No embedded color profiles causing shifts
- [ ] File names match exactly (case-sensitive on Linux servers)

---

## KNOWN CONSTRAINTS & IMMUTABLE SPECS

### DO NOT CHANGE THESE

1. **Scene 4 frame:** 172×340px, 28px radius (locked to app dimensions)
2. **Scene 5 frame:** 192×380px, 30px radius (locked to device mockup)
3. **Scene 5 captions:** Text is hardcoded and will not change
4. **Scene 6 aspect ratio:** Strictly 16:9 (will distort otherwise)
5. **Scene 6 single frame:** Only one photograph, no carousel
6. **Scene 7 badges:** 152×48px, official graphics only
7. **Animation timing:** 500ms crossfade, controlled by scroll progress

### Things That WILL Change

- Asset file paths (if component architecture updates)
- Placeholder text/styling (once real assets are in place)
- Store badge links (once app is live)

---

## NEXT STEPS

1. **Designer intake:** Provide this spec to the design team with no modifications
2. **Asset creation:** Designers produce assets to exact specifications
3. **Delivery:** Deposit files in `/public/` directory structure as listed above
4. **QA:** Run through the checklist above before final delivery
5. **Integration:** Component will load and render assets automatically once files are in place
6. **Testing:** No code changes required; scenes should render correctly on first load

---

## NOTES FOR THE DEVELOPMENT TEAM

### What NOT to do before assets arrive:

- ❌ Do not add conditional logic for missing assets (fallback already exists)
- ❌ Do not create loader states or spinners (placeholder frames already render)
- ❌ Do not modify component prop interfaces (they're already built for asset paths)
- ❌ Do not change animation timing (it's coordinated across all scenes)

### What the component will do automatically:

- ✅ Load images from `/public/app-screenshots/screen-*.png` (Scene 5)
- ✅ Apply CSS transformations and transitions automatically
- ✅ Handle image errors gracefully (onError handler prevents broken images)
- ✅ Fade in/out based on scene progress (no manual control needed)
- ✅ Render all border and styling (component provides, not asset files)

### Code changes required after assets arrive:

None, unless:
- Asset file paths change in component architecture
- Store badge links need to be wired to real app store listings (Scene 7 only)
- A5 responsive dimensions need adjustment (rare; current breakpoints are solid)

---

**End of Asset Consumer Spec**
