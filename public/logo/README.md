# Logo

Brand mark assets — the animated Iron Oasis mark and, once produced, the static
brand-icon family used in browser chrome and social previews.

## Live today

**`logo_000.webp` .. `logo_120.webp`** — 121-frame WebP sequence, the animated
logo reveal scrubbed frame-by-frame against scroll progress.

- Consumed by: `components/v3/scenes/Scene1LogoReveal.tsx` (v3, via
  `components/v3/assets/registry.ts` → `ASSET_REGISTRY.logoFrames`) and
  `components/ScrollExperience.tsx` (legacy homepage, hardcoded `frameUrl()`).
  Both point at this one copy — there is no second set of frames anywhere.
- Naming: zero-padded to 3 digits, `logo_000.webp` through `logo_120.webp`, no
  gaps. `frameCount` in the registry (121) and the legacy `FRAME_COUNT`
  constant both assume that exact range — adding, removing, or renumbering
  frames means updating both.
- Format: WebP, one image per frame. Keep frame dimensions identical across
  the sequence (canvas draws whatever `naturalWidth`/`naturalHeight` the
  loaded frame reports).

## Reserved, not yet produced

- **`favicon.ico`** and **`apple-icon.png`** — `app/layout.tsx` already
  references `/favicon.ico` and `/apple-icon.png` in its `icons` metadata.
  Neither file exists yet (checked: not in `/public`, not a Next.js
  `app/icon.*` convention file either) — this is a live broken reference
  today, not a future placeholder. Standard sizes: `favicon.ico` multi-size
  (16/32/48px), `apple-icon.png` 180×180px.

Do not add new logo-frame files speculatively — the 121-frame sequence is
complete and working; this folder's only open item is the two icon files
above.
