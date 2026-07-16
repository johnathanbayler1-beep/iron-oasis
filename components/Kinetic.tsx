'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Kinetic layer — two page-wide physical details:
 * 1. Architecture line: 1px matte vertical rule down the left margin that
 *    draws itself with scroll, structurally tying hero → scene → keys.
 * 2. Magnetic CTAs: primary `.io-btn--accent` buttons pull toward the cursor
 *    (max 10px) and snap back on leave. Delegated, so every accent button
 *    on the page gets it without per-component wiring.
 */
export function Kinetic() {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    // ── architecture line ──
    let st: ScrollTrigger | undefined
    if (lineRef.current) {
      if (reduce) {
        gsap.set(lineRef.current, { scaleY: 1 })
      } else {
        st = ScrollTrigger.create({
          trigger: document.documentElement,
          start: 0,
          end: 'max',
          scrub: 0.6,
          animation: gsap.fromTo(
            lineRef.current,
            { scaleY: 0 },
            { scaleY: 1, ease: 'none' },
          ),
        })
      }
    }

    // ── magnetic CTAs ──
    let active: HTMLElement | null = null
    const release = (el: HTMLElement) =>
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'power4.out', overwrite: 'auto' })
    const onMove = (e: MouseEvent) => {
      const btn = (e.target as Element | null)?.closest?.('.io-btn--accent') as HTMLElement | null
      if (btn !== active) {
        if (active) release(active)
        active = btn
      }
      if (!btn) return
      const r = btn.getBoundingClientRect()
      // subtract the current pull so the anchor is the button's resting center
      const cx = r.left + r.width / 2 - Number(gsap.getProperty(btn, 'x'))
      const cy = r.top + r.height / 2 - Number(gsap.getProperty(btn, 'y'))
      gsap.to(btn, {
        x: gsap.utils.clamp(-10, 10, (e.clientX - cx) * 0.18),
        y: gsap.utils.clamp(-10, 10, (e.clientY - cy) * 0.18),
        duration: 0.4,
        ease: 'power4.out',
        overwrite: 'auto',
      })
    }
    if (fine && !reduce) document.addEventListener('mousemove', onMove, { passive: true })

    // press feedback — CSS :active transform is disabled on accent buttons so
    // GSAP stays the single owner of their transform
    let pressed: HTMLElement | null = null
    const onDown = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest?.('.io-btn--accent') as HTMLElement | null
      if (!btn) return
      pressed = btn
      gsap.to(btn, { scale: 0.96, duration: 0.14, ease: 'power4.out', overwrite: 'auto' })
    }
    const onUp = () => {
      if (!pressed) return
      gsap.to(pressed, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
      pressed = null
    }
    document.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointercancel', onUp, { passive: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      if (active) release(active)
      st?.kill()
    }
  }, [])

  return (
    <div
      ref={lineRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 'clamp(20px, 3vw, 48px)',
        width: 1,
        background: 'rgba(255,255,255,0.1)',
        transform: 'scaleY(0)',
        transformOrigin: 'top center',
        pointerEvents: 'none',
        zIndex: 30,
        willChange: 'transform',
      }}
    />
  )
}
