'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const KEYS = [
  { tier: 'OASIS LITE',      price: '$99',  alloc: '4 SOLO WINDOWS / MO',  line: 'Entry node access. Full hardware suite, uncontested.' },
  { tier: 'OASIS MID',       price: '$125', alloc: '8 SOLO WINDOWS / MO',  line: 'Expanded allocation. Priority booking horizon.' },
  { tier: 'OASIS UNLIMITED', price: '$149', alloc: 'UNLIMITED WINDOWS',    line: 'Total spatial autonomy. Any node, any hour.' },
]

const handlePWADownload = () => console.log('PWA Prompt Triggered')

export function FinalClose() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap.querySelectorAll('[data-close]'),
        { opacity: 0, y: 80 },
        {
          opacity: 1, y: 0, stagger: 0.12, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: wrap, start: 'top 80%', end: 'top 30%', scrub: 0.6 },
        },
      )
    }, wrap)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative', zIndex: 20, background: '#000',
        padding: 'clamp(80px, 12vh, 160px) 6% clamp(100px, 14vh, 180px)',
        borderTop: '2px solid #fff',
      }}
    >
      <div
        data-close
        style={{
          fontFamily: 'var(--font-jetbrains), monospace', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase',
        }}
      >
        // FINAL ALLOCATION — ACCESS KEYS
      </div>

      <h2
        data-close
        style={{
          margin: '24px 0 64px', fontFamily: 'var(--font-grotesk), sans-serif',
          fontWeight: 900, fontSize: 'clamp(56px, 10vw, 160px)', lineHeight: 0.85,
          letterSpacing: '-0.04em', color: '#fff', textTransform: 'uppercase',
        }}
      >
        Claim your key.
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0, border: '2px solid #fff' }}>
        {KEYS.map((k, i) => (
          <div
            key={k.tier}
            data-close
            style={{
              padding: '48px 32px 56px',
              borderLeft: i > 0 ? '2px solid #fff' : 'none',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}
          >
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.55)' }}>
              KEY_{String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900, fontSize: 'clamp(24px, 2.4vw, 34px)', letterSpacing: '-0.02em', color: '#fff', textTransform: 'uppercase' }}>
              {k.tier}
            </span>
            <span style={{ fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 900, fontSize: 'clamp(56px, 6vw, 88px)', lineHeight: 1, color: '#fff' }}>
              {k.price}
              <span style={{ fontSize: '0.3em', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginLeft: 8 }}>/MO</span>
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', color: '#fff' }}>
              {k.alloc}
            </span>
            <p style={{ fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 16, fontWeight: 500, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              {k.line}
            </p>
          </div>
        ))}
      </div>

      <div data-close style={{ marginTop: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
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
          }}
        >
          GET ACCESS
        </button>
        <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          Install the app. Secure your key. Operate the node.
        </span>
      </div>
    </div>
  )
}
