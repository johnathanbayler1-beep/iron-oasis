'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { spinState } from '@/components/scenes/SpinContent'

const CARD_GLASS: React.CSSProperties = {
  background: 'rgba(20, 20, 20, 0.4)',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  willChange: 'transform, opacity',
  border: '1px solid rgba(255,255,255,0.1)',
  borderTop: '1px solid rgba(255,255,255,0.28)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
}

const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

function Grain() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, borderRadius: 12,
        backgroundImage: NOISE_URI, backgroundSize: '120px 120px',
        opacity: 0.05, pointerEvents: 'none',
      }}
    />
  )
}

type AccessTier = { name: string; price: string; featured: boolean; features: string[] }

const TIERS: AccessTier[] = [
  {
    name: 'Oasis Lite',
    price: '$99',
    featured: false,
    features: ['3 days per week', '1hr Booking Windows', 'Non-peak hours (3–8pm restricted)', 'Entire Private Space, Zero Sharing'],
  },
  {
    name: 'Oasis Plus',
    price: '$125',
    featured: true,
    features: ['4 days per week', '1hr Booking Windows', 'Peak hours included', 'Entire Private Space, Zero Sharing'],
  },
  {
    name: 'Oasis Max',
    price: '$149',
    featured: false,
    features: ['7 days per week', '48hr Priority Booking Window', 'All hours, 24/7 Access', 'Entire Private Space, Zero Sharing'],
  },
]

const cardsProxy = TIERS.map(() => ({ intro: 0 }))

export default function GymSpin({ onActive }: { onActive?: (active: boolean) => void }) {
  const trackRef   = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const tiltRefs   = useRef<(HTMLDivElement | null)[]>([])

  const canTilt = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const tiltMove = (i: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRefs.current[i]
    if (!el || !canTilt()) return
    const r = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    gsap.to(el, { rotateY: nx * 10, rotateX: -ny * 10, y: -4, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
  }
  const tiltReset = (i: number) => () => {
    const el = tiltRefs.current[i]
    if (!el) return
    gsap.to(el, { rotateX: 0, rotateY: 0, y: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => onActive?.(entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onActive])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, CustomEase)
    if (!CustomEase.get('cardHover')) CustomEase.create('cardHover', '0.32, 0.72, 0, 1')

    let domRaf: number | null = null

    const ctx = gsap.context(() => {
      spinState.rotationRef.current = -Math.PI / 4

      const tl = gsap.timeline({ paused: true })
      ;(window as any).__timelines = { ...((window as any).__timelines ?? {}), gymSpin: tl }

      tl.to(spinState.rotationRef, { current: Math.PI / 2, duration: 1, ease: 'none' }, 0)
      cardsProxy.forEach((p, i) => {
        p.intro = 0
        tl.fromTo(p, { intro: 0 }, { intro: 1, duration: 0.6, ease: 'power3.out' }, 0.2 + i * 0.15)
      })

      if (!trackRef.current) {
        console.error('[GymSpin] scrollTrackRef is null at ScrollTrigger init — aborting context')
        return
      }

      ScrollTrigger.create({
        trigger: trackRef.current,
        start:   'top top',
        end:     () => `+=${trackRef.current?.offsetHeight ?? 1000}`,
        scrub:   1.5, invalidateOnRefresh: true,
        onLeave() {
          overlayRef.current?.style.setProperty('opacity', '0')
          if (overlayRef.current) overlayRef.current.style.visibility = 'hidden'
        },
        onEnterBack() {
          if (overlayRef.current) overlayRef.current.style.visibility = 'visible'
          overlayRef.current?.style.removeProperty('opacity')
        },
        onUpdate(self) {
          tl.progress(self.progress)
          if (domRaf === null) {
            domRaf = requestAnimationFrame(() => {
              cardsProxy.forEach((p, i) => {
                const clamped = Math.min(1, Math.max(0, p.intro))
                overlayRef.current?.style.setProperty(`--card-intro-${i}`, String(clamped))
              })
              spinState.invalidateRef.current()
              domRaf = null
            })
          }
        },
      })
    })

    const rid = requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => { cancelAnimationFrame(rid); if (domRaf !== null) cancelAnimationFrame(domRaf); ctx.revert() }
  }, [])

  return (
    <>
      {/* 300vh scroll track — dead tail before HowItWorks trimmed */}
      <div ref={trackRef} style={{ height: '300vh', position: 'relative', zIndex: 1 }} />

      {/* DOM glass card overlay — reads --cards-intro set by the scrub timeline above.
          Positioned fixed to sit over the shared Canvas while this section is active. */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 'clamp(16px, 2vw, 28px)', padding: '0 6%', perspective: 1400,
          pointerEvents: 'none',
        }}
      >
        {TIERS.map((tier, i) => (
          <div
            key={tier.name}
            ref={(el) => { tiltRefs.current[i] = el }}
            onMouseMove={tiltMove(i)}
            onMouseLeave={tiltReset(i)}
            style={{
              position: 'relative', width: 280, borderRadius: 12, ...CARD_GLASS,
              padding: 'clamp(28px, 2.6vw, 36px)', color: '#fff',
              pointerEvents: 'auto', cursor: 'default', transformStyle: 'preserve-3d',
              border: tier.featured ? '1px solid rgba(255,255,255,0.28)' : CARD_GLASS.border,
              opacity: `var(--card-intro-${i}, 0)`,
              transform: `translateY(calc((1 - var(--card-intro-${i}, 0)) * 40px))`,
              transition: 'opacity 0.2s linear',
            }}
          >
            <Grain />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 'clamp(20px, 1.6vw, 24px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#EAEAEA' }}>{tier.name}</h3>
              {tier.featured && (
                <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '3px 8px' }}>
                  Priority
                </span>
              )}
            </div>
            <p style={{ position: 'relative', fontSize: 14, color: '#EAEAEA', marginBottom: 16 }}>
              {tier.price}<span style={{ marginLeft: 4, color: 'rgba(255,255,255,0.5)' }}>/mo</span>
            </p>
            <div style={{ position: 'relative', height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
            <ul style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', margin: 0, padding: 0, marginBottom: 24 }}>
              {tier.features.map((f) => (
                <li key={f} style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{f}</li>
              ))}
            </ul>
            <button
              style={{
                position: 'relative', width: '100%', borderRadius: 8, padding: '10px 0',
                background: '#000', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              }}
            >
              Acquire Key
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
