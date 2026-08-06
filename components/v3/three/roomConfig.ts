// Shared contract between the gym GLB and everything that assumes its
// dimensions: the camera path (gymRevealPath.ts) and the lighting rig
// (LightingRig.tsx) both place things in world space relative to the room's
// floor, and previously each hardcoded FLOOR_Y as its own local constant —
// two copies of the same magic number that could silently drift out of sync.
//
// This value is measured from the current placeholder
// (public/gym-space-2k.glb POSITION accessors, Y-up, no parent transform):
// floor at y=-1.735, ceiling at y=1.735 (3.47m clear height), footprint
// ~7.3m (x) by 5.5m (z), centered on the origin.
//
// When the final digital-twin scan replaces the placeholder, it needs to
// either match this floor/origin convention (Y-up, floor at this height,
// centered at the origin) or this constant — and the hand-placed poses in
// gymRevealPath.ts and fixture positions in LightingRig.tsx that are offset
// from it — need to be re-measured against the new export. Centralizing the
// number here means that re-measurement is a one-line change instead of a
// hunt across files.
export const ROOM_FLOOR_Y = -1.735;
