'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

// The honest walkthrough — the process, stated plainly, before the close.
// Calm editorial: numbered steps, one glass panel for the model. No hype.
const STEPS = [
  { n: '01', k: 'Download the App', line: 'Get the Iron Oasis app. Your Access Key lives on your phone.' },
  { n: '02', k: 'Book a Session', line: 'Reserve a one-hour session. The whole space, held for you alone.' },
  { n: '03', k: 'Arrive', line: 'Park on the street at 3011 Blimey Drive, Windsor. A quiet residential setting — walk up the property.' },
  { n: '04', k: 'Enter', line: 'Your code opens the Yale smart lock. It answers to your key alone.' },
  { n: '05', k: 'Complete Privacy', line: '24/7 private access. Zero sharing. Every square foot is yours for the session.' },
]

const ACCENT = '#d4d7da'

export function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
    CustomEase.create('appleOut', '0.16, 1, 0.3, 1')
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    let split: SplitText | undefined
    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]')
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]')
      if (reduce) {
        gsap.set([...steps, ...fades], { opacity: 1, y: 0 })
        return
      }
      // H2 — brutalist masked word reveal, scrubbed to scroll position
      const h2 = wrap.querySelector<HTMLElement>('[data-headline]')
      if (h2) {
        split = new SplitText(h2, { type: 'lines,words', mask: 'lines' })
        gsap.fromTo(
          split.words,
          { yPercent: 110 },
          { yPercent: 0, stagger: 0.06, ease: 'appleOut',
            scrollTrigger: { trigger: h2, start: 'top 88%', end: 'top 42%', scrub: 1.5, invalidateOnRefresh: true } },
        )
      }
      gsap.fromTo(
        fades,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: wrap, start: 'top 72%', once: true } },
      )
      // steps settle in sequentially — restrained rise + subtle tilt (≤6deg), quiet-luxury
      gsap.fromTo(
        steps,
        { opacity: 0, y: 30, rotateX: -6 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.75, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: steps[0], start: 'top 82%', once: true } },
      )
    }, wrap)

    return () => { ctx.revert(); split?.revert() }
  }, [])

  return (
    <section
      ref={wrapRef}
      style={{
        position: 'relative', zIndex: 20,
        padding: 'clamp(120px, 18vh, 240px) 6%',
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          data-fade
          style={{
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 14, fontWeight: 700,
            letterSpacing: '0.24em', textTransform: 'uppercase', color: ACCENT,
          }}
        >
          How it works
        </div>

        <h2
          data-headline
          style={{
            margin: '20px 0 clamp(48px, 7vh, 96px)',
            fontFamily: 'var(--font-display), sans-serif', fontWeight: 800,
            fontSize: 'clamp(40px, 6vw, 96px)', lineHeight: 0.95,
            letterSpacing: '-0.045em', color: '#fff',
          }}
        >
          Five steps to complete privacy.
        </h2>

        <div style={{ perspective: 1400, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              data-step
              style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(88px, 12vw, 168px) 1fr',
                gap: 'clamp(20px, 4vw, 56px)',
                alignItems: 'baseline',
                padding: 'clamp(28px, 4vh, 44px)',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains), monospace', fontWeight: 700,
                  fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-0.02em',
                  color: 'rgba(255,255,255,0.32)',
                }}
              >
                {s.n}
              </span>
              <div>
                <h3
                  style={{
                    margin: 0, fontFamily: 'var(--font-display), sans-serif', fontWeight: 700,
                    fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1.05,
                    letterSpacing: '-0.03em', color: '#fff',
                  }}
                >
                  {s.k}
                </h3>
                <p
                  style={{
                    margin: '12px 0 0', maxWidth: 640,
                    fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 400,
                    fontSize: 'clamp(16px, 1.6vw, 20px)', lineHeight: 1.5,
                    letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  {s.line}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* the model, stated once, in a single deep-glass panel */}
        <div
          data-fade
          style={{
            marginTop: 'clamp(56px, 8vh, 96px)',
            display: 'flex', flexDirection: 'column', gap: 16,
            padding: 'clamp(40px, 5vw, 72px)', borderRadius: 12,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px) saturate(150%)',
            WebkitBackdropFilter: 'blur(12px) saturate(150%)',
            willChange: 'transform, opacity',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display), sans-serif', fontWeight: 800,
              fontSize: 'clamp(30px, 4.2vw, 56px)', lineHeight: 1.05,
              letterSpacing: '-0.035em', color: '#fff',
            }}
          >
            A pure subscription structure.
          </span>
          <span
            style={{
              fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 400,
              fontSize: 'clamp(17px, 1.8vw, 22px)', lineHeight: 1.5,
              letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.75)',
            }}
          >
            No hidden fees. No contracts. No cancellation fees. Cancel any time — your key just stops renewing.
          </span>
        </div>
      </div>
    </section>
  )
}
