"use client";

import { Suspense, useContext, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import CameraRig from "../camera/CameraRig";
import GymModel from "../three/GymModel";
import LightingRig from "../three/LightingRig";
import { SceneProgressContext } from "./SceneProgressContext";
import { GymSceneContext } from "./GymSceneContext";
import { ASSET_REGISTRY } from "../assets/registry";
import { HERO_POSE } from "./Scene3PrivateExperience";

// Shared 3D gym Canvas — the single WebGL context behind Scene2GymReveal,
// Scene3PrivateExperience, and GymBackdrop. Those three previously each
// mounted an identical Canvas/GymModel/LightingRig/CameraRig/HDRI stack of
// their own (three separate GLB decodes, three live WebGL contexts, held
// simultaneously for most of the scroll since none of them unmount, only
// fade). This is the same stack, mounted once, with visibility and the
// lighting/environment progress it reads driven by GymSceneController
// instead of each scene owning its own copy.
//
// No camera, lighting, or model behavior changes here — CameraRig, LightingRig,
// and GymModel are untouched, and still read from the same CameraContext /
// SceneProgressContext they always did. Only the Canvas ownership moved.

// Environment-intensity ramp per dominant source, unchanged from what used
// to live inside Scene2GymReveal's and Scene3PrivateExperience's own
// EnvironmentIntensityRig components. GymBackdrop's own Canvas never touched
// environmentIntensity, leaving it at the THREE.Scene default (1) for as
// long as it was on screen — reproduced here as the "backdrop" case.
function EnvironmentIntensityRig() {
  const controller = useContext(GymSceneContext);
  const { scene } = useThree();
  useFrame(() => {
    if (!controller) return;
    const p = controller.progressRef.current;
    switch (controller.dominantSource) {
      case "gym-reveal":
        scene.environmentIntensity = 0.03 + Math.min(1, Math.max(0, p)) * 0.1;
        break;
      case "private-experience":
        scene.environmentIntensity = 0.08 + Math.min(1, Math.max(0, p * 1.2)) * 0.08;
        break;
      case "backdrop":
        scene.environmentIntensity = 1;
        break;
    }
  });
  return null;
}

export default function SharedGymCanvas() {
  const rootRef = useRef<HTMLDivElement>(null);
  const controller = useContext(GymSceneContext);

  useEffect(() => {
    if (!controller) return;
    const el = rootRef.current;
    const apply = () => {
      if (el) el.style.opacity = String(controller.getCombinedOpacity());
    };
    apply();
    return controller.subscribe(apply);
  }, [controller]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-[15] overflow-hidden bg-[#050505] opacity-0"
    >
      <SceneProgressContext.Provider value={controller?.progressRef ?? null}>
        <Canvas
          dpr={[1, 1.5]}
          shadows
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.82,
          }}
          camera={{
            fov: HERO_POSE.fov,
            near: 0.1,
            far: 60,
            position: HERO_POSE.position,
          }}
        >
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={["#050505", 2.5, 10]} />
          <Suspense fallback={null}>
            <GymModel />
            <Environment files={ASSET_REGISTRY.hdriStudio.path} background={false} />
          </Suspense>
          <LightingRig />
          <EnvironmentIntensityRig />
          <CameraRig />
        </Canvas>
      </SceneProgressContext.Provider>
    </div>
  );
}
