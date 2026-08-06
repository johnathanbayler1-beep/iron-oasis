"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { SceneHandle } from "../types";
import { ASSET_REGISTRY, frameSequenceUrl, type FrameSequenceAsset } from "../assets/registry";

const logoFrames: FrameSequenceAsset = ASSET_REGISTRY.logoFrames;

// Scene 1 — Logo Reveal. Scrubs the pre-rendered logo_000..120.webp frame
// sequence against scroll progress, canvas-drawn for frame-accurate control.
//
// The frame index is driven through an ease (not a raw linear scrub) so the
// mark resolves in with a settle rather than ticking through frames at a
// constant scroll-linked rate — reads as a deliberate reveal, not a
// video-scrubber. Canvas opacity carries its own fade-in/out curve at the
// scene's edges so the handoff from/to Scene0 and SceneHook is a crossfade,
// not a cut.
const FADE_IN = 0.12;
const FADE_OUT = 0.12;

function ease(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

const Scene1LogoReveal = forwardRef<SceneHandle>(function Scene1LogoReveal(_props, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(-1);

  useEffect(() => {
    imagesRef.current = Array.from({ length: logoFrames.frameCount }, (_, i) => {
      const img = new Image();
      img.src = frameSequenceUrl(logoFrames, i);
      return img;
    });
  }, []);

  function drawFrame(index: number) {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || currentFrameRef.current === index) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = img.naturalWidth || canvas.width;
    canvas.height = img.naturalHeight || canvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    currentFrameRef.current = index;
  }

  useImperativeHandle(ref, () => ({
    enter() {
      const el = rootRef.current;
      if (el) el.style.opacity = "0";
      drawFrame(0);
    },
    update(progress) {
      const el = rootRef.current;
      if (el) {
        const inT = Math.min(1, progress / FADE_IN);
        const outT = progress > 1 - FADE_OUT ? (progress - (1 - FADE_OUT)) / FADE_OUT : 0;
        el.style.opacity = String(Math.max(0, ease(inT) - ease(outT)));
      }
      drawFrame(Math.round(ease(progress) * (logoFrames.frameCount - 1)));
    },
    exit() {
      const el = rootRef.current;
      if (el) el.style.opacity = "0";
    },
  }));

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center bg-[#050505] opacity-0"
    >
      <canvas ref={canvasRef} className="max-h-[60vh] max-w-[60vw] object-contain" />
    </div>
  );
});

export default Scene1LogoReveal;
