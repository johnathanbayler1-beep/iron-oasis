'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { bridgeState } from '@/components/scenes/BridgeContent'

const SCROLL_VH = 160 // tightened runway — kills trailing dead zone, beats still dwell — each beat dwells and reads before the next

const BEATS = [
  { window: '0.02,0.35', side: 'right', head: 'CLAIM YOUR KEY.', body: 'Pick an Access Key in the app. Premium equipment, zero sharing, 24/7 access. No contracts, no hidden fees.' },
  { window: '0.33,0.67', side: 'left',  head: 'BOOK YOUR SESSION.',  body: 'Reserve a 1-hour block. Park on the street, walk up the property — the entire space is yours, no one else.' },
  { window: '0.65,0.98', side: 'right', head: 'UNLOCK WITH YOUR KEY.', body: 'The Yale smart lock opens for your key alone. A frictionless, private walk-in — every time.' },
]

export default function InfrastructureBridge({ onActive }: { onActive?: (active: boolean) => void }) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => onActive?.(entry.isIntersecting),
      { threshold: 0, rootMargin: '-45% 0px -45% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onActive])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.registerPlugin(ScrollTrigger, CustomEase)
    if (!CustomEase.get('appleOut')) CustomEase.create('appleOut', '0.16, 1, 0.3, 1')

    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   1.5, invalidateOnRefresh: true,
      onUpdate(self) {
        bridgeState.progressRef.current = self.progress
        bridgeState.invalidateRef.current()
        const beats = section.querySelectorAll<HTMLElement>('[data-beat]')
        beats.forEach((el) => {
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
        })
      },
    })

    const rid = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(rid)
      st.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} style={{ height: `${SCROLL_VH}vh`, position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
        {BEATS.map((beat) => (
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
            <p
              style={{
                marginTop: 20, fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 18,
                color: 'rgba(255,255,255,0.92)', lineHeight: 1.6, fontWeight: 500,
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
