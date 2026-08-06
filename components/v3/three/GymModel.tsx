"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ASSET_REGISTRY } from "../assets/registry";

const MODEL_PATH = ASSET_REGISTRY.gymSpace.optimizedPath ?? ASSET_REGISTRY.gymSpace.path;
const DRACO_DECODER_PATH = "/draco/";

// Using the glTF-Transform output (gym-space-2k-opt.glb, ~608KB) now that a
// self-hosted Draco decoder lives under /public/draco/ — previously this
// loaded the uncompressed source (gym-space-2k.glb, ~4.2MB) because drei's
// default Draco resolution goes to a CDN, which was worse for a scene meant
// to look reliable and finished than the extra weight. Geometry and UVs are
// identical between the two files (verified by comparing POSITION accessor
// min/max), so this is a pure payload reduction.
useGLTF.preload(MODEL_PATH, DRACO_DECODER_PATH);

// Scene 2's subject: the scanned gym interior. Bounds (Y-up, no parent
// transform): x [-3.65, 3.65], y [-1.735, 1.735], z [-2.77, 2.77] — a real
// room, not a stylized model, which is why lighting does the work here
// rather than any material replacement.
export default function GymModel() {
  const { scene } = useGLTF(MODEL_PATH, DRACO_DECODER_PATH);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Handled as a possible array, not just a single material: the
        // placeholder scan happens to export one material per mesh, but
        // that's an artifact of this specific export, not a guarantee the
        // final digital-twin scan will share — multi-material meshes are
        // common output from other scan/photogrammetry pipelines.
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if (material instanceof THREE.MeshStandardMaterial) {
            material.envMapIntensity = 0.35;
          }
        }
        // The scan's raw geometry carries hard per-face normals (a byproduct
        // of decimation), which reads as a faceted, crystalline low-poly
        // surface under any directional or spot light — the single biggest
        // thing making the room look game-like rather than photographed.
        // Welding coincident vertices and rebuilding smooth normals turns
        // those facets into continuous surfaces without altering silhouette.
        const geometry = child.geometry;
        if (geometry && !geometry.userData.smoothed) {
          const merged = mergeVertices(geometry, 1e-4);
          merged.computeVertexNormals();
          merged.userData.smoothed = true;
          child.geometry = merged;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}
