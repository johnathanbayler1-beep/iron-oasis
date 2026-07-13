'use client'

import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

// Warm, plain-English tiers — one accent, no tech lingo. The "key" is the brand:
// download the app, get your key, the whole gym is yours.
const TIERS = [
  { name: 'Lite',      price: 99,  sessions: '4 sessions a month', line: 'Get started. The whole gym to yourself.', featured: false },
  { name: 'Plus',      price: 125, sessions: '8 sessions a month', line: 'Train more, and book further ahead.',    featured: true  },
  { name: 'Unlimited', price: 149, sessions: 'Unlimited sessions',  line: 'Train any hour, day or night.',          featured: false },
]

const ACCENT = '#4dffa6'
const MAX_TILT = 8

function KeyCard({ t }: { t: (typeof TIERS)[number] }) {
  const cardRef = useRef<HTMLDivElement>(null)
  // quickTo/quickSetter created once per card — no per-event tween allocation
  const setRotX = useRef<((v: number) => void) | null>(null)
  const setRotY = useRef<((v: number) => void) | null>(null)
  const setMX = useRef<((v: string) => void) | null>(null)
  const setMY = useRef<((v: string) => void) | null>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    gsap.set(el, { transformPerspective: 1200 })
    setRotX.current = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power3.out' })
    setRotY.current = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power3.out' })
    setMX.current = gsap.quickSetter(el, '--mx') as (v: string) => void
    setMY.current = gsap.quickSetter(el, '--my') as (v: string) => void
  }, [])

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1  // -1..1
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1
    setMX.current?.(`${((nx + 1) / 2) * 100}%`)
    setMY.current?.(`${((ny + 1) / 2) * 100}%`)
    setRotY.current?.(nx * MAX_TILT)
    setRotX.current?.(-ny * MAX_TILT)
  }

  const onLeave = () => {
    const el = cardRef.current
    if (!el) return
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' })
  }

  return (
    <div
      ref={cardRef}
      data-key-card
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        padding: 'clamp(32px, 3vw, 44px)',
        borderRadius: 24,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        // brushed graphite plate under a thin glass layer
        background: t.featured
          ? 'linear-gradient(165deg, rgba(77,255,166,0.10) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0.55) 100%)'
          : 'linear-gradient(165deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 42%, rgba(0,0,0,0.55) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${t.featured ? 'rgba(77,255,166,0.55)' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: t.featured
          ? `0 0 0 1px rgba(77,255,166,0.25) inset, 0 30px 80px rgba(0,0,0,0.6), 0 0 60px rgba(77,255,166,0.18)`
          : '0 30px 80px rgba(0,0,0,0.55)',
      }}
    >
      {/* pointer-tracked sheen — soft white, catches the light like a metal card */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, borderRadius: 24, pointerEvents: 'none', zIndex: 1,
          background: 'radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.16), transparent 60%)',
        }}
      />

      {t.featured && (
        <span
          style={{
            position: 'absolute', top: 20, right: 20, zIndex: 2,
            padding: '6px 14px', borderRadius: 999,
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em', color: '#04140c',
            background: ACCENT, boxShadow: `0 0 24px ${ACCENT}66`,
          }}
        >
          Most popular
        </span>
      )}

      <span
        style={{
          position: 'relative', zIndex: 2,
          fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 15, fontWeight: 700,
          letterSpacing: '0.02em', color: t.featured ? ACCENT : 'rgba(255,255,255,0.85)',
        }}
      >
        {t.name}
      </span>

      <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'baseline', gap: 6, margin: '18px 0 4px' }}>
        <span
          style={{
            fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
            fontSize: 'clamp(56px, 6vw, 84px)', lineHeight: 1, letterSpacing: '-0.04em', color: '#f6f8f6',
          }}
        >
          ${t.price}
        </span>
        <span style={{ fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.5)' }}>
          / month
        </span>
      </span>

      <span
        style={{
          position: 'relative', zIndex: 2,
          fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 15, fontWeight: 600,
          color: 'rgba(255,255,255,0.9)', paddingTop: 18, marginTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {t.sessions}
      </span>

      <p
        style={{
          position: 'relative', zIndex: 2, margin: '12px 0 0',
          fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 16, fontWeight: 400,
          lineHeight: 1.55, color: 'rgba(255,255,255,0.62)',
        }}
      >
        {t.line}
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
      const cards = grid ? gsap.utils.toArray<HTMLElement>(grid.querySelectorAll('[data-key-card]')) : []
      const supporting = wrap.querySelectorAll('[data-fade]')

      if (reduce) {
        gsap.set([...cards, ...supporting], { opacity: 1, y: 0, rotateX: 0 })
        return
      }

      // Headline — masked line reveal, words rise out of overflow-hidden line masks
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

      // Cards — 3D unfold: each plate tilts up from the table and settles, once
      gsap.set(cards, { transformPerspective: 1200 })
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, rotateX: -32 },
        {
          opacity: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.12, ease: 'appleOut',
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
      {/* single soft spotlight — depth without tech clutter */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(1100px circle at 50% 0%, rgba(77,255,166,0.10), transparent 55%)',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
        <div
          data-fade
          style={{
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 14, fontWeight: 700,
            letterSpacing: '0.24em', textTransform: 'uppercase', color: ACCENT,
          }}
        >
          Membership
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
          Get your key.
        </h2>

        <p
          data-fade
          style={{
            margin: '0 0 clamp(48px, 6vh, 80px)', maxWidth: 560,
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 'clamp(17px, 1.6vw, 21px)',
            fontWeight: 400, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)',
          }}
        >
          Pick a plan and the whole gym in Windsor is yours to book — private, any time you train.
        </p>

        <div
          ref={gridRef}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(18px, 2vw, 28px)', perspective: 1200,
          }}
        >
          {TIERS.map((t) => (
            <KeyCard key={t.name} t={t} />
          ))}
        </div>

        <div
          data-fade
          style={{
            marginTop: 'clamp(56px, 8vh, 96px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => console.log('PWA Prompt Triggered')}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: 'clamp(20px, 2.4vh, 26px) clamp(40px, 5vw, 64px)',
              borderRadius: 999, border: 'none', cursor: 'pointer',
              background: ACCENT, color: '#04140c',
              fontFamily: 'var(--font-grotesk), sans-serif',
              fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 700, letterSpacing: '-0.01em',
              boxShadow: `0 0 48px ${ACCENT}55`,
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 0 64px ${ACCENT}88` }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 48px ${ACCENT}55` }}
          >
            Download the app
          </button>
          <span style={{ fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>
            Get your key and start training in minutes.
          </span>
        </div>
      </div>
    </div>
  )
}
