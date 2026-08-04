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
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MagicShimmerButton } from "./ui/MagicShimmerButton";

gsap.registerPlugin(ScrollTrigger, useGSAP);
useGLTF.setDecoderPath("/draco/");

const MODEL_URL = "/gym-space-2k.glb";

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

// ─── Master timeline map ────────────────────────────────────────────────
// Every constant below is a fraction of the single pinned range (+=800%).
//
//   0 ──────────────── 0.45 ─────────────────────────────────────── 1.0
//     frame sequence 0-120   3D fly-through   tiers   showcase   drift
//
// The 121-frame logo sequence owns the front 45% of the pin. That is what
// makes frame-interval text cues meaningful: a block living from frame 28
// to frame 52 gets ~1700px of scroll, not ~90px. All sequence-phase text is
// declared in FRAME numbers (see SEQUENCE_BLOCKS) and converted by f().
const FRAME_SPAN = 0.45;
const f = (frame: number) => (frame / (FRAME_COUNT - 1)) * FRAME_SPAN;

// Hero: logo settles first, headline clip-reveals second, both clear well
// before the first floating overlay arrives at frame 28 — no clumped motion.
const LOGO_ENTER_DUR = f(3);
const TEXT_ENTER_START = LOGO_ENTER_DUR;
const TEXT_ENTER_DUR = f(6);
const HERO_EXIT_START = f(16);
const HERO_EXIT_DUR = f(8);

// Sequence-phase motion vocabulary: fade + slide up in, fade + slide up out.
// Deliberately flat (no skew/rotateX) — the tier/showcase phases keep the
// kinetic 3D vocabulary, the Apple-style sequence phase stays minimal.
const SEQ_REVEAL_DUR = f(9);
const SEQ_FADE_DUR = f(7);

// Logo canvas holds full-size across the entire sequence, then recedes as
// the 3D stage wipes in over the top of it.
const LOGO_EXIT_START = FRAME_SPAN;
const LOGO_EXIT_DUR = 0.04;

const SPATIAL_START = 0.44;
const WEBGL_IN_DUR = 0.07;
const PANEL_ENTER = 0.49;
const PANEL_ENTER_DUR = 0.03;

const CTA_POS = [0.56, 0.645, 0.73] as const;
const CTA_SPACING = CTA_POS[1] - CTA_POS[0];
const CTA_FADE_GAP = Math.min(0.05, CTA_SPACING * 0.4);
const CTA_REVEAL_DUR = CTA_SPACING * 0.4;
// Panel's exit completes before CTA_POS[0] begins the Oasis Lite entrance.
const PANEL_EXIT_DUR = 0.02;
const PANEL_FADE = CTA_POS[0] - CTA_FADE_GAP;
// AppShowcase phase: merged into this single master pin so the 3D canvas and
// background persist continuously instead of handing off to a second,
// independently-pinned section.
const APPSHOWCASE_START = 0.79;
const APPSHOWCASE_END = 0.95;
const SHOWCASE_STEP_COUNT = 3;
const SHOWCASE_SPACING = (APPSHOWCASE_END - APPSHOWCASE_START) / SHOWCASE_STEP_COUNT;
const SHOWCASE_POS = Array.from({ length: SHOWCASE_STEP_COUNT }, (_, i) => APPSHOWCASE_START + i * SHOWCASE_SPACING);
const SHOWCASE_FADE_GAP = Math.min(0.06, SHOWCASE_SPACING * 0.4);
const SHOWCASE_REVEAL_DUR = SHOWCASE_SPACING * 0.4;
// APPSHOWCASE_END -> DRIFT_END is a pure camera-drift tail: the last
// showcase card (Access Key CTA) stays on screen while the rig keeps
// gliding into its final waypoint, so releasing the pin never reads as an
// abrupt stop right as the rest of the page (LocalSeoSection/FinalClose)
// takes over.
const DRIFT_END = 1.0;

// Access-flow steps — formerly a separately-pinned AppShowcase section, now
// the final phase of the single master timeline so the 3D stage never cuts
// away to a new pin.
type ShowcaseStep = { eyebrow: string; headline: string; body: string; cta?: boolean };

const SHOWCASE_STEPS: ShowcaseStep[] = [
  {
    eyebrow: "Frictionless Private Access",
    headline: "ONE ACCESS KEY.\nZERO SHARING. ENTIRE SPACE.",
    body: "No front desks, no shared keycards, no waiting. Request your session instantly in the app.",
  },
  {
    eyebrow: "Encrypted Key Exchange",
    headline: "VALIDATED IN SECONDS.\nNO STAFF. NO DELAY.",
    body: "Your Access Key is generated and cryptographically bound to your session the moment you request it.",
  },
  {
    eyebrow: "On-Demand Unlock",
    headline: "ARRIVE. UNLOCK.\nTHE SPACE IS YOURS ALONE.",
    body: "Zero-crowd guarantee — every square foot of the private space, every session, for you only.",
    cta: true,
  },
];

// CSS iPhone shell screens — synced 1:1 to SHOWCASE_STEPS/SHOWCASE_POS via
// index, but this is the on-device UI (booking flow) vs. the marketing copy.
type PhoneScreen = { label: string };
const PHONE_SCREENS: PhoneScreen[] = [
  { label: "Instant Sign Up" },
  { label: "Secure Your Session" },
  { label: "Digital Access Key" },
];

// Apple-style overlays that float over the frame sequence. `in`/`out` are
// FRAME numbers against the 121-frame scrub — `in` is when the block starts
// revealing, `out` is when it has finished clearing. Keep the windows
// non-overlapping; f() turns them into timeline positions.
type SequenceBlock = {
  in: number;
  out: number;
  eyebrow: string;
  heading: string;
  body?: string;
  features?: string[];
  stats?: { value: string; label: string }[];
};

const SEQUENCE_BLOCKS: SequenceBlock[] = [
  {
    in: 28,
    out: 52,
    eyebrow: "Private by design",
    heading: "The whole space.\nJust you.",
    body: "One member per session. No queue for a rack, no waiting on a bench, no one else's schedule to work around.",
  },
  {
    in: 60,
    out: 84,
    eyebrow: "Built around the key",
    heading: "It opens\nthe moment\nyou arrive.",
    features: ["Encrypted Access Key", "24/7 unstaffed entry", "Commercial-grade floor"],
  },
  {
    in: 92,
    out: 118,
    eyebrow: "By the numbers",
    heading: "Solitude, quantified.",
    stats: [
      { value: "1", label: "Member per session" },
      { value: "24/7", label: "Continuous access" },
      { value: "0", label: "Shared equipment" },
      { value: "60s", label: "Signup to key" },
    ],
  },
];

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
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry = mergeVertices(obj.geometry);
        obj.geometry.computeVertexNormals();

        const src = obj.material as THREE.MeshStandardMaterial;
        obj.material = new THREE.MeshPhysicalMaterial({
          color: src?.color,
          map: src?.map ?? null,
          normalMap: src?.normalMap ?? null,
          roughnessMap: src?.roughnessMap ?? null,
          metalnessMap: src?.metalnessMap ?? null,
          aoMap: src?.aoMap ?? null,
          roughness: src?.roughnessMap ? 1 : 0.45,
          metalness: src?.metalnessMap ? 1 : 0.15,
          clearcoat: 0.4,
          clearcoatRoughness: 0.2,
          envMapIntensity: 1.6,
          side: THREE.DoubleSide,
        });
      }
    });
    return clone;
  }, [scene]);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const s = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    rig.height = s.y;

    // All waypoints sit strictly inside the room's bounding box (|offset| <
    // 0.4 * extent on every axis) so the fly-through never pokes through a
    // wall/ceiling/floor — the prior path started at y=+0.85*height and
    // z=+1.6*depth, both well outside the box, looking down at the exterior
    // roof from above instead of the equipment inside.
    rig.waypoints = [
      { pos: new THREE.Vector3(c.x - s.x * 0.3, c.y - s.y * 0.28, c.z + s.z * 0.4), lookAt: new THREE.Vector3(c.x + s.x * 0.1, c.y - s.y * 0.05, c.z - s.z * 0.2) },
      { pos: new THREE.Vector3(c.x - s.x * 0.15, c.y - s.y * 0.22, c.z + s.z * 0.05), lookAt: new THREE.Vector3(c.x, c.y - s.y * 0.05, c.z - s.z * 0.3) },
      // Mid-scroll waypoint: pulled back on Z and raised on Y so the fly-through
      // clears the central equipment cluster instead of clipping into it — the
      // prior offsets sat almost dead-center in the room, right on top of the
      // reflective mesh, filling the viewport with distorted metal close-ups.
      { pos: new THREE.Vector3(c.x, c.y - s.y * 0.2, c.z - s.z * 0.02), lookAt: new THREE.Vector3(c.x + s.x * 0.15, c.y - s.y * 0.02, c.z - s.z * 0.3) },
      { pos: new THREE.Vector3(c.x + s.x * 0.2, c.y - s.y * 0.18, c.z - s.z * 0.25), lookAt: new THREE.Vector3(c.x, c.y - s.y * 0.05, c.z - s.z * 0.4) },
      { pos: new THREE.Vector3(c.x + s.x * 0.12, c.y - s.y * 0.2, c.z - s.z * 0.15), lookAt: new THREE.Vector3(c.x, c.y - s.y * 0.05, c.z - s.z * 0.3) },
      // Final drift waypoint: a small, slow continuation past the
      // fly-through's last stop so the camera keeps gently gliding — never
      // freezes — while the showcase cards reveal over the rest of the pin.
      { pos: new THREE.Vector3(c.x + s.x * 0.05, c.y - s.y * 0.24, c.z - s.z * 0.22), lookAt: new THREE.Vector3(c.x - s.x * 0.05, c.y - s.y * 0.06, c.z - s.z * 0.35) },
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

    // Continuous micro-orbit: a small sine/cosine drift on the look-at target,
    // driven by wall-clock time (not scrub.progress) so the rig keeps
    // breathing even while the user holds still mid-scroll — the scan never
    // reads as frozen during a stationary waypoint hold.
    const orbitT = performance.now() * 0.00018;
    const orbitAmp = rig.height * 0.012;
    _lookAt.x += Math.sin(orbitT) * orbitAmp;
    _lookAt.y += Math.cos(orbitT * 0.7) * orbitAmp * 0.5;

    // Bank into turns: roll the up vector toward the curve tangent's lateral
    // component *before* lookAt consumes it, so the sweep reads as a
    // physical fly-through, not a locked-gimbal pan.
    const tangent = curve.getTangent(eased);
    const bank = THREE.MathUtils.clamp(-tangent.x * 0.6, -0.25, 0.25);
    camera.up.set(Math.sin(bank), Math.cos(bank), 0);

    const aspect = size.width / Math.max(size.height, 1);
    const dolly = THREE.MathUtils.clamp(0.74 - (1 - aspect) * 0.12, 0.55, 0.82);
    const bias = THREE.MathUtils.clamp(0.08 - (aspect - 1) * 0.02, 0.05, 0.08);
    camera.position.sub(_lookAt).multiplyScalar(dolly).add(_lookAt);
    _lookAt.y -= rig.height * bias;
    camera.lookAt(_lookAt);

    const d = camera.position.distanceTo(_lookAt);
    const density = 0.5 / Math.max(d, 0.001);
    if (scene.fog instanceof THREE.FogExp2) scene.fog.density = density;
    else scene.fog = new THREE.FogExp2(0x07080b, density);

    // Canvas runs frameloop="demand" — without a self-perpetuating
    // invalidate the rig would freeze the instant the user stops scrolling.
    // Re-arming every frame keeps the micro-orbit alive continuously.
    invalidate();
  });

  return null;
}

// Brutalist telemetry blocks sequenced across the camera fly-through — each
// pairs a spatial-mechanics heading with its Access Key tier and price.
type CtaBlock = { tag: string; tier: string; price: string; headline: string; body: string; cta?: boolean };

const CTA_BLOCKS: CtaBlock[] = [
  {
    tag: "ACCESS TIER // 01",
    tier: "OASIS LITE",
    price: "$99/mo",
    headline: "NO DESK.\nNO ONE ELSE'S SCHEDULE.",
    body: "Park on the street, walk up the property — the entire private space unlocks for you alone.",
  },
  {
    tag: "ACCESS TIER // 02",
    tier: "OASIS PLUS",
    price: "$125/mo",
    headline: "COMMERCIAL-GRADE.\nZERO CROWDING.",
    body: "Full racks, plates, and machines — reserved to your session only, every time.",
  },
  {
    tag: "ACCESS TIER // 03",
    tier: "OASIS MAX",
    price: "$149/mo",
    headline: "REQUEST\nAPP ACCESS.",
    body: "App-only ecosystem — no web checkout. Download to Access and generate your Key.",
    cta: true,
  },
];

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualLayerRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const webglWrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sequenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tiltRefs = useRef<(HTMLDivElement | null)[]>([]);
  const showcaseRefs = useRef<(HTMLDivElement | null)[]>([]);
  const phoneScreenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const phoneShellRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    const canvas = heroCanvasRef.current;
    const text = heroTextRef.current;
    if (!container || !canvas || !text) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const images: HTMLImageElement[] = [];
    const frameState = { frame: 0 };

    const draw = () => {
      const img = images[Math.round(frameState.frame)];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      // Logo frame is drawn at 74% of the fitted (contain) box so the
      // entrance animation always has breathing room and never clips.
      const LOGO_PAD = 0.74;
      let dw: number, dh: number;
      // Contain fit: when the canvas is relatively wider than the image
      // (cr > ir) the image's HEIGHT is the constraining dimension — fit
      // to height first. The inverse branch fits to width first. (Swapping
      // these, as a prior version did, overflows the canvas on tall/narrow
      // logo art inside a wide viewport — the top/right clipping bug.)
      if (cr > ir) {
        dh = ch * LOGO_PAD;
        dw = dh * ir;
      } else {
        dw = cw * LOGO_PAD;
        dh = dw / ir;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);

      // The source frames bake in a solid rectangular background, which
      // shows as a hard box seam against the page's gradient backdrop.
      // Feather the drawn image's own edges to transparent (destination-in)
      // so the seam dissolves regardless of the page background color.
      //
      // A circular gradient sized off max(dw, dh) undershoots the SHORT
      // axis of a non-square box (e.g. a portrait logo on a wide canvas):
      // the fade radius barely reaches the short-axis edge, leaving that
      // edge hard while only the corners soften. Fix: build the gradient
      // in a coordinate space scaled to the box's own half-extents, so a
      // "circle" there maps to an ellipse matching the box aspect exactly,
      // guaranteeing full transparency before every edge.
      const cx = cw / 2;
      const cy = ch / 2;
      const halfW = dw / 2;
      const halfH = dh / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(halfW, halfH);
      const fade = ctx.createRadialGradient(0, 0, 0.4, 0, 0, 0.92);
      fade.addColorStop(0, "rgba(0,0,0,1)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = fade;
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
      ctx.globalCompositeOperation = "source-over";
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      if (i === 0) img.fetchPriority = "high";
      img.src = frameUrl(i);
      img.onload = draw;
      images.push(img);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      draw();
    };

    resize();
    window.addEventListener("resize", resize);

    gsap.set(text, { autoAlpha: 1 });
    gsap.set(bloomRef.current, { opacity: 0.5, scale: 1 });
    // Continuous ambient breathing, independent of scroll — keeps the dark
    // backdrop from ever reading as a flat, dead void behind the canvas.
    gsap.to(bloomRef.current, {
      scale: 1.18,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
    gsap.set(webglWrapRef.current, { autoAlpha: 0, clipPath: "circle(0% at 50% 50%)" });
    gsap.set(panelRef.current, { clipPath: "inset(0 100% 0 0)", x: -20 });

    const blocks = tiltRefs.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(blocks, { autoAlpha: 0, y: 24, scale: 0.94 });

    const seqBlocks = sequenceRefs.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(seqBlocks, { autoAlpha: 0, y: 0 });
    const seqChildren = seqBlocks.map((b) => Array.from(b.children));
    seqChildren.forEach((kids) => gsap.set(kids, { autoAlpha: 0, y: 36 }));

    const showcaseBlocks = showcaseRefs.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(showcaseBlocks, { autoAlpha: 0, y: 40, rotateX: 12, skewY: 2, clipPath: "inset(0 0 100% 0)" });

    const phoneScreens = phoneScreenRefs.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(phoneScreens, { autoAlpha: 0, y: 24 });
    gsap.set(phoneShellRef.current, {
      autoAlpha: 0,
      scale: 0.75,
      rotateY: -30,
      rotateX: 15,
      z: -200,
      y: 50,
    });

    gsap.set(canvas, { scale: 1.35, autoAlpha: 0, filter: "brightness(1.1) saturate(1.05)" });
    gsap.set(Array.from(text.children), { clipPath: "inset(0 100% 0 0)", xPercent: -4, scale: 0.95, rotateX: 12, skewY: 2 });

    // Logo + headline entrance plays once on mount — Apple-style: the visitor
    // sees the reveal immediately on load, before any scroll input. It's
    // deliberately kept out of the scrubbed master timeline below (which used
    // to own this) so the page never depends on the user scrolling to see
    // the intro, and scrolling back to top can't re-hide an already-settled
    // hero.
    const introTl = gsap.timeline({ delay: 0.15 });
    introTl.to(canvas, { scale: 1, autoAlpha: 1, filter: "brightness(1) saturate(1)", duration: 1.1, ease: "power3.out" }, 0);
    introTl.to(
      Array.from(text.children),
      { clipPath: "inset(0 0% 0 0)", xPercent: 0, scale: 1, rotateX: 0, skewY: 0, stagger: 0.12, duration: 1.2, ease: "expo.out" },
      0.5,
    );

    // Single pin on the container drives the whole sequence — visualLayerRef
    // and overlayRef are plain absolute children riding along with it, so
    // there's only one pin-spacer and no cross-trigger desync.
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=800%",
        pin: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          frameState.frame =
            gsap.utils.clamp(0, 1, self.progress / FRAME_SPAN) * (FRAME_COUNT - 1);
          draw();

          scrub.progress = gsap.utils.clamp(
            0,
            1,
            (self.progress - SPATIAL_START) / (DRIFT_END - SPATIAL_START),
          );
          scrub.invalidate();
        },
      },
    });

    // Phase 0 (0 - 0.11) logo/headline entrance is handled by introTl above,
    // which autoplays on mount instead of waiting on scroll.

    // Phase 1 (frames 16-24): hero copy clears while the logo sequence keeps
    // scrubbing at full size behind it. The canvas is the product shot for
    // this whole phase, so it does NOT shrink here — it holds until
    // LOGO_EXIT_START (= FRAME_SPAN), after the last frame has been drawn.
    tl.to(text, { autoAlpha: 0, y: -32, duration: HERO_EXIT_DUR, ease: "power2.in" }, HERO_EXIT_START);

    if (bgTextRef.current) {
      // Kinetic bg type: fades/drifts in during the hero beat, then keeps
      // parallax-drifting across the entire pin — never freezes.
      tl.fromTo(
        bgTextRef.current,
        { xPercent: -10, autoAlpha: 0 },
        { xPercent: -4, autoAlpha: 0.1, duration: f(20), ease: "power2.out" },
        0,
      );
      tl.to(bgTextRef.current, { xPercent: 18, ease: "none", duration: 1 - f(20) }, f(20));
    }

    // Phase 2: frame-cued Apple overlays. Each block's children stagger up
    // into place across its `in` window and the whole block slides out just
    // before its `out` frame — one block on screen at a time, always.
    SEQUENCE_BLOCKS.forEach((blk, i) => {
      const el = seqBlocks[i];
      if (!el) return;
      tl.set(el, { autoAlpha: 1 }, f(blk.in));
      tl.to(
        seqChildren[i],
        { autoAlpha: 1, y: 0, stagger: SEQ_REVEAL_DUR / 6, duration: SEQ_REVEAL_DUR, ease: "expo.out" },
        f(blk.in),
      );
      tl.to(el, { autoAlpha: 0, y: -28, duration: SEQ_FADE_DUR, ease: "power2.in" }, f(blk.out) - SEQ_FADE_DUR);
      // Bloom shifts with each block so the backdrop breathes in step.
      tl.to(bloomRef.current, { opacity: 0.3 + i * 0.16, duration: SEQ_REVEAL_DUR, ease: "sine.inOut" }, f(blk.in));
    });

    // Phase 2→3 handoff: the logo recedes only after frame 120 is on screen,
    // and the 3D circle-wipe overlaps that exit so there's never a dead frame.
    tl.to(
      canvas,
      { scale: 0.72, y: -40, autoAlpha: 0, filter: "brightness(0.4) saturate(0.8)", duration: LOGO_EXIT_DUR, ease: "power2.inOut" },
      LOGO_EXIT_START,
    );
    tl.fromTo(
      webglWrapRef.current,
      { autoAlpha: 0, clipPath: "circle(0% at 50% 50%)" },
      { autoAlpha: 1, clipPath: "circle(75% at 50% 50%)", duration: WEBGL_IN_DUR, ease: "power2.inOut" },
      SPATIAL_START,
    );
    tl.to(panelRef.current, { clipPath: "inset(0 0% 0 0)", x: 0, duration: PANEL_ENTER_DUR, ease: "power2.out" }, PANEL_ENTER);

    // Phase 2 (0.18 - 1.0): camera fly-through, driven by scrub.progress in onUpdate above.
    // Fully hidden (autoAlpha) well before CTA_POS[0] — see PANEL_FADE derivation above.
    tl.to(panelRef.current, { autoAlpha: 0, y: -24, duration: PANEL_EXIT_DUR, ease: "power2.out" }, PANEL_FADE);

    // Phase 3: brutalist CTA/spatial-mechanics blocks materialize sequentially
    // across the continuous camera fly-through — one at a time, same slot.
    const BLOOM_INTENSITY = [0.35, 0.65, 0.45, 0.7, 0.4, 0.75];
    CTA_POS.forEach((at, i) => {
      tl.to(
        blocks[i],
        { autoAlpha: 1, y: 0, scale: 1, duration: CTA_REVEAL_DUR, ease: "power3.out" },
        at,
      );
      const fadeAt = i < CTA_POS.length - 1 ? CTA_POS[i + 1] - CTA_FADE_GAP : APPSHOWCASE_START - CTA_FADE_GAP;
      tl.to(blocks[i], { autoAlpha: 0, y: -16, scale: 0.96, duration: CTA_FADE_GAP, ease: "power2.in" }, fadeAt);
      // Bloom shifts intensity with each tier reveal so the ambient glow
      // breathes in step with the waypoint transition, never sitting static.
      tl.to(bloomRef.current, { opacity: BLOOM_INTENSITY[i], duration: CTA_REVEAL_DUR, ease: "sine.inOut" }, at);
    });

    // Phase 4: access-flow steps (formerly the separately-pinned AppShowcase
    // section) — same continuous 3D stage, camera holds its final frame while
    // these full-bleed steps reveal one at a time.
    tl.to(visualLayerRef.current, { opacity: 0.4, ease: "none", duration: 1 - APPSHOWCASE_START }, APPSHOWCASE_START);
    tl.to(
      phoneShellRef.current,
      { autoAlpha: 1, scale: 1, rotateY: 0, rotateX: 0, z: 0, y: 0, duration: 0.08, ease: "back.out(1.5)" },
      APPSHOWCASE_START
    );
    SHOWCASE_POS.forEach((at, i) => {
      tl.to(
        showcaseBlocks[i],
        { autoAlpha: 1, y: 0, rotateX: 0, skewY: 0, clipPath: "inset(0 0 0% 0)", duration: SHOWCASE_REVEAL_DUR, ease: "expo.out" },
        at,
      );
      tl.to(bloomRef.current, { opacity: BLOOM_INTENSITY[(i + CTA_POS.length) % BLOOM_INTENSITY.length], duration: SHOWCASE_REVEAL_DUR, ease: "sine.inOut" }, at);
      if (i < SHOWCASE_POS.length - 1) {
        tl.to(showcaseBlocks[i], { autoAlpha: 0, rotateX: -8, skewY: -2, clipPath: "inset(0 0 100% 0)", duration: SHOWCASE_FADE_GAP, ease: "power2.in" }, SHOWCASE_POS[i + 1] - SHOWCASE_FADE_GAP);
      }

      // Phone-shell screen crossfades in lockstep with its text block above —
      // same waypoint, same "slide up + fade" Apple-style motion.
      tl.to(
        phoneScreens[i],
        { autoAlpha: 1, y: 0, duration: SHOWCASE_REVEAL_DUR, ease: "expo.out" },
        at,
      );
      if (i < SHOWCASE_POS.length - 1) {
        tl.to(phoneScreens[i], { autoAlpha: 0, y: -16, duration: SHOWCASE_FADE_GAP, ease: "power2.in" }, SHOWCASE_POS[i + 1] - SHOWCASE_FADE_GAP);
      }
    });

    // drift tail: phone gracefully rotates away as scroll exits the showcase dwell
    tl.to(
      phoneShellRef.current,
      { rotateY: 25, scale: 0.95, autoAlpha: 0, duration: DRIFT_END - APPSHOWCASE_END, ease: "power2.in" },
      APPSHOWCASE_END,
    );

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-gradient-to-b from-[#1a1014] via-[#3a0f16] to-[#5c0f1a] text-white overflow-hidden flex flex-col lg:flex-row"
    >
      {/* WebGL/2D canvas layer — globally pinned, right 2/3, z-0 */}
      <div ref={visualLayerRef} className="fixed inset-y-0 right-0 z-10 w-full lg:w-2/3 pointer-events-none bg-transparent">
        <div
          ref={bloomRef}
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 55% at 30% 40%, rgba(120,140,255,0.16), transparent 70%), radial-gradient(45% 45% at 75% 65%, rgba(255,180,140,0.1), transparent 72%), radial-gradient(50% 50% at 50% 55%, rgba(180,24,44,0.16), transparent 70%)",
            willChange: "transform, opacity",
          }}
        />
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
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMappingExposure: 1.2 }}
            onCreated={() => scrub.invalidate()}
          >
            <PerspectiveCamera makeDefault fov={45} near={0.01} far={500} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1.1} />
            <directionalLight position={[-5, 2, -3]} intensity={0.4} />
            {/* charcoal bounce fill — kills pure-black shadow crush */}
            <hemisphereLight color="#3a4252" groundColor="#0a0b0e" intensity={0.4} />
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
          style={{ mixBlendMode: "lighten" }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(60,20,30,0.12),rgba(92,15,26,0.4))] pointer-events-none" />
      </div>

      {/* CSS iPhone shell — booking-flow screens, floats over the dimmed 3D
          canvas on the same z-10 layer, separated visually via ambient glow. */}
      <div
        aria-hidden
        className="fixed inset-0 z-10 hidden lg:flex items-center justify-center pointer-events-none [perspective:2500px] [transform-style:preserve-3d]"
      >
        <div ref={phoneShellRef} className="relative">
          <div className="absolute -inset-20 rounded-full bg-white/[0.06] blur-[100px]" />
          <div className="absolute -inset-24 rounded-full bg-[radial-gradient(circle,rgba(180,24,44,0.14),transparent_70%)] blur-[80px]" />
          <div
            className="device-shell relative rounded-[3rem] border border-white/15 bg-gradient-to-b from-zinc-800 to-black p-[3px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_50px_120px_-30px_rgba(0,0,0,0.95)]"
            style={{ width: "clamp(230px, 20vw, 300px)", aspectRatio: "9 / 19.5" }}
          >
            {/* Specular rim light — thin gradient ring tracing the glass edge */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[3rem] opacity-80"
              style={{
                padding: "1px",
                background:
                  "conic-gradient(from 200deg at 50% 0%, rgba(255,255,255,0.55), transparent 30%, transparent 70%, rgba(255,255,255,0.25))",
                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            <div className="relative h-full w-full overflow-hidden rounded-[2.7rem] border border-black/60 bg-black">
              {/* Dynamic Island */}
              <div className="absolute left-1/2 top-[10px] z-30 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black" />

              {/* status bar */}
              <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-3 font-mono text-[11px] text-white/70">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="h-[7px] w-[16px] rounded-[2px] border border-white/50" />
                </div>
              </div>

              {PHONE_SCREENS.map((screen, i) => (
                <div
                  key={screen.label}
                  ref={(el) => { phoneScreenRefs.current[i] = el; }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
                >
                  {i === 0 && (
                    <>
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/[0.04]">
                        <div className="h-9 w-9 rounded-full border-2 border-white/60" />
                      </div>
                      <p className="font-syne text-sm font-bold uppercase tracking-[0.1em] text-white">
                        {screen.label}
                      </p>
                      <div className="w-full rounded-full border border-white/15 bg-white/[0.06] py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/80">
                        Continue with Face ID
                      </div>
                    </>
                  )}
                  {i === 1 && (
                    <>
                      <p className="self-start font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {screen.label}
                      </p>
                      <div className="flex w-full flex-col gap-2">
                        {["6:00 AM", "7:30 AM", "9:00 AM"].map((slot, idx) => (
                          <div
                            key={slot}
                            className={`flex items-center justify-between rounded-xl border px-4 py-2.5 font-mono text-[11px] ${
                              idx === 1
                                ? "border-white/40 bg-white/[0.08] text-white"
                                : "border-white/10 bg-white/[0.02] text-white/50"
                            }`}
                          >
                            <span>{slot}</span>
                            {idx === 1 && <span className="text-white">✓</span>}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/30">
                        <div className="absolute inset-0 animate-pulse rounded-full border border-white/20" />
                        <div className="h-10 w-10 rounded-md border-2 border-white/70" />
                      </div>
                      <p className="font-syne text-sm font-bold uppercase tracking-[0.1em] text-white">
                        {screen.label}
                      </p>
                      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
                        Access Granted
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* HTML overlay layer — copy column, transparent, floats over the 3D space, z-10 */}
      <div ref={overlayRef} className="relative w-full min-h-screen z-20 bg-transparent [perspective:1200px] [transform-style:preserve-3d]">
        <div
          ref={heroTextRef}
          className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center will-change-[transform,opacity] [transform:translateZ(0)]"
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 pointer-events-none"
            style={{
              background:
                "radial-gradient(62% 68% at 50% 48%, rgba(5,6,9,0.94) 0%, rgba(5,6,9,0.78) 42%, rgba(5,6,9,0) 80%)",
            }}
          />
          <div className="relative w-full max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.32em] text-white/40 font-mono mb-4 block">
              Iron Oasis — Windsor-Central (ON)
            </span>
            <h1 className="text-[clamp(2.75rem,7vw,6rem)] font-semibold tracking-[-0.045em] leading-[0.98] font-syne mb-8">
              Private access.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-600">
                Zero sharing.
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-zinc-400 text-lg font-light leading-relaxed">
              A premium private space in a quiet residential setting. Premium
              equipment in a commercial-grade suite, unlocked instantly via the app.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
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
          className="max-w-7xl mx-auto"
          style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "flex-start",
            padding: "0 6%",
            pointerEvents: "none",
          }}
        >
          {SEQUENCE_BLOCKS.map((blk, i) => (
            <div
              key={blk.eyebrow}
              ref={(el) => { sequenceRefs.current[i] = el; }}
              className="absolute w-[clamp(320px,34vw,560px)] border-l border-white/15 pl-8"
              style={{ pointerEvents: "none" }}
            >
              <span className="block font-mono text-[10px] uppercase tracking-[0.32em] text-white/50 mb-3">
                {blk.eyebrow}
              </span>
              <h3 className="font-syne font-black uppercase leading-[1.05] tracking-[-0.02em] text-[clamp(1.6rem,2.3vw,2.4rem)] text-white whitespace-pre-line break-words">
                {blk.heading}
              </h3>
              {blk.body && (
                <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-[32ch]">{blk.body}</p>
              )}
              {blk.features && (
                <ul className="mt-5 space-y-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-300">
                  {blk.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <span className="h-1 w-1 rounded-full bg-white/60 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              )}
              {blk.stats && (
                <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4">
                  {blk.stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="font-syne text-3xl font-bold text-white">{stat.value}</div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {CTA_BLOCKS.map((blk, i) => (
            <div
              key={blk.tag}
              ref={(el) => { tiltRefs.current[i] = el; }}
              className="absolute w-[clamp(320px,34vw,520px)] rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-2xl px-8 py-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
              style={{ pointerEvents: blk.cta ? "auto" : "none" }}
            >
              <span className="block font-mono text-[10px] uppercase tracking-[0.32em] text-white/50 mb-3">
                {blk.tag}
              </span>
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="font-syne text-sm font-bold uppercase tracking-[0.1em] text-zinc-200">
                  {blk.tier}
                </span>
                <span className="font-mono text-sm text-white">{blk.price}</span>
              </div>
              <h3 className="font-syne font-black uppercase leading-[1.05] tracking-[-0.02em] text-[clamp(1.6rem,2.3vw,2.4rem)] text-white whitespace-pre-line break-words">
                {blk.headline}
              </h3>
              <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-[32ch]">{blk.body}</p>
              {blk.cta && (
                <a
                  href="#request-access"
                  className="mt-6 inline-flex items-center justify-center rounded-none border border-white bg-white px-7 py-3 font-syne text-sm font-bold uppercase tracking-[0.15em] text-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.97]"
                >
                  Request App Access
                </a>
              )}
            </div>
          ))}

          {SHOWCASE_STEPS.map((step, i) => (
            <div
              key={step.eyebrow}
              ref={(el) => { showcaseRefs.current[i] = el; }}
              id={i === 0 ? "request-access" : undefined}
              className="absolute w-[clamp(320px,34vw,560px)] border-l border-white/15 pl-8"
              style={{ pointerEvents: step.cta ? "auto" : "none" }}
            >
              <span className="block font-mono text-[10px] uppercase tracking-[0.32em] text-white/50 mb-3">
                {step.eyebrow}
              </span>
              <h3 className="font-syne font-black uppercase leading-[1.05] tracking-[-0.02em] text-[clamp(1.6rem,2.3vw,2.4rem)] text-white whitespace-pre-line break-words">
                {step.headline}
              </h3>
              <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-[32ch]">{step.body}</p>
              {step.cta && (
                <a
                  href="#request-access"
                  className="mt-6 inline-flex items-center justify-center rounded-none border border-white bg-white px-7 py-3 font-syne text-sm font-bold uppercase tracking-[0.15em] text-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.97]"
                >
                  Request App Access
                </a>
              )}
            </div>
          ))}
        </div>

        <div
          ref={panelRef}
          className="absolute bottom-16 left-6 z-20 w-[min(28rem,calc(100%-3rem))] md:left-12 border-t border-white/10 pt-6"
        >
          <span className="text-[10px] uppercase tracking-[0.32em] text-white/40 font-mono mb-3 block">
            Spatial Mechanics
          </span>
          <h3 className="text-3xl font-bold font-syne text-white mb-3">
            Move through the space
          </h3>
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


function useTiltHandlers() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    gsap.to(card, {
      rotateX: ((y - yc) / yc) * -8,
      rotateY: ((x - xc) / xc) * 8,
      transformPerspective: 1000,
      duration: 0.4,
      ease: "power2.out",
    });
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const onMouseLeave = (index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
  };

  return { cardRefs, onMouseMove, onMouseLeave };
}

export function LocalSeoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const { cardRefs, onMouseMove, onMouseLeave } = useTiltHandlers();

  useGSAP(() => {
    if (!leftColRef.current || !quoteRef.current) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sectionRef.current, start: "top 90%", end: "bottom 40%", scrub: 1.2 },
    });

    tl.fromTo(
      Array.from(leftColRef.current.children),
      { autoAlpha: 0, y: 32, clipPath: "inset(0 0 100% 0)" },
      { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", stagger: 0.5, ease: "power3.out", duration: 1 },
      0,
    );
    tl.fromTo(
      quoteRef.current,
      { autoAlpha: 0, y: 32, clipPath: "inset(0 0 100% 0)" },
      { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", ease: "power3.out", duration: 1 },
      2.6,
    );

    const coordCards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (coordCards.length) {
      const coordTl = gsap.timeline({
        scrollTrigger: {
          trigger: coordCards[0].parentElement,
          start: "top 90%",
          end: "top 30%",
          scrub: 1.2,
        },
      });
      coordCards.forEach((card, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        coordTl.fromTo(
          card,
          { autoAlpha: 0, z: -900, rotateY: dir * 35, rotateX: 14, scale: 0.75 },
          { autoAlpha: 1, z: 0, rotateY: 0, rotateX: 0, scale: 1, ease: "power2.out", duration: 1 },
          i * 0.18,
        );
      });
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative z-10 bg-transparent text-white px-6 py-32 [perspective:2500px]">
      {/* Section-local underglow — the global fixed vignette alone reads too flat this deep in the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(55% 45% at 15% 10%, rgba(160,20,40,0.16), transparent 65%), radial-gradient(45% 40% at 90% 80%, rgba(120,140,180,0.08), transparent 65%)",
        }}
      />
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

      <div className="max-w-[1400px] mx-auto">
        <div ref={leftColRef}>
          <span className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-mono mb-6 block">
            Operational Coordinates / WNDSR
          </span>
          <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black tracking-[-0.04em] leading-[0.95] font-syne mb-10">
            Flagship location.
            <br />
            <span className="text-zinc-500">A private space, not a facility.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-14 leading-relaxed max-w-2xl">
            A premium private space in a quiet Windsor residential setting.
            Zero staffing, zero sharing, fully automated voice/SMS handlers,
            and turnkey Access Key control.
          </p>

          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-14 [perspective:2000px]" style={{ transformStyle: "preserve-3d" }}>
            {COORDINATES.map(({ k, v }, i) => (
              <div
                key={k}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                onMouseMove={(e) => onMouseMove(e, i)}
                onMouseLeave={() => onMouseLeave(i)}
                className="io-tier relative group rounded-2xl px-5 py-5 backdrop-blur-2xl overflow-hidden"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(120,140,255,0.15), transparent 80%)`,
                  }}
                />
                <div style={{ transform: "translateZ(30px)" }} className="relative">
                  <dt className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-mono mb-2">{k}</dt>
                  <dd className="text-sm tracking-wide text-zinc-100 font-mono">{v}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-4">
            <MagicShimmerButton>Acquire Key</MagicShimmerButton>
            <MagicShimmerButton>Request App Access</MagicShimmerButton>
          </div>
        </div>

        <div ref={quoteRef} className="border-t border-white/10 mt-24 pt-16">
          <span className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-mono mb-6 block">
            The Space
          </span>
          <p className="text-[clamp(1.75rem,3.5vw,3.25rem)] font-syne font-medium tracking-[-0.02em] leading-[1.15] max-w-4xl">
            Park on the street, walk up the property, and the entire private
            space is yours. No staff, no shared floor, no one else&rsquo;s
            schedule to work around.
          </p>
        </div>
      </div>
    </section>
  );
}

const FOOTER_LINKS = [
  { label: "The Space", href: "/" },
  { label: "The Shop", href: "/shop" },
  { label: "Access Terms", href: "#request-access" },
];

export function FinalClose() {
  const sectionRef = useRef<HTMLElement>(null);
  const legalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    gsap.to(card, {
      rotateX: ((y - yc) / yc) * -4,
      rotateY: ((x - xc) / xc) * 4,
      transformPerspective: 1200,
      duration: 0.4,
      ease: "power2.out",
    });
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const onMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
  };

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(
      sectionRef.current.children,
      { autoAlpha: 0, y: 32, clipPath: "inset(0 0 100% 0)" },
      {
        autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", stagger: 0.15, ease: "power3.out", duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "bottom 60%", scrub: 1.2 },
      },
    );

    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { z: -1600, rotateX: 22, rotateY: -18, scale: 0.68 },
        {
          z: 0, rotateX: 0, rotateY: 0, scale: 1, ease: "power2.out",
          scrollTrigger: { trigger: cardRef.current, start: "top 92%", end: "top 35%", scrub: 1.2 },
        },
      );
    }

    if (legalRef.current) {
      gsap.fromTo(
        legalRef.current.querySelectorAll("[data-footer-item]"),
        { autoAlpha: 0, y: 24, rotateX: 15, transformPerspective: 600 },
        {
          autoAlpha: 1, y: 0, rotateX: 0, stagger: 0.08, ease: "expo.out", duration: 0.9,
          scrollTrigger: { trigger: legalRef.current, start: "top 92%", end: "bottom 70%", scrub: 1 },
        },
      );
    }
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative z-10 overflow-hidden bg-gradient-to-b from-transparent via-[#0d0509] to-[#0d070b] text-white px-6 py-24 md:py-32 border-t border-white/10 [perspective:2500px]"
    >
      {/* Ambient glow anchors the card so the section reads as a designed
          destination instead of a flat void once the card's own padding ends. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(55% 65% at 50% 25%, rgba(255,255,255,0.07), transparent 70%), radial-gradient(60% 50% at 50% 100%, rgba(160,20,40,0.16), transparent 70%)",
        }}
      />

      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative io-tier group max-w-4xl mx-auto rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center backdrop-blur-2xl overflow-hidden"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), rgba(120,140,255,0.12), transparent 80%)`,
          }}
        />
        <div style={{ transform: "translateZ(50px)" }} className="relative">
          <span className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-mono mb-6 block">
            Request Access
          </span>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-[-0.04em] leading-[0.98] font-syne mb-6">
            The space is waiting.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            No tours, no sales calls. Download the app, generate your Access
            Key, and the private space unlocks the moment you arrive.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <MagicShimmerButton>Request App Access</MagicShimmerButton>
            <a
              href="#request-access"
              className="group/link relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-7 py-3 font-syne text-sm font-semibold tracking-[0.15em] text-zinc-200 backdrop-blur-2xl transition-[color,border-color,background-color,transform] duration-300 [transition-timing-function:var(--ease-mech)] hover:border-white/25 hover:text-white hover:scale-[1.02] active:scale-[0.97]"
            >
              Acquire Key
            </a>
          </div>
        </div>
      </div>

      <div
        ref={legalRef}
        className="relative mt-20 flex flex-col items-center gap-6 text-center [perspective:600px]"
      >
        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-footer-item
              className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500 transition-colors duration-300 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <span data-footer-item className="font-syne text-sm font-semibold tracking-[0.32em] text-zinc-500">
          IRON OASIS
        </span>
        <span data-footer-item className="text-[10px] font-mono tracking-[0.28em] text-zinc-600 uppercase">
          &copy; {new Date().getFullYear()} Iron Oasis. Private access only.
        </span>
      </div>
    </section>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_URL);
}
