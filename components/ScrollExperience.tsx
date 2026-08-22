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

const MODEL_URL = "/gym/gym-space-2k.glb";

// public/logo/logo_000.webp .. logo_120.webp
const FRAME_COUNT = 121;
const frameUrl = (i: number) => `/logo/logo_${String(i).padStart(3, "0")}.webp`;

// Single master timeline drives everything below via self.progress (0-1
// across the whole pinned range) — this object is the only bridge between
// the DOM scroll thread and the R3F render loop.
const scrub = {
  progress: 0,
  invalidate: () => {},
};

// Phase boundaries, all expressed as fractions of total scroll progress.
// Total pin range grew 350% -> 450% -> 800% viewport height, first to fit
// the merged AppShowcase phase (see APPSHOWCASE_START below) and now to
// keep the pin (and the 3D background) alive through the whole showcase
// dwell instead of releasing the instant the fly-through ends — every
// pre-existing fraction is scaled by SCALE so on-screen pixel timing for
// the hero/camera/CTA phases is unchanged.
const SCALE = 350 / 800;
const HERO_END = 0.22 * SCALE;
const FRAME_SPEED = 2.0;
const SPATIAL_START = 0.18 * SCALE;
const HERO_EXIT_START = 0.16 * SCALE;
const HERO_EXIT_DUR = 0.08 * SCALE;
// Sequential entrance: logo scales/settles first, text only starts revealing
// once the logo tween is fully done — no simultaneous clumped motion.
const LOGO_ENTER_DUR = 0.05 * SCALE;
const TEXT_ENTER_START = LOGO_ENTER_DUR;
const TEXT_ENTER_DUR = 0.06 * SCALE;
// Logo exits fully (autoAlpha 0, visibility hidden) before text begins its own exit — no overlap.
const LOGO_EXIT_START = HERO_EXIT_START;
const LOGO_EXIT_DUR = HERO_EXIT_DUR / 2;
const TEXT_EXIT_START = LOGO_EXIT_START + LOGO_EXIT_DUR;
const TEXT_EXIT_DUR = HERO_EXIT_DUR / 2;
const PANEL_ENTER = 0.28 * SCALE;
// CAMERA_END marks the end of the primary fly-through segment and anchors
// the CTA phase timing below. The camera itself keeps gliding past this
// point — see DRIFT_END and rig.waypoints' 6th "drift" point — all the way
// through the showcase phase, so the 3D stage never freezes or cuts away.
const CAMERA_END = 1.0 * SCALE;
const CTA_POS = [0.42 * SCALE, 0.64 * SCALE, 0.86 * SCALE] as const;
const CTA_SPACING = CTA_POS[1] - CTA_POS[0];
const CTA_FADE_GAP = Math.min(0.08 * SCALE, CTA_SPACING * 0.4);
const CTA_REVEAL_DUR = CTA_SPACING * 0.4;
// Panel's exit must fully complete, with a clear gap, before CTA_POS[0]
// begins the Oasis Lite entrance — previously PANEL_FADE == CTA_POS[0]
// exactly, so the spatial-mechanics text and the first tier block animated
// on screen at the same time.
const PANEL_EXIT_DUR = 0.02 * SCALE;
const PANEL_EXIT_GAP = 0.01 * SCALE;
const PANEL_FADE = CTA_POS[0] - PANEL_EXIT_GAP - PANEL_EXIT_DUR;
// AppShowcase phase: merged into this single master pin so the 3D canvas and
// background persist continuously instead of handing off to a second,
// independently-pinned section.
const APPSHOWCASE_START = CAMERA_END + 0.02;
const APPSHOWCASE_END = 0.85;
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
  { label: "Instant Access" },
  { label: "Secure Your Session" },
  { label: "Digital Access Key" },
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

const CHILD_IN = { autoAlpha: 0, y: 34, scale: 0.96, rotateX: 10, transformPerspective: 900, clipPath: "inset(0 0 100% 0)" };
const CHILD_OUT = { autoAlpha: 1, y: 0, scale: 1, rotateX: 0, clipPath: "inset(0 0 0% 0)" };

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

    // Cards carry only the slab-level fade; every line inside them owns its own
    // fade + scale + shift so the reveal cascades line by line instead of the
    // whole slab snapping in as one rigid unit.
    // transformPerspective is per-line: the overlay's [perspective:1200px] only
    // reaches the slab itself, not the lines nested inside it.
    const blocks = tiltRefs.current.filter(Boolean) as HTMLDivElement[];
    const blockLines = blocks.map((b) => Array.from(b.children) as HTMLElement[]);
    gsap.set(blocks, { autoAlpha: 0, y: 24, scale: 0.985 });
    blockLines.forEach((lines) => gsap.set(lines, CHILD_IN));

    const showcaseBlocks = showcaseRefs.current.filter(Boolean) as HTMLDivElement[];
    const showcaseLines = showcaseBlocks.map((b) => Array.from(b.children) as HTMLElement[]);
    gsap.set(showcaseBlocks, { autoAlpha: 0, y: 24, scale: 0.985 });
    showcaseLines.forEach((lines) => gsap.set(lines, CHILD_IN));

    const phoneScreens = phoneScreenRefs.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(phoneScreens, { autoAlpha: 0, y: 24, scale: 0.97 });
    gsap.set(phoneShellRef.current, {
      autoAlpha: 0,
      scale: 0.75,
      rotateY: -30,
      rotateX: 15,
      z: -200,
      y: 50,
    });

    // Entrance lives INSIDE the scrubbed master timeline below (not a
    // one-time mount tween) so it's fully reversible and always reflects the
    // true scroll position — landing mid-scroll now shows the correct
    // partial state instead of a frozen half-played intro.
    gsap.set(canvas, { scale: 1.35, autoAlpha: 0, filter: "brightness(1.1) saturate(1.05)" });
    gsap.set(Array.from(text.children), { clipPath: "inset(0 100% 0 0)", xPercent: -4, scale: 0.95, rotateX: 12, skewY: 2 });

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
            gsap.utils.clamp(0, 1, (self.progress / HERO_END) * FRAME_SPEED) * (FRAME_COUNT - 1);
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

    // Phase 0 (0 - 0.11): sequential hero entrance. Logo scales/settles
    // FIRST; only once that tween completes does the headline start its
    // staggered clip-reveal — no simultaneous clumped motion.
    tl.to(canvas, { scale: 1, autoAlpha: 1, filter: "brightness(1) saturate(1)", duration: LOGO_ENTER_DUR, ease: "power3.out" }, 0);
    tl.to(
      Array.from(text.children),
      { clipPath: "inset(0 0% 0 0)", xPercent: 0, scale: 1, rotateX: 0, skewY: 0, stagger: TEXT_ENTER_DUR / (text.children.length * 2), duration: TEXT_ENTER_DUR, ease: "power3.out" },
      TEXT_ENTER_START,
    );

    // Phase 1 (0.11 - 0.16): hero logo shrinks/recedes as the user scrolls
    // out of the hero, once the entrance has fully settled.
    tl.to(canvas, { scale: 0.6, z: -400, y: -50, filter: "brightness(0.35) saturate(0.8)", duration: HERO_EXIT_START - TEXT_ENTER_START - TEXT_ENTER_DUR, ease: "power2.out" }, TEXT_ENTER_START + TEXT_ENTER_DUR);
    if (bgTextRef.current) {
      // Kinetic bg type: fades/drifts in during the hero beat, then keeps
      // parallax-drifting across the entire fly-through — never freezes.
      tl.fromTo(
        bgTextRef.current,
        { xPercent: -10, autoAlpha: 0 },
        { xPercent: -2, autoAlpha: 0.1, duration: HERO_END, ease: "power2.out" },
        0,
      );
      tl.to(bgTextRef.current, { xPercent: 18, ease: "none", duration: 1 - HERO_END }, HERO_END);
    }

    // Phase 1→2 handoff: logo (canvas) reaches autoAlpha:0/visible:false completely
    // before the hero text begins its own exit — strict sequential separation, no
    // overlap — then both are fully gone before the Spatial Mechanics panel fades in.
    tl.to(canvas, { autoAlpha: 0, duration: LOGO_EXIT_DUR, ease: "power2.out" }, LOGO_EXIT_START);
    tl.to(text, { autoAlpha: 0, duration: TEXT_EXIT_DUR, ease: "power2.out" }, TEXT_EXIT_START);
    // Circle-wipe the 3D canvas in, overlapping the hero logo's fade-out so
    // there's no dead black gap between the hero and the first 3D frame.
    tl.fromTo(
      webglWrapRef.current,
      { autoAlpha: 0, clipPath: "circle(0% at 50% 50%)" },
      { autoAlpha: 1, clipPath: "circle(75% at 50% 50%)", duration: PANEL_ENTER - LOGO_EXIT_START, ease: "power2.inOut" },
      LOGO_EXIT_START,
    );
    // Duration must be SCALE-relative: at the old raw 0.08 the panel finished
    // clipping in at 0.2025, *after* PANEL_FADE (0.1706) had already begun its
    // exit — the panel was arriving and leaving at the same time.
    tl.to(panelRef.current, { clipPath: "inset(0 0% 0 0)", x: 0, duration: 0.08 * SCALE, ease: "power3.out" }, PANEL_ENTER);

    // Phase 2 (0.18 - 1.0): camera fly-through, driven by scrub.progress in onUpdate above.
    // Fully hidden (autoAlpha) well before CTA_POS[0] — see PANEL_FADE derivation above.
    tl.to(panelRef.current, { autoAlpha: 0, y: -24, duration: PANEL_EXIT_DUR, ease: "power2.out" }, PANEL_FADE);

    // Phase 3: brutalist CTA/spatial-mechanics blocks materialize sequentially
    // across the continuous camera fly-through — one at a time, same slot.
    const BLOOM_INTENSITY = [0.35, 0.65, 0.45, 0.7, 0.4, 0.75];
    // Slab lifts first, then its lines cascade in. Stagger is expressed as a
    // fraction of the reveal window so it stays proportional at any scroll
    // speed; 4 lines * 0.13 + 0.7 = 1.09 * CTA_REVEAL_DUR, which still lands
    // well clear of the next waypoint's fade-out.
    const CTA_LINE_STAGGER = CTA_REVEAL_DUR * 0.13;
    CTA_POS.forEach((at, i) => {
      tl.to(blocks[i], { autoAlpha: 1, y: 0, scale: 1, duration: CTA_REVEAL_DUR * 0.35, ease: "power3.out" }, at);
      tl.to(
        blockLines[i],
        { ...CHILD_OUT, duration: CTA_REVEAL_DUR * 0.7, stagger: CTA_LINE_STAGGER, ease: "power3.out" },
        at,
      );
      const fadeAt = i < CTA_POS.length - 1 ? CTA_POS[i + 1] - CTA_FADE_GAP : APPSHOWCASE_START - CTA_FADE_GAP;
      tl.to(blocks[i], { autoAlpha: 0, y: -18, scale: 0.98, duration: CTA_FADE_GAP, ease: "power2.in" }, fadeAt);
      // Bloom shifts intensity with each tier reveal so the ambient glow
      // breathes in step with the waypoint transition, never sitting static.
      tl.to(bloomRef.current, { opacity: BLOOM_INTENSITY[i], duration: CTA_REVEAL_DUR, ease: "sine.inOut" }, at);
    });

    // Phase 4: access-flow steps (formerly the separately-pinned AppShowcase
    // section) — same continuous 3D stage, camera holds its final frame while
    // these full-bleed steps reveal one at a time.
    // Dim the *geometry* to push the phone forward, NOT the whole visual layer:
    // bloomRef and the ambient radial both live inside visualLayerRef, so
    // fading that layer to 0.4 drained the atmosphere and left the entire
    // showcase phase reading as flat black. Glow is lifted instead.
    tl.to(webglWrapRef.current, { opacity: 0.45, ease: "none", duration: 1 - APPSHOWCASE_START }, APPSHOWCASE_START);
    // power3.out, not back.out — overshoot easing on a scrubbed timeline reads
    // as a bounce-back artifact the moment the user scrolls against it.
    tl.to(
      phoneShellRef.current,
      { autoAlpha: 1, scale: 1, rotateY: 0, rotateX: 0, z: 0, y: 0, duration: 0.08, ease: "power3.out" },
      APPSHOWCASE_START
    );
    const SHOWCASE_LINE_STAGGER = SHOWCASE_REVEAL_DUR * 0.13;
    SHOWCASE_POS.forEach((at, i) => {
      tl.to(showcaseBlocks[i], { autoAlpha: 1, y: 0, scale: 1, duration: SHOWCASE_REVEAL_DUR * 0.35, ease: "power3.out" }, at);
      tl.to(
        showcaseLines[i],
        { ...CHILD_OUT, duration: SHOWCASE_REVEAL_DUR * 0.7, stagger: SHOWCASE_LINE_STAGGER, ease: "power3.out" },
        at,
      );
      tl.to(bloomRef.current, { opacity: BLOOM_INTENSITY[(i + CTA_POS.length) % BLOOM_INTENSITY.length], duration: SHOWCASE_REVEAL_DUR, ease: "sine.inOut" }, at);
      if (i < SHOWCASE_POS.length - 1) {
        tl.to(showcaseBlocks[i], { autoAlpha: 0, y: -18, scale: 0.98, duration: SHOWCASE_FADE_GAP, ease: "power2.in" }, SHOWCASE_POS[i + 1] - SHOWCASE_FADE_GAP);
      }

      // Phone-shell screen crossfades in lockstep with its text block above —
      // same waypoint, same "slide up + fade" Apple-style motion.
      tl.to(
        phoneScreens[i],
        { autoAlpha: 1, y: 0, scale: 1, duration: SHOWCASE_REVEAL_DUR, ease: "power3.out" },
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

    // The hero entrance lives inside this scrubbed timeline (not a one-time mount
    // tween) so a mid-scroll page load still lands in the correct partial state.
    // But that means a fresh visitor at scroll 0 sees the timeline's progress-0
    // frame — logo, headline, and bloom all hidden — until they touch the wheel.
    // Nudge the ScrollTrigger's own scroll position forward on mount so the same
    // scrub logic plays the entrance once automatically, then hand off to real
    // scroll input from wherever it lands.
    const introRaf = requestAnimationFrame(() => {
      const st = tl.scrollTrigger;
      if (!st) return;
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        duration: 1.4,
        delay: 0.2,
        ease: "power3.out",
        onUpdate: () => st.scroll(st.start + (st.end - st.start) * HERO_END * proxy.p),
      });
    });

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(introRaf);
    };
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-gradient-to-b from-[#07080b] to-[#11141d] text-white overflow-hidden flex flex-col lg:flex-row"
    >
      {/* WebGL/2D canvas layer — globally pinned, right 2/3, z-0 */}
      <div ref={visualLayerRef} className="fixed inset-0 z-10 pointer-events-none bg-transparent">
        <div
          ref={bloomRef}
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 55% at 30% 40%, rgba(120,140,255,0.16), transparent 70%), radial-gradient(45% 45% at 75% 65%, rgba(255,180,140,0.1), transparent 72%)",
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
              <Environment files="/gym/hdri/lebombo_1k.hdr" />
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

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(18,22,32,0.12),rgba(10,11,14,0.45))] pointer-events-none" />
      </div>

      {/* CSS iPhone shell — booking-flow screens, floats over the dimmed 3D
          canvas on the same z-10 layer, separated visually via ambient glow. */}
      <div
        aria-hidden
        className="fixed inset-0 z-10 hidden lg:flex items-center justify-center pointer-events-none [perspective:2500px] [transform-style:preserve-3d]"
      >
        <div ref={phoneShellRef} className="relative">
          <div className="absolute -inset-20 rounded-full bg-white/[0.06] blur-[100px]" />
          <div
            className="device-shell relative rounded-[3rem] border border-white/15 bg-gradient-to-b from-zinc-800 to-black p-[3px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_50px_120px_-30px_rgba(0,0,0,0.95)]"
            style={{ width: "clamp(230px, 20vw, 300px)", aspectRatio: "9 / 19.5" }}
          >
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
      <div ref={overlayRef} className="relative w-full lg:w-5/12 min-h-screen px-6 lg:px-12 z-20 bg-transparent [perspective:1200px] [transform-style:preserve-3d]">
        <div
          ref={heroTextRef}
          className="absolute inset-0 z-20 flex items-center justify-start text-left px-6 lg:px-12 will-change-[transform,opacity] [transform:translateZ(0)]"
        >
          <div className="w-full">
            <span className="text-[10px] uppercase tracking-[0.32em] text-white/40 font-mono mb-4 block">
              Iron Oasis — Windsor-Central (ON)
            </span>
            <h1 className="text-[clamp(2.25rem,4.2vw,4.75rem)] font-extrabold tracking-[-0.035em] leading-[0.96] font-syne mb-6">
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
              <a
                href="#request-access"
                className="group relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white px-7 py-3 font-syne text-sm font-semibold tracking-[0.15em] text-zinc-900 transition-[color,border-color,background-color,transform] duration-300 [transition-timing-function:var(--ease-mech)] hover:border-white/25 hover:text-black hover:scale-[1.02] active:scale-[0.97]"
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
          {CTA_BLOCKS.map((blk, i) => (
            <div
              key={blk.tag}
              ref={(el) => { tiltRefs.current[i] = el; }}
              className={
                i === 0
                  ? "absolute w-[clamp(320px,34vw,520px)] px-8 py-9"
                  : "absolute w-[clamp(320px,34vw,520px)] rounded-2xl border border-white/10 border-l-white/25 bg-black/10 px-8 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_90px_-40px_rgba(0,0,0,0.92)]"
              }
              style={{ pointerEvents: blk.cta ? "auto" : "none" }}
            >
              <span
                className="block font-mono text-[10px] uppercase tracking-[0.32em] text-white/50 mb-3"
                style={i === 0 ? { textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)" } : undefined}
              >
                {blk.tag}
              </span>
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span
                  className="font-syne text-sm font-bold uppercase tracking-[0.1em] text-zinc-200"
                  style={i === 0 ? { textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)" } : undefined}
                >
                  {blk.tier}
                </span>
              </div>
              <h3
                className="font-syne font-black uppercase leading-[1.05] tracking-[-0.02em] text-[clamp(1.6rem,2.3vw,2.4rem)] text-white whitespace-pre-line break-words"
                style={i === 0 ? { textShadow: "0 4px 24px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.95)" } : undefined}
              >
                {blk.headline}
              </h3>
              <p
                className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-[32ch]"
                style={i === 0 ? { textShadow: "0 2px 10px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.95)" } : undefined}
              >
                {blk.body}
              </p>
              {blk.cta && (
                <a
                  href="#request-access"
                  className="mt-6 inline-flex items-center justify-center rounded-none border border-white bg-white px-7 py-3 font-syne text-sm font-bold uppercase tracking-[0.15em] text-black transition-transform duration-300 hover:scale-[1.02] active:scale-[0.97]"
                >
                  Get Access
                </a>
              )}
            </div>
          ))}

          {SHOWCASE_STEPS.map((step, i) => (
            <div
              key={step.eyebrow}
              ref={(el) => { showcaseRefs.current[i] = el; }}
              id={i === 0 ? "request-access" : undefined}
              className="absolute w-[clamp(320px,34vw,560px)] rounded-2xl border border-white/10 border-l-white/25 bg-black/10 px-8 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_40px_90px_-40px_rgba(0,0,0,0.92)]"
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
                  Get Access
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
            Move Through The Space
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


export function LocalSeoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!leftColRef.current || !quoteRef.current) return;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sectionRef.current, start: "top 90%", end: "bottom 40%", scrub: 1 },
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
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative z-10 bg-transparent text-white px-6 py-32">
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

      <div
        aria-hidden
        className="io-ambient-glow pointer-events-none absolute -top-40 left-[10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(120,140,255,0.14),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="io-ambient-glow-b pointer-events-none absolute bottom-0 right-[5%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(255,180,140,0.10),transparent_70%)] blur-3xl"
      />

      <div className="max-w-[1400px] mx-auto">
        <div ref={leftColRef}>
          <span className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-mono mb-6 block">
            Operational Coordinates / WNDSR
          </span>
          <h2 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black tracking-[-0.04em] leading-[0.95] font-syne mb-10">
            Flagship Location.
            <br />
            <span className="text-zinc-500">A Private Space, Not A Facility.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-14 leading-relaxed max-w-2xl">
            A premium private space in a quiet Windsor residential setting.
            Zero staffing, zero sharing, fully automated voice/SMS handlers,
            and turnkey Access Key control.
          </p>

          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-14">
            {COORDINATES.map(({ k, v }) => (
              <div key={k} className="io-tier rounded-2xl px-5 py-5 backdrop-blur-2xl">
                <dt className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-mono mb-2">{k}</dt>
                <dd className="text-sm tracking-wide text-zinc-100 font-mono">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-4">
            <MagicShimmerButton>Acquire Key</MagicShimmerButton>
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

export function FinalClose() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;
    gsap.fromTo(
      sectionRef.current.children,
      { autoAlpha: 0, y: 32, clipPath: "inset(0 0 100% 0)" },
      {
        autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", stagger: 0.15, ease: "power3.out", duration: 1,
        scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "bottom 60%", scrub: 1 },
      },
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative z-10 overflow-hidden bg-gradient-to-b from-transparent via-[#0a0c11] to-black text-white px-6 py-24 md:py-32 border-t border-white/10"
    >
      {/* Ambient glow anchors the card so the section reads as a designed
          destination instead of a flat void once the card's own padding ends. */}
      <div
        aria-hidden
        className="io-ambient-glow pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(50% 60% at 50% 30%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="io-ambient-glow-b pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(40% 50% at 70% 70%, rgba(120,140,255,0.08), transparent 70%)",
        }}
      />

      <div className="relative io-tier max-w-4xl mx-auto rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center backdrop-blur-2xl">
        <span className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 font-mono mb-6 block">
          Get Access
        </span>
        <h2 className="text-[clamp(2rem,5vw,4rem)] font-black tracking-[-0.04em] leading-[0.98] font-syne mb-6">
          The Space Is Waiting.
        </h2>
        <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
          No tours, no sales calls. Download the app, generate your Access
          Key, and the private space unlocks the moment you arrive.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#request-access"
            className="group relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white px-7 py-3 font-syne text-sm font-semibold tracking-[0.15em] text-zinc-900 transition-[color,border-color,background-color,transform] duration-300 [transition-timing-function:var(--ease-mech)] hover:border-white/25 hover:text-black hover:scale-[1.02] active:scale-[0.97]"
          >
            Acquire Key
          </a>
        </div>
      </div>

      <div className="relative mt-20 flex flex-col items-center gap-3 text-center">
        <span className="font-syne text-sm font-semibold tracking-[0.32em] text-zinc-500">
          IRON OASIS
        </span>
        <span className="text-[10px] font-mono tracking-[0.28em] text-zinc-600 uppercase">
          &copy; {new Date().getFullYear()} Iron Oasis. Private access only.
        </span>
      </div>
    </section>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(MODEL_URL);
}
