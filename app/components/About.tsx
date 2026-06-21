'use client'

import IOReveal from '@/app/components/IOReveal'
import { NeoButton } from '@/app/components/NeoButton'

const STATS = [
  { figure: '24 / 7', label: 'Every window. Every hour.' },
  { figure: '1',      label: 'You. No one else.' },
  { figure: '0',      label: 'Other members during your session.' },
]

const FEATURES = [
  {
    tag: 'SMART LOCK ENTRY',
    desc: 'Your Access Key initializes the lock. No clearance desk, no staff — just you entering your private space.',
  },
  {
    tag: 'MOBILE BOOKING',
    desc: 'Secure your window directly from the app. The moment you confirm, the space is reserved to your key alone.',
  },
  {
    tag: '24/7 ACCESS',
    desc: 'Every window is live. Enter at any hour — early, late, or mid-afternoon. No restrictions on clearance.',
  },
  {
    tag: 'ZERO STAFF',
    desc: 'Fully automated protocols. The node operator manages access and scheduling. Your session runs uninterrupted.',
  },
]

export function About() {
  return (
    <section className="io-editorial">
      <div className="mx-auto max-w-5xl">

        {/* Block 1 — Section headline */}
        <IOReveal>
          <h2
            style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900 }}
            className="text-[clamp(48px,8vw,88px)] uppercase leading-[0.9] tracking-tight text-white"
          >
            MOVE WITHOUT LIMITS
          </h2>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-white/70">
            One private space, reserved for one person per window. No crowds, no
            contested equipment, no waiting — your clearance is absolute from the
            moment you book.
          </p>
        </IOReveal>

        {/* Block 2 — Three stat/proof columns (3 siblings → nth-child stagger fires) */}
        <div className="mt-20 grid grid-cols-1 border border-white/10 sm:grid-cols-3">
          {STATS.map((stat) => (
            <IOReveal key={stat.figure} className="border-white/10 p-8 sm:border-r last:border-r-0">
              <span
                style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900 }}
                className="block text-[clamp(48px,8vw,88px)] leading-none tracking-tight text-white"
              >
                {stat.figure}
              </span>
              <span className="mt-3 block font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">
                {stat.label}
              </span>
            </IOReveal>
          ))}
        </div>

        {/* Block 3 — Two-column editorial split */}
        <IOReveal className="mt-20 grid grid-cols-1 gap-16 md:grid-cols-2">

          {/* Left — punchy copy block */}
          <div className="flex flex-col gap-6">
            <p className="font-mono text-sm leading-relaxed text-white/70">
              Iron Oasis is a private automated space. Book a window and the smart
              lock initializes to your Access Key alone — the space opens for you
              and no one else. No staff presence, no shared clearance, no
              compromise on autonomy.
            </p>
            <p className="font-mono text-sm leading-relaxed text-white/70">
              This is optimization without interference. Each session runs as a
              clean protocol: enter, execute, exit. The node operator handles
              everything outside it. You handle the work.
            </p>
          </div>

          {/* Right — brutalist feature list */}
          <div className="flex flex-col gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.tag} className="border-l-2 border-white pl-[6px]">
                <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
                  {feature.tag}
                </span>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-white">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

        </IOReveal>

        {/* Block 4 — CTA strip (no reveal animation) */}
        <div className="mt-20 flex flex-wrap gap-4">
          <NeoButton variant="primary">GET ACCESS</NeoButton>
          <NeoButton variant="outline">SEE THE SPACE</NeoButton>
        </div>

      </div>
    </section>
  )
}
