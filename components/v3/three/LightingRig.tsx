"use client";

import { useContext, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneProgressContext } from "../scenes/SceneProgressContext";
import { ROOM_FLOOR_Y } from "./roomConfig";

const FLOOR_Y = ROOM_FLOOR_Y;
const GOLD = "#C9A84C";

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Progressive interior lighting: the room reads as near-black at entry and
// lights up fixture by fixture as the camera advances, in sequence rather
// than all at once. Per the bible's Scene 3 lighting direction (interior
// lights switching on progressively) and 4.9 (motivated light sources only —
// the key light is a rack spotlight, not a generic fill).
export default function LightingRig() {
  const progressRef = useContext(SceneProgressContext);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const keyRef = useRef<THREE.SpotLight>(null);
  const fixtureARef = useRef<THREE.PointLight>(null);
  const fixtureBRef = useRef<THREE.PointLight>(null);

  const keyTarget = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const p = progressRef?.current ?? 0;
    // Ambient/rim ceilings pulled down from the original pass: the HDRI's
    // environmentIntensity ramp (Scene2GymReveal) was already filling the
    // room, and stacking a rising ambient on top of it flattened the walls
    // to an even, shadowless gray by mid-scene — the opposite of a
    // showroom's pools of light against dark. Keep enough to read geometry
    // in the dark, no more.
    if (ambientRef.current) ambientRef.current.intensity = 0.02 + smoothstep(0, 1, p) * 0.09;
    if (rimRef.current) rimRef.current.intensity = 0.05 + smoothstep(0, 1, p) * 0.16;
    if (keyRef.current) keyRef.current.intensity = smoothstep(0.05, 0.35, p) * 5;
    if (fixtureARef.current) fixtureARef.current.intensity = smoothstep(0.25, 0.55, p) * 2.2;
    if (fixtureBRef.current) fixtureBRef.current.intensity = smoothstep(0.55, 0.85, p) * 2.2;
  });

  return (
    <>
      {/* Near-black ambient floor; keeps the void from ever reading as pure black voids. */}
      <ambientLight ref={ambientRef} intensity={0.02} color="#1a1a22" />
      {/* Cool rim for edge definition against the gold key, unmotivated but subtle. */}
      <directionalLight ref={rimRef} position={[-4, 3, -3]} intensity={0.05} color="#7a8fb0" />
      {/* Rack spotlight — the first fixture to switch on, the scene's primary key light. */}
      <primitive object={keyTarget} position={[0, FLOOR_Y, -0.5]} />
      <spotLight
        ref={keyRef}
        position={[0.5, FLOOR_Y + 3.2, -0.5]}
        target={keyTarget}
        angle={0.45}
        penumbra={0.55}
        distance={8}
        decay={2}
        color={GOLD}
        intensity={0}
        castShadow
      />
      {/* Two more fixtures resolving in sequence as the camera travels deeper in. */}
      <pointLight
        ref={fixtureARef}
        position={[-2.2, FLOOR_Y + 2.4, -1.8]}
        distance={6}
        decay={2}
        color={GOLD}
        intensity={0}
      />
      <pointLight
        ref={fixtureBRef}
        position={[2.0, FLOOR_Y + 2.4, -2.0]}
        distance={6}
        decay={2}
        color={GOLD}
        intensity={0}
      />
    </>
  );
}
