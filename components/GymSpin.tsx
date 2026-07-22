'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import { spinState } from '@/components/scenes/SpinContent'

const CARD_GLASS: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.65)',
  backdropFilter: 'blur(12px) saturate(150%)',
  WebkitBackdropFilter: 'blur(12px) saturate(150%)',
  willChange: 'transform, opacity',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.03)',
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
  const btnRefs    = useRef<(HTMLButtonElement | null)[]>([])
  const btnTextRefs = useRef<(HTMLSpanElement | null)[]>([])
  const quickRefs  = useRef<Array<{ x: (v: number) => void; y: (v: number) => void; tx: (v: number) => void; ty: (v: number) => void } | null>>([])

  const canTilt = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const tiltMove = (i: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRefs.current[i]
    if (!el) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    if (!canTilt()) return
    const nx = px - 0.5
    const ny = py - 0.5
    gsap.to(el, { rotateY: nx * 10, rotateX: -ny * 10, y: -4, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
  }
  const tiltReset = (i: number) => () => {
    const el = tiltRefs.current[i]
    if (!el) return
    gsap.to(el, { rotateX: 0, rotateY: 0, y: 0, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
  }

  const magneticMove = (i: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!canTilt()) return
    const btn = btnRefs.current[i]
    const txt = btnTextRefs.current[i]
    if (!btn || !txt) return
    if (!quickRefs.current[i]) {
      quickRefs.current[i] = {
        x:  gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' }),
        y:  gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' }),
        tx: gsap.quickTo(txt, 'x', { duration: 0.5, ease: 'power3' }),
        ty: gsap.quickTo(txt, 'y', { duration: 0.5, ease: 'power3' }),
      }
    }
    const r = e.currentTarget.getBoundingClientRect()
    const relX = e.clientX - (r.left + r.width / 2)
    const relY = e.clientY - (r.top + r.height / 2)
    const q = quickRefs.current[i]!
    q.x(relX * 0.2); q.y(relY * 0.2)
    q.tx(relX * 0.35); q.ty(relY * 0.35)
  }
  const magneticLeave = (i: number) => () => {
    const btn = btnRefs.current[i]
    const txt = btnTextRefs.current[i]
    if (!btn || !txt) return
    gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' })
    gsap.to(txt, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' })
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => onActive?.(entry.isIntersecting),
      { threshold: 0, rootMargin: '-45% 0px -45% 0px' },
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
          spinState.focusRef.current = self.progress
          spinState.invalidateRef.current()
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
            className="pricing-card"
            ref={(el) => { tiltRefs.current[i] = el }}
            onMouseMove={tiltMove(i)}
            onMouseLeave={tiltReset(i)}
            style={{
              position: 'relative', width: 280, borderRadius: 12, ...CARD_GLASS,
              padding: 'clamp(28px, 2.6vw, 36px)', color: '#F5F5F7', fontFamily: 'var(--font-display)',
              pointerEvents: 'auto', cursor: 'default', transformStyle: 'preserve-3d',
              opacity: `var(--card-intro-${i}, 0)`,
              transform: `translateY(calc((1 - var(--card-intro-${i}, 0)) * 40px))`,
              transition: 'opacity 0.2s linear',
            }}
          >
            <Grain />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 'clamp(20px, 1.6vw, 24px)', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: '#F5F5F7' }}>{tier.name}</h3>
              {tier.featured && (
                <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,245,247,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '3px 8px' }}>
                  Priority
                </span>
              )}
            </div>
            <p style={{ position: 'relative', fontSize: 'clamp(14px, 1.2vw, 16px)', color: '#F5F5F7', marginBottom: 16 }}>
              {tier.price}<span style={{ marginLeft: 4, color: 'rgba(245,245,247,0.5)' }}>/mo</span>
            </p>
            <div style={{ position: 'relative', height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
            <ul style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', margin: 0, padding: 0, marginBottom: 24 }}>
              {tier.features.map((f) => (
                <li key={f} style={{ fontSize: 'clamp(13px, 1.1vw, 15px)', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{f}</li>
              ))}
            </ul>
            <button
              ref={(el) => { btnRefs.current[i] = el }}
              onMouseMove={magneticMove(i)}
              onMouseLeave={magneticLeave(i)}
              style={{
                position: 'relative', width: '100%', borderRadius: 8, padding: '10px 0',
                background: '#000', color: '#F5F5F7', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              }}
            >
              <span ref={(el) => { btnTextRefs.current[i] = el }} style={{ display: 'inline-block' }}>Acquire Key</span>
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .pricing-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.6), transparent 55%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .pricing-card:hover::before {
          opacity: 1;
        }
        /* ponytail: !important overrides the inline bg/color; upgrade to a className if this button gains more states */
        .pricing-card button {
          transition: background 0.2s ease, color 0.2s ease;
        }
        .pricing-card button:hover {
          background: #fff !important;
          color: #000 !important;
        }
      `}</style>
    </>
  )
}
