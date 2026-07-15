'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

// Logistics + rules — the honest close. No pricing here; Access Keys carry that.
const RULES = [
  { name: '1-hour blocks', line: 'Every booking is a clean 1-hour block. Reserve it, walk up, the node is yours.', featured: false },
  { name: 'Flexible cancellations', line: 'Can’t make it? Cancel any time and keep your booking key. No penalty.', featured: false },
  { name: 'Zero commitments', line: 'No contracts, no hidden fees, no cancellation charges — ever.', featured: false },
]

const ACCENT = '#d4d7da'

// Calm tactile card — no 3D tilt, no glow. A quiet lift + border brighten on
// hover, a physical scale(0.98) on press. Spring-like ease, not a linear fade.
function RuleCard({ r }: { r: (typeof RULES)[number] }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const set = (transform: string, border: string) => {
    const el = cardRef.current
    if (!el) return
    el.style.transform = transform
    el.style.borderColor = border
  }

  return (
    <div
      ref={cardRef}
      data-rule-card
      onMouseEnter={() => set('translateY(-4px)', 'rgba(255,255,255,0.09)')}
      onMouseLeave={() => set('translateY(0)', 'rgba(255,255,255,0.04)')}
      onPointerDown={() => set('scale(0.98)', 'rgba(255,255,255,0.09)')}
      onPointerUp={() => set('translateY(-4px)', 'rgba(255,255,255,0.09)')}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        padding: 'clamp(32px, 3vw, 44px)',
        borderRadius: 12,
        willChange: 'transform',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
        transition: 'transform 0.4s cubic-bezier(0.32,0.72,0,1), border-color 0.4s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      <span
        style={{
          position: 'relative', zIndex: 2,
          fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 700,
          fontSize: 'clamp(22px, 2.4vw, 28px)', letterSpacing: '-0.02em', color: '#f6f8f6',
        }}
      >
        {r.name}
      </span>
      <p
        style={{
          position: 'relative', zIndex: 2, margin: '14px 0 0',
          fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 16, fontWeight: 400,
          lineHeight: 1.55, color: 'rgba(255,255,255,0.62)',
        }}
      >
        {r.line}
      </p>
    </div>
  )
}

export function FinalClose() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const grid = gridRef.current
    if (!wrap) return
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
    CustomEase.create('appleOut', '0.16, 1, 0.3, 1')

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const splits: SplitText[] = []

    const ctx = gsap.context(() => {
      const cards = grid ? gsap.utils.toArray<HTMLElement>(grid.querySelectorAll('[data-rule-card]')) : []
      const supporting = wrap.querySelectorAll('[data-fade]')

      if (reduce) {
        gsap.set([...cards, ...supporting], { opacity: 1, y: 0, rotateX: 0 })
        return
      }

      wrap.querySelectorAll<HTMLElement>('[data-split-head]').forEach((head) => {
        const split = new SplitText(head, { type: 'lines,words', mask: 'lines' })
        splits.push(split)
        gsap.fromTo(
          split.words,
          { yPercent: 115 },
          {
            yPercent: 0, stagger: 0.06, ease: 'appleOut', immediateRender: false,
            scrollTrigger: { trigger: wrap, start: 'top 80%', end: 'top 42%', scrub: 0.6 },
          },
        )
      })

      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'appleOut',
          scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
        },
      )

      gsap.fromTo(
        supporting,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: wrap, start: 'top 60%', once: true },
        },
      )
    }, wrap)

    return () => { splits.forEach((s) => s.revert()); ctx.revert() }
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative', zIndex: 20, background: '#000',
        padding: 'clamp(96px, 15vh, 200px) 6% clamp(96px, 14vh, 180px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
        <div
          data-fade
          style={{
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 14, fontWeight: 700,
            letterSpacing: '0.24em', textTransform: 'uppercase', color: ACCENT,
          }}
        >
          The rules
        </div>

        <h2
          data-split-head
          style={{
            margin: '20px 0 20px',
            fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
            fontSize: 'clamp(52px, 8vw, 120px)', lineHeight: 0.92,
            letterSpacing: '-0.045em', color: '#f6f8f6',
          }}
        >
          Simple and honest.
        </h2>

        <p
          data-fade
          style={{
            margin: '0 0 clamp(48px, 6vh, 80px)', maxWidth: 560,
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 'clamp(17px, 1.6vw, 21px)',
            fontWeight: 400, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)',
          }}
        >
          Claim an Access Key, book a block, and the private node in Windsor is yours. No games, no fine print.
        </p>

        <div
          ref={gridRef}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(18px, 2vw, 28px)',
          }}
        >
          {RULES.map((r) => (
            <RuleCard key={r.name} r={r} />
          ))}
        </div>

        {/* Strict policy — the one hard line, called out */}
        <div
          data-fade
          style={{
            marginTop: 'clamp(28px, 4vh, 44px)',
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            padding: 'clamp(22px, 2.6vw, 32px)', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff',
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.5)',
            }}
          >
            Strict policy
          </span>
          <span
            style={{
              fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 'clamp(16px, 1.8vw, 20px)',
              fontWeight: 600, color: '#fff', letterSpacing: '-0.01em',
            }}
          >
            Absolutely no refunds, under any circumstances.
          </span>
        </div>

        <div
          data-fade
          style={{
            position: 'relative', marginTop: 'clamp(56px, 8vh, 96px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 'clamp(24px, 3.5vh, 40px)', textAlign: 'center',
            padding: 'clamp(72px, 11vh, 128px) clamp(32px, 6vw, 88px)',
            borderRadius: 12, overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <h3
            style={{
              position: 'relative', margin: 0,
              fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
              fontSize: 'clamp(32px, 4.5vw, 56px)', lineHeight: 1, letterSpacing: '-0.04em', color: '#f6f8f6',
            }}
          >
            The node is waiting.
          </h3>
          <button
            type="button"
            onClick={() => console.log('PWA Prompt Triggered')}
            className="io-btn io-btn--accent"
            style={{ position: 'relative', padding: 'clamp(20px, 2.4vh, 26px) clamp(40px, 5vw, 64px)', fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 700 }}
          >
            Get your key
          </button>
          <span style={{ position: 'relative', fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>
            Download the app and claim your Access Key in minutes.
          </span>
        </div>
      </div>
    </div>
  )
}
