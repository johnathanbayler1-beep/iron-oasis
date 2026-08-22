// Declarative asset registry for the V3 experience. Scenes look up what they
// need by id instead of hardcoding paths, so swapping/optimizing an asset
// later touches one file.

export interface FrameSequenceAsset {
  type: "frame-sequence";
  id: string;
  basePath: string;
  frameCount: number;
  padLength: number;
  extension: string;
}

export interface ModelAsset {
  type: "model";
  id: string;
  path: string;
  optimizedPath?: string;
}

export interface HdriAsset {
  type: "hdri";
  id: string;
  path: string;
}

export type AssetDescriptor = FrameSequenceAsset | ModelAsset | HdriAsset;

export const ASSET_REGISTRY = {
  logoFrames: {
    type: "frame-sequence",
    id: "logoFrames",
    basePath: "/logo/logo_",
    frameCount: 121,
    padLength: 3,
    extension: "webp",
  },
  gymSpace: {
    type: "model",
    id: "gymSpace",
    path: "/gym/gym-space-2k.glb",
    optimizedPath: "/gym/gym-space-2k-opt.glb",
  },
  hdriStudio: {
    type: "hdri",
    id: "hdriStudio",
    path: "/gym/hdri/studio_small_03_1k.hdr",
  },
  hdriLebombo: {
    type: "hdri",
    id: "hdriLebombo",
    path: "/gym/hdri/lebombo_1k.hdr",
  },
} as const satisfies Record<string, AssetDescriptor>;

export function frameSequenceUrl(asset: FrameSequenceAsset, index: number): string {
  const clamped = Math.min(asset.frameCount - 1, Math.max(0, Math.round(index)));
  return `${asset.basePath}${String(clamped).padStart(asset.padLength, "0")}.${asset.extension}`;
}
