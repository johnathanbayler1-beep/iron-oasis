# Video

Reserved for filmed/rendered footage once it exists. Nothing in the current
experience loads a video file — this folder is empty by design, not because
something is missing.

## Infrastructure already built, not yet wired to any scene

- `components/media/VideoPlayer.tsx` — lazy loading, poster image, fallback
  handling.
- `components/media/LazyMedia.tsx` — generic intersection-observer lazy mount
  with a fallback slot.
- `components/media/ImageSequence.tsx` — progressive frame-sequence loader
  (the same pattern `Scene1LogoReveal.tsx` hand-rolls for the logo frames,
  generalized).

None of these three are imported anywhere in `components/` or `app/` today.
They exist as ready-made plumbing for when real footage arrives, not as
placeholders standing in for anything currently on screen.

## Likely future consumers

These are the v3 beats built as static/empty placeholders today that a future
"filming complete" pass could upgrade to video instead of stills, per the task
brief's distinction between what stays 3D and what becomes real footage:

- **Scene6 (`Scene6LocationTrust.tsx`)** — the reserved 16:9 exterior/entrance
  frame currently expects a still (`public/gym/photography/`, see that
  folder's README). If the final asset is a short exterior/entrance clip
  instead of a photograph, it plugs in through `VideoPlayer.tsx` at the same
  spot, on the same beat timing (`activeStep`) — no change to the surrounding
  scene logic.
- **Scene4 (`Scene4HowItWorks.tsx`)** and **Scene5 (`Scene5AppExperience.tsx`)**
  — both explicitly allow video as an alternative to stills for their
  feature/app-screen beats (see `public/app/README.md`).

Scene2GymReveal, Scene3PrivateExperience, and GymBackdrop should stay 3D (see
`public/gym/README.md`) — those are camera-choreographed shots of the actual
room via CameraRig, not something video footage can substitute for without
losing the interactive camera move.
