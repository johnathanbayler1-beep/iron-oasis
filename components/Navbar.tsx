"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import { MagicShimmerButton } from "./ui/MagicShimmerButton";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Pathway = { label: string; href: string };

const PATHWAYS: Pathway[] = [
  { label: "The Space", href: "/" },
  { label: "The Shop", href: "/shop" },
];

const MECH = { type: "spring" as const, stiffness: 520, damping: 40, mass: 1 };

const panel = {
  closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  open: { transition: { delayChildren: 0.1, staggerChildren: 0.06 } },
};

const item = {
  closed: { y: "110%", opacity: 0 },
  open: { y: "0%", opacity: 1, transition: MECH },
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLSpanElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  // Expanded glass bar collapses into a floating compact pill past the hero.
  useGSAP(() => {
    if (!barRef.current) return;
    const compact = {
      maxWidth: 0.42,
      top: 14,
      paddingX: 18,
      paddingY: 10,
      radius: 999,
    };

    gsap.set(barRef.current, { "--io-nav-scale": 1 });

    ScrollTrigger.create({
      start: "top top",
      end: "+=280",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(barRef.current, {
          top: gsap.utils.interpolate(24, compact.top, p),
          paddingLeft: gsap.utils.interpolate(28, compact.paddingX, p),
          paddingRight: gsap.utils.interpolate(28, compact.paddingX, p),
          paddingTop: gsap.utils.interpolate(16, compact.paddingY, p),
          paddingBottom: gsap.utils.interpolate(16, compact.paddingY, p),
          borderRadius: gsap.utils.interpolate(24, compact.radius, p),
          width: `${gsap.utils.interpolate(94, compact.maxWidth * 100, p)}%`,
          backgroundColor: `rgba(8,9,12,${gsap.utils.interpolate(0.28, 0.62, p)})`,
        });
        if (linksRef.current) {
          gsap.set(linksRef.current, {
            opacity: gsap.utils.interpolate(1, 0, Math.min(p * 1.6, 1)),
            width: gsap.utils.interpolate(1, 0, Math.min(p * 1.6, 1)) === 0 ? 0 : "auto",
            marginRight: gsap.utils.interpolate(24, 0, p),
          });
        }
        if (wordmarkRef.current) {
          gsap.set(wordmarkRef.current, {
            scale: gsap.utils.interpolate(1, 0.86, p),
          });
        }
      },
    });
  }, { scope: barRef });

  return (
    <>
      <div
        ref={barRef}
        className="fixed left-1/2 top-6 z-[60] flex w-[94%] max-w-5xl -translate-x-1/2 items-center justify-between overflow-hidden rounded-3xl border border-white/10 bg-black/30 px-7 py-4 backdrop-blur-2xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] transition-[border-color] duration-300 [transition-timing-function:var(--ease-mech)] hover:border-white/20"
      >
        <Link href="/" className="relative z-10 flex items-center gap-2">
          <span
            ref={wordmarkRef}
            className="font-syne text-sm font-bold uppercase tracking-[0.3em] text-white"
          >
            Iron Oasis
          </span>
        </Link>

        <div ref={linksRef} className="hidden items-center gap-8 md:flex">
          {PATHWAYS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400 transition-colors duration-300 hover:text-white"
            >
              {p.label}
            </Link>
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <MagicShimmerButton className="hidden sm:inline-flex" sweepDuration={3.2}>
            Request Access
          </MagicShimmerButton>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition-colors duration-300 hover:border-white/25"
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
              {open ? "X" : "IO"}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.25 } }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-black/90 backdrop-blur-2xl"
          >
            <motion.ul
              variants={panel}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-1 flex-col justify-center px-6 md:px-16"
            >
              {PATHWAYS.map((p, i) => (
                <li key={p.href} className="overflow-hidden border-t border-white/10 last:border-b">
                  <motion.div variants={item}>
                    <Link
                      href={p.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-6 py-6 md:py-10"
                    >
                      <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-syne text-[14vw] uppercase leading-[0.85] tracking-tight text-white transition-transform duration-300 group-hover:translate-x-4 md:text-[6vw]">
                        {p.label}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </motion.ul>

            <motion.div
              variants={item}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex items-center justify-between border-t border-white/10 px-6 py-6 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 md:px-16"
            >
              <span>Iron Oasis</span>
              <span>24/7 Access</span>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
