'use client'

// Final close — rules + CTA, no pricing. Photo bento holds until equipment photography lands.
const SLOTS = [
  'RACK — 01',
  'PLATFORM — 02',
  'DUMBBELL WALL — 03',
  'CABLE STACK — 04',
  'CONDITIONING — 05',
  'RECOVERY — 06',
]

export function FinalClose() {
  return (
    <section
      style={{
        position: 'relative', zIndex: 20,
        padding: 'clamp(120px, 18vh, 240px) 6%',
        borderTop: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
          }}
        >
          We are not a gym.
        </span>

        <h2
          style={{
            margin: '20px 0 0',
            fontFamily: 'var(--font-display), sans-serif', fontWeight: 800,
            fontSize: 'clamp(40px, 6vw, 100px)', lineHeight: 0.95,
            letterSpacing: '-0.045em', color: '#fff', textTransform: 'uppercase',
          }}
        >
          The space is yours.
        </h2>

        <div
          style={{
            marginTop: 'clamp(48px, 7vh, 96px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            borderLeft: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          {SLOTS.map((label, i) => (
            <div
              key={label}
              className="io-blueprint-cell"
              style={{
                aspectRatio: '4 / 3',
                borderRight: '1px solid rgba(255,255,255,0.14)',
                borderBottom: '1px solid rgba(255,255,255,0.14)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: 20,
              }}
            >
              <span className="io-blueprint-watermark" aria-hidden>In Production</span>
              <span
                style={{
                  fontFamily: 'var(--font-jetbrains), monospace', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  alignSelf: 'flex-end',
                  fontFamily: 'var(--font-jetbrains), monospace', fontSize: 11,
                  letterSpacing: '0.18em', color: 'rgba(255,255,255,0.18)',
                }}
              >
                [ {String(i + 1).padStart(2, '0')} / {String(SLOTS.length).padStart(2, '0')} ]
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            margin: 'clamp(32px, 5vh, 56px) 0 0', maxWidth: 560,
            fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, lineHeight: 1.7,
            letterSpacing: '0.06em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
          }}
        >
          Equipment photography in production. Grid populates on delivery.
        </p>

        <div
          style={{
            marginTop: 'clamp(48px, 8vh, 96px)',
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(24px, 4vw, 48px)',
            borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: 'clamp(32px, 5vh, 56px)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-jetbrains), monospace', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
            }}
          >
            24/7 Access · Zero Sharing · Windsor
          </span>

          {/* Showcase CTA — app-only ecosystem, no web checkout. Hover inverts + arrow translates. */}
          <a
            href="#"
            className="io-final-cta"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: '18px 32px',
              fontFamily: 'var(--font-grotesk), sans-serif', fontWeight: 800, fontSize: 15,
              letterSpacing: '-0.01em', textTransform: 'uppercase', textDecoration: 'none',
              color: '#fff',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.18)',
              transition: 'background .25s ease, color .25s ease, border-color .25s ease',
            }}
          >
            Acquire Key
            <span className="io-final-arrow" style={{ transition: 'transform .25s ease', display: 'inline-block' }}>→</span>
          </a>
        </div>

        <style>{`
          .io-final-cta:hover { background:#fff !important; color:#000 !important; border-color:#fff !important; }
          .io-final-cta:hover .io-final-arrow { transform: translateX(6px); }
        `}</style>
      </div>
    </section>
  )
}
