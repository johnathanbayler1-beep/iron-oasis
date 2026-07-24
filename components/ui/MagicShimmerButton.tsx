"use client";

import { motion, useAnimationControls } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

// Omit DOM handlers whose signatures collide with framer-motion's props.
type MagicShimmerButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
> & {
  children: ReactNode;
  /** Sweep duration in seconds. Default 2.6. */
  sweepDuration?: number;
};

/**
 * Animated border-sweep CTA. A luminance ring travels the perimeter (conic
 * gradient), the surface stays matte obsidian glass. Motion is spring-driven,
 * not CSS-eased. Brand-safe: caller supplies allowed action language.
 */
export const MagicShimmerButton = forwardRef<
  HTMLButtonElement,
  MagicShimmerButtonProps
>(function MagicShimmerButton(
  { children, sweepDuration = 2.6, className, disabled, ...props },
  ref
) {
  const controls = useAnimationControls();

  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-40 ${className ?? ""}`}
      initial={false}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.6 }}
      onHoverStart={() => controls.start({ opacity: 1 })}
      onHoverEnd={() => controls.start({ opacity: 0.55 })}
      {...props}
    >
      {/* traveling border sweep */}
      <motion.span
        aria-hidden
        className="absolute inset-[-120%]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(255,255,255,0.9) 340deg, transparent 360deg)",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: sweepDuration,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      {/* inner surface — matte obsidian glass */}
      <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-[#050505] px-7 py-3 font-syne text-sm font-semibold tracking-wide text-white transition-colors">
        {/* ambient inner glow, spring-brightened on hover */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(120% 140% at 50% 0%, rgba(255,255,255,0.14), transparent 60%)",
          }}
          initial={{ opacity: 0.55 }}
          animate={controls}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        <span className="relative">{children}</span>
      </span>
    </motion.button>
  );
});
