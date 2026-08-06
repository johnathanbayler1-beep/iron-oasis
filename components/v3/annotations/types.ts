// Annotation layer foundation types. Annotations are short, in-scene text
// beats that appear over a fixed sub-range of a scene's local progress.

export interface Annotation {
  id: string;
  sceneId: string;
  /** [start, end] local progress within the scene, e.g. [0.2, 0.5]. */
  at: [number, number];
  content: string;
}
