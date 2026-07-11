# Iron Oasis — Project Protocol

## Canonical Branch
- All active development must occur on: **rebuild-from-scratch**

## Brand Vocabulary (Canonical)
- **Preferred**: spatial autonomy, private space, solo window, high-end premium environment, node operator, access keys.
- **Banned**: clearance, gym, workout, train, membership, sign up, gains, fitness, tiers, subscriptions, sanctuary, beast mode, grind, gym floor, precision.

## Architecture
- **Framework**: Next.js 16.2.9, App Router, Turbopack.
- **Components**: GymScene, GymSpin (must remain permanently mounted once triggered).
- **Generator**: Use `scripts/new-site.mjs` for all new site expansions.
- **State**: Strictly enforce "gymMounted" state gating for 3D canvas logic to prevent layout collapse.
