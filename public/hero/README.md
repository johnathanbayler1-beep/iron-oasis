# Hero

Top-of-funnel and social/SEO imagery — the assets that represent the
experience before a visitor scrolls, or before they've even clicked through
(link previews, search results).

## Reserved, not yet produced

- **`og-image.png`** — 1200×630px. `app/layout.tsx` already references
  `https://ironnedoasis.com/og-image.png` in both `openGraph.images` and
  `twitter.images`. The file does not exist in `/public` today — every link
  share and Twitter/X card is currently pointing at a 404. This is the single
  highest-priority asset in this folder: it affects how the site looks when
  shared, right now, not after some future launch gate.
  - Once produced, place at `public/hero/og-image.png` and update the two
    `images` URLs in `app/layout.tsx` from `/og-image.png` to
    `/hero/og-image.png`.

No other slot in the v3 experience (`components/v3/timeline/MasterTimeline.tsx`
and its scenes) currently expects a "hero" image or video — Scene 0
(`Scene0Loading`) and the opening beats are text/canvas only, and the shared
gym Canvas (`SharedGymCanvas.tsx`) covers the loading moment with its own
`<Html>` brand overlay, not an image. If a future opening beat is added ahead
of the logo reveal (a poster frame behind the loading state, for instance),
its asset belongs here.
