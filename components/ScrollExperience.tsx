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
import { useGSAP } from "@gsap/react";
import { MagicShimmerButton } from "./ui/MagicShimmerButton";
import { SmoothLuxCard } from "./ui/SmoothLuxCard";
import { KeyRound, ShieldCheck, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
useGLTF.setDecoderPath("/draco/");

const MODEL_URL = "/gym-space-2k-opt.glb";

// public/frames/logo_000.webp .. logo_120.webp
const FRAME_COUNT = 121;
const frameUrl = (i: number) => `/frames/logo_${String(i).padStart(3, "0")}.webp`;

// Single master timeline drives everything below via self.progress (0-1
// across the whole pinned range) — this object is the only bridge between
// the DOM scroll thread and the R3F render loop.
const scrub = {
  progress: 0,
  invalidate: () => {},
};

// Phase boundaries, all expressed as fractions of total scroll progress.
const HERO_END = 0.22;
const SPATIAL_START = 0.18;
const HERO_EXIT_START = 0.16;
const HERO_EXIT_DUR = 0.08;
const PANEL_ENTER = 0.28; // gap = HERO_EXIT_START + HERO_EXIT_DUR (0.24) -> 0.04 clean gap
const PANEL_FADE = 0.42;
const CARD_POS = [0.55, 0.72, 0.88] as const;
const CARD_FADE_GAP = 0.06;

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

    const aspect = size.width / Math.max(size.height, 1);
    const dolly = THREE.MathUtils.clamp(0.74 - (1 - aspect) * 0.12, 0.55, 0.82);
    const bias = THREE.MathUtils.clamp(0.62 - (aspect - 1) * 0.12, 0.4, 0.62);
    camera.position.sub(_lookAt).multiplyScalar(dolly).add(_lookAt);
    _lookAt.y -= rig.height * bias;
    camera.lookAt(_lookAt);

    const d = camera.position.distanceTo(_lookAt);
    const density = 0.5 / Math.max(d, 0.001);
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = density;
    else scene.fog = new THREE.FogExp2(0x000000, density);
  });

  return null;
}

const CARD_GLASS_CLASS =
  "bg-black/40 backdrop-blur-[40px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-3xl overflow-hidden";

type Tier = { name: string; price: string; badge: string; features: string[]; popular: boolean };

const TIERS: Tier[] = [
  { name: "Oasis Lite", price: "99", badge: "Entry Tier", popular: false, features: ["Off-Peak 1-Hour Blocks", "Digital Key Integration", "Full Equipment Access", "Zero-Crowd Guarantee"] },
  { name: "Oasis Plus", price: "125", badge: "Most Popular", popular: true, features: ["24/7 Priority Scheduling", "Instant Key Dispatch", "Advanced Biometrics Sync", "Guest Pass Included"] },
  { name: "Oasis Max", price: "149", badge: "Top Tier", popular: false, features: ["All Private Locations", "Multi-Hour Advanced Hold", "Dedicated VIP Support", "Custom Locker Integration"] },
];

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const webglWrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tiltRefs = useRef<(HTMLDivElement | null)[]>([]);

  const tiltMove = (i: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRefs.current[i];
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    gsap.to(el, { rotateY: (px - 0.5) * 8, rotateX: -(py - 0.5) * 8, y: -4, scale: 1.02, duration: 0.45, ease: "back.out(1.6)", overwrite: "auto" });
  };
  const tiltReset = (i: number) => () => {
    const el = tiltRefs.current[i];
    if (!el) return;
    gsap.to(el, { rotateX: 0, rotateY: 0, y: 0, scale: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  };

  useGSAP(() => {
    const container = containerRef.current;
    const canvas = heroCanvasRef.current;
    const text = heroTextRef.current;
    if (!container || !canvas || !text) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      images.push(img);
    }

    const frameState = { frame: 0 };

    const draw = () => {
      const img = images[Math.round(frameState.frame)];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let dw: number, dh: number;
      if (cr > ir) {
        dw = cw;
        dh = cw / ir;
      } else {
        dh = ch;
        dw = ch * ir;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    images[0].onload = draw;

    gsap.set(canvas, { filter: "brightness(1) saturate(1)" });
    gsap.set(text, { autoAlpha: 1 });
    gsap.set(webglWrapRef.current, { autoAlpha: 0 });
    gsap.set(panelRef.current, { autoAlpha: 0 });

    const cards = tiltRefs.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(cards, { z: -500, rotationX: -30, opacity: 0 });

    // ONE ScrollTrigger, ONE timeline, pinned once for the whole experience.
    // Every phase below is a scrubbed tween positioned at a literal progress
    // threshold (0-1) — no stacked pins, no secondary triggers.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=350%",
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          frameState.frame =
            gsap.utils.clamp(0, 1, self.progress / HERO_END) * (FRAME_COUNT - 1);
          draw();

          scrub.progress = gsap.utils.clamp(
            0,
            1,
            (self.progress - SPATIAL_START) / (1 - SPATIAL_START),
          );
          scrub.invalidate();
        },
      },
    });

    // Phase 1 (0 - 0.22): hero logo shrinks/recedes, headline staggers in.
    tl.to(canvas, { scale: 0.6, z: -400, y: -50, filter: "brightness(0.35) saturate(0.8)", ease: "power2.out" }, 0);
    tl.from(Array.from(text.children), { y: 100, opacity: 0, stagger: 0.1, duration: 0.18, ease: "power4.out" }, 0.02);

    // Phase 1→2 handoff: hero fully exits (autoAlpha -> visibility:hidden) BEFORE
    // the Spatial Mechanics panel begins to fade in, with a clean empty gap between.
    tl.to([canvas, text], { autoAlpha: 0, duration: HERO_EXIT_DUR, ease: "power2.out" }, HERO_EXIT_START);
    tl.to(webglWrapRef.current, { autoAlpha: 1, duration: 0.08, ease: "power2.in" }, PANEL_ENTER);
    tl.to(panelRef.current, { autoAlpha: 1, duration: 0.08, ease: "power2.in" }, PANEL_ENTER);

    // Phase 2 (0.18 - 1.0): camera fly-through, driven by scrub.progress in onUpdate above.
    tl.to(panelRef.current, { opacity: 0, y: -24, duration: 0.06, ease: "power2.out" }, PANEL_FADE);

    // Phase 3: pricing tiers materialize sequentially over the fly-through.
    CARD_POS.forEach((at, i) => {
      tl.to(cards[i], { z: 0, rotationX: 0, opacity: 1, duration: 0.12, ease: "back.out(1.4)" }, at);
      if (i < CARD_POS.length - 1) {
        tl.to(cards[i], { opacity: 0, duration: CARD_FADE_GAP, ease: "power2.in" }, CARD_POS[i + 1] - CARD_FADE_GAP);
      }
    });

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#050505] text-white overflow-hidden"
    >
      {/* WebGL/2D canvas layer — fixed under everything, z-0 */}
      <div className="absolute inset-0 z-0">
        <div ref={webglWrapRef} className="absolute inset-0">
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
        </div>

        <canvas
          ref={heroCanvasRef}
          className="absolute inset-0 w-full h-full will-change-[transform,opacity] [transform:translateZ(0)]"
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,0,0,0.35),rgba(0,0,0,0.85))] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* HTML overlay layer — hero copy + pricing tiers, z-10 */}
      <div className="absolute inset-0 z-10 [perspective:1200px] [transform-style:preserve-3d]">
        <div
          ref={heroTextRef}
          className="absolute inset-0 z-10 flex items-center justify-center text-center px-6 will-change-[transform,opacity] [transform:translateZ(0)]"
        >
          <div className="max-w-4xl">
            <span className="text-[10px] uppercase tracking-[0.32em] text-white/40 font-mono mb-4 block">
              Iron Oasis — Windsor-Central (ON)
            </span>
            <h1 className="text-[clamp(2.75rem,9vw,7.5rem)] font-extrabold tracking-[-0.035em] leading-[0.96] font-syne mb-6">
              PRIVATE ACCESS. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-600">
                ZERO SHARING.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              A premium private space in a quiet residential setting. Premium
              equipment in a commercial-grade suite, unlocked instantly via the app.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagicShimmerButton className="tracking-[0.15em]">
                Download to Access
              </MagicShimmerButton>
              <a
                href="#access"
                className="group relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-7 py-3 font-syne text-sm font-semibold tracking-[0.15em] text-zinc-200 backdrop-blur-2xl transition-[color,border-color,background-color,transform] duration-300 [transition-timing-function:var(--ease-mech)] hover:border-white/25 hover:text-white hover:scale-[1.02] active:scale-[0.97]"
              >
                Acquire Key
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 6%", perspective: 1400,
            pointerEvents: "none",
          }}
        >
          {TIERS.map((tier, i) => (
            <div
              key={tier.name}
              ref={(el) => { tiltRefs.current[i] = el; }}
              onMouseMove={tiltMove(i)}
              onMouseLeave={tiltReset(i)}
              className={CARD_GLASS_CLASS}
              style={{
                position: "absolute", width: "clamp(280px, 22vw, 340px)",
                padding: "clamp(24px, 2.2vw, 32px)", color: "#F5F5F7", fontFamily: "var(--font-display)",
                pointerEvents: "auto", cursor: "default", transformStyle: "preserve-3d",
                ...(tier.popular ? { borderColor: "rgba(255,255,255,0.25)" } : {}),
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute", insetInline: 0, top: 0, height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                  pointerEvents: "none",
                }}
              />
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.32em] text-white/40 font-mono">{tier.badge}</span>
                {tier.popular ? (
                  <div className="px-2 py-0.5 rounded-full bg-white text-black font-mono text-[9px] uppercase tracking-widest font-bold flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-black" />
                  </div>
                ) : (
                  <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>
              <h3 style={{ fontSize: "clamp(19px, 1.6vw, 23px)", fontWeight: 700, letterSpacing: "-0.025em", margin: 0 }}>{tier.name}</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-5 pb-4 border-b border-white/10">
                <span className="text-[11px] text-zinc-500 font-mono self-start mt-1.5">$</span>
                <span style={{ fontSize: "clamp(40px, 3.4vw, 56px)" }} className="font-black font-mono tracking-tighter tabular-nums leading-none">{tier.price}</span>
              </div>
              <ul className="space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-zinc-300">
                    <ShieldCheck className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          ref={panelRef}
          className="absolute bottom-16 left-6 z-20 w-[min(28rem,calc(100%-3rem))] md:left-12"
        >
          <SmoothLuxCard eyebrow="Spatial Mechanics">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-3xl font-bold font-syne text-white">
                Move Through The Space
              </h3>
            </div>
            <p className="text-sm text-zinc-400">
              Scroll to move through the commercial-grade suite — every square
              foot of the private space is yours alone.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-x-6 border-t border-white/[0.08] pt-4 font-mono text-[10px] uppercase tracking-[0.2em]">
              {[
                ["LAT", "42.3149° N"],
                ["LONG", "-83.0364° W"],
                ["ACCESS", "24 / 7"],
                ["OCCUPANCY", "1 / 1"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] py-1.5"
                >
                  <span className="text-zinc-500">{k}</span>
                  <span className="text-zinc-200">{v}</span>
                </div>
              ))}
            </div>
          </SmoothLuxCard>
        </div>
      </div>
    </section>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_URL);
}
