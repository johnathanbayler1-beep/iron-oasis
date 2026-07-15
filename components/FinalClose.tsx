'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

// Logistics + rules — the honest close. No pricing here; Access Keys carry that.
const RULES = [
  { name: '1-hour blocks', line: 'Every booking is a clean 1-hour block. Reserve it, walk up, the space is yours.', featured: false },
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
        padding: 'clamp(38px, 3.6vw, 53px)',
        borderRadius: 12,
        willChange: 'transform',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(16px) saturate(110%)',
        WebkitBackdropFilter: 'blur(16px) saturate(110%)',
        border: '1px solid rgba(255,255,255,0.04)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.4s cubic-bezier(0.32,0.72,0,1), border-color 0.4s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      <span
        style={{
          position: 'relative', zIndex: 2,
          fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 700,
          fontSize: 'clamp(22px, 2.4vw, 28px)', lineHeight: 1.1, letterSpacing: '-0.03em', color: '#ffffff',
        }}
      >
        {r.name}
      </span>
      <p
        style={{
          position: 'relative', zIndex: 2, margin: '14px 0 0',
          fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 16, fontWeight: 400,
          lineHeight: 1.5, color: '#a1a1aa',
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
        { opacity: 0, y: 30, rotateX: -6 },
        {
          opacity: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.1, ease: 'appleOut',
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

      // data-speed parallax — ghost layers drift at their own rate against the
      // content, written straight to the DOM (no per-el tweens). Depth, not motion slop.
      const layers = gsap.utils.toArray<HTMLElement>('[data-speed]')
      ScrollTrigger.create({
        trigger: wrap,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate(self) {
          const p = self.progress - 0.5
          layers.forEach((el) => {
            const s = Number(el.dataset.speed ?? 0)
            el.style.transform = `translate3d(0, ${p * s * 260}px, 0)`
          })
        },
      })
    }, wrap)

    return () => { splits.forEach((s) => s.revert()); ctx.revert() }
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative', zIndex: 20, background: '#000',
        padding: 'clamp(120px, 18vh, 240px) 6% clamp(120px, 16vh, 220px)',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
        {/* ghost layer — huge outline word drifting slower than the content behind the heading */}
        <span
          data-speed="-1.4"
          aria-hidden="true"
          style={{
            position: 'absolute', top: '-2vh', left: '-1vw', zIndex: 0, pointerEvents: 'none',
            fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900,
            fontSize: 'clamp(120px, 22vw, 340px)', lineHeight: 0.8, letterSpacing: '-0.05em',
            color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.05)',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}
        >
          Private
        </span>

        <div
          data-fade
          style={{
            position: 'relative', zIndex: 2,
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 14, fontWeight: 700,
            letterSpacing: '0.24em', textTransform: 'uppercase', color: ACCENT,
          }}
        >
          The rules
        </div>

        <h2
          data-split-head
          style={{
            position: 'relative', zIndex: 2,
            margin: '20px 0 20px',
            fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
            fontSize: 'clamp(60px, 9vw, 140px)', lineHeight: 0.95,
            letterSpacing: '-0.045em', color: '#ffffff',
          }}
        >
          Simple and honest.
        </h2>

        <p
          data-fade
          style={{
            position: 'relative', zIndex: 2,
            margin: '0 0 clamp(48px, 6vh, 80px)', maxWidth: 560,
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 'clamp(17px, 1.6vw, 21px)',
            fontWeight: 400, lineHeight: 1.5, color: '#a1a1aa',
          }}
        >
          Claim an Access Key, book a block, and the private node in Windsor is yours. No games, no fine print.
        </p>

        <div
          ref={gridRef}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(18px, 2vw, 28px)',
            perspective: '1000px',
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
            padding: 'clamp(26px, 3.1vw, 38px)', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.04)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(16px) saturate(110%)',
            WebkitBackdropFilter: 'blur(16px) saturate(110%)',
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

        {/* spatial finale — overlapping ghost word drifts behind a single deep-glass panel */}
        <div style={{ position: 'relative', marginTop: 'clamp(72px, 12vh, 160px)' }}>
          <span
            data-speed="1.6"
            aria-hidden="true"
            style={{
              position: 'absolute', bottom: '-6vh', right: '-2vw', zIndex: 0, pointerEvents: 'none',
              fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900,
              fontSize: 'clamp(140px, 28vw, 460px)', lineHeight: 0.7, letterSpacing: '-0.06em',
              color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.055)',
              textTransform: 'uppercase', whiteSpace: 'nowrap',
            }}
          >
            Oasis
          </span>

          <div
            data-fade
            style={{
              position: 'relative', zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'clamp(28px, 4vh, 44px)', textAlign: 'center',
              padding: 'clamp(88px, 14vh, 168px) clamp(32px, 6vw, 96px)',
              borderRadius: 12, overflow: 'hidden',
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(28px) saturate(120%)',
              WebkitBackdropFilter: 'blur(28px) saturate(120%)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h3
              style={{
                position: 'relative', margin: 0,
                fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
                fontSize: 'clamp(52px, 8vw, 108px)', lineHeight: 0.95, letterSpacing: '-0.045em', color: '#ffffff',
              }}
            >
              Your private node is waiting.
            </h3>
            <button
              type="button"
              onClick={() => console.log('PWA Prompt Triggered')}
              className="io-btn io-btn--accent"
              style={{ position: 'relative', padding: 'clamp(22px, 2.6vh, 28px) clamp(48px, 6vw, 76px)', fontSize: 'clamp(19px, 2.2vw, 24px)', fontWeight: 700 }}
            >
              Get your key
            </button>
            <span style={{ position: 'relative', fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>
              Download the app and claim your Access Key in minutes.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
