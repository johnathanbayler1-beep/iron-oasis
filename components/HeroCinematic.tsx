"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagicShimmerButton } from "./ui/MagicShimmerButton";
import { RetroTelemetryPanel } from "./ui/RetroTelemetryPanel";

gsap.registerPlugin(ScrollTrigger);

// public/frames/logo_000.webp .. logo_120.webp
const FRAME_COUNT = 121;
const frameUrl = (i: number) => `/frames/logo_${String(i).padStart(3, "0")}.webp`;

export default function HeroCinematic() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const text = textRef.current;
    if (!container || !canvas || !text) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Preload the full frame array into memory BEFORE scrubbing so fast scrolls
    // never hit an undecoded image (no flicker). webp frames are small.
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      images.push(img);
    }

    const state = { frame: 0 };

    const draw = () => {
      const img = images[Math.round(state.frame)];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width;
      const ch = canvas.height;
      // cover-fit
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
    // first frame may decode after resize() runs
    images[0].onload = draw;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: "+=1800",
        pin: true,
        scrub: 0.4,
        anticipatePin: 1,
      },
    });

    tl.to(
      state,
      { frame: FRAME_COUNT - 1, ease: "none", onUpdate: draw },
      0,
    );

    tl.fromTo(
      text,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.25 },
      0,
    ).to(text, { opacity: 0, y: -40, ease: "power1.in" }, 0.75);

    return () => {
      window.removeEventListener("resize", resize);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#050505] text-white overflow-hidden flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full will-change-[transform,opacity] [transform:translateZ(0)]"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,0,0,0.35),rgba(0,0,0,0.85))] pointer-events-none" />

      <div
        ref={textRef}
        className="relative z-30 text-center max-w-4xl px-6 opacity-0 translate-y-8 will-change-[transform,opacity] [transform:translateZ(0)]"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-400 font-mono mb-4 block">
          Iron Oasis — Windsor-Central (ON)
        </span>
        <h1 className="text-[clamp(2.75rem,9vw,7.5rem)] font-extrabold tracking-tight leading-[1.02] font-syne mb-6">
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
            className="group relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-7 py-3 font-syne text-sm font-semibold tracking-[0.15em] text-zinc-200 backdrop-blur-2xl transition-colors duration-200 ease-out hover:border-white/25 hover:text-white active:scale-[0.97]"
          >
            Acquire Key
          </a>
        </div>
      </div>

      {/* Floating Yale-gateway telemetry — anchored bottom-right, outside the
          text fade so it persists as the hero scrubs. */}
      <div className="pointer-events-none absolute bottom-8 right-8 z-30 hidden w-72 md:block">
        <RetroTelemetryPanel
          status="locked"
          rows={[
            { label: "LOCATION", value: "WINDSOR-CENTRAL (ON)" },
            { label: "OCCUPANCY", value: "1 / 1" },
            { label: "ACCESS", value: "24 / 7" },
          ]}
        />
      </div>
    </section>
  );
}
