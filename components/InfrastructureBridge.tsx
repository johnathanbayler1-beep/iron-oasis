'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
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
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onActive])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
    if (!CustomEase.get('appleOut')) CustomEase.create('appleOut', '0.16, 1, 0.3, 1')

    // Kowalski masked reveals — one scrub-driven timeline per beat heading
    const splits: SplitText[] = []
    const headTls = new Map<HTMLElement, gsap.core.Timeline>()
    section.querySelectorAll<HTMLElement>('[data-beat]').forEach((el) => {
      const head = el.querySelector<HTMLElement>('[data-head]')
      if (!head) return
      const split = new SplitText(head, { type: 'lines,words', mask: 'lines' })
      splits.push(split)
      const tl = gsap.timeline({ paused: true })
      tl.fromTo(split.words, { yPercent: 110 }, { yPercent: 0, stagger: 0.08, duration: 1, ease: 'appleOut' })
      headTls.set(el, tl)
    })

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
          const entry = p <= a ? 0 : Math.min(1, (p - a) / (inEnd - a))
          headTls.get(el)?.progress(entry)
        })
      },
    })

    const rid = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      cancelAnimationFrame(rid)
      st.kill()
      headTls.forEach((tl) => tl.kill())
      splits.forEach((s) => s.revert())
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
            <div
              data-head
              style={{
                fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900,
                fontSize: 'clamp(40px, 6.5vw, 104px)', lineHeight: 0.9,
                letterSpacing: '-0.03em', color: '#fff', textTransform: 'uppercase',
                textShadow: '0 4px 60px rgba(0,0,0,0.95), 0 0 24px rgba(0,0,0,0.9)',
              }}
            >
              {beat.head}
            </div>
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
