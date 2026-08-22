# App

Everything representing the Iron Oasis mobile app: real product screenshots,
the feature-walkthrough demos, and the official store badges.

## screenshots/ — Scene5 (App Experience)

**Component:** `components/v3/scenes/Scene5AppExperience.tsx`
**Required files:** `screen-1.png` .. `screen-5.png`
**Dimensions:** 192×380px (native) — the device frame is fixed at exactly
this size; a 2x variant (384×760px) works too since the `<img>` is unsized by
CSS pixels via the frame, not the intrinsic dimensions.
**Format:** PNG or WebP.
**Steps (in order):** Book a session → Receive access → Arrive → Unlock the
gym → Train privately.

The `<img>` tags already exist in code (`src={`/app/screenshots/screen-${i +
1}.png`}`) with an `onError` handler that hides the element gracefully if the
file is missing — so dropping files in with the exact names above is the only
step required. No timing or layout change needed; opacity is already driven
by the same beat curve as the on-screen captions.

## features/ — Scene4 (How It Works)

**Component:** `components/v3/scenes/Scene4HowItWorks.tsx`
**Required files:** `feature-1.png` .. `feature-5.png` (or `.webm`/`.mp4` for
video — see `public/video/README.md`)
**Dimensions:** 400×600px (portrait 2:3).
**Steps (in order):** Download the app → Choose training time → Reserve the
gym → Receive access → Walk in and train.

Unlike Scene5, this one is not yet wired to any `<img>` — the reserved frame
(`components/v3/scenes/Scene4HowItWorks.tsx`, the `frameNumberRef` block) is
still an empty div. Wiring it up when assets arrive means adding an `<img>`
(or `<video>`) inside that frame, keyed to the existing per-step index, using
the same `onError`-hide pattern as Scene5 — no change to the beat timing.

## badges/ — Scene7 (Final Access)

**Component:** `components/v3/scenes/Scene7FinalAccess.tsx`
**Required files:** `app-store-badge.png`, `google-play-badge.png`
**Dimensions:** 152×48px, both.
**Format:** PNG 32-bit with transparency. Official badges only — download
from Apple's and Google's developer/marketing sites, no custom redesigns.

The `<img>` tags and `onError` fallback already exist in code
(`/app/badges/app-store-badge.png`, `/app/badges/google-play-badge.png`).
Drop the two files in with the exact names above.

Note: the CTA button beneath the badges already points to `/apply` (the real
membership application flow) — that is not a placeholder and needs no asset.
