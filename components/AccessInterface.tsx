'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Access Interface — In-App Smart-Lock preview: live occupancy + encrypted key.
// Reads as a feature of the Iron Oasis app, not a web form.

const SUB = 'rgba(255,255,255,0.75)'
const MONO = 'var(--font-jetbrains), monospace'

const PANEL_GLASS: React.CSSProperties = {
  background: '#0a0a0a',
  willChange: 'transform, opacity',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px rgba(0,0,0,0.5), 0 48px 110px rgba(0,0,0,0.8)',
  borderRadius: 12,
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: SUB, textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

export function AccessInterface() {
  const rootRef = useRef<HTMLElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const [key, setKey] = useState<string | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.to(dotRef.current, {
        opacity: 0.35,
        duration: 1.1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.from('[data-access-panel]', {
        y: 64,
        opacity: 0,
        stagger: 0.18,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 85%',
          end: 'top 40%',
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // ponytail: cosmetic pass string; wire to smart-lock API when it exists.
  const generate = () =>
    setKey(
      Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) =>
        (b % 36).toString(36).toUpperCase(),
      ).join(''),
    )

  return (
    <section
      ref={rootRef}
      className="relative"
      style={{ background: '#000', padding: 'clamp(96px, 14vh, 180px) 24px' }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Panel 1 — Live Occupancy */}
        <div data-access-panel style={{ ...PANEL_GLASS, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>App Interface Preview</Label>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                ref={dotRef}
                aria-hidden="true"
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffffff' }}
              />
              <Label>Live</Label>
            </span>
          </div>
          <p style={{ fontSize: 22, lineHeight: 1.35, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
            Zero Occupancy. Complete Privacy Available.
          </p>
          {/* Capacity bar — 0/1 active users */}
          <div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '0%', background: '#ffffff' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <Label>Active Users</Label>
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#ffffff' }}>0 / 1</span>
            </div>
          </div>
        </div>

        {/* Panel 2 — Smart-Lock Access */}
        <div data-access-panel style={{ ...PANEL_GLASS, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Label>In-App Smart-Lock</Label>
          <p style={{ fontSize: 22, lineHeight: 1.35, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
            One-time encrypted keys, generated in the Iron Oasis app.
          </p>
          <div
            style={{
              fontFamily: MONO, fontSize: 15, letterSpacing: '0.3em', color: key ? '#ffffff' : SUB,
              padding: '14px 16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
            }}
          >
            {key ?? '· · · · · ·'}
          </div>
          <button
            type="button"
            onClick={generate}
            style={{
              marginTop: 'auto', alignSelf: 'flex-start', cursor: 'pointer',
              fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#000000', background: '#ffffff', border: 'none', padding: '14px 24px',
            }}
          >
            Acquire Key
          </button>
        </div>
      </div>
    </section>
  )
}
