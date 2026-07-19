'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gymSceneState } from '@/components/scenes/GymSceneContent'

const SCROLL_VH = 280 // doubled runway — halves camera speed per scroll pixel

export default function GymScene({
  onReady,
  onActive,
}: {
  onReady?: () => void
  onActive?: (active: boolean) => void
}) {
  const sectionRef    = useRef<HTMLDivElement>(null)
  const stickyRef     = useRef<HTMLDivElement>(null)
  const readyFiredRef = useRef(false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!inView || readyFiredRef.current) return
    let raf1 = 0, raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        readyFiredRef.current = true
        onReady?.()
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [inView, onReady])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { setInView(entry.isIntersecting); onActive?.(entry.isIntersecting) },
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onActive])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    gsap.registerPlugin(ScrollTrigger)
    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5, invalidateOnRefresh: true,
      onUpdate(self) {
        gymSceneState.progressRef.current = self.progress
        gymSceneState.invalidateRef.current()
        const beats = sectionRef.current?.querySelectorAll<HTMLElement>('[data-beat]')
        beats?.forEach((el) => {
          const [a, b] = (el.dataset.beat ?? '0,1').split(',').map(Number)
          const span = b - a
          const inEnd = a + span * 0.28
          const outStart = b - span * 0.28
          const p = self.progress
          const o = p <= a || p >= b ? 0
            : p < inEnd ? (p - a) / (inEnd - a)
            : p > outStart ? (b - p) / (b - outStart)
            : 1
          el.style.opacity   = String(o)
          el.style.transform = `translateY(${(1 - o) * 24}px)`
          const body = el.querySelector<HTMLElement>('p')
          if (body) {
            const ob = Math.max(0, Math.min(1, (o - 0.3) / 0.7))
            body.style.opacity   = String(ob)
            body.style.transform = `translateY(${(1 - ob) * 20}px)`
          }
        })
      },
    })

    const fadeSt = ScrollTrigger.create({
      trigger: section,
      start:   'top bottom',
      end:     'top top',
      scrub:   1.5, invalidateOnRefresh: true,
      onUpdate(self) {
        if (!stickyRef.current) return
        stickyRef.current.style.opacity = String(0.15 + self.progress * 0.85)
        gymSceneState.invalidateRef.current()
      },
    })

    const rid = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => { cancelAnimationFrame(rid); st.kill(); fadeSt.kill() }
  }, [])

  return (
    <section ref={sectionRef} style={{ height: `${SCROLL_VH}vh`, position: 'relative' }}>
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          willChange: 'opacity',
        }}
      >
        {[
          { window: '0.04,0.36', side: 'left',  head: 'ONE KEY.',       body: 'Frictionless isolation. Park, walk up — the entire private facility is yours.' },
          { window: '0.34,0.67', side: 'right', head: 'ZERO SHARING.',  body: 'Every rack and machine is yours for the whole session.' },
          { window: '0.65,0.98', side: 'left',  head: 'PURE PRIVACY.',  body: 'Premium equipment, quiet residential setting. Reset between sessions.' },
        ].map((beat) => (
          <div
            key={beat.head}
            data-beat={beat.window}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '50%',
              [beat.side]: '6%',
              transform: 'translateY(24px)',
              opacity: 0,
              maxWidth: '42vw',
              pointerEvents: 'none',
              textAlign: beat.side as 'left' | 'right',
              zIndex: 2,
              willChange: 'opacity, transform',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900,
                fontSize: 'clamp(48px, 8vw, 120px)', lineHeight: 0.9,
                letterSpacing: '-0.03em', color: '#fff', textTransform: 'uppercase',
                textWrap: 'balance',
                textShadow: '0 4px 60px rgba(0,0,0,0.95), 0 0 24px rgba(0,0,0,0.9)',
              }}
            >
              {beat.head}
            </div>
            <p
              style={{
                marginTop: 20, fontFamily: 'var(--font-grotesk), sans-serif',
                fontSize: 'clamp(18px, 1.5vw, 22px)', maxWidth: '34ch',
                marginLeft: beat.side === 'right' ? 'auto' : 0,
                color: 'rgba(255,255,255,0.95)', lineHeight: 1.55, fontWeight: 500,
                textWrap: 'balance', willChange: 'opacity, transform',
                textShadow: '0 0 32px rgba(0,0,0,1), 0 2px 12px rgba(0,0,0,0.9)',
              }}
            >
              {beat.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
