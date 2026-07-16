'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

const ACCENT = '#d4d7da'

// Six pillars — the exact narrative stack. Spans drive the bento rhythm (12-col grid).
const PILLARS = [
  { k: '01', name: '100% Privacy',      line: 'A quiet residential setting. No crowds, no cameras on you, no audience. Ever.', span: 7 },
  { k: '02', name: 'Zero Sharing',      line: 'Every rack, every machine, every square foot is yours for the whole session.',  span: 5 },
  { k: '03', name: '24/7 Access',       line: 'Your key works at 6 AM or 2 AM. The space runs on your clock, not ours.',       span: 4 },
  { k: '04', name: 'Premium Equipment', line: 'Commercial-grade hardware, reset and ready between every session.',             span: 4 },
  { k: '05', name: 'No Fees',           line: 'No sign-up fees, no hidden fees, no cancellation charges — ever.',              span: 4 },
  { k: '06', name: 'No Commitment',     line: 'Clean 1-hour blocks. Cancel any time, keep your booking key. No contracts.',    span: 12 },
]

// gradient-border dark glass + grain — matches the Access Key card material
const NOISE =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`

const glass = (edgeTop: string): React.CSSProperties => ({
  border: '1px solid transparent',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, padding-box, border-box',
  backgroundImage: [
    'linear-gradient(180deg, rgba(22,22,26,0.5), rgba(8,8,10,0.55))',
    NOISE,
    `linear-gradient(180deg, ${edgeTop}, rgba(255,255,255,0.03))`,
  ].join(', '),
  backdropFilter: 'blur(20px) saturate(120%)',
  WebkitBackdropFilter: 'blur(20px) saturate(120%)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
})

function PillarCell({ p }: { p: (typeof PILLARS)[number] }) {
  const ref = useRef<HTMLDivElement>(null)
  const set = (transform: string) => { if (ref.current) ref.current.style.transform = transform }

  return (
    <div
      ref={ref}
      data-bento-cell
      onMouseEnter={() => set('translateY(-4px)')}
      onMouseLeave={() => set('translateY(0)')}
      onPointerDown={() => set('scale(0.985)')}
      onPointerUp={() => set('translateY(-4px)')}
      style={{
        gridColumn: `span ${p.span}`,
        position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        minHeight: p.span >= 12 ? 160 : 220,
        padding: 'clamp(28px, 3vw, 44px)',
        borderRadius: 14,
        willChange: 'transform',
        transition: 'transform 0.4s cubic-bezier(0.32,0.72,0,1)',
        ...glass('rgba(255,255,255,0.14)'),
      }}
    >
      <span
        style={{
          position: 'absolute', top: 'clamp(22px, 2.4vw, 34px)', left: 'clamp(28px, 3vw, 44px)',
          fontFamily: 'var(--font-jetbrains), monospace', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.28em', color: 'rgba(255,255,255,0.35)',
        }}
      >
        {p.k}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
          fontSize: 'clamp(24px, 2.6vw, 34px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#fff',
        }}
      >
        {p.name}
      </span>
      <p
        style={{
          margin: '12px 0 0', maxWidth: '46ch',
          fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 16, fontWeight: 400,
          lineHeight: 1.5, color: 'rgba(255,255,255,0.6)',
        }}
      >
        {p.line}
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
      const cells = grid ? gsap.utils.toArray<HTMLElement>(grid.querySelectorAll('[data-bento-cell]')) : []
      const supporting = wrap.querySelectorAll('[data-fade]')

      if (reduce) {
        gsap.set([...cells, ...supporting], { opacity: 1, y: 0, rotateX: 0 })
        return
      }

      // kinetic headline — words launch out of a line mask on scrub
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
        cells,
        { opacity: 0, y: 36, rotateX: -7 },
        {
          opacity: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.08, ease: 'appleOut',
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

      // data-speed parallax — ghost typography drifts at its own rate against
      // the content, written straight to the DOM. Depth, not motion slop.
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
      <div style={{ position: 'relative', maxWidth: 1240, margin: '0 auto' }}>
        {/* ghost layer — outline word drifting slower than the content behind the heading */}
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
          The model
        </div>

        <h2
          data-split-head
          style={{
            position: 'relative', zIndex: 2,
            margin: '20px 0 20px',
            fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
            fontSize: 'clamp(56px, 8.6vw, 132px)', lineHeight: 0.95,
            letterSpacing: '-0.045em', color: '#ffffff', textTransform: 'uppercase',
          }}
        >
          We are not a gym.
        </h2>

        <p
          data-fade
          style={{
            position: 'relative', zIndex: 2,
            margin: '0 0 clamp(48px, 6vh, 80px)', maxWidth: 620,
            fontFamily: 'var(--font-grotesk), sans-serif', fontSize: 'clamp(17px, 1.6vw, 21px)',
            fontWeight: 400, lineHeight: 1.5, color: '#a1a1aa',
          }}
        >
          We do not operate like a gym. Claim an Access Key, book a block, and the
          entire private space in Windsor is yours. No games, no fine print.
        </p>

        {/* bento — 12-col architectural grid, spans set the rhythm */}
        <div
          ref={gridRef}
          style={{
            position: 'relative', zIndex: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'clamp(14px, 1.6vw, 24px)',
            perspective: '1200px',
          }}
        >
          {PILLARS.map((p) => (
            <PillarCell key={p.k} p={p} />
          ))}
        </div>

        {/* Strict policy — the one hard line, called out */}
        <div
          data-fade
          style={{
            position: 'relative', zIndex: 2,
            marginTop: 'clamp(28px, 4vh, 44px)',
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            padding: 'clamp(26px, 3.1vw, 38px)', borderRadius: 14,
            ...glass('rgba(255,255,255,0.14)'),
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

        {/* spatial finale — ghost word drifts behind one deep-glass command panel */}
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
              borderRadius: 14, overflow: 'hidden',
              ...glass('rgba(255,255,255,0.18)'),
            }}
          >
            <h3
              data-split-head
              style={{
                position: 'relative', margin: 0,
                fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800,
                fontSize: 'clamp(52px, 8vw, 108px)', lineHeight: 0.95, letterSpacing: '-0.045em', color: '#ffffff',
              }}
            >
              Your private space is waiting.
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

      {/* mobile: bento collapses to a single column */}
      <style>{`
        @media (max-width: 860px) {
          [data-bento-cell] { grid-column: span 12 !important; min-height: 180px !important; }
        }
      `}</style>
    </div>
  )
}
