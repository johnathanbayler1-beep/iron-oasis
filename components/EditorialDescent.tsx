'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Wraps the bottom editorial sections in a continuous GSAP-scrubbed descent.
 * Each direct child section is revealed via scroll scrub (clip + y + opacity),
 * over a parallaxed coordinate-grid backdrop so the 2D half reads as a
 * continuation of the 3D flight, not a static page.
 */
export function EditorialDescent({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // parallax grid — drifts against scroll for depth
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      }

      // each section scrubs in: rises out of the void, unclips, settles
      wrap.querySelectorAll<HTMLElement>('[data-descent]').forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 120, clipPath: 'inset(12% 0% 0% 0%)' },
          {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 95%',
              end: 'top 45%',
              scrub: 0.6,
            },
          },
        )
      })
    }, wrap)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapRef} style={{ position: 'relative', background: '#000', zIndex: 20 }}>
      {/* coordinate-grid backdrop — brutalist survey lines, parallaxed */}
      <div
        ref={gridRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '-10% 0',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)',
          willChange: 'transform',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
