# Iron Oasis — Project Protocol

## Canonical Branch
- All active development must occur on: **rebuild-from-scratch**

## Brand Vocabulary (Canonical)
- **Allowed**: Access Key, Key, Private Node, Autonomy, Solo Window, Location, Private Access, Premium Equipment, Zero Sharing, 24/7 Access, Access, Booking, Session, Private, Windsor.
- **Banned**: Token, Spatial Token, Gym, Train, Workout, Gains, Grind, Membership, Partner, Franchise, Network, Area Developer.
- **Concept**: A premium private node in a quiet residential setting. Frictionless flow — park on the street, walk up the property, and the entire private node is yours.
- **Tone**: Apple / Emil Kowalski standard. Clean, high-contrast, confident. Premium and calm, not hype. Focus on privacy, zero sharing, and frictionless 24/7 access.

## Architecture
- **Framework**: Next.js 16.2.9, App Router, Turbopack.
- **Components**: GymScene, GymSpin (must remain permanently mounted once triggered).
- **Generator**: Use `scripts/new-site.mjs` for all new site expansions.
- **State**: Strictly enforce "gymMounted" state gating for 3D canvas logic to prevent layout collapse.
