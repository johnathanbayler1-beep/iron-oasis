# Iron Oasis — DESIGN.md Specification

## 1. Aesthetic & Brand Identity
- **Canvas Archetype:** Absolute Obsidian Matte (`#050505`) with layered radial white spotlights (`radial-gradient(circle at 50% 20%, rgba(255,255,255,0.04) 0%, transparent 70%)`).
- **Glassmorphism (`.io-lux-card`):** Border `1px solid rgba(255, 255, 255, 0.08)`, background `rgba(255, 255, 255, 0.02)`, backdrop blur `24px`, and subtle inner box-shadow glow on interaction.

## 2. Typography Rules
- **Primary Headings & Numbers:** Custom `Syne` variable font (`var(--font-syne)`). **Strictly ban Inter, Arial, and system defaults for hero typography.**
- **Body & Captions:** Clean, high-readability sans-serif with tracked-out uppercase labels (`tracking-widest text-xs uppercase text-zinc-400`).

## 3. Motion Physics & Interaction Principles
- **Scrubbing:** Frame-accurate GSAP ScrollTrigger timelines for spatial video and logo transitions.
- **Micro-States:** Emil Kowalski-inspired spring physics (`framer-motion`) with snappy hover scales (`scale: 1.02`) and border luminance shifts.