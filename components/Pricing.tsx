'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const cards = sectionRef.current?.querySelectorAll('.io-tier')
    if (!cards?.length) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full bg-transparent px-6 py-28 md:px-12"
    >
      <div className="relative z-20 mx-auto max-w-6xl">
        <p
          className="text-center text-white/40"
          style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase' }}
        >
          Access
        </p>
        <h2
          className="mt-4 text-center text-white"
          style={{ fontFamily: 'var(--font-display), sans-serif', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          Choose your Key.
        </h2>

        <div className="mt-16 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="io-tier io-lux-card flex flex-col rounded-2xl p-8"
              style={tier.featured ? { borderColor: 'rgba(255,255,255,0.28)' } : undefined}
            >
              {tier.featured && (
                <span
                  className="mb-5 self-start rounded-full border border-white/20 bg-white/5 px-3 py-1 text-white/70"
                  style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}
                >
                  Most Access
                </span>
              )}
              <h3
                className="text-white"
                style={{ fontFamily: 'var(--font-display), sans-serif', fontWeight: 700, fontSize: 22, letterSpacing: '-0.01em' }}
              >
                {tier.name}
              </h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span
                  className="text-white"
                  style={{ fontFamily: 'var(--font-display), sans-serif', fontWeight: 800, fontSize: 'clamp(2.75rem, 6vw, 3.5rem)', lineHeight: 1 }}
                >
                  {tier.price}
                </span>
                <span className="text-white/40" style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12 }}>
                  / month
                </span>
              </div>

              <ul className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-white/70"
                    style={{ fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 14, lineHeight: 1.5 }}
                  >
                    <span className="mt-0.5 text-white/40" aria-hidden>—</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="mt-10 w-full rounded-full border border-white/20 bg-white/5 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
              >
                Acquire Key
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
