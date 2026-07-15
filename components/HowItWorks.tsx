'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// The honest walkthrough — the process, stated plainly, before the close.
// Calm editorial: numbered steps, one glass panel for the model. No hype.
const STEPS = [
  { n: '01', k: 'The App', line: 'Book your private window and get your access pass — right from your phone.' },
  { n: '02', k: 'The Location', line: 'Arrive at 3011 Blimey Drive, Windsor. A quiet, calm residential street. Park out front, walk up.' },
  { n: '03', k: 'The Access', line: 'Enter your code into the Yale Assure smart lock. It opens for your key alone.' },
  { n: '04', k: 'The Experience', line: '24/7 private access. Zero sharing. The entire node is yours, and yours alone.' },
]

const ACCENT = '#d4d7da'

export function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    gsap.registerPlugin(ScrollTrigger)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]')
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]')
      if (reduce) {
        gsap.set([...steps, ...fades], { opacity: 1, y: 0 })
        return
      }
      gsap.fromTo(
        fades,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out',
          scrollTrigger: { trigger: wrap, start: 'top 72%', once: true } },
      )
      // steps snap in sequentially — a slight z-push + tilt, like plates settling into place
      gsap.fromTo(
        steps,
        { opacity: 0, y: 36, z: -60, rotateX: -10 },
        { opacity: 1, y: 0, z: 0, rotateX: 0, duration: 0.75, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: steps[0], start: 'top 82%', once: true } },
      )
    }, wrap)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={wrapRef}
      style={{
        position: 'relative', zIndex: 20, background: '#000',
        padding: 'clamp(96px, 15vh, 200px) 6%',
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
          data-fade
          style={{
            margin: '20px 0 clamp(48px, 7vh, 96px)',
            fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
            fontSize: 'clamp(52px, 8vw, 120px)', lineHeight: 0.95,
            letterSpacing: '-0.045em', color: '#fff',
          }}
        >
          Four steps to the node.
        </h2>

        <div style={{ perspective: 1400 }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              data-step
              style={{
                display: 'grid',
                gridTemplateColumns: 'clamp(88px, 12vw, 168px) 1fr',
                gap: 'clamp(20px, 4vw, 56px)',
                alignItems: 'baseline',
                padding: 'clamp(28px, 4vh, 44px) 0',
                borderTop: '1px solid rgba(255,255,255,0.1)',
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
                    margin: 0, fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 700,
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
                    fontSize: 'clamp(16px, 1.6vw, 20px)', lineHeight: 1.55, color: '#a1a1aa',
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
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px) saturate(115%)',
            WebkitBackdropFilter: 'blur(20px) saturate(115%)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
              fontSize: 'clamp(30px, 4.2vw, 56px)', lineHeight: 1.05,
              letterSpacing: '-0.035em', color: '#fff',
            }}
          >
            A subscription, like Netflix.
          </span>
          <span
            style={{
              fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 400,
              fontSize: 'clamp(17px, 1.8vw, 22px)', lineHeight: 1.5, color: '#a1a1aa',
            }}
          >
            No hidden fees. No contracts. No cancellation fees. Cancel any time — your key just stops renewing.
          </span>
        </div>
      </div>
    </section>
  )
}
