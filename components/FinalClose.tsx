'use client'

import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

const KEYS = [
  { tier: 'IRON OASIS LITE',      price: '$99',  alloc: '4 SESSIONS / MO',  line: 'Get started. The whole gym to yourself.',   accent: '#4dffa6' },
  { tier: 'IRON OASIS PLUS',      price: '$125', alloc: '8 SESSIONS / MO',  line: 'Train more. Book further ahead.',            accent: '#5ac8ff' },
  { tier: 'IRON OASIS UNLIMITED', price: '$149', alloc: 'UNLIMITED',        line: 'Train any hour, day or night.',             accent: '#ff4d6d' },
]

const handlePWADownload = () => console.log('PWA Prompt Triggered')

const MAX_TILT = 12

function KeyCard({ k, i }: { k: (typeof KEYS)[number]; i: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  // quickTo/quickSetter created once per card — no per-event tween allocation
  const setRotX = useRef<((v: number) => void) | null>(null)
  const setRotY = useRef<((v: number) => void) | null>(null)
  const setMX = useRef<((v: string) => void) | null>(null)
  const setMY = useRef<((v: string) => void) | null>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    gsap.set(el, { transformPerspective: 1000 })
    setRotX.current = gsap.quickTo(el, 'rotateX', { duration: 0.35, ease: 'power3.out' })
    setRotY.current = gsap.quickTo(el, 'rotateY', { duration: 0.35, ease: 'power3.out' })
    setMX.current = gsap.quickSetter(el, '--mx') as (v: string) => void
    setMY.current = gsap.quickSetter(el, '--my') as (v: string) => void
  }, [])

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    // -1..1 across bounding box
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1
    setMX.current?.(`${((nx + 1) / 2) * 100}%`)
    setMY.current?.(`${((ny + 1) / 2) * 100}%`)
    setRotY.current?.(nx * MAX_TILT)
    setRotX.current?.(-ny * MAX_TILT)
  }

  const onLeave = () => {
    const el = cardRef.current
    if (!el) return
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.55)', overwrite: 'auto' })
  }

  return (
    <div
      ref={cardRef}
      data-close
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        padding: '48px 32px 56px',
        display: 'flex', flexDirection: 'column', gap: 16,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        // metallic hardware node — brushed plate + glass layer
        background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 38%, rgba(0,0,0,0.6) 100%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: `1px solid ${k.accent}`,
        boxShadow: `inset 0 0 0 1px ${k.accent}, 0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 32px ${k.accent}33, 0 24px 60px rgba(0,0,0,0.8)`,
        clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
      }}
    >
      {/* cursor-tracked metallic sheen */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: 'radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.30), rgba(255,255,255,0.05) 38%, transparent 62%)',
          mixBlendMode: 'overlay',
        }}
      />
      {/* status LED strip */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: 3,
          background: `linear-gradient(90deg, ${k.accent}, transparent 70%)`,
          boxShadow: `0 0 12px ${k.accent}`,
        }}
      />
      <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', color: k.accent }}>
        ● PLAN_{String(i + 1).padStart(2, '0')}
      </span>
      <span style={{ fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900, fontSize: 'clamp(28px, 2.8vw, 40px)', letterSpacing: '-0.03em', color: '#fff', textTransform: 'uppercase' }}>
        {k.tier}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900,
          fontSize: 'clamp(64px, 7vw, 104px)', lineHeight: 1, letterSpacing: '-0.03em',
          background: `linear-gradient(180deg, #fff 30%, ${k.accent} 140%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}
      >
        {k.price}
        <span style={{ fontSize: '0.28em', fontWeight: 700, WebkitTextFillColor: 'rgba(255,255,255,0.6)', marginLeft: 8, letterSpacing: '0.1em' }}>/MO</span>
      </span>
      <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 14 }}>
        {k.alloc}
      </span>
      <p style={{ fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 16, fontWeight: 500, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
        {k.line}
      </p>
    </div>
  )
}

export function FinalClose() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
    CustomEase.create('appleOut', '0.16, 1, 0.3, 1')
    const splits: SplitText[] = []
    const ctx = gsap.context(() => {
      // Kowalski masked line reveal — words rise out of overflow-hidden line masks
      wrap.querySelectorAll<HTMLElement>('[data-split-head]').forEach((head) => {
        const split = new SplitText(head, { type: 'lines,words', mask: 'lines' })
        splits.push(split)
        gsap.fromTo(
          split.words,
          { yPercent: 110 },
          {
            yPercent: 0, stagger: 0.06, ease: 'appleOut', immediateRender: false,
            scrollTrigger: { trigger: wrap, start: 'top 85%', end: 'top 40%', scrub: 0.5 },
          },
        )
      })
      gsap.fromTo(
        wrap.querySelectorAll('[data-close]'),
        { opacity: 0, y: 80 },
        {
          opacity: 1, y: 0, stagger: 0.12, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: wrap, start: 'top 80%', end: 'top 40%', scrub: 0.5 },
        },
      )
      // parallax coordinate grid — background pans slower than scroll
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current,
          { backgroundPosition: '0px 0px, 0px 0px, 0px 0px' },
          {
            backgroundPosition: '0px -240px, 0px -240px, 0px -120px',
            ease: 'none',
            scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 0.3 },
          },
        )
      }
    }, wrap)
    return () => { splits.forEach((s) => s.revert()); ctx.revert() }
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative', zIndex: 20, background: '#000',
        padding: 'clamp(80px, 12vh, 160px) 6% clamp(100px, 14vh, 180px)',
        borderTop: '2px solid #fff',
        overflow: 'hidden',
      }}
    >
      {/* parallax coordinate grid — kills the flat void */}
      <div
        ref={gridRef}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: '-260px 0 0',
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px),
            radial-gradient(circle at 50% 30%, rgba(77,255,166,0.07), transparent 55%)
          `,
          backgroundSize: '64px 64px, 64px 64px, 100% 100%',
          maskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)',
        }}
      />

      <div
        data-close
        style={{
          position: 'relative',
          fontFamily: 'var(--font-jetbrains), monospace', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase',
        }}
      >
        {'// PRICING — MONTHLY ACCESS'}
      </div>

      <h2
        data-split-head
        style={{
          position: 'relative',
          margin: '24px 0 64px', fontFamily: 'var(--font-grotesk), sans-serif',
          fontWeight: 900, fontSize: 'clamp(64px, 11vw, 176px)', lineHeight: 0.85,
          letterSpacing: '-0.05em', color: '#fff', textTransform: 'uppercase',
        }}
      >
        Claim your key.
      </h2>

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(20px, 2.5vw, 40px)' }}>
        {KEYS.map((k, i) => (
          <KeyCard key={k.tier} k={k} i={i} />
        ))}
      </div>

      <div data-close style={{ position: 'relative', marginTop: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <button
          type="button"
          onClick={handlePWADownload}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', maxWidth: 900,
            border: '2px solid #fff', background: '#fff', color: '#000',
            padding: 'clamp(28px, 4vh, 44px) 48px', cursor: 'pointer',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 700,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            boxShadow: '0 0 48px rgba(255,255,255,0.25)',
          }}
        >
          GET ACCESS
        </button>
        <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          Download the app. Get your key. Start training.
        </span>
      </div>
    </div>
  )
}
