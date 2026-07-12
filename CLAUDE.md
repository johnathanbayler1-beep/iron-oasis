# Iron Oasis — Project Protocol

## Canonical Branch
- All active development must occur on: **rebuild-from-scratch**

## Brand Vocabulary (Canonical)
- **Allowed**: Gym, Workout, Train, Access, Booking, Session, Private, Windsor.
- **Banned**: Node Operator, System Deployment, Partner, Franchise, Network, Area Developer.
- **Tone**: Plain English. Simple, direct, warm, and inviting. No tech-heavy lingo. Focus on the ease of booking and the privacy of the workout.

## Architecture
- **Framework**: Next.js 16.2.9, App Router, Turbopack.
- **Components**: GymScene, GymSpin (must remain permanently mounted once triggered).
- **Generator**: Use `scripts/new-site.mjs` for all new site expansions.
- **State**: Strictly enforce "gymMounted" state gating for 3D canvas logic to prevent layout collapse.
