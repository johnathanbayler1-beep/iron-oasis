'use client'

import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import IOReveal from '@/app/components/IOReveal'
import { NeoButton } from '@/app/components/NeoButton'

const TERMS = [
  'NODE OPERATOR',
  'PRIVATE SPACE',
  'ACCESS KEY',
  'ACCESS WINDOW',
  'SMART LOCK',
  'PROTOCOL',
  'AUTONOMY',
]

const CELLS = [
  {
    label: 'INFRASTRUCTURE',
    title: 'ZERO OVERHEAD',
    copy: 'Iron Oasis installs the equipment, the lock system, and the booking app. Your role is to secure the space and collect revenue.',
  },
  {
    label: 'REVENUE SPLIT',
    title: '85 / 15',
    copy: 'Every Access Key sold through your node routes 85% directly to you via Stripe. Iron Oasis takes 15% as the protocol operator.',
  },
  {
    label: 'AUTONOMY',
    title: 'YOUR SPACE, YOUR RULES',
    copy: 'Set your own access windows. Lock or unlock access on demand. The protocol works around your schedule, not the other way around.',
  },
]

export default function PartnerContent() {
  const [form, setForm] = useState({ name: '', email: '', city: '', message: '' })

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from('.partner-term', {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power3.out',
        duration: 0.6,
        scrollTrigger: {
          trigger: '.partner-terms',
          start: 'top 80%',
        },
      })
    })
    return () => ctx.revert()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log(form)
    const subject = encodeURIComponent('Node Operator Inquiry')
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nCity: ${form.city}\n\n${form.message}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <section className="io-editorial">
      <div className="mx-auto max-w-5xl">

        {/* BLOCK 1 — Hero (no IOReveal, above the fold) */}
        <div>
          <h1
            style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900 }}
            className="text-[clamp(3rem,7vw,7rem)] uppercase leading-[0.9] tracking-tight text-white"
          >
            BECOME A NODE OPERATOR
          </h1>
          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-white/70">
            Operate the infrastructure. Iron Oasis deploys the space, the lock, and the app —
            initialize your node, enter the optimization protocol, and collect 85% of every
            Access Key sold.
          </p>
        </div>

        {/* BLOCK 2 — 7 Core Terms (single IOReveal, GSAP per-term stagger) */}
        <IOReveal className="partner-terms mt-20">
          <div className="flex flex-wrap items-center border-b border-t border-white/10 py-6">
            {TERMS.map((term, i) => (
              <div key={term} className="flex items-center">
                <span
                  className="partner-term text-[12px] uppercase tracking-[0.2em] text-white"
                  style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900 }}
                >
                  {term}
                </span>
                {i < TERMS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="mx-6 inline-block h-3 w-px bg-white/20"
                  />
                )}
              </div>
            ))}
          </div>
        </IOReveal>

        {/* BLOCK 3 — 3 Infrastructure Cells (individual IOReveal → nth-child stagger 1–3) */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CELLS.map((cell) => (
            <IOReveal key={cell.label}>
              <div className="flex h-full flex-col border-2 border-white p-8">
                <span
                  className="block font-mono text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {cell.label}
                </span>
                <h3
                  style={{ fontFamily: 'Arial, sans-serif', fontWeight: 900 }}
                  className="mt-4 text-2xl uppercase leading-tight text-white"
                >
                  {cell.title}
                </h3>
                <p className="mt-3 font-mono text-[11px] leading-relaxed text-white/70">
                  {cell.copy}
                </p>
              </div>
            </IOReveal>
          ))}
        </div>

        {/* BLOCK 5 — Closing CTA form (no IOReveal) */}
        <form onSubmit={handleSubmit} className="mt-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-none border-2 border-white bg-black px-5 py-4 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-none border-2 border-white bg-black px-5 py-4 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <input
              type="text"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="rounded-none border-2 border-white bg-black px-5 py-4 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none sm:col-span-2"
            />
            <textarea
              placeholder="Message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="resize-none rounded-none border-2 border-white bg-black px-5 py-4 font-mono text-sm text-white placeholder:text-white/30 focus:outline-none sm:col-span-2"
            />
          </div>
          <div className="mt-6">
            <NeoButton variant="primary" type="submit">GET ACCESS</NeoButton>
          </div>
        </form>

      </div>
    </section>
  )
}
