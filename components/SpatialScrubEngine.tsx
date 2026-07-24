"use client";

import React, {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  PerspectiveCamera,
  Preload,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SmoothLuxCard } from "./ui/SmoothLuxCard";

gsap.registerPlugin(ScrollTrigger);
useGLTF.setDecoderPath("/draco/");

// Only one facility model exists; it drives both the scroll fly-through and the
// ambient accent below (useGLTF caches by URL, each mount clones the scene).
const MODEL_URL = "/gym-space-2k-opt.glb";

// GSAP ScrollTrigger (DOM thread) writes scroll progress here; the R3F camera
// rig reads it each demanded frame. invalidate is published back for on-demand render.
const scrub = {
  progress: 0,
  invalidate: () => {},
};

const _camPos = new THREE.Vector3();
const _lookAt = new THREE.Vector3();

type WayPoint = { pos: THREE.Vector3; lookAt: THREE.Vector3 };

const rig = {
  waypoints: [] as WayPoint[],
  curve: null as THREE.CatmullRomCurve3 | null,
  height: 0,
};

function Model() {
  const { scene } = useGLTF(MODEL_URL);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const s = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    rig.height = s.y;

    rig.waypoints = [
      { pos: new THREE.Vector3(c.x, c.y + s.y * 0.25, c.z + s.z * 1.4), lookAt: c.clone() },
      { pos: new THREE.Vector3(c.x - s.x * 0.5, c.y + s.y * 0.2, c.z + s.z * 0.5), lookAt: c.clone() },
      { pos: new THREE.Vector3(c.x + s.x * 0.1, c.y + s.y * 0.05, c.z + s.z * 0.1), lookAt: new THREE.Vector3(c.x, c.y + s.y * 0.15, c.z - s.z * 0.3) },
      { pos: new THREE.Vector3(c.x + s.x * 0.45, c.y + s.y * 0.2, c.z - s.z * 0.2), lookAt: c.clone() },
      { pos: new THREE.Vector3(c.x, c.y + s.y * 0.5, c.z + s.z * 0.6), lookAt: c.clone() },
    ];
    rig.curve = new THREE.CatmullRomCurve3(
      rig.waypoints.map((w) => w.pos),
      false,
      "centripetal",
    );
    scrub.invalidate();
  }, [cloned]);

  return <primitive object={cloned} />;
}

function CameraRig() {
  const { camera, invalidate, size, scene } = useThree();

  useEffect(() => {
    scrub.invalidate = invalidate;
    return () => {
      scrub.invalidate = () => {};
      scene.fog = null;
    };
  }, [invalidate, scene]);

  useFrame(() => {
    const pts = rig.waypoints;
    const curve = rig.curve;
    if (!curve || pts.length < 2) return;

    const p = scrub.progress;
    const eased =
      p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2;

    curve.getPoint(eased, _camPos);
    camera.position.copy(_camPos);

    const scaled = eased * (pts.length - 1);
    const lo = Math.floor(scaled);
    const hi = Math.min(lo + 1, pts.length - 1);
    _lookAt.lerpVectors(pts[lo].lookAt, pts[hi].lookAt, scaled - lo);

    // Dolly toward target + bias look-down so the floor-dominant scan fills the
    // frame and residual void crops off the top. ponytail: dolly/bias are the knobs.
    const aspect = size.width / Math.max(size.height, 1);
    const dolly = THREE.MathUtils.clamp(0.74 - (1 - aspect) * 0.12, 0.55, 0.82);
    const bias = THREE.MathUtils.clamp(0.62 - (aspect - 1) * 0.12, 0.4, 0.62);
    camera.position.sub(_lookAt).multiplyScalar(dolly).add(_lookAt);
    _lookAt.y -= rig.height * bias;
    camera.lookAt(_lookAt);

    // Dense black exponential fog dissolves the finite mesh far edge into void.
    const d = camera.position.distanceTo(_lookAt);
    const density = 0.5 / Math.max(d, 0.001);
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = density;
    else scene.fog = new THREE.FogExp2(0x000000, density);
  });

  return null;
}

// Continuous ambient rotation — no scroll binding, its own always-on render loop.
function SpinAccent() {
  const { scene } = useGLTF(MODEL_URL);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = box.getCenter(new THREE.Vector3());
    c.position.sub(center); // recentre for clean spin about its own axis
    return c;
  }, [scene]);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={ref} scale={0.9}>
      <primitive object={cloned} />
    </group>
  );
}

export default function SpatialScrubEngine() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "+=2500",
      pin: true,
      scrub: 0.3,
      onUpdate: (self) => {
        scrub.progress = self.progress;
        scrub.invalidate();
      },
    });

    return () => st.kill();
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-screen bg-black overflow-hidden"
      >
        <Canvas
          className="absolute inset-0"
          frameloop="demand"
          gl={{ antialias: true, powerPreference: "high-performance" }}
          onCreated={() => scrub.invalidate()}
        >
          <PerspectiveCamera makeDefault fov={45} near={0.01} far={500} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Suspense fallback={null}>
            <Environment files="/hdri/lebombo_1k.hdr" />
            <Model />
            <CameraRig />
            <Preload all />
          </Suspense>
        </Canvas>

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
        <div className="absolute bottom-16 left-12 z-20 max-w-lg">
          <SmoothLuxCard eyebrow="Spatial Mechanics">
            <h3 className="text-3xl font-bold font-syne text-white">
              Fly Through The Facility
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              Scroll to move through the commercial-grade suite — every square
              foot of the private space is yours alone.
            </p>
          </SmoothLuxCard>
        </div>
      </div>

      {/* Ambient rotating 3D accent — lower layout */}
      <section className="relative w-full bg-[#050505] py-40 flex flex-col items-center overflow-hidden border-t border-white/10">
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-500 font-mono mb-6">
          Premium Equipment · Zero Sharing
        </span>
        <div className="relative w-full h-[420px]">
          <Canvas
            className="absolute inset-0"
            camera={{ position: [0, 0.5, 4], fov: 40 }}
            gl={{ antialias: true }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 6, 4]} intensity={1.1} />
            <Suspense fallback={null}>
              <Environment files="/hdri/lebombo_1k.hdr" />
              <SpinAccent />
              <Preload all />
            </Suspense>
          </Canvas>
        </div>
      </section>
    </>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_URL);
}
