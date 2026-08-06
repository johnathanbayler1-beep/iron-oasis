/**
 * Cinematic Asset Integration Points
 * Defines placeholders and integration patterns for:
 * - Logo frame sequences
 * - Kling-rendered motion assets
 * - Product reveal media
 * - GEM cinematic elements
 */

/**
 * Logo frame sequence configuration
 * Current: 121 frames of logo animation
 * Path: /public/frames/logo_XXX.webp
 */
export const LOGO_SEQUENCE = {
  frameCount: 121,
  frameWidth: 1920,
  frameHeight: 1080,
  fps: 30,
  format: 'webp',
  basePath: '/frames',
  getFramePath: (frameNum: number) => {
    const padded = String(frameNum).padStart(3, '0');
    return `/frames/logo_${padded}.webp`;
  },
  getFrameRange: (startFrame: number, endFrame: number) => {
    return Array.from(
      { length: endFrame - startFrame + 1 },
      (_, i) => startFrame + i
    ).map((frameNum) => LOGO_SEQUENCE.getFramePath(frameNum));
  },
};

/**
 * Future Kling motion asset placeholders
 * Ready for integration of Kling-rendered animations
 */
export const KLING_ASSETS = {
  // Scene transitions
  scene_transitions: {
    status: 'placeholder',
    description: 'Smooth cinematic transitions between scenes',
    slots: [
      { sceneFrom: 1, sceneTo: 2, placeholder: true },
      { sceneFrom: 2, sceneTo: 3, placeholder: true },
      { sceneFrom: 3, sceneTo: 4, placeholder: true },
      { sceneFrom: 4, sceneTo: 5, placeholder: true },
      { sceneFrom: 5, sceneTo: 6, placeholder: true },
      { sceneFrom: 6, sceneTo: 7, placeholder: true },
    ],
  },
  // Environment reveals
  environment_reveals: {
    status: 'placeholder',
    description: 'Cinematic reveals of gym environment',
    slots: [
      {
        id: 'gym_exterior',
        description: 'Exterior approach',
        placeholder: true,
      },
      {
        id: 'gym_interior_wide',
        description: 'Wide interior pan',
        placeholder: true,
      },
      {
        id: 'gym_equipment_showcase',
        description: 'Equipment detail showcase',
        placeholder: true,
      },
    ],
  },
};

/**
 * Product reveal media configuration
 * For app interface and features showcase
 */
export const PRODUCT_REVEAL = {
  app_interface: {
    status: 'placeholder',
    description: 'App UI/UX demonstration video',
    formats: {
      webm: '/assets/product/app-ui-demo.webm',
      mp4: '/assets/product/app-ui-demo.mp4',
      poster: '/assets/product/app-ui-demo-poster.png',
    },
  },
  features_showcase: {
    status: 'placeholder',
    description: 'Feature highlights video',
    formats: {
      webm: '/assets/product/features-showcase.webm',
      mp4: '/assets/product/features-showcase.mp4',
      poster: '/assets/product/features-showcase-poster.png',
    },
  },
  training_flow: {
    status: 'placeholder',
    description: 'User training flow demonstration',
    formats: {
      webm: '/assets/product/training-flow.webm',
      mp4: '/assets/product/training-flow.mp4',
      poster: '/assets/product/training-flow-poster.png',
    },
  },
};

/**
 * GEM (Gym Experience Media) cinematic elements
 */
export const GEM_CINEMATIC = {
  hero_sequence: {
    status: 'placeholder',
    description: 'Hero section cinematic sequence',
    duration_ms: 4000,
    video: {
      webm: '/assets/gem/hero-cinematic.webm',
      mp4: '/assets/gem/hero-cinematic.mp4',
      poster: '/assets/gem/hero-cinematic-poster.png',
    },
  },
  section_headers: {
    status: 'placeholder',
    description: 'Cinematic headers for each section',
    slots: [
      { section: 'experience', video_placeholder: true },
      { section: 'training', video_placeholder: true },
      { section: 'community', video_placeholder: true },
      { section: 'access', video_placeholder: true },
    ],
  },
  transition_effects: {
    status: 'placeholder',
    description: 'Smooth transition effects between sections',
    types: [
      { type: 'fade', duration_ms: 1000 },
      { type: 'slide', duration_ms: 1200 },
      { type: 'morph', duration_ms: 1500 },
    ],
  },
};

/**
 * Asset loading utility
 * Handles preloading and caching of cinematic assets
 */
export function preloadCinematicAssets() {
  if (typeof window === 'undefined') return;

  // Preload first frame of logo sequence
  const firstFrame = new Image();
  firstFrame.src = LOGO_SEQUENCE.getFramePath(0);

  // Preload product reveal posters
  Object.values(PRODUCT_REVEAL).forEach((asset) => {
    if (asset.formats?.poster) {
      const img = new Image();
      img.src = asset.formats.poster;
    }
  });

  // Preload GEM hero poster
  if (GEM_CINEMATIC.hero_sequence.video.poster) {
    const img = new Image();
    img.src = GEM_CINEMATIC.hero_sequence.video.poster;
  }
}

/**
 * Asset status tracker
 * Track which assets are ready vs placeholder
 */
export function getAssetReadiness() {
  const assets = {
    logo_sequence: { ready: true, frames: LOGO_SEQUENCE.frameCount },
    kling_assets: { ready: false, placeholder: true },
    product_reveal: { ready: false, placeholder: true },
    gem_cinematic: { ready: false, placeholder: true },
  };

  const readyCount = Object.values(assets).filter((a) => a.ready).length;
  const totalCount = Object.keys(assets).length;

  return {
    assets,
    readiness: `${readyCount}/${totalCount}`,
    allReady: readyCount === totalCount,
  };
}

/**
 * Asset integration checklist
 */
export const ASSET_CHECKLIST = {
  logo_reveal: {
    current: 'ready',
    action: 'Integrate existing frame sequence',
    status: '✓ Complete',
  },
  kling_transitions: {
    current: 'placeholder',
    action: 'Add Kling-rendered scene transitions',
    status: 'Pending',
  },
  product_media: {
    current: 'placeholder',
    action: 'Create/add product reveal videos',
    status: 'Pending',
  },
  gem_hero: {
    current: 'placeholder',
    action: 'Create/add GEM hero cinematic',
    status: 'Pending',
  },
  section_cinematics: {
    current: 'placeholder',
    action: 'Create/add section cinematic headers',
    status: 'Pending',
  },
  fallback_images: {
    current: 'ready',
    action: 'Ensure poster images for all video elements',
    status: '✓ In progress',
  },
};
