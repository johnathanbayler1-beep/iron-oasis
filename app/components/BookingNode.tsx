'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Booking Node — live occupancy + smart-lock time-slot generation.
// Sits below GymSpin: same glass, same grain, same calm.

const ACCENT = '#e6e6e6'
const SUB = 'rgba(255,255,255,0.75)'

const CARD_GLASS: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 42%, rgba(0,0,0,0.06))',
  backdropFilter: 'blur(32px) saturate(160%)',
  WebkitBackdropFilter: 'blur(32px) saturate(160%)',
  border: '1px solid rgba(255,255,255,0.14)',
  boxShadow:
    'inset 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -40px 64px rgba(0,0,0,0.32), 0 12px 32px rgba(0,0,0,0.5), 0 48px 110px rgba(0,0,0,0.8)',
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

// ponytail: slots are generated client-side; wire to the smart-lock API when it exists.
function buildSlots() {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const start = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000)
    start.setMinutes(0, 0, 0)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', ' ')
    return { id: i, label: `${fmt(start)} — ${fmt(end)}`, open: i !== 2 && i !== 5 }
  })
}

// Live Capacity Meter — radial gauge. 0 = vacant node, ready for entry.
function CapacityGauge({ occupancy }: { occupancy: number }) {
  const R = 84
  const C = 2 * Math.PI * R
  return (
    <div style={{ position: 'relative', width: 220, height: 220, flexShrink: 0 }}>
      <svg viewBox="0 0 220 220" width="220" height="220" aria-label="Spatial capacity">
        <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          cx="110" cy="110" r={R} fill="none"
          stroke={ACCENT} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - occupancy)}
          transform="rotate(-90 110 110)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center',
        }}
      >
        <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 40, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
          {Math.round(occupancy * 100)}%
        </span>
        <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', color: SUB }}>
          SPATIAL CAPACITY
        </span>
      </div>
    </div>
  )
}

export function BookingNode() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [slots] = useState(buildSlots)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    gsap.registerPlugin(ScrollTrigger)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const fades = gsap.utils.toArray<HTMLElement>('[data-node-fade]')
      if (reduce) {
        gsap.set(fades, { opacity: 1, y: 0 })
        return
      }
      gsap.fromTo(
        fades,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: wrap, start: 'top 72%', once: true } },
      )
    }, wrap)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={wrapRef}
      style={{
        position: 'relative', zIndex: 20, background: '#000',
        padding: 'clamp(120px, 18vh, 240px) 6%',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <span
          data-node-fade
          style={{
            display: 'block', fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', color: SUB,
            marginBottom: 'clamp(20px, 2.4vw, 32px)',
          }}
        >
          BOOKING — SECURE ACCESS WINDOW
        </span>

        <h2
          data-node-fade
          style={{
            color: '#ffffff', fontWeight: 700, letterSpacing: '-0.03em',
            fontSize: 'clamp(34px, 4.6vw, 64px)', lineHeight: 1.04,
            textWrap: 'balance', maxWidth: '18ch',
            marginBottom: 'clamp(16px, 2vw, 24px)',
          }}
        >
          Claim the window. The lock does the rest.
        </h2>

        <p
          data-node-fade
          style={{
            color: SUB, letterSpacing: '-0.01em', fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.6, maxWidth: '52ch', textWrap: 'balance',
            marginBottom: 'clamp(48px, 6vw, 80px)',
          }}
        >
          Live occupancy, read straight from the Location. Pick a window, and Dynamic
          Key Generation issues a one-time code to the Yale smart lock. Autonomous
          Entry — no desk, no handoff, zero sharing.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 380px) 1fr',
            gap: 'clamp(20px, 2.4vw, 32px)',
            alignItems: 'stretch',
          }}
        >
          {/* Live Capacity Meter */}
          <div
            data-node-fade
            style={{
              position: 'relative', borderRadius: 12, ...CARD_GLASS,
              padding: 'clamp(34px, 3.6vw, 48px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 'clamp(20px, 2.4vw, 28px)',
            }}
          >
            <Grain />
            <CapacityGauge occupancy={0} />
            <p
              style={{
                color: SUB, letterSpacing: '-0.01em', fontSize: 14, lineHeight: 1.55,
                textAlign: 'center', textWrap: 'balance', maxWidth: '26ch', margin: 0,
              }}
            >
              Node is vacant. Every Solo Window holds the entire Location for one key.
            </p>
          </div>

          {/* Slot grid */}
          <div
            data-node-fade
            style={{
              position: 'relative', borderRadius: 12, ...CARD_GLASS,
              padding: 'clamp(34px, 3.6vw, 48px)',
            }}
          >
            <Grain />
            <span
              style={{
                display: 'block', fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.22em', color: '#ffffff',
                marginBottom: 'clamp(20px, 2vw, 28px)',
              }}
            >
              NEXT 12 HOURS — WINDSOR
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 12,
              }}
            >
              {slots.map((s) => {
                const active = selected === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!s.open}
                    onClick={() => setSelected(s.id)}
                    aria-pressed={active}
                    style={{
                      fontFamily: 'var(--font-jetbrains), monospace',
                      fontSize: 13, fontWeight: 700, letterSpacing: '0.02em',
                      padding: '14px 12px', borderRadius: 8, cursor: s.open ? 'pointer' : 'default',
                      color: s.open ? (active ? '#000' : '#ffffff') : 'rgba(255,255,255,0.3)',
                      background: active ? ACCENT : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? ACCENT : 'rgba(255,255,255,0.14)'}`,
                      transition: 'background 0.25s ease, color 0.25s ease, border-color 0.25s ease',
                      textDecoration: s.open ? 'none' : 'line-through',
                    }}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
            <p
              style={{
                color: SUB, letterSpacing: '-0.01em', fontSize: 13, lineHeight: 1.5,
                marginTop: 'clamp(20px, 2vw, 28px)', marginBottom: 0, textWrap: 'balance',
              }}
            >
              {selected !== null
                ? 'Window held. Dynamic Key Generation arms your code at the top of the hour.'
                : 'Select a Secure Access Window. Struck slots are already claimed.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
