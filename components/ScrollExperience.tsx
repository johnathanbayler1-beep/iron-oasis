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
const FRAME_SPEED = 2.0;
const SPATIAL_START = 0.18;
const HERO_EXIT_START = 0.16;
const HERO_EXIT_DUR = 0.08;
// Logo exits fully (autoAlpha 0, visibility hidden) before text begins its own exit — no overlap.
const LOGO_EXIT_START = HERO_EXIT_START;
const LOGO_EXIT_DUR = HERO_EXIT_DUR / 2;
const TEXT_EXIT_START = LOGO_EXIT_START + LOGO_EXIT_DUR;
const TEXT_EXIT_DUR = HERO_EXIT_DUR / 2;
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
      { pos: new THREE.Vector3(c.x - s.x * 0.65, c.y + s.y * 0.85, c.z + s.z * 1.6), lookAt: new THREE.Vector3(c.x, c.y - s.y * 0.05, c.z) },
      { pos: new THREE.Vector3(c.x - s.x * 0.35, c.y + s.y * 0.55, c.z + s.z * 0.95), lookAt: new THREE.Vector3(c.x, c.y, c.z) },
      { pos: new THREE.Vector3(c.x, c.y + s.y * 0.3, c.z + s.z * 0.5), lookAt: new THREE.Vector3(c.x, c.y + s.y * 0.05, c.z - s.z * 0.1) },
      { pos: new THREE.Vector3(c.x + s.x * 0.25, c.y + s.y * 0.15, c.z + s.z * 0.15), lookAt: new THREE.Vector3(c.x, c.y + s.y * 0.1, c.z - s.z * 0.3) },
      { pos: new THREE.Vector3(c.x + s.x * 0.1, c.y + s.y * 0.08, c.z - s.z * 0.05), lookAt: new THREE.Vector3(c.x, c.y + s.y * 0.12, c.z - s.z * 0.5) },
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
  "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden transition-transform duration-300";

type Tier = { name: string; price: string; badge: string; features: string[]; popular: boolean };

const TIERS: Tier[] = [
  { name: "Oasis Lite", price: "99", badge: "Entry Tier", popular: false, features: ["Off-Peak 1-Hour Blocks", "Digital Key Integration", "Full Equipment Access", "Zero-Crowd Guarantee"] },
  { name: "Oasis Plus", price: "125", badge: "Most Popular", popular: true, features: ["24/7 Priority Scheduling", "Instant Key Dispatch", "Advanced Biometrics Sync", "Guest Pass Included"] },
  { name: "Oasis Max", price: "149", badge: "Top Tier", popular: false, features: ["All Private Locations", "Multi-Hour Advanced Hold", "Dedicated VIP Support", "Custom Locker Integration"] },
];

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualLayerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
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
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
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

    // Single pin on the container drives the whole sequence — visualLayerRef
    // and overlayRef are plain absolute children riding along with it, so
    // there's only one pin-spacer and no cross-trigger desync.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=350%",
        pin: true,
        scrub: 2.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          frameState.frame =
            gsap.utils.clamp(0, 1, (self.progress / HERO_END) * FRAME_SPEED) * (FRAME_COUNT - 1);
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

    // Phase 1 (0 - 0.22): hero logo shrinks/recedes, headline clip-reveals in.
    tl.to(canvas, { scale: 0.6, z: -400, y: -50, filter: "brightness(0.35) saturate(0.8)", ease: "power2.out" }, 0);
    tl.fromTo(
      Array.from(text.children),
      { clipPath: "inset(0 100% 0 0)", xPercent: -4, scale: 0.95 },
      { clipPath: "inset(0 0% 0 0)", xPercent: 0, scale: 1, stagger: 0.08, duration: 0.22, ease: "expo.out" },
      0.02,
    );
    if (bgTextRef.current) {
      tl.fromTo(
        bgTextRef.current,
        { xPercent: -8, autoAlpha: 0 },
        { xPercent: 8, autoAlpha: 1, ease: "none" },
        0,
      );
    }

    // Phase 1→2 handoff: logo (canvas) reaches autoAlpha:0/visible:false completely
    // before the hero text begins its own exit — strict sequential separation, no
    // overlap — then both are fully gone before the Spatial Mechanics panel fades in.
    tl.to(canvas, { autoAlpha: 0, duration: LOGO_EXIT_DUR, ease: "power2.out" }, LOGO_EXIT_START);
    tl.to(text, { autoAlpha: 0, duration: TEXT_EXIT_DUR, ease: "power2.out" }, TEXT_EXIT_START);
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

    // Dim the pinned visual layer to an ambient backdrop once AppShowcase
    // scrolls into view, so it never fights the copy above it.
    const appShowcase = document.getElementById("request-access");
    if (appShowcase && visualLayerRef.current) {
      gsap.to(visualLayerRef.current, {
        opacity: 0.22,
        ease: "none",
        scrollTrigger: {
          trigger: appShowcase,
          start: "top 90%",
          end: "top 20%",
          scrub: 2.5,
        },
      });
    }

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#050505] text-white overflow-hidden"
    >
      {/* WebGL/2D canvas layer — globally pinned, right 2/3, z-0 */}
      <div ref={visualLayerRef} className="absolute right-0 top-0 h-full w-full md:w-2/3 z-0">
        <div
          ref={bgTextRef}
          aria-hidden
          className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none select-none opacity-0"
        >
          <span className="font-syne font-black uppercase leading-none text-white/[0.04] tracking-tighter text-[clamp(8rem,22vw,22rem)] whitespace-nowrap">
            ZERO SHARING
          </span>
        </div>
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

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,0,0,0.18),rgba(0,0,0,0.55))] pointer-events-none" />
      </div>

      {/* HTML overlay layer — copy column, transparent, floats over the 3D space, z-10 */}
      <div ref={overlayRef} className="absolute inset-y-0 left-0 z-10 w-full md:w-1/2 lg:w-[45%] bg-transparent [perspective:1200px] [transform-style:preserve-3d]">
        <div
          ref={heroTextRef}
          className="absolute inset-0 z-10 flex items-center justify-start text-left px-6 md:px-10 lg:px-14 will-change-[transform,opacity] [transform:translateZ(0)]"
        >
          <div className="max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.32em] text-white/40 font-mono mb-4 block">
              Iron Oasis — Windsor-Central (ON)
            </span>
            <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold tracking-[-0.035em] leading-[0.96] font-syne mb-6">
              PRIVATE ACCESS. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-600">
                ZERO SHARING.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg font-light leading-relaxed">
              A premium private space in a quiet residential setting. Premium
              equipment in a commercial-grade suite, unlocked instantly via the app.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start justify-start gap-4">
              <MagicShimmerButton className="tracking-[0.15em]">
                Request App Access
              </MagicShimmerButton>
              <a
                href="#request-access"
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
            display: "flex", alignItems: "center", justifyContent: "flex-start",
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
                height: "clamp(360px, 26vw, 420px)", display: "flex", flexDirection: "column",
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
              <ul className="space-y-2.5 mt-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-zinc-300">
                    <ShieldCheck className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-baseline gap-1">
                  <span className="text-[11px] text-zinc-500 font-mono self-start mt-1.5">$</span>
                  <span style={{ fontSize: "clamp(40px, 3.4vw, 56px)" }} className="font-black font-mono tracking-tighter tabular-nums leading-none">{tier.price}</span>
                </div>
                <a
                  href="#request-access"
                  className="mt-3 block w-full rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-center font-syne text-[11px] font-semibold tracking-[0.15em] text-zinc-200 transition-colors hover:border-white/30 hover:text-white"
                >
                  Request App Access
                </a>
              </div>
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

const COORDINATES = [
  { k: "FACILITY", v: "IRON OASIS — WNDSR" },
  { k: "LOCALITY", v: "WINDSOR, ONTARIO (CA)" },
  { k: "LAT", v: "42.3149° N" },
  { k: "LONG", v: "-83.0364° W" },
  { k: "HOURS", v: "24/7 — CONTINUOUS" },
  { k: "ACCESS", v: "BIOMETRIC / DIGITAL KEY" },
];

function CornerAccents() {
  const base = "absolute h-3 w-3 border-white/25";
  return (
    <>
      <span aria-hidden className={`${base} left-0 top-0 border-l border-t`} />
      <span aria-hidden className={`${base} right-0 top-0 border-r border-t`} />
      <span aria-hidden className={`${base} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${base} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

export function LocalSeoSection() {
  return (
    <section className="relative z-10 bg-transparent text-white px-6 py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HealthClub",
            "name": "Iron Oasis Private Space",
            "description": "24/7 unstaffed, private-access facility.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Windsor",
              "addressRegion": "ON",
              "addressCountry": "CA"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 42.3149,
              "longitude": -83.0364
            },
            "priceRange": "$$$",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "00:00",
              "closes": "23:59"
            }
          }),
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-5 block">
            OPERATIONAL COORDINATES / WNDSR
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter font-syne mb-6">
            Flagship Location. <br />
            <span className="text-zinc-500">A Private Space, Not a Facility.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
            A premium private space in a quiet Windsor residential setting. Zero staffing, zero sharing, fully automated Twilio voice/SMS handlers, and turnkey Access Key control.
          </p>

          <div className="relative border border-white/[0.08] bg-white/[0.02] p-5 mb-10">
            <CornerAccents />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 font-mono">
              {COORDINATES.map(({ k, v }) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-1.5"
                >
                  <dt className="text-[10px] uppercase tracking-widest text-zinc-500">{k}</dt>
                  <dd className="text-xs tracking-wider text-zinc-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-wrap gap-4">
            <MagicShimmerButton>Acquire Key</MagicShimmerButton>
            <MagicShimmerButton>Request App Access</MagicShimmerButton>
          </div>
        </div>

        <div className="relative border border-white/10 bg-black/50 backdrop-blur-3xl rounded-3xl p-10">
          <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-white/40 pointer-events-none" />
          <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-white/40 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-white/40 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-white/40 pointer-events-none" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono mb-5 block">
            The Space
          </span>
          <h3 className="text-3xl font-bold font-syne tracking-tight mb-4">
            Windsor-Central.
          </h3>
          <p className="text-zinc-400 leading-relaxed">
            Park on the street, walk up the property, and the entire private
            space is yours. No staff, no shared floor, no one else&rsquo;s
            schedule to work around.
          </p>
        </div>
      </div>
    </section>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_URL);
}
