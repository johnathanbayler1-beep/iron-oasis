"use client";

import { useContext, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CameraContext } from "./CameraProvider";
import type { CameraState } from "../types";

// How quickly the render camera catches up to the controller's target state,
// in the framerate-independent exponential-decay sense (higher = snappier).
// Tuned to read as a weighted dolly, not a snap-to-position cut.
const DAMPING = 2.6;

// Drives the R3F default camera from CameraController state. The controller
// is framework-agnostic (see camera/CameraController.ts); this is the one
// place that translates its state into an actual THREE.PerspectiveCamera,
// smoothing between scroll-scrub updates instead of jumping on each one.
export default function CameraRig() {
  const { camera } = useThree();
  const controller = useContext(CameraContext);

  const targetPosition = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const targetFov = useRef(50);
  const currentLook = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!controller) return;

    const apply = (state: CameraState) => {
      targetPosition.current.set(...state.position);
      targetLook.current.set(...state.target);
      targetFov.current = state.fov;
    };

    apply(controller.getState());
    return controller.subscribe(apply);
  }, [controller]);

  useEffect(() => {
    camera.position.copy(targetPosition.current);
    currentLook.current.copy(targetLook.current);
    camera.lookAt(currentLook.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const t = 1 - Math.exp(-DAMPING * delta);

    camera.position.lerp(targetPosition.current, t);
    currentLook.current.lerp(targetLook.current, t);
    camera.lookAt(currentLook.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov.current, t);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
